const Studio = require('../models/Studio');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

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

  const query = { isActive: true };

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

  const studio = await Studio.findById(id).populate('user');

  if (!studio) {
    throw new ApiError('Studio not found', 404);
  }

  // Check ownership
  if (studio.user._id.toString() !== userId.toString()) {
    throw new ApiError('Access denied', 403);
  }

  studio.availability.push(req.body);
  await studio.save();

  res.json({
    status: 'success',
    data: { studio }
  });
});

module.exports = {
  getStudios,
  getStudio,
  updateStudio,
  addAvailability
};
