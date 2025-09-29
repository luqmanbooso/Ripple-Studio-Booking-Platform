const Notification = require('../models/Notification');
const User = require('../models/User');
const { emitToUser, emitToRole } = require('../utils/sockets');

class NotificationService {
  // Create a notification
  static async createNotification({
    userId,
    type,
    title,
    message,
    data = {},
    priority = 'medium',
    expiresAt = null
  }) {
    try {
      const notification = await Notification.create({
        user: userId,
        type,
        title,
        message,
        data,
        priority,
        expiresAt
      });

      // Emit real-time notification to user
      emitToUser(userId, 'notification', notification);

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Create admin notification (sends to all admins)
  static async createAdminNotification({
    type,
    title,
    message,
    data = {},
    priority = 'medium',
    expiresAt = null
  }) {
    try {
      // Get all admin users
      const adminUsers = await User.find({ role: 'admin', isActive: true });
      
      const notifications = [];
      
      for (const admin of adminUsers) {
        const notification = await this.createNotification({
          userId: admin._id,
          type,
          title,
          message,
          data,
          priority,
          expiresAt
        });
        notifications.push(notification);
      }

      // Also emit to admin role for real-time updates
      emitToRole('admin', 'notification', {
        type,
        title,
        message,
        priority,
        data,
        createdAt: new Date()
      });

      return notifications;
    } catch (error) {
      console.error('Error creating admin notification:', error);
      throw error;
    }
  }

  // Studio registration notification
  static async notifyStudioRegistration(studio, user) {
    return this.createAdminNotification({
      type: 'studio_registration',
      title: 'New Studio Registration',
      message: `${studio.name} has registered and is awaiting approval`,
      data: {
        studioId: studio._id,
        userId: user._id,
        actionRequired: true,
        url: `/admin/studios/approvals`,
        metadata: {
          studioName: studio.name,
          ownerName: user.name,
          ownerEmail: user.email,
          location: `${studio.location.city}, ${studio.location.country}`
        }
      },
      priority: 'high'
    });
  }

  // User registration notification
  static async notifyUserRegistration(user) {
    return this.createAdminNotification({
      type: 'user_registration',
      title: 'New User Registration',
      message: `${user.name} (${user.role}) has joined the platform`,
      data: {
        userId: user._id,
        url: `/admin/users`,
        metadata: {
          userName: user.name,
          userEmail: user.email,
          userRole: user.role,
          registrationDate: user.createdAt
        }
      },
      priority: 'low'
    });
  }

  // Booking created notification
  static async notifyBookingCreated(booking, client, studio) {
    return this.createAdminNotification({
      type: 'booking_created',
      title: 'New Booking Created',
      message: `${client.name} booked ${studio.name} for ${booking.service.name}`,
      data: {
        bookingId: booking._id,
        userId: client._id,
        studioId: studio._id,
        amount: booking.price,
        currency: 'LKR',
        url: `/admin/bookings`,
        metadata: {
          clientName: client.name,
          studioName: studio.name,
          serviceName: booking.service.name,
          bookingDate: booking.start,
          totalAmount: booking.price
        }
      },
      priority: 'medium'
    });
  }

  // Review flagged notification
  static async notifyReviewFlagged(review, reporter) {
    return this.createAdminNotification({
      type: 'review_flagged',
      title: 'Review Flagged for Moderation',
      message: `A review has been flagged as inappropriate and needs moderation`,
      data: {
        reviewId: review._id,
        userId: reporter._id,
        actionRequired: true,
        url: `/admin/reviews`,
        metadata: {
          reviewContent: review.comment,
          reviewRating: review.rating,
          reporterName: reporter.name,
          flaggedDate: new Date()
        }
      },
      priority: 'high'
    });
  }

  // Payment dispute notification
  static async notifyPaymentDispute(booking, reason) {
    return this.createAdminNotification({
      type: 'payment_dispute',
      title: 'Payment Dispute Reported',
      message: `A payment dispute has been reported for booking #${booking._id}`,
      data: {
        bookingId: booking._id,
        amount: booking.price,
        currency: 'LKR',
        actionRequired: true,
        url: `/admin/payments`,
        metadata: {
          disputeReason: reason,
          bookingAmount: booking.price,
          disputeDate: new Date()
        }
      },
      priority: 'high'
    });
  }

  // Revenue milestone notification
  static async notifyRevenueMilestone(milestone, currentRevenue) {
    return this.createAdminNotification({
      type: 'revenue_milestone',
      title: 'Revenue Milestone Achieved! 🎉',
      message: `Platform has reached LKR ${milestone.toLocaleString()} in total revenue!`,
      data: {
        amount: currentRevenue,
        currency: 'LKR',
        url: `/admin/revenue`,
        metadata: {
          milestone: milestone,
          currentRevenue: currentRevenue,
          achievedDate: new Date()
        }
      },
      priority: 'medium'
    });
  }

  // System alert notification
  static async notifySystemAlert(alertType, message, metadata = {}) {
    return this.createAdminNotification({
      type: 'system_alert',
      title: `System Alert: ${alertType}`,
      message: message,
      data: {
        actionRequired: true,
        url: `/admin`,
        metadata: {
          alertType,
          alertTime: new Date(),
          ...metadata
        }
      },
      priority: 'high'
    });
  }

  // Get notifications for a user
  static async getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
    const query = { user: userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('data.userId', 'name email')
      .populate('data.studioId', 'name')
      .populate('data.bookingId', 'service start')
      .populate('data.reviewId', 'rating comment');

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

    return {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    };
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return notification.markAsRead();
  }

  // Mark all notifications as read
  static async markAllAsRead(userId) {
    return Notification.updateMany(
      { user: userId, isRead: false },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );
  }

  // Delete notification
  static async deleteNotification(notificationId, userId) {
    return Notification.findOneAndDelete({
      _id: notificationId,
      user: userId
    });
  }

  // Get notification statistics
  static async getNotificationStats(userId) {
    const stats = await Notification.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: {
            $sum: {
              $cond: [{ $eq: ['$isRead', false] }, 1, 0]
            }
          },
          high_priority: {
            $sum: {
              $cond: [{ $eq: ['$priority', 'high'] }, 1, 0]
            }
          }
        }
      }
    ]);

    return stats[0] || { total: 0, unread: 0, high_priority: 0 };
  }

  // Notify user blocked/warned
  static async notifyUserBlocked(user, adminUser, reason, blockType) {
    try {
      const title = blockType === 'warning' 
        ? 'User Warning Issued'
        : blockType === 'permanent' 
          ? 'User Permanently Blocked'
          : 'User Temporarily Blocked';

      const message = blockType === 'warning'
        ? `Warning issued to ${user.name} (${user.email}). Reason: ${reason}`
        : `${user.name} (${user.email}) has been ${blockType === 'permanent' ? 'permanently' : 'temporarily'} blocked. Reason: ${reason}`;

      return await this.createAdminNotification({
        type: 'user_blocked',
        title,
        message,
        priority: blockType === 'permanent' ? 'high' : 'medium',
        data: {
          userId: user._id,
          userEmail: user.email,
          userName: user.name,
          blockType,
          reason,
          blockedBy: adminUser._id,
          blockedByName: adminUser.name,
          url: '/admin/users',
          metadata: {
            blockType,
            reason,
            blockedAt: new Date()
          }
        }
      });
    } catch (error) {
      console.error('Failed to create user blocked notification:', error);
    }
  }
}

module.exports = NotificationService;
