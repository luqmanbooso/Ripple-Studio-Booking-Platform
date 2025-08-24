const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Artist = require('../models/Artist');
const Studio = require('../models/Studio');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m'
  });

  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d'
  });

  return { accessToken, refreshToken };
};

const register = catchAsync(async (req, res) => {
  const { name, email, password, role, country, city, phone, artist, studio } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError('User already exists with this email', 400);
  }

  // Create user - always set country to Sri Lanka
  const user = await User.create({
    name,
    email,
    password,
    role,
    country: 'Sri Lanka', // Always set to Sri Lanka
    city,
    phone
  });

  // Create role-specific profile
  if (role === 'artist') {
    const artistData = {
      user: user._id,
      genres: artist?.genres || [],
      instruments: artist?.instruments || [],
      hourlyRate: artist?.hourlyRate || 50,
      bio: artist?.bio || ''
    };
    
    const artistProfile = await Artist.create(artistData);
    user.artist = artistProfile._id;
    await user.save();
  } else if (role === 'studio') {
    const studioData = {
      user: user._id,
      name: studio?.name || `${name}'s Studio`,
      description: studio?.description || '',
      location: { 
        country: 'Sri Lanka', // Always set to Sri Lanka
        city: city
      },
      services: []
    };
    
    const studioProfile = await Studio.create(studioData);
    user.studio = studioProfile._id;
    await user.save();
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save();

  // Set refresh token cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(201).json({
    status: 'success',
    message: 'Registration successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified
      },
      accessToken
    }
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError('Invalid credentials', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ApiError('Account has been deactivated', 401);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError('Invalid credentials', 401);
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Save refresh token
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  // Set refresh token cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.json({
    status: 'success',
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        avatar: user.avatar
      },
      accessToken
    }
  });
});

const logout = catchAsync(async (req, res) => {
  const userId = req.user._id;

  // Clear refresh token from database
  await User.findByIdAndUpdate(userId, { refreshToken: null });

  // Clear refresh token cookie
  res.clearCookie('refreshToken');

  res.json({
    status: 'success',
    message: 'Logout successful'
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new ApiError('Refresh token not provided', 401);
  }

  // Verify refresh token
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  
  // Find user and verify refresh token
  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== refreshToken) {
    throw new ApiError('Invalid refresh token', 401);
  }

  // Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

  // Update refresh token in database
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
});

const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.body;

  // For now, just mark as verified (implement proper email verification later)
  const user = await User.findOneAndUpdate(
    { _id: token }, // In real implementation, this would be a verification token
    { verified: true },
    { new: true }
  );

  if (!user) {
    throw new ApiError('Invalid verification token', 400);
  }

  res.json({
    status: 'success',
    message: 'Email verified successfully'
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError('User not found', 404);
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  // In real implementation, send email with reset link
  res.json({
    status: 'success',
    message: 'Password reset token sent to email',
    // For development only - remove in production
    resetToken
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const { token, password } = req.body;

  // Hash token and find user
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError('Invalid or expired reset token', 400);
  }

  // Update password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({
    status: 'success',
    message: 'Password reset successful'
  });
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
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe
};
