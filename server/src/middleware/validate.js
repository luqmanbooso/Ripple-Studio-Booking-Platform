const { z } = require('zod');
const ApiError = require('../utils/ApiError');

/**
 * Validation middleware using Zod
 * @param {object} schema - Zod schema object with body, params, query
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Validate request body
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      // Validate request params
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }

      // Validate request query
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors
          .map(err => `${err.path.join('.')}: ${err.message}`)
          .join(', ');
        
        return next(new ApiError(`Validation error: ${errorMessage}`, 400));
      }
      
      next(error);
    }
  };
};

// Common validation schemas
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

const pagination = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10)
});

module.exports = {
  validate,
  objectId,
  pagination
};
