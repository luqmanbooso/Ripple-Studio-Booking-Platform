const Artist = require('../models/Artist');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const getArtists = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    q,
    country,
    city,
    genre,
    instrument,
    minRate,
    maxRate,
    sort = '-ratingAvg'
  } = req.query;

  const query = { isActive: true };

  // Text search
  if (q) {
    query.$text = { $search: q };
  }

  // Location filters
  if (country || city) {
    const userQuery = {};
    if (country) userQuery.country = new RegExp(country, 'i');
    if (city) userQuery.city = new RegExp(city, 'i');
    
    const userIds = await User.find(userQuery).distinct('_id');
    query.user = { $in: userIds };
  }

  // Genre filter
  if (genre) {
    query.genres = new RegExp(genre, 'i');
  }

  // Instrument filter
  if (instrument) {
    query.instruments = new RegExp(instrument, 'i');
  }

  // Rate filter
  if (minRate || maxRate) {
    query.hourlyRate = {};
    if (minRate) query.hourlyRate.$gte = Number(minRate);
    if (maxRate) query.hourlyRate.$lte = Number(maxRate);
  }

  const artists = await Artist.find(query)
    .populate('user', 'name email avatar country city')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await Artist.countDocuments(query);

  res.json({
    status: 'success',
    data: {
      artists,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

const getArtist = catchAsync(async (req, res) => {
  const { id } = req.params;

  const artist = await Artist.findById(id)
    .populate('user', 'name email avatar phone country city verified');

  if (!artist) {
    throw new ApiError('Artist not found', 404);
  }

  res.json({
    status: 'success',
    data: { artist }
  });
});

const updateArtist = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const artist = await Artist.findById(id).populate('user');

  if (!artist) {
    throw new ApiError('Artist not found', 404);
  }

  // Check ownership
  if (artist.user._id.toString() !== userId.toString() && req.user.role !== 'admin') {
    throw new ApiError('Access denied', 403);
  }

  const updatedArtist = await Artist.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  ).populate('user', 'name email avatar phone country city');

  res.json({
    status: 'success',
    data: { artist: updatedArtist }
  });
});

const addAvailability = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const artist = await Artist.findById(id).populate('user');

  if (!artist) {
    throw new ApiError('Artist not found', 404);
  }

  // Check ownership
  if (artist.user._id.toString() !== userId.toString()) {
    throw new ApiError('Access denied', 403);
  }

  artist.availability.push(req.body);
  await artist.save();

  res.json({
    status: 'success',
    data: { artist }
  });
});

module.exports = {
  getArtists,
  getArtist,
  updateArtist,
  addAvailability
};
