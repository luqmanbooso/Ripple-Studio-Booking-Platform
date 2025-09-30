const ApiError = require('../utils/ApiError');

/**
 * Role-based access control middleware
 * @param {...string} roles - Allowed roles
 */
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError('Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError('Access denied. Insufficient permissions.', 403);
    }

    next();
  };
};

module.exports = {
  allowRoles
};

const ownerOrAdmin = (resourceUserField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError('Authentication required', 401));
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.resource && req.resource[resourceUserField] 
      ? req.resource[resourceUserField].toString() 
      : req.params.userId || req.params.id;

    if (req.user._id.toString() === resourceUserId) {
      return next();
    }

    return next(new ApiError('Access denied. You can only access your own resources', 403));
  };
};

/**
 * Check if user is artist/studio owner or admin
 */
const providerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError('Authentication required', 401));
  }

  const allowedRoles = ['studio', 'admin'];
  if (!allowedRoles.includes(req.user.role)) {
    return next(new ApiError('Access denied. Only providers and admins allowed', 403));
  }

  next();
};

module.exports = {
  allowRoles,
  ownerOrAdmin,
  providerOrAdmin
};
