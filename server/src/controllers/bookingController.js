const Booking = require("../models/Booking");
const Studio = require("../models/Studio");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const availabilityService = require("../services/availabilityService");
const bookingService = require("../services/bookingService");
const paymentService = require("../services/paymentService");
const NotificationService = require("../services/notificationService");
const { emitToUser, emitToProvider } = require("../utils/sockets");

const createBooking = catchAsync(async (req, res) => {
  const { studioId, service, services = [], equipment = [], start, end, notes } = req.body;
  const clientId = req.user._id;

  // Check if client is verified
  if (!req.user.verified) {
    throw new ApiError("Please verify your email address before making bookings", 403);
  }

  // Get the provider (studio only)
  const provider = await Studio.findById(studioId).populate("user");
  const providerType = "studio";

  if (!provider) {
    throw new ApiError("Provider not found", 404);
  }

  if (!provider.isActive) {
    throw new ApiError("Provider is not currently accepting bookings", 400);
  }

  // Check if studio is approved
  if (!provider.isApproved) {
    throw new ApiError("This studio is not yet approved for bookings", 400);
  }

  // PRD: Validate services (legacy single + new multiple)
  let validatedServices = [];
  let totalServicePrice = 0;
  
  // Handle legacy single service
  if (service && service.name) {
    const studioService = provider.getService(service.name);
    if (!studioService) {
      throw new ApiError("Service not available at this studio", 400);
    }
    service.price = studioService.price;
    service.durationMins = studioService.durationMins;
    totalServicePrice += service.price;
  }
  
  // Handle multiple services
  if (services && services.length > 0) {
    for (const svc of services) {
      const studioService = provider.getService(svc.name);
      if (!studioService) {
        throw new ApiError(`Service "${svc.name}" not available at this studio`, 400);
      }
      validatedServices.push({
        name: svc.name,
        price: studioService.price,
        description: studioService.description,
        category: studioService.category
      });
      totalServicePrice += studioService.price;
    }
  }
  
  // Ensure at least one service is selected
  if (!service?.name && validatedServices.length === 0) {
    throw new ApiError("At least one service must be selected", 400);
  }

  // Check availability
  const isAvailable = await availabilityService.checkAvailability(
    providerType,
    provider._id,
    start,
    end
  );

  if (!isAvailable) {
    throw new ApiError("Selected time slot is not available", 400);
  }

  // PRD: Validate equipment rentals
  let validatedEquipment = [];
  let totalEquipmentPrice = 0;
  
  if (equipment && equipment.length > 0) {
    const Equipment = require('../models/Equipment');
    
    for (const eqp of equipment) {
      const equipmentItem = await Equipment.findById(eqp.equipmentId);
      if (!equipmentItem) {
        throw new ApiError(`Equipment "${eqp.name}" not found`, 400);
      }
      
      if (equipmentItem.studio.toString() !== studioId) {
        throw new ApiError(`Equipment "${eqp.name}" does not belong to this studio`, 400);
      }
      
      if (equipmentItem.status !== 'Available') {
        throw new ApiError(`Equipment "${eqp.name}" is not available (${equipmentItem.status})`, 400);
      }
      
      validatedEquipment.push({
        equipmentId: equipmentItem._id,
        name: equipmentItem.name,
        rentalPrice: eqp.rentalPrice || 0,
        rentalDuration: eqp.rentalDuration || 'session',
        status: 'Reserved'
      });
      totalEquipmentPrice += (eqp.rentalPrice || 0);
    }
  }

  // Calculate total price
  const totalPrice = totalServicePrice + totalEquipmentPrice;

  // Create booking reservation (will be confirmed after payment)
  const booking = await Booking.create({
    client: clientId,
    [providerType]: provider._id,
    service: service || (validatedServices.length > 0 ? validatedServices[0] : null),
    services: validatedServices,
    equipment: validatedEquipment,
    start: new Date(start),
    end: new Date(end),
    price: totalPrice,
    notes,
    status: "reservation_pending", // New status for reservations
  });

  // Populate booking for response
  await booking.populate([
    { path: "client", select: "name email avatar" },
    { path: providerType, populate: { path: "user", select: "name email" } },
  ]);

  // Create Stripe checkout session
  const checkoutSession = await paymentService.createCheckoutSession(booking);

  // Emit socket events
  emitToUser(provider.user._id, "booking_created", {
    bookingId: booking._id,
    clientName: req.user.name,
    service: service.name,
    start,
    end,
  });

  // Send notification to admin about new booking (async)
  NotificationService.notifyBookingCreated(booking, req.user, provider).catch(error => {
    console.error('Failed to send booking notification:', error);
  });

  res.status(201).json({
    status: "success",
    data: {
      booking,
      checkoutUrl: checkoutSession.url,
      checkoutData: checkoutSession.checkoutData,
    },
  });
});

