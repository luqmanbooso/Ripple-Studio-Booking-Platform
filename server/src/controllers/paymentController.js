const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const paymentService = require("../services/paymentService");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const logger = require("../utils/logger");

const createCheckoutSession = catchAsync(async (req, res) => {
  const { bookingId } = req.body;

  const booking = await Booking.findById(bookingId).populate([
    { path: "client" },
    { path: "artist", populate: { path: "user" } },
    { path: "studio", populate: { path: "user" } },
  ]);

  if (!booking) {
    throw new ApiError("Booking not found", 404);
  }

  // Verify user owns this booking
  if (booking.client._id.toString() !== req.user._id.toString()) {
    throw new ApiError("Access denied", 403);
  }

  if (!['reservation_pending', 'payment_pending'].includes(booking.status)) {
    throw new ApiError("Booking is not available for payment", 400);
  }

  const checkoutSession = await paymentService.createCheckoutSession(booking);

  res.json({
    status: "success",
    data: {
      orderId: checkoutSession.id,
      checkoutUrl: checkoutSession.url,
      checkoutData: checkoutSession.checkoutData, // PayHere specific data for frontend
    },
  });
});

// Test endpoint to create a sample payment (development only)
const createTestPayment = catchAsync(async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    throw new ApiError("Only available in development", 403);
  }

  const userId = req.user._id;
  
  // Create a test payment record
  const testPayment = await Payment.create({
    booking: new require('mongoose').Types.ObjectId(), // Dummy booking ID
    payhereOrderId: `test_${Date.now()}`,
    payherePaymentId: `pay_${Date.now()}`,
    status: 'Completed',
    amount: 5000,
    currency: 'LKR',
    bookingSnapshot: {
      client: {
        id: userId,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || '+94771234567'
      },
      studio: {
        id: new require('mongoose').Types.ObjectId(),
        name: 'Test Studio',
        email: 'studio@test.com'
      },
      service: {
        name: 'Recording Session',
        price: 5000,
        durationMins: 60,
        description: 'Test recording session'
      },
      start: new Date(),
      end: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
      notes: 'Test payment for development'
    },
    completedAt: new Date(),
    initiatedAt: new Date()
  });

  logger.info(`Test payment created: ${testPayment._id} for user: ${userId}`);

  res.json({
    status: "success",
    message: "Test payment created successfully",
    data: {
      paymentId: testPayment._id,
      amount: testPayment.amount,
      status: testPayment.status
    }
  });
});

const refundBooking = catchAsync(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new ApiError("Booking not found", 404);
  }

  if (!booking.payherePaymentId) {
    throw new ApiError("No payment found for this booking", 400);
  }

  const refund = await paymentService.refundPayment(
    booking.payherePaymentId,
    booking.price
  );

  booking.status = "refunded";
  booking.refundAmount = booking.price;
  booking.refundedAt = new Date();
  await booking.save();

  res.json({
    status: "success",
    data: {
      refund,
      booking,
    },
  });
});

const demoCompleteSession = catchAsync(async (req, res) => {
  const { sessionId, bookingId } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError("Booking not found", 404);
  }

  // Only allow client who created booking to complete demo payment
  if (booking.client.toString() !== req.user._id.toString()) {
    throw new ApiError("Access denied", 403);
  }

  // Mark booking as paid
  booking.paymentIntentId = `pi_demo_${Math.random().toString(36).substr(2, 9)}`;
  booking.status = "confirmed";
  booking.paidAt = new Date();
  await booking.save();

  res.json({ status: "success", data: { booking } });
});

const verifyPayherePayment = catchAsync(async (req, res) => {
  const { order_id, payment_id, status_code } = req.body;

  if (!order_id || !payment_id) {
    throw new ApiError("Missing payment parameters", 400);
  }

  // Extract booking ID from order_id (format: booking_ID_timestamp)
  const orderIdParts = order_id.split("_");
  const bookingId = orderIdParts[1];

  if (!bookingId) {
    throw new ApiError("Invalid order ID format", 400);
  }

  const booking = await Booking.findById(bookingId).populate([
    { path: "client", select: "name email" },
    { path: "artist", populate: { path: "user", select: "name email" } },
    { path: "studio", populate: { path: "user", select: "name email" } },
  ]);

  if (!booking) {
    throw new ApiError("Booking not found", 404);
  }

  // Check if payment was successful
  if (parseInt(status_code) === 2) {
    // Payment successful - update booking status
    booking.status = 'confirmed';
    booking.payhereOrderId = order_id;
    booking.payherePaymentId = payment_id;
    await booking.save();
    
    res.json({
      success: true,
      message: "Payment verified successfully",
      booking: {
        _id: booking._id,
        start: booking.start,
        end: booking.end,
        price: booking.price,
        status: booking.status,
      },
    });
  } else {
    // Payment failed or cancelled - delete reservation
    if (booking.status === 'reservation_pending') {
      await Booking.findByIdAndDelete(bookingId);
    }
    
    res.json({
      success: false,
      message: "Payment verification failed",
      statusCode: status_code,
    });
  }
});

