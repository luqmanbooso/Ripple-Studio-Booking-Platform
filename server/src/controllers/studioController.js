const Studio = require('../models/Studio');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const mongoose = require('mongoose');

// Create a new studio (for studio owners and admin)
const createStudio = catchAsync(async (req, res) => {
  let studioOwnerId = req.user.id;

  // If admin is creating a studio for someone else
  if (req.user.role === 'admin' && req.body.ownerEmail) {
    // Check if user with that email exists
    let studioOwner = await User.findOne({ email: req.body.ownerEmail });
    
    if (!studioOwner) {
      // Create a new user for the studio owner
      studioOwner = await User.create({
        email: req.body.ownerEmail,
        name: req.body.ownerName || req.body.name + ' Owner',
        role: 'studio',
        isVerified: true
      });
    }
    
    studioOwnerId = studioOwner._id;
  }

  const studioData = { 
    ...req.body,
    user: studioOwnerId,
    isApproved: false, // Always start as pending for review
    verificationStatus: 'pending'
  };

  // Remove ownerEmail and ownerName from studioData as they're not part of the schema
  delete studioData.ownerEmail;
  delete studioData.ownerName;

  // If admin is creating, auto-approve
  if (req.user.role === 'admin') {
    studioData.isApproved = true;
    studioData.verificationStatus = 'verified';
  }

  const studio = await Studio.create(studioData);
  
  await studio.populate('user', 'name email');

  res.status(201).json({
    status: 'success',
    message: req.user.role === 'admin' ? 'Studio created and approved' : 'Studio created and submitted for review',
    data: { studio }
  });
});

const getStudios = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    q,
    country,
    city,
    service,
    sort = '-ratingAvg'
  } = req.query;

  const query = { isActive: true, isApproved: true }; // Only show approved studios to public

  // Text search
  if (q) {
    query.$text = { $search: q };
  }

  // Location filters
  if (country) {
    query['location.country'] = new RegExp(country, 'i');
  }
  if (city) {
    query['location.city'] = new RegExp(city, 'i');
  }

  // Service filter
  if (service) {
    query['services.name'] = new RegExp(service, 'i');
  }

  const studios = await Studio.find(query)
    .populate('user', 'name email avatar phone')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

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

const getStudio = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError('Invalid studio ID', 400);
  }

  const studio = await Studio.findById(id)
    .populate('user', 'name email avatar phone verified');

  if (!studio) {
    throw new ApiError('Studio not found', 404);
  }

  res.json({
    status: 'success',
    data: { studio }
  });
});

const updateStudio = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const studio = await Studio.findById(id).populate('user');

  if (!studio) {
    throw new ApiError('Studio not found', 404);
  }

  // Check ownership
  if (studio.user._id.toString() !== userId.toString() && req.user.role !== 'admin') {
    throw new ApiError('Access denied', 403);
  }

  const updatedStudio = await Studio.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  ).populate('user', 'name email avatar phone');

  res.json({
    status: 'success',
    data: { studio: updatedStudio }
  });
});

const addAvailability = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  console.log('=== AVAILABILITY REQUEST ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('User ID:', userId);

  const studio = await Studio.findById(id).populate('user');

  if (!studio) {
    throw new ApiError('Studio not found', 404);
  }

  // Check ownership
  if (studio.user._id.toString() !== userId.toString()) {
    throw new ApiError('Access denied', 403);
  }

  try {
    studio.availability.push(req.body);
    await studio.save();

    res.json({
      status: 'success',
      data: { studio }
    });
  } catch (error) {
    console.error('Error saving availability:', error.message);
    throw new ApiError(error.message, 400);
  }
});

// Delete availability slot
const deleteAvailability = catchAsync(async (req, res) => {
  const { id, availabilityId } = req.params;
  const userId = req.user._id;

  const studio = await Studio.findById(id).populate('user');

  if (!studio) {
    throw new ApiError('Studio not found', 404);
  }

  // Check ownership
  if (studio.user._id.toString() !== userId.toString()) {
    throw new ApiError('Access denied', 403);
  }

  // Find and remove the availability slot
  const availabilityIndex = studio.availability.findIndex(
    slot => slot._id.toString() === availabilityId
  );

  if (availabilityIndex === -1) {
    throw new ApiError('Availability slot not found', 404);
  }

  studio.availability.splice(availabilityIndex, 1);
  await studio.save();

  res.json({
    status: 'success',
    message: 'Availability slot deleted successfully',
    data: { studio }
  });
});

// Get studio availability
const getAvailability = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate } = req.query;

  const studio = await Studio.findById(id);
  if (!studio) {
    throw new ApiError('Studio not found', 404);
  }

  let availability = studio.availability || [];

  // Filter by date range if provided
  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);

    availability = availability.filter(slot => {
      const slotStart = new Date(slot.start);
      const slotEnd = new Date(slot.end);
      return slotStart >= start && slotEnd <= end;
    });
  }

  res.json({
    status: 'success',
    data: { availability }
  });
});

// Admin functions
const getAllStudiosForAdmin = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    q,
    status,
    type,
    sort = '-createdAt'
  } = req.query;

  const query = {};

  // Text search across multiple fields
  if (q) {
    query.$or = [
      { name: new RegExp(q, 'i') },
      { 'location.city': new RegExp(q, 'i') },
      { 'location.country': new RegExp(q, 'i') },
      { description: new RegExp(q, 'i') }
    ];
  }

  // Status filter
  if (status && status !== 'all') {
    if (status === 'active') {
      query.isActive = true;
      query.isApproved = true;
    } else if (status === 'pending') {
      query.isApproved = false;
    } else if (status === 'suspended') {
      query.isActive = false;
    }
  }

  // Type filter
  if (type && type !== 'all') {
    query.studioType = type;
  }

  const studios = await Studio.find(query)
    .populate('user', 'name email avatar phone createdAt')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await Studio.countDocuments(query);

  // Add calculated fields (remove bookings population since it's not in schema)
  const studiosWithStats = studios.map(studio => ({
    ...studio,
    totalBookings: 0, // TODO: Calculate from Booking collection if needed
    totalRevenue: 0   // TODO: Calculate from Booking collection if needed
  }));

  res.json({
    status: 'success',
    data: {
      studios: studiosWithStats,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  }); // Updated for admin studio management
});

