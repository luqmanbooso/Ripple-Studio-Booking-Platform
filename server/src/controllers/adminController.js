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

// Studio Management Functions
const getStudios = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search, city } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') }
    ];
  }
  if (city) {
    query['location.city'] = city;
  }

  const studios = await Studio.find(query)
    .populate('user', 'name email verified isActive')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Studio.countDocuments(query);

  res.json({
    status: 'success',
    data: {
      studios,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

const createStudio = catchAsync(async (req, res) => {
  const {
    name,
    description,
    location,
    equipment,
    amenities,
    services,
    hourlyRate,
    capacity,
    ownerEmail
  } = req.body;

  // Find or create the owner user
  let owner = await User.findOne({ email: ownerEmail });
  
  if (!owner) {
    // Create a new studio owner account
    owner = await User.create({
      name: `${name} Owner`,
      email: ownerEmail,
      password: 'TempPassword123!', // They will need to reset this
      role: 'studio',
      verified: true,
      country: 'Sri Lanka',
      city: location.city
    });
  } else if (owner.role !== 'studio') {
    // Update existing user to studio role
    owner.role = 'studio';
    await owner.save();
  }

  const studio = await Studio.create({
    user: owner._id,
    name,
    description,
    location: {
      ...location,
      country: 'Sri Lanka' // Always Sri Lanka
    },
    equipment: equipment || [],
    amenities: amenities || [],
    services: services || [],
    hourlyRate: hourlyRate || 100,
    capacity: capacity || 10
  });

  // Update user with studio reference
  owner.studio = studio._id;
  await owner.save();

  const populatedStudio = await Studio.findById(studio._id)
    .populate('user', 'name email verified');

  res.status(201).json({
    status: 'success',
    data: { studio: populatedStudio }
  });
});

const updateStudio = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  // Ensure country is always Sri Lanka if location is being updated
  if (updateData.location) {
    updateData.location.country = 'Sri Lanka';
  }

  const studio = await Studio.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('user', 'name email verified');

  if (!studio) {
    throw new ApiError('Studio not found', 404);
  }

  res.json({
    status: 'success',
    data: { studio }
  });
});

const deleteStudio = catchAsync(async (req, res) => {
  const { id } = req.params;

  const studio = await Studio.findById(id);
  if (!studio) {
    throw new ApiError('Studio not found', 404);
  }

  // Remove studio reference from user
  await User.findByIdAndUpdate(studio.user, { $unset: { studio: 1 } });

  // Delete all related bookings (or handle them appropriately)
  await Booking.deleteMany({ studio: id });

  // Delete the studio
  await Studio.findByIdAndDelete(id);

  res.json({
    status: 'success',
    message: 'Studio deleted successfully'
  });
});

const toggleStudioStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const studio = await Studio.findById(id);
  if (!studio) {
    throw new ApiError('Studio not found', 404);
  }

  // Update the studio's owner user status
  await User.findByIdAndUpdate(studio.user, { isActive });

  const updatedStudio = await Studio.findById(id)
    .populate('user', 'name email verified isActive');

  res.json({
    status: 'success',
    data: { studio: updatedStudio }
  });
});

// Revenue Analytics
const getRevenueAnalytics = catchAsync(async (req, res) => {
  const { timeframe = 'month', startDate, endDate } = req.query;
  
  let dateFilter = {};
  const now = new Date();
  
  if (startDate && endDate) {
    dateFilter = {
      completedAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
  } else {
    let start;
    switch (timeframe) {
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // month
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    dateFilter = { completedAt: { $gte: start } };
  }

  const [
    totalRevenue,
    revenueByMonth,
    revenueByStudio,
    revenueByArtist,
    averageBookingValue
  ] = await Promise.all([
    // Total revenue
    Booking.aggregate([
      { $match: { status: 'completed', ...dateFilter } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]),
    
    // Revenue by month
    Booking.aggregate([
      { $match: { status: 'completed', ...dateFilter } },
      {
        $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' }
          },
          revenue: { $sum: '$price' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]),
    
    // Revenue by studio
    Booking.aggregate([
      { $match: { status: 'completed', studio: { $exists: true }, ...dateFilter } },
      {
        $lookup: {
          from: 'studios',
          localField: 'studio',
          foreignField: '_id',
          as: 'studioInfo'
        }
      },
      { $unwind: '$studioInfo' },
      {
        $group: {
          _id: '$studio',
          name: { $first: '$studioInfo.name' },
          revenue: { $sum: '$price' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]),
    
    // Revenue by artist
    Booking.aggregate([
      { $match: { status: 'completed', artist: { $exists: true }, ...dateFilter } },
      {
        $lookup: {
          from: 'artists',
          localField: 'artist',
          foreignField: '_id',
          as: 'artistInfo'
        }
      },
      { $unwind: '$artistInfo' },
      {
        $lookup: {
          from: 'users',
          localField: 'artistInfo.user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $group: {
          _id: '$artist',
          name: { $first: '$userInfo.name' },
          revenue: { $sum: '$price' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]),
    
    // Average booking value
    Booking.aggregate([
      { $match: { status: 'completed', ...dateFilter } },
      { $group: { _id: null, average: { $avg: '$price' } } }
    ])
  ]);

  res.json({
    status: 'success',
    data: {
      totalRevenue: totalRevenue[0]?.total || 0,
      averageBookingValue: averageBookingValue[0]?.average || 0,
      revenueByMonth: revenueByMonth.map(item => ({
        month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        revenue: item.revenue,
        bookings: item.bookings
      })),
      topStudios: revenueByStudio,
      topArtists: revenueByArtist
    }
  });
});

module.exports = {
  getAnalytics,
  getUsers,
  updateUserRole,
  getBookings,
  getReviews,
  approveReview,
  // Studio management
  getStudios,
  createStudio,
  updateStudio,
  deleteStudio,
  toggleStudioStatus,
  // Revenue analytics
  getRevenueAnalytics
};
