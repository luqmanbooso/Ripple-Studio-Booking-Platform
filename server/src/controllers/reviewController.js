const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Artist = require('../models/Artist');
const Studio = require('../models/Studio');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const createReview = catchAsync(async (req, res) => {
  const { targetType, targetId, booking: bookingId, rating, comment } = req.body;
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

// Admin: Get all reviews for moderation
const getAllReviewsForModeration = catchAsync(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    rating, 
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filter
  const filter = {};
  
  if (status) {
    if (status === 'approved') {
      filter.isApproved = true;
    } else if (status === 'pending') {
      filter.isApproved = false;
    } else if (status === 'reported') {
      filter['reported.0'] = { $exists: true };
    }
  }
  
  if (rating) {
    filter.rating = parseInt(rating);
  }

  // Search in comment or author name
  if (search) {
    filter.$or = [
      { comment: { $regex: search, $options: 'i' } },
      { 'author.name': { $regex: search, $options: 'i' } }
    ];
  }

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const reviews = await Review.find(filter)
    .populate('author', 'name email avatar')
    .populate('targetId', 'name')
    .populate('booking', 'start end service')
    .populate('moderatedBy', 'name')
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Review.countDocuments(filter);

  // Get statistics
  const stats = await Review.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        approved: { $sum: { $cond: ['$isApproved', 1, 0] } },
        pending: { $sum: { $cond: [{ $not: '$isApproved' }, 1, 0] } },
        reported: { $sum: { $cond: [{ $gt: [{ $size: '$reported' }, 0] }, 1, 0] } },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  res.json({
    status: 'success',
    data: {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      statistics: stats[0] || {
        total: 0,
        approved: 0,
        pending: 0,
        reported: 0,
        avgRating: 0
      }
    }
  });
});

// Admin: Moderate review (approve/reject)
const moderateReview = catchAsync(async (req, res) => {
  const { reviewId } = req.params;
  const { action, moderatorNotes } = req.body; // action: 'approve' or 'reject'

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError('Review not found', 404);
  }

  review.isApproved = action === 'approve';
  review.moderatorNotes = moderatorNotes;
  review.moderatedBy = req.user._id;
  review.moderatedAt = new Date();

  await review.save();

  // If approving, update the target's average rating
  if (action === 'approve') {
    const Model = review.targetType === 'artist' ? Artist : Studio;
    const target = await Model.findById(review.targetId);
    
    if (target) {
      const approvedReviews = await Review.find({
        targetType: review.targetType,
        targetId: review.targetId,
        isApproved: true
      });
      
      const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = totalRating / approvedReviews.length;
      
      target.rating = Math.round(avgRating * 10) / 10;
      target.reviewCount = approvedReviews.length;
      await target.save();
    }
  }

  await review.populate('author', 'name email');
  await review.populate('targetId', 'name');
  await review.populate('moderatedBy', 'name');

  res.json({
    status: 'success',
    data: { review },
    message: `Review ${action}d successfully`
  });
});

// Admin: Delete review
const deleteReview = catchAsync(async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError('Review not found', 404);
  }

  await Review.findByIdAndDelete(reviewId);

  // Recalculate target rating if review was approved
  if (review.isApproved) {
    const Model = review.targetType === 'artist' ? Artist : Studio;
    const target = await Model.findById(review.targetId);
    
    if (target) {
      const approvedReviews = await Review.find({
        targetType: review.targetType,
        targetId: review.targetId,
        isApproved: true
      });
      
      if (approvedReviews.length > 0) {
        const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = totalRating / approvedReviews.length;
        
        target.rating = Math.round(avgRating * 10) / 10;
        target.reviewCount = approvedReviews.length;
      } else {
        target.rating = 0;
        target.reviewCount = 0;
      }
      
      await target.save();
    }
  }

  res.json({
    status: 'success',
    message: 'Review deleted successfully'
  });
});

// Admin: Bulk moderate reviews
const bulkModerateReviews = catchAsync(async (req, res) => {
  const { reviewIds, action, moderatorNotes } = req.body;

  if (!reviewIds || !Array.isArray(reviewIds) || reviewIds.length === 0) {
    throw new ApiError('Review IDs are required', 400);
  }

  const reviews = await Review.find({ _id: { $in: reviewIds } });
  
  if (reviews.length === 0) {
    throw new ApiError('No reviews found', 404);
  }

  // Update all reviews
  await Review.updateMany(
    { _id: { $in: reviewIds } },
    {
      isApproved: action === 'approve',
      moderatorNotes,
      moderatedBy: req.user._id,
      moderatedAt: new Date()
    }
  );

  // If approving, recalculate ratings for affected targets
  if (action === 'approve') {
    const uniqueTargets = [...new Set(reviews.map(r => `${r.targetType}-${r.targetId}`))];
    
    for (const targetKey of uniqueTargets) {
      const [targetType, targetId] = targetKey.split('-');
      const Model = targetType === 'artist' ? Artist : Studio;
      const target = await Model.findById(targetId);
      
      if (target) {
        const approvedReviews = await Review.find({
          targetType,
          targetId,
          isApproved: true
        });
        
        const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = totalRating / approvedReviews.length;
        
        target.rating = Math.round(avgRating * 10) / 10;
        target.reviewCount = approvedReviews.length;
        await target.save();
      }
    }
  }

  res.json({
    status: 'success',
    data: { 
      processedCount: reviews.length,
      action 
    },
    message: `${reviews.length} reviews ${action}d successfully`
  });
});

module.exports = {
  createReview,
  getReviews,
  updateReview,
  getAllReviewsForModeration,
  moderateReview,
  deleteReview,
  bulkModerateReviews
};