const getMyBookings = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, upcoming } = req.query;
  const userId = req.user._id;

  let query = {};

  // Build query based on user role
  if (req.user.role === "client") {
    query.client = userId;
  } else if (req.user.role === "studio" && req.user.studio) {
    // req.user.studio can be either an ID or a populated object
    query.studio = req.user.studio._id || req.user.studio;
  } else {
    throw new ApiError("User has no associated provider profile", 400);
  }

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Filter by upcoming/past
  if (upcoming === "true") {
    query.start = { $gte: new Date() };
  } else if (upcoming === "false") {
    query.end = { $lt: new Date() };
  }

  const bookings = await Booking.find(query)
    .populate([
      { path: "client", select: "name email avatar" },
      { path: "studio", populate: { path: "user", select: "name email" } },
    ])
    .sort({ start: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Booking.countDocuments(query);

  res.json({
    status: "success",
    data: {
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

const getBooking = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const booking = await Booking.findById(id).populate([
    { path: "client", select: "name email avatar phone" },
    { path: "studio", populate: { path: "user", select: "name email phone" } },
  ]);

  if (!booking) {
    throw new ApiError("Booking not found", 404);
  }

  // Check if user has access to this booking
  const hasAccess =
    booking.client._id.toString() === userId.toString() ||
    (booking.studio &&
      booking.studio.user._id.toString() === userId.toString()) ||
    req.user.role === "admin";

  if (!hasAccess) {
    throw new ApiError("Access denied", 403);
  }

  res.json({
    status: "success",
    data: {
      booking,
    },
  });
});

const cancelBooking = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const userId = req.user._id;

  const booking = await Booking.findById(id).populate([
    { path: "client" },
    { path: "studio", populate: { path: "user" } },
  ]);

  if (!booking) {
    throw new ApiError("Booking not found", 404);
  }

  // Check if user can cancel this booking
  const canCancel =
    booking.client._id.toString() === userId.toString() ||
    (booking.studio &&
      booking.studio.user._id.toString() === userId.toString()) ||
    req.user.role === "admin";

  if (!canCancel) {
    throw new ApiError("You cannot cancel this booking", 403);
  }

  if (!booking.canCancel(req.user.role)) {
    throw new ApiError("Booking cannot be cancelled at this time", 400);
  }

  // Cancel booking and process refund
  const cancelledBooking = await bookingService.cancelBooking(booking, reason);

  // Emit socket events
  const providerType = "studio";
  const providerId = booking.studio._id;
  const providerUserId = booking.studio.user._id;

  emitToUser(booking.client._id, "booking_cancelled", {
    bookingId: booking._id,
    reason,
  });

  emitToUser(providerUserId, "booking_cancelled", {
    bookingId: booking._id,
    reason,
  });

  emitToProvider(providerType, providerId, "calendar_update", {
    action: "booking_cancelled",
    bookingId: booking._id,
  });

  res.json({
    status: "success",
    data: {
      booking: cancelledBooking,
    },
  });
});

const completeBooking = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  const userId = req.user._id;

  const booking = await Booking.findById(id).populate([
    { path: "client" },
    { path: "studio", populate: { path: "user" } },
  ]);

  if (!booking) {
    throw new ApiError("Booking not found", 404);
  }

  // Only provider can mark booking as complete
  const isProvider =
    (booking.studio &&
      booking.studio.user._id.toString() === userId.toString());

  if (!isProvider && req.user.role !== "admin") {
    throw new ApiError("Only the provider can mark booking as complete", 403);
  }

  if (!booking.canComplete()) {
    throw new ApiError("Booking cannot be completed at this time", 400);
  }

  // Complete booking
  const completedBooking = await bookingService.completeBooking(booking, notes);

  // Emit socket events
  emitToUser(booking.client._id, "booking_completed", {
    bookingId: booking._id,
  });

  res.json({
    status: "success",
    data: {
      booking: completedBooking,
    },
  });
});

