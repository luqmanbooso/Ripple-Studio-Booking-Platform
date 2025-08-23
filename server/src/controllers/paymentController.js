const Booking = require('../models/Booking');
const paymentService = require('../services/paymentService');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const createCheckoutSession = catchAsync(async (req, res) => {
  const { bookingId } = req.body;

  const booking = await Booking.findById(bookingId)
    .populate([
      { path: 'client' },
      { path: 'artist', populate: { path: 'user' } },
      { path: 'studio', populate: { path: 'user' } }
    ]);

  if (!booking) {
    throw new ApiError('Booking not found', 404);
  }

  // Verify user owns this booking
  if (booking.client._id.toString() !== req.user._id.toString()) {
    throw new ApiError('Access denied', 403);
  }

  if (booking.status !== 'payment_pending') {
    throw new ApiError('Booking is not pending payment', 400);
  }

  const session = await paymentService.createCheckoutSession(booking);

  res.json({
    status: 'success',
    data: {
      sessionId: session.id,
      url: session.url
    }
  });
});

const refundBooking = catchAsync(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new ApiError('Booking not found', 404);
  }

  if (!booking.paymentIntentId) {
    throw new ApiError('No payment found for this booking', 400);
  }

  const refund = await paymentService.refundPayment(
    booking.paymentIntentId,
    booking.price
  );

  booking.status = 'refunded';
  booking.refundAmount = booking.price;
  booking.refundedAt = new Date();
  await booking.save();

  res.json({
    status: 'success',
    data: {
      refund,
      booking
    }
  });
});

module.exports = {
  createCheckoutSession,
  refundBooking
};
