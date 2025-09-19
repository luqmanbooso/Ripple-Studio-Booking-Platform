// Rate limiting feature removed by request. Export no-op middlewares so
// existing imports continue to work but no rate-limiting is applied.

// noop middleware generator
const noop = () => (req, res, next) => next();

const rateLimiter = noop();
const authLimiter = noop();
const uploadLimiter = noop();
const bookingLimiter = noop();

module.exports = {
  rateLimiter,
  authLimiter,
  uploadLimiter,
  bookingLimiter
};
