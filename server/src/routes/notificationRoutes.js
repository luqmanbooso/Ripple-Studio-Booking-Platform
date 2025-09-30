const express = require('express');
const { z } = require('zod');
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

const router = express.Router();

// All notification routes require authentication
router.use(authenticate);

// Validation schemas
const testNotificationSchema = {
  body: z.object({
    type: z.string().optional(),
    title: z.string().min(1, 'Title is required').max(200),
    message: z.string().min(1, 'Message is required').max(1000),
    priority: z.enum(['low', 'medium', 'high']).optional()
  })
};

// Get user notifications
router.get('/', notificationController.getNotifications);

// Get notification statistics
router.get('/stats', notificationController.getNotificationStats);

// Mark notification as read
router.patch('/:id/read', notificationController.markAsRead);

// Mark all notifications as read
router.patch('/read-all', notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

// Admin only routes
router.post('/test', 
  allowRoles('admin'), 
  validate(testNotificationSchema), 
  notificationController.createTestNotification
);

module.exports = router;
