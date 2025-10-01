const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Studio = require('../models/Studio');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { 
  sendStudioApprovalEmail, 
  sendStudioRejectionEmail 
} = require('../services/emailService');

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

  const dateFilter = { createdAt: { $gte: startDate } };
  const bookingDateFilter = { createdAt: { $gte: startDate } };
  const completedBookingFilter = { status: 'completed', completedAt: { $gte: startDate } };

  const [
    totalUsers,
    totalBookings,
    totalRevenue,
    avgRating,
    userGrowth,
    bookingTrends,
    revenueTrends,
    studioStats,
    reviewStats,
    userDemographics,
    platformHealth
  ] = await Promise.all([
    // Total users
    User.countDocuments(),
    
    // Total bookings
    Booking.countDocuments(),
    
    // Total revenue
    Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]),
    
    // Average rating
    Review.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]),
    
    // User growth over time
    User.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]),
    
    // Booking trends
    Booking.aggregate([
      { $match: bookingDateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$price' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]),
    
    // Revenue trends (completed bookings)
    Booking.aggregate([
      { $match: completedBookingFilter },
      {
        $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' },
            day: { $dayOfMonth: '$completedAt' }
          },
          revenue: { $sum: '$price' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]),
    
    // Studio statistics
    Studio.aggregate([
      {
        $group: {
          _id: '$isApproved',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          }
        }
      }
    ]),
    
    // Review statistics
    Review.aggregate([
      { $match: { isApproved: true } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]),
    
    // User demographics by role
    User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          }
        }
      }
    ]),
    
    // Platform health metrics
    Promise.resolve({
      activeUsers: await User.countDocuments({ lastLogin: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } }),
      pendingBookings: await Booking.countDocuments({ status: 'pending' }),
      completedBookings: await Booking.countDocuments({ status: 'completed' }),
      totalStudios: await Studio.countDocuments(),
      approvedStudios: await Studio.countDocuments({ isApproved: true })
    })
  ]);

  // Process user growth data
  const processedUserGrowth = userGrowth.map(item => ({
    date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
    users: item.count
  }));

  // Process booking trends
  const processedBookingTrends = bookingTrends.map(item => ({
    date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
    bookings: item.count,
    revenue: item.revenue
  }));

  // Process revenue trends
  const processedRevenueTrends = revenueTrends.map(item => ({
    date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
    revenue: item.revenue,
    bookings: item.count
  }));

  // Process rating distribution
  const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
    rating,
    count: reviewStats[0]?.ratingDistribution.filter(r => r === rating).length || 0
  }));

  res.json({
    status: 'success',
    data: {
      // Overview metrics
      totalUsers,
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      avgRating: avgRating[0]?.avg || 0,
      
      // Trends data
      userGrowth: processedUserGrowth,
      bookingTrends: processedBookingTrends,
      revenueTrends: processedRevenueTrends,
      
      // Studio stats
      studioStats: {
        total: studioStats.reduce((sum, stat) => sum + stat.count, 0),
        approved: studioStats.find(stat => stat._id === true)?.count || 0,
        pending: studioStats.find(stat => stat._id === false)?.count || 0,
        active: studioStats.reduce((sum, stat) => sum + stat.active, 0)
      },
      
      // Review stats
      reviewStats: {
        totalReviews: reviewStats[0]?.totalReviews || 0,
        avgRating: reviewStats[0]?.avgRating || 0,
        ratingDistribution
      },
      
      // User demographics
      userDemographics: userDemographics.map(demo => ({
        role: demo._id,
        count: demo.count,
        active: demo.active
      })),
      
      // Platform health
      platformHealth
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

const verifyUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(
    id,
    { 
      verified: true,
      emailVerificationToken: undefined,
      emailVerificationExpires: undefined
    },
    { new: true, runValidators: true }
  ).select('-password -refreshToken');

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  res.json({
    status: 'success',
    message: 'User verified successfully',
    data: { user }
  });
});

const unverifyUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(
    id,
    { verified: false },
    { new: true, runValidators: true }
  ).select('-password -refreshToken');

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  res.json({
    status: 'success',
    message: 'User unverified successfully',
    data: { user }
  });
});

const blockUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  // Prevent blocking admin users
  const targetUser = await User.findById(id);
  if (!targetUser) {
    throw new ApiError('User not found', 404);
  }

  if (targetUser.role === 'admin') {
    throw new ApiError('Cannot block admin users', 403);
  }

  const user = await User.findByIdAndUpdate(
    id,
    { 
      isBlocked: true,
      blockedAt: new Date(),
      blockedBy: req.user._id,
      blockReason: reason || 'No reason provided',
      isActive: false
    },
    { new: true, runValidators: true }
  ).select('-password -refreshToken');

  res.json({
    status: 'success',
    message: 'User blocked successfully',
    data: { user }
  });
});

const unblockUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(
    id,
    { 
      isBlocked: false,
      blockedAt: undefined,
      blockedBy: undefined,
      blockReason: undefined,
      isActive: true,
      loginAttempts: 0,
      lockUntil: undefined
    },
    { new: true, runValidators: true }
  ).select('-password -refreshToken');

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  res.json({
    status: 'success',
    message: 'User unblocked successfully',
    data: { user }
  });
});

const toggleUserStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const user = await User.findByIdAndUpdate(
    id,
    { isActive },
    { new: true, runValidators: true }
  ).select('-password -refreshToken');

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  res.json({
    status: 'success',
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: { user }
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Prevent deleting admin users
  const targetUser = await User.findById(id);
  if (!targetUser) {
    throw new ApiError('User not found', 404);
  }

  if (targetUser.role === 'admin') {
    throw new ApiError('Cannot delete admin users', 403);
  }

  // Delete related data
  await Promise.all([
    // Delete bookings where user is client
    Booking.deleteMany({ client: id }),
    // Delete reviews by the user
    Review.deleteMany({ author: id }),
    // Remove studio profile if exists
    Studio.deleteMany({ user: id })
  ]);

  // Delete the user
  await User.findByIdAndDelete(id);

  res.json({
    status: 'success',
    message: 'User and all related data deleted successfully'
  });
});

const getUserStats = catchAsync(async (req, res) => {
  const stats = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'client' }),
    User.countDocuments({ role: 'studio' }),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ verified: true }),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ isBlocked: true }),
    User.countDocuments({ 
      createdAt: { 
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
      } 
    })
  ]);

  res.json({
    status: 'success',
    data: {
      total: stats[0],
      clients: stats[1],
      studios: stats[2],
      admins: stats[3],
      verified: stats[4],
      active: stats[5],
      blocked: stats[6],
      newThisMonth: stats[7]
    }
  });
});

const bulkUserActions = catchAsync(async (req, res) => {
  const { userIds, action, reason } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new ApiError('User IDs array is required', 400);
  }

  let updateData = {};
  let message = '';

  switch (action) {
    case 'verify':
      updateData = { 
        verified: true,
        emailVerificationToken: undefined,
        emailVerificationExpires: undefined
      };
      message = 'Users verified successfully';
      break;
    case 'unverify':
      updateData = { verified: false };
      message = 'Users unverified successfully';
      break;
    case 'block':
      updateData = { 
        isBlocked: true,
        blockedAt: new Date(),
        blockedBy: req.user._id,
        blockReason: reason || 'Bulk action',
        isActive: false
      };
      message = 'Users blocked successfully';
      break;
    case 'unblock':
      updateData = { 
        isBlocked: false,
        blockedAt: undefined,
        blockedBy: undefined,
        blockReason: undefined,
        isActive: true
      };
      message = 'Users unblocked successfully';
      break;
    case 'activate':
      updateData = { isActive: true };
      message = 'Users activated successfully';
      break;
    case 'deactivate':
      updateData = { isActive: false };
      message = 'Users deactivated successfully';
      break;
    default:
      throw new ApiError('Invalid action', 400);
  }

  // Prevent bulk actions on admin users
  const adminUsers = await User.find({ 
    _id: { $in: userIds }, 
    role: 'admin' 
  }).select('_id');

  if (adminUsers.length > 0) {
    throw new ApiError('Cannot perform bulk actions on admin users', 403);
  }

  const result = await User.updateMany(
    { _id: { $in: userIds } },
    updateData
  );

  res.json({
    status: 'success',
    message,
    data: {
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    }
  });
});