// Get all payments for a booking
const getBookingPayments = catchAsync(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError("Booking not found", 404);
  }

  // Verify access
  const hasAccess =
    booking.client.toString() === req.user._id.toString() ||
    (req.user.studio && booking.studio.toString() === req.user.studio.toString()) ||
    req.user.role === "admin";

  if (!hasAccess) {
    throw new ApiError("Access denied", 403);
  }

  const payments = await Payment.find({ booking: bookingId })
    .populate("refundInitiatedBy", "name email role")
    .sort({ createdAt: -1 });

  res.json({
    status: "success",
    data: { payments },
  });
});

// Get payment by ID
const getPayment = catchAsync(async (req, res) => {
  const { paymentId } = req.params;

  const payment = await Payment.findById(paymentId)
    .populate("booking")
    .populate("refundInitiatedBy", "name email role");

  if (!payment) {
    throw new ApiError("Payment not found", 404);
  }

  // Verify access
  const booking = await Booking.findById(payment.booking);
  const hasAccess =
    booking.client.toString() === req.user._id.toString() ||
    (req.user.studio && booking.studio.toString() === req.user.studio.toString()) ||
    req.user.role === "admin";

  if (!hasAccess) {
    throw new ApiError("Access denied", 403);
  }

  res.json({
    status: "success",
    data: { payment },
  });
});

// Get user's payment history (client view)
const getMyPayments = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const userId = req.user._id;

  let query = {};

  if (req.user.role === "client") {
    query["bookingSnapshot.client.id"] = userId;
  } else if (req.user.role === "studio" && req.user.studio) {
    query["bookingSnapshot.studio.id"] = req.user.studio._id || req.user.studio;
  } else {
    throw new ApiError("Invalid user role", 400);
  }

  if (status) {
    query.status = status;
  }

  const payments = await Payment.find(query)
    .populate("booking", "start end status")
    .populate("refundInitiatedBy", "name role")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Payment.countDocuments(query);

  // Calculate statistics
  const stats = await Payment.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  res.json({
    status: "success",
    data: {
      payments,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// Get all payments (admin only)
const getAllPayments = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;

  let query = {};

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { payhereOrderId: { $regex: search, $options: "i" } },
      { payherePaymentId: { $regex: search, $options: "i" } },
      { "bookingSnapshot.client.name": { $regex: search, $options: "i" } },
      { "bookingSnapshot.client.email": { $regex: search, $options: "i" } },
    ];
  }

  const payments = await Payment.find(query)
    .populate("booking", "start end status")
    .populate("refundInitiatedBy", "name email role")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Payment.countDocuments(query);

  // Platform-wide statistics
  const stats = await Payment.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
        totalRefunded: { $sum: "$refundAmount" },
      },
    },
  ]);

  res.json({
    status: "success",
    data: {
      payments,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// Initiate refund (admin or studio)
const initiateRefund = catchAsync(async (req, res) => {
  const { paymentId } = req.params;
  const { amount, reason } = req.body;

  const payment = await Payment.findById(paymentId).populate("booking");
  if (!payment) {
    throw new ApiError("Payment not found", 404);
  }

  if (payment.status !== "Completed") {
    throw new ApiError("Only completed payments can be refunded", 400);
  }

  // Verify access (admin or studio owner)
  const booking = await Booking.findById(payment.booking);
  const isStudioOwner =
    req.user.studio && booking.studio.toString() === req.user.studio.toString();
  const isAdmin = req.user.role === "admin";

  if (!isStudioOwner && !isAdmin) {
    throw new ApiError("Access denied", 403);
  }

  const refundAmount = amount || payment.amount;

  if (refundAmount > payment.amount) {
    throw new ApiError("Refund amount cannot exceed payment amount", 400);
  }

  // Process refund
  payment.processRefund(refundAmount, reason, req.user._id);
  await payment.save();

  // Update booking status
  booking.status = "refunded";
  booking.refundAmount = refundAmount;
  booking.refundedAt = new Date();
  booking.cancellationReason = reason;
  await booking.save();

  logger.info(`Refund initiated for payment ${paymentId} by user ${req.user._id}`);

  res.json({
    status: "success",
    message: "Refund processed successfully",
    data: { payment },
  });
});

module.exports = {
  createCheckoutSession,
  createTestPayment,
  refundBooking,
  demoCompleteSession,
  verifyPayherePayment,
  getBookingPayments,
  getPayment,
  getMyPayments,
  getAllPayments,
  initiateRefund,
};
