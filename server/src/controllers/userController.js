const User = require('../models/User');
const Artist = require('../models/Artist');
const Studio = require('../models/Studio');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { uploadImage } = require('../config/cloudinary');

const updateProfile = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { name, phone, country, city, ...otherData } = req.body;

  // Update user basic info
  const user = await User.findByIdAndUpdate(
    userId,
    { name, phone, country, city },
    { new: true, runValidators: true }
  ).populate('artist').populate('studio');

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  // Update role-specific profile if exists
  if (user.role === 'artist' && user.artist) {
    await Artist.findByIdAndUpdate(user.artist._id, otherData, {
      new: true,
      runValidators: true
    });
  } else if (user.role === 'studio' && user.studio) {
    await Studio.findByIdAndUpdate(user.studio._id, otherData, {
      new: true,
      runValidators: true
    });
  }

  res.json({
    status: 'success',
    data: { user }
  });
});

const uploadAvatar = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ApiError('No file uploaded', 400);
  }

  const userId = req.user._id;

  // Upload to cloudinary
  const result = await uploadImage(req.file.path, {
    folder: 'avatars',
    width: 200,
    height: 200,
    crop: 'fill'
  });

  // Update user avatar
  const user = await User.findByIdAndUpdate(
    userId,
    {
      avatar: {
        url: result.url,
        publicId: result.publicId
      }
    },
    { new: true }
  );

  res.json({
    status: 'success',
    data: {
      avatar: user.avatar
    }
  });
});

const getUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .populate('artist')
    .populate('studio')
    .select('-password -refreshToken');

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  res.json({
    status: 'success',
    data: { user }
  });
});

module.exports = {
  updateProfile,
  uploadAvatar,
  getUser
};
