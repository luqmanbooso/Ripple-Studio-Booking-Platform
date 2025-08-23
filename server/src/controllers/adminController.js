const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Artist = require('../models/Artist');
const Studio = require('../models/Studio');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const getAnalytics = catchAsync(async (req, res) => {
  const { timeframe = 'month' } = req.query;
  
  // Calculate date range based on timeframe
  const now = new Date();
  let startDate;
  
  switch (timeframe) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'quarter':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default: // month
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const [
    totalUsers,
    totalBookings,
    totalRevenue,
    avgRating
  ] = await Promise.all([
    User.countDocuments(),
    Booking.countDocuments(),
    Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]),
    Review.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ])
  ]);

  res.json({
    status: 'success',
    data: {
      totalUsers,
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      avgRating: avgRating[0]?.avg || 0
    }
  });
});

const getUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, role, search } = req.query;

  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') }
    ];
  }

  const users = await User.find(query)
    .select('-password -refreshToken')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(query);

  res.json({
    status: 'success',
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

const updateUserRole = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  ).select('-password -refreshToken');

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  res.json({
    status: 'success',
    data: { user }
  });
});

const getBookings = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = {};
  if (status) query.status = status;

  const bookings = await Booking.find(query)
    .populate([
      { path: 'client', select: 'name email' },
      { path: 'artist', populate: { path: 'user', select: 'name email' } },
      { path: 'studio', populate: { path: 'user', select: 'name email' } }
    ])
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Booking.countDocuments(query);

  res.json({
    status: 'success',
    data: {
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

const getReviews = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, isApproved } = req.query;

  const query = {};
  if (isApproved !== undefined) query.isApproved = isApproved === 'true';

  const reviews = await Review.find(query)
    .populate('author', 'name email')
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

const approveReview = catchAsync(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findByIdAndUpdate(
    id,
    { 
      isApproved: true,
      moderatedBy: req.user._id,
      moderatedAt: new Date()
    },
    { new: true }
  ).populate('author', 'name email');

  if (!review) {
    throw new ApiError('Review not found', 404);
  }

  res.json({
    status: 'success',
    data: { review }
  });
});

module.exports = {
  getAnalytics,
  getUsers,
  updateUserRole,
  getBookings,
  getReviews,
  approveReview
};
