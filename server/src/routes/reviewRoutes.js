const express = require('express');
const { z } = require('zod');
const reviewController = require('../controllers/reviewController');
const { validate, objectId, pagination } = require('../middleware/validate');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

const createReviewSchema = {
  body: z.object({
    targetType: z.enum(['artist', 'studio']),
    targetId: objectId,
    bookingId: objectId,
    rating: z.number().min(1).max(5),
    comment: z.string().max(1000).optional()
  })
};

const updateReviewSchema = {
  body: z.object({
    rating: z.number().min(1).max(5).optional(),
    comment: z.string().max(1000).optional()
  })
};

const getReviewsSchema = {
  query: pagination.extend({
    targetType: z.enum(['artist', 'studio']).optional(),
    targetId: objectId.optional()
  })
};

// Public routes
router.get('/', validate(getReviewsSchema), reviewController.getReviews);

// Protected routes
router.post('/', authenticate, validate(createReviewSchema), reviewController.createReview);
router.patch('/:id', authenticate, validate(updateReviewSchema), reviewController.updateReview);

module.exports = router;