// Get booked slots for a studio on a specific date
const getBookedSlots = catchAsync(async (req, res) => {
  const { studioId, providerId, date } = req.query;
  
  // Handle both studioId and providerId for backward compatibility
  const actualStudioId = studioId || providerId;
  
  if (!actualStudioId) {
    throw new ApiError("studioId or providerId is required", 400);
  }
  if (!date) {
    throw new ApiError("date is required (YYYY-MM-DD)", 400);
  }

  // Build date range for the given date (UTC)
  const startOfDay = new Date(`${date}T00:00:00.000Z`);
  const endOfDay = new Date(`${date}T23:59:59.999Z`);

  const query = {
    studio: actualStudioId,
    start: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['confirmed', 'payment_pending'] }, // Exclude reservation_pending
  };

  const bookings = await Booking.find(query).select("start end status");

  // Return start and end as ISO strings so client can compute overlaps correctly
  const bookedSlots = bookings.map((b) => ({
    start: b.start.toISOString(),
    end: b.end.toISOString(),
    status: b.status,
  }));

  res.json({ status: "success", data: { bookedSlots } });
});

// Manual booking confirmation (for studios)
const confirmBooking = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const booking = await Booking.findById(id).populate([
    { path: "client", select: "name email" },
    { path: "studio", populate: { path: "user", select: "_id name email" } },
  ]);

  if (!booking) {
    throw new ApiError("Booking not found", 404);
  }

  // Check if user is the studio owner OR the client who made the booking
  const isStudioOwner = booking.studio.user._id.toString() === userId.toString();
  const isBookingClient = booking.client._id.toString() === userId.toString();
  
  if (!isStudioOwner && !isBookingClient) {
    throw new ApiError("Not authorized to confirm this booking", 403);
  }

  // Check if booking can be confirmed
  if (!['reservation_pending', 'payment_pending'].includes(booking.status)) {
    throw new ApiError("Booking cannot be confirmed in its current state", 400);
  }

  // Use booking service to confirm
  const bookingService = require('../services/bookingService');
  const confirmedBooking = await bookingService.confirmBooking(booking, booking.payherePaymentId || 'manual_confirmation');

  res.json({
    status: "success",
    message: "Booking confirmed successfully",
    data: {
      booking: confirmedBooking,
    },
  });
});

// Client payment confirmation (for clients after successful payment)
const confirmPayment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const booking = await Booking.findById(id).populate([
    { path: "client", select: "name email" },
    { path: "studio", populate: { path: "user", select: "_id name email" } },
  ]);

  if (!booking) {
    throw new ApiError("Booking not found", 404);
  }

  // Check if user is the client who made the booking
  if (booking.client._id.toString() !== userId.toString()) {
    throw new ApiError("Not authorized to confirm this booking", 403);
  }

  // Check if booking can be confirmed
  if (!['reservation_pending', 'payment_pending'].includes(booking.status)) {
    throw new ApiError("Booking cannot be confirmed in its current state", 400);
  }

  // Use booking service to confirm
  const bookingService = require('../services/bookingService');
  const confirmedBooking = await bookingService.confirmBooking(booking, 'client_confirmation');

  res.json({
    status: "success",
    message: "Payment confirmed successfully",
    data: {
      booking: confirmedBooking,
    },
  });
});

module.exports = {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  completeBooking,
  confirmBooking,
  confirmPayment,
  getBookedSlots,
};
