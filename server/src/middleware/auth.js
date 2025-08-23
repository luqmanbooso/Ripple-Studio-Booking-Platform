const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

/**
 * Middleware to authenticate user using JWT
 */
const authenticate = catchAsync(async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  let token;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError('Access token is required', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id)
      .populate('artist')
      .populate('studio')
      .select('-password');
    
    if (!user) {
      return next(new ApiError('User not found', 401));
    }

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError('Access token expired', 401));
    } else if (error.name === 'JsonWebTokenError') {
      return next(new ApiError('Invalid access token', 401));
    }
    return next(new ApiError('Authentication failed', 401));
  }
});

/**
 * Optional authentication - doesn't fail if no token provided
 */
const optionalAuth = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id)
        .populate('artist')
        .populate('studio')
        .select('-password');
      
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Continue without user
    }
  }

  next();
});

module.exports = { authenticate, optionalAuth };