const getStudioStats = catchAsync(async (req, res) => {
  const totalStudios = await Studio.countDocuments();
  const approvedStudios = await Studio.countDocuments({ isApproved: true });
  const pendingStudios = await Studio.countDocuments({ isApproved: false, verificationStatus: 'pending' });
  const rejectedStudios = await Studio.countDocuments({ isApproved: false, verificationStatus: 'rejected' });
  const activeStudios = await Studio.countDocuments({ isActive: true, isApproved: true });

  res.json({
    status: 'success',
    data: {
      totalStudios,
      approvedStudios,
      pendingStudios,
      rejectedStudios,
      activeStudios
    }
  });
});

const getStudioAnalytics = catchAsync(async (req, res) => {
  const { period = '30d' } = req.query;
  
  let dateFilter = {};
  const now = new Date();
  
  if (period === '7d') {
    dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
  } else if (period === '30d') {
    dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
  } else if (period === '90d') {
    dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
  }

  // New studios over time
  const newStudios = await Studio.aggregate([
    { $match: { createdAt: dateFilter } },
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
  ]);

  // Revenue by studio
  const Booking = require('../models/Booking');
  const revenueByStudio = await Booking.aggregate([
    { $match: { status: 'completed', createdAt: dateFilter } },
    {
      $group: {
        _id: '$studio',
        totalRevenue: { $sum: '$totalAmount' },
        bookingCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'studios',
        localField: '_id',
        foreignField: '_id',
        as: 'studio'
      }
    },
    { $unwind: '$studio' },
    { $sort: { totalRevenue: -1 } },
    { $limit: 10 }
  ]);

  res.json({
    status: 'success',
    data: {
      newStudios,
      revenueByStudio,
      period
    }
  });
});

const updateStudioStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { isApproved, verificationStatus, reason } = req.body;

  const updateData = {};
  
  // Handle direct field updates
  if (typeof isApproved !== 'undefined') {
    updateData.isApproved = isApproved;
  }
  
  if (verificationStatus) {
    updateData.verificationStatus = verificationStatus;
  }
  
  // Set isActive based on approval status
  if (typeof isApproved !== 'undefined') {
    updateData.isActive = isApproved;
  }

  if (reason) {
    updateData.statusReason = reason;
  }

  const studio = await Studio.findByIdAndUpdate(id, updateData, { new: true });

  if (!studio) {
    throw new ApiError(404, 'Studio not found');
  }

  const actionMessage = isApproved === true ? 'approved' : 
                       isApproved === false && verificationStatus === 'rejected' ? 'rejected' : 
                       'updated';

  res.json({
    status: 'success',
    message: `Studio ${actionMessage} successfully`,
    data: { studio }
  });
});

const toggleStudioFeature = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { feature, enabled } = req.body;

  const updateData = {};
  updateData[`features.${feature}`] = enabled;

  const studio = await Studio.findByIdAndUpdate(id, updateData, { new: true });

  if (!studio) {
    throw new ApiError(404, 'Studio not found');
  }

  res.json({
    status: 'success',
    message: `Studio feature ${enabled ? 'enabled' : 'disabled'} successfully`,
    data: { studio }
  });
});

const deleteStudio = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Check for active bookings
  const Booking = require('../models/Booking');
  const activeBookings = await Booking.countDocuments({
    studio: id,
    status: { $in: ['pending', 'confirmed'] }
  });

  if (activeBookings > 0) {
    throw new ApiError(400, 'Cannot delete studio with active bookings');
  }

  const studio = await Studio.findByIdAndDelete(id);

  if (!studio) {
    throw new ApiError(404, 'Studio not found');
  }

  res.json({
    status: 'success',
    message: 'Studio deleted successfully'
  });
});

const bulkStudioActions = catchAsync(async (req, res) => {
  const { action, studioIds, data } = req.body;

  let updateData = {};
  let message = '';

  switch (action) {
    case 'approve':
      updateData = { isApproved: true, isActive: true };
      message = 'Studios approved successfully';
      break;
    case 'suspend':
      updateData = { isActive: false };
      message = 'Studios suspended successfully';
      break;
    case 'activate':
      updateData = { isActive: true };
      message = 'Studios activated successfully';
      break;
    case 'feature':
      updateData[`features.${data.feature}`] = data.enabled;
      message = `Studio feature ${data.enabled ? 'enabled' : 'disabled'} successfully`;
      break;
    default:
      throw new ApiError(400, 'Invalid bulk action');
  }

  const result = await Studio.updateMany(
    { _id: { $in: studioIds } },
    updateData
  );

  res.json({
    status: 'success',
    message,
    data: {
      modifiedCount: result.modifiedCount
    }
  });
});

module.exports = {
  createStudio,
  getStudios,
  getStudio,
  updateStudio,
  addAvailability,
  deleteAvailability,
  getAvailability,
  getAllStudiosForAdmin,
  getStudioStats,
  getStudioAnalytics,
  updateStudioStatus,
  toggleStudioFeature,
  deleteStudio,
  bulkStudioActions
};
