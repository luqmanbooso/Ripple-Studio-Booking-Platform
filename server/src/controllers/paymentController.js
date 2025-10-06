const Booking = require("../models/Booking");
const paymentService = require("../services/paymentService");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");

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

module.exports = {
  createCheckoutSession,
  refundBooking,
  demoCompleteSession,
  verifyPayherePayment,
};
