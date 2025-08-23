const User = require('../models/User');
const Artist = require('../models/Artist');
const Studio = require('../models/Studio');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt');

const register = catchAsync(async (req, res) => {
  const { name, email, password, role, ...profileData } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError('User already exists with this email', 400);
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'client'
  });

  // Create profile based on role
  if (role === 'artist') {
    const artist = await Artist.create({
      user: user._id,
      hourlyRate: profileData.hourlyRate || 50,
      genres: profileData.genres || [],
      instruments: profileData.instruments || [],
      bio: profileData.bio || ''
    });
    user.artist = artist._id;
    await user.save();
  } else if (role === 'studio') {
    const studio = await Studio.create({
      user: user._id,
      name: profileData.studioName || `${name}'s Studio`,
      location: {
        country: profileData.country || '',
        city: profileData.city || ''
      },
      services: profileData.services || []
    });
    user.studio = studio._id;
    await user.save();
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokenPair(user._id);
  
  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save();

  // Set refresh token as httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(201).json({
    status: 'success',
    data: {
      user,
      accessToken
    }
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    throw new ApiError('Please provide email and password', 400);
  }

  // Check if user exists and password is correct
  const user = await User.findOne({ email })
    .select('+password')
    .populate('artist')
    .populate('studio');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError('Incorrect email or password', 401);
  }

  if (!user.isActive) {
    throw new ApiError('Your account has been deactivated', 401);
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokenPair(user._id);
  
  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save();

  // Set refresh token as httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  // Remove password from response
  user.password = undefined;

  res.json({
    status: 'success',
    data: {
      user,
      accessToken
    }
  });
});

const logout = catchAsync(async (req, res) => {
  // Clear refresh token from database
  if (req.user) {
    req.user.refreshToken = undefined;
    await req.user.save();
  }

  // Clear refresh token cookie
  res.clearCookie('refreshToken');

  res.json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new ApiError('Refresh token not provided', 401);
  }

  // Find user with this refresh token
  const user = await User.findOne({ refreshToken });
  if (!user) {
    throw new ApiError('Invalid refresh token', 401);
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    if (decoded.id !== user._id.toString()) {
      throw new ApiError('Invalid refresh token', 401);
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user._id);
    
    // Update refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      status: 'success',
      data: {
        accessToken
      }
    });
  } catch (error) {
    throw new ApiError('Invalid refresh token', 401);
  }
});

const getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('artist')
    .populate('studio');

  res.json({
    status: 'success',
    data: {
      user
    }
  });
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getMe
};
