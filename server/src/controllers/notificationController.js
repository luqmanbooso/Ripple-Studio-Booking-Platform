const NotificationService = require('../services/notificationService');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// Get user notifications
const getNotifications = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 20, unreadOnly = false } = req.query;

  const result = await NotificationService.getUserNotifications(userId, {
    page: parseInt(page),
    limit: parseInt(limit),
    unreadOnly: unreadOnly === 'true'
  });

  res.json({
    status: 'success',
    data: result
  });
});

// Get notification statistics
const getNotificationStats = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const stats = await NotificationService.getNotificationStats(userId);

  res.json({
    status: 'success',
    data: stats
  });
});

// Mark notification as read
const markAsRead = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const notification = await NotificationService.markAsRead(id, userId);

  res.json({
    status: 'success',
    message: 'Notification marked as read',
    data: { notification }
  });
});

// Mark all notifications as read
const markAllAsRead = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const result = await NotificationService.markAllAsRead(userId);

  res.json({
    status: 'success',
    message: `${result.modifiedCount} notifications marked as read`
  });
});

// Delete notification
const deleteNotification = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const notification = await NotificationService.deleteNotification(id, userId);

  if (!notification) {
    throw new ApiError('Notification not found', 404);
  }

  res.json({
    status: 'success',
    message: 'Notification deleted successfully'
  });
});

// Create test notification (admin only - for testing)
const createTestNotification = catchAsync(async (req, res) => {
  const { type, title, message, priority = 'medium' } = req.body;

  const notification = await NotificationService.createAdminNotification({
    type: type || 'system_alert',
    title: title || 'Test Notification',
    message: message || 'This is a test notification from the admin panel',
    priority,
    data: {
      url: '/admin',
      metadata: {
        testNotification: true,
        createdBy: req.user.name,
        createdAt: new Date()
      }
    }
  });

  res.json({
    status: 'success',
    message: 'Test notification created successfully',
    data: { notification }
  });
});

module.exports = {
  getNotifications,
  getNotificationStats,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createTestNotification
};
