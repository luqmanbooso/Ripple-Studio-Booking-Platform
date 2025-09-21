const { z } = require("zod");
const ApiError = require("../utils/ApiError");

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
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");

        return next(new ApiError(`Validation error: ${errorMessage}`, 400));
      }

      next(error);
    }
  };
};

// Common validation schemas
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

const pagination = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

// Feedback validation schemas
const generalFeedbackSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5),
    category: z.enum([
      "ui_ux",
      "performance",
      "booking",
      "payment",
      "search",
      "communication",
      "mobile",
      "other",
    ]),
    title: z.string().max(200).optional(),
    description: z.string().min(10).max(5000),
    email: z.string().email().optional(),
    anonymous: z.boolean().default(false),
  }),
});

const featureFeedbackSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(200),
    description: z.string().min(10).max(5000),
    category: z.enum([
      "booking",
      "payment",
      "communication",
      "discovery",
      "profile",
      "mobile",
      "integration",
      "other",
    ]),
    priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
    useCase: z.string().max(2000).optional(),
    email: z.string().email().optional(),
  }),
});

const bugFeedbackSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(200),
    description: z.string().min(10).max(5000),
    severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
    stepsToReproduce: z.string().min(10).max(2000),
    expectedBehavior: z.string().max(1000).optional(),
    actualBehavior: z.string().max(1000).optional(),
    browser: z.string().max(100).optional(),
    device: z.string().max(100).optional(),
    email: z.string().email().optional(),
  }),
});

// Feedback validation middleware
const validateFeedback = (type) => {
  const schemas = {
    general: generalFeedbackSchema,
    feature: featureFeedbackSchema,
    bug: bugFeedbackSchema,
  };

  const schema = schemas[type];
  if (!schema) {
    throw new Error(`Invalid feedback type: ${type}`);
  }

  return validate(schema);
};

module.exports = {
  validate,
  objectId,
  pagination,
  validateFeedback,
};
