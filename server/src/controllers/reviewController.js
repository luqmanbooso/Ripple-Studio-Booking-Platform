const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Artist = require('../models/Artist');
const Studio = require('../models/Studio');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const createReview = catchAsync(async (req, res) => {
  const { targetType, targetId, bookingId, rating, comment } = req.body;
  const authorId = req.user._id;

  // Verify booking exists and user is the client
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError('Booking not found', 404);
  }

  if (booking.client.toString() !== authorId.toString()) {
    throw new ApiError('You can only review your own bookings', 403);
  }

  if (booking.status !== 'completed') {
    throw new ApiError('You can only review completed bookings', 400);
  }

  // Check if review already exists
  const existingReview = await Review.findOne({
    author: authorId,
    booking: bookingId
  });

  if (existingReview) {
    throw new ApiError('You have already reviewed this booking', 400);
  }

  // Create review
  const review = await Review.create({
    author: authorId,
    targetType,
    targetId,
    booking: bookingId,
    rating,
    comment,
    isApproved: false // Requires admin approval
  });

  // Update provider rating
  const Model = targetType === 'artist' ? Artist : Studio;
  const provider = await Model.findById(targetId);
  
  if (provider) {
    await provider.updateRating(rating);
  }

  await review.populate('author', 'name avatar');

  res.status(201).json({
    status: 'success',
    data: { review }
  });
});

const getReviews = catchAsync(async (req, res) => {
  const { targetType, targetId, page = 1, limit = 10 } = req.query;

  const query = { isApproved: true };
  
  if (targetType && targetId) {
    query.targetType = targetType;
    query.targetId = targetId;
  }

  const reviews = await Review.find(query)
    .populate('author', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Review.countDocuments(query);

  res.json({
    status: 'success',
    data: {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

const updateReview = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;

  const review = await Review.findById(id);

  if (!review) {
    throw new ApiError('Review not found', 404);
  }

  if (review.author.toString() !== userId.toString()) {
    throw new ApiError('You can only update your own reviews', 403);
  }

  review.rating = rating || review.rating;
  review.comment = comment || review.comment;
  review.isApproved = false; // Requires re-approval after edit

  await review.save();
  await review.populate('author', 'name avatar');

  res.json({
    status: 'success',
    data: { review }
  });
});

module.exports = {
  createReview,
  getReviews,
  updateReview
};
