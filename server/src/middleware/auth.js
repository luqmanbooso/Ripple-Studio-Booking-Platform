const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

/**
 * Middleware to authenticate user using JWT
 */
const authenticate = catchAsync(async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError('Access token is required', 401);
  }

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

  // Get user from token
  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    throw new ApiError('User not found', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ApiError('Account has been deactivated', 401);
  }

  req.user = user;
  next();
});

/**
 * Optional authentication - doesn't fail if no token provided
 */
const optionalAuth = catchAsync(async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Continue without user if token is invalid
    }
  }

  next();
});

module.exports = {
  authenticate,
  optionalAuth
};


module.exports = { authenticate, optionalAuth };
