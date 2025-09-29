const Booking = require("../models/Booking");
const Studio = require("../models/Studio");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const availabilityService = require("../services/availabilityService");
const bookingService = require("../services/bookingService");
const paymentService = require("../services/paymentService");
const { emitToUser, emitToProvider } = require("../utils/sockets");

const createBooking = catchAsync(async (req, res) => {
  const { studioId, service, start, end, notes } = req.body;
  const clientId = req.user._id;

  // Get the provider (studio only)
  const provider = await Studio.findById(studioId).populate("user");
  const providerType = "studio";

  if (!provider) {
    throw new ApiError("Provider not found", 404);
  }

  if (!provider.isActive) {
    throw new ApiError("Provider is not currently accepting bookings", 400);
  }

  // Validate service for studio
  const studioService = provider.getService(service.name);
  if (!studioService) {
    throw new ApiError("Service not available at this studio", 400);
  }
  service.price = studioService.price;
  service.durationMins = studioService.durationMins;

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

  // Create booking
  const booking = await Booking.create({
    client: clientId,
    [providerType]: provider._id,
    service,
    start: new Date(start),
    end: new Date(end),
    price: service.price,
    notes,
    status: "payment_pending",
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
    query.studio = req.user.studio._id;
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

  if (!booking.canCancel()) {
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
  const { studioId, date } = req.query;
  if (!studioId) {
    throw new ApiError("studioId is required", 400);
  }
  if (!date) {
    throw new ApiError("date is required (YYYY-MM-DD)", 400);
  }

  // Build date range for the given date (UTC)
  const startOfDay = new Date(`${date}T00:00:00.000Z`);
  const endOfDay = new Date(`${date}T23:59:59.999Z`);

  const query = {
    studio: studioId,
    start: { $gte: startOfDay, $lte: endOfDay },
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

module.exports = {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  completeBooking,
  getBookedSlots,
};
