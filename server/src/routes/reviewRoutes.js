const express = require('express');
const { z } = require('zod');
const reviewController = require('../controllers/reviewController');
const { validate, objectId, pagination } = require('../middleware/validate');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');

const router = express.Router();

const createReviewSchema = {
  body: z.object({
    targetType: z.enum(['Studio']),
    targetId: objectId,
    booking: objectId,
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
    targetType: z.enum(['Artist', 'Studio']).optional(),
    targetId: objectId.optional()
  })
};

// Public routes
router.get('/', validate(getReviewsSchema), reviewController.getReviews);

// Protected routes
router.post('/', authenticate, validate(createReviewSchema), reviewController.createReview);
router.patch('/:id', authenticate, validate(updateReviewSchema), reviewController.updateReview);

// Admin routes
const adminModerationSchema = {
  query: pagination.extend({
    status: z.enum(['approved', 'pending', 'reported']).optional(),
    rating: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.enum(['createdAt', 'rating', 'moderatedAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
  })
};

const moderateReviewSchema = {
  body: z.object({
    action: z.enum(['approve', 'reject']),
    moderatorNotes: z.string().optional()
  })
};

const bulkModerateSchema = {
  body: z.object({
    reviewIds: z.array(objectId),
    action: z.enum(['approve', 'reject']),
    moderatorNotes: z.string().optional()
  })
};

router.get('/admin/all', 
  authenticate, 
  allowRoles('admin'), 
  validate(adminModerationSchema), 
  reviewController.getAllReviewsForModeration
);

router.patch('/admin/:reviewId/moderate', 
  authenticate, 
  allowRoles('admin'), 
  validate(moderateReviewSchema), 
  reviewController.moderateReview
);

router.delete('/admin/:reviewId', 
  authenticate, 
  allowRoles('admin'), 
  reviewController.deleteReview
);

router.post('/admin/bulk-moderate', 
  authenticate, 
  allowRoles('admin'), 
  validate(bulkModerateSchema), 
  reviewController.bulkModerateReviews
);

module.exports = router;