const getBookings = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = {};
  if (status) query.status = status;

  const bookings = await Booking.find(query)
    .populate([
      { path: 'client', select: 'name email' },
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
    emptyArtistArray,
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
    
    // Empty array for artists (removed)
    Promise.resolve([]),
    
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
      topStudios: revenueByStudio
    }
  });
});

// Approve studio - allows studio to login and use the platform
const approveStudio = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { message: approvalMessage } = req.body;

  const studio = await Studio.findById(id).populate('user');
  if (!studio) {
    throw new ApiError('Studio not found', 404);
  }

  if (studio.isApproved) {
    throw new ApiError('Studio is already approved', 400);
  }

  // Approve the studio
  studio.isApproved = true;
  studio.statusReason = approvalMessage || 'Approved by admin';
  await studio.save();

  // Send approval email
  try {
    await sendStudioApprovalEmail(studio.user, studio);
  } catch (error) {
    console.error('Failed to send approval email:', error);
    // Don't fail the approval if email fails
  }

  // Send notification
  try {
    await NotificationService.notifyStudioApproval(studio, studio.user);
  } catch (error) {
    console.error('Failed to send approval notification:', error);
  }

  res.json({
    status: 'success',
    message: `Studio "${studio.name}" has been approved. User can now login.`,
    data: { 
      studio,
      user: {
        id: studio.user._id,
        name: studio.user.name,
        email: studio.user.email,
        canLogin: true
      }
    }
  });
});

// Reject studio - deletes both studio and user account
const rejectStudio = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const studio = await Studio.findById(id).populate('user');
  if (!studio) {
    throw new ApiError('Studio not found', 404);
  }

  if (studio.isApproved) {
    throw new ApiError('Cannot reject an approved studio', 400);
  }

  const user = studio.user;
  const userName = user.name;
  const userEmail = user.email;

  // Send rejection email before deletion
  try {
    await sendStudioRejectionEmail(user, studio, reason);
  } catch (error) {
    console.error('Failed to send rejection email:', error);
    // Continue with deletion even if email fails
  }

  // Delete the studio
  await Studio.findByIdAndDelete(id);

  // Delete the associated user account
  await User.findByIdAndDelete(user._id);

  // Send notification to admin
  try {
    await NotificationService.notifyStudioRejection(studio, user, reason);
  } catch (error) {
    console.error('Failed to send admin notification:', error);
  }

  res.json({
    status: 'success',
    message: `Studio "${studio.name}" and user account "${userName}" (${userEmail}) have been permanently deleted`,
    data: { 
      deletedStudio: {
        id: studio._id,
        name: studio.name
      },
      deletedUser: {
        id: user._id,
        name: userName,
        email: userEmail
      },
      reason: reason || 'Rejected by admin'
    }
  });
});

// Get pending studios
const getPendingStudios = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const [studios, total] = await Promise.all([
    Studio.find({ isApproved: false })
      .populate('user', 'name email phone createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Studio.countDocuments({ isApproved: false })
  ]);

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

module.exports = {
  getAnalytics,
  getUsers,
  updateUserRole,
  // User management
  verifyUser,
  unverifyUser,
  blockUser,
  unblockUser,
  toggleUserStatus,
  deleteUser,
  getUserStats,
  bulkUserActions,
  getBookings,
  getReviews,
  approveReview,
  // Studio management
  getStudios,
  createStudio,
  updateStudio,
  deleteStudio,
  // Studio approval
  approveStudio,
  rejectStudio,
  getPendingStudios,
  // Revenue analytics
  getRevenueAnalytics
};
