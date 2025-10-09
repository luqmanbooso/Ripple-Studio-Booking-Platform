const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const Studio = require("../models/Studio");
const Payout = require("../models/Payout");
const Notification = require("../models/Notification");
const paymentService = require("./paymentService");
const RevenueService = require("./revenueService");
const { emitToUser, emitToProvider } = require("../utils/sockets");
const logger = require("../utils/logger");

/**
 * Complete a booking
 * @param {object} booking - Booking object
 * @param {string} notes - Completion notes
 * @returns {Promise<object>} - Updated booking
 */
const completeBooking = async (booking, notes = "") => {
  try {
    // Update booking status
    booking.status = "completed";
    booking.completedAt = new Date();
    booking.providerNotes = notes;
    await booking.save();

    // Update provider stats
    const providerType = "studio";
    const providerId = booking.studio;

    await updateProviderStats(providerType, providerId, booking.price);

    // Create payout record
    const platformFee = calculatePlatformFee(booking.price);
    await Payout.create({
      booking: booking._id,
      recipientType: providerType,
      recipientId: providerId,
      amount: booking.price,
      platformFee,
      netAmount: booking.price - platformFee,
      status: "pending",
    });

    // Create notifications
    await createNotification(booking.client, "booking_completed", {
      title: "Booking Completed",
      message: `Your booking has been completed.`,
      bookingId: booking._id,
    });

    logger.info(`Booking completed: ${booking._id}`);
    return booking;
  } catch (error) {
    logger.error("Error completing booking:", error);
    throw error;
  }
};

/**
 * Cancel a booking
 * @param {object} booking - Booking object
 * @param {string} reason - Cancellation reason
 * @param {object} cancelledBy - User who cancelled (for audit)
 * @returns {Promise<object>} - Updated booking
 */
const cancelBooking = async (booking, reason = "", cancelledBy = null) => {
  try {
    const refundAmount = booking.getRefundAmount();

    // Update booking status
    booking.status = "cancelled";
    booking.cancellationReason = reason;
    booking.refundAmount = refundAmount;
    await booking.save();

    // Find associated payment record
    const payment = await Payment.findOne({
      booking: booking._id,
      status: 'Completed'
    });

    // Process refund if applicable
    if (refundAmount > 0 && booking.payherePaymentId && payment) {
      try {
        // Update payment record with refund status
        payment.processRefund(
          refundAmount,
          reason || 'Booking cancelled',
          cancelledBy
        );
        await payment.save();

        // Call PayHere refund API (manual processing required)
        await paymentService.refundPayment(
          booking.payherePaymentId,
          refundAmount
        );
        
        booking.status = "refunded";
        booking.refundedAt = new Date();
        await booking.save();

        logger.info(`Payment record ${payment._id} marked as Refunded`);
      } catch (refundError) {
        logger.error("Refund failed:", refundError);
        // Keep booking as cancelled even if refund fails
      }
    }

    // Create notifications
    const providerType = booking.artist ? "artist" : "studio";
    const provider = booking.artist || booking.studio;
    const providerUser = provider.user;

    await createNotification(booking.client, "booking_cancelled", {
      title: "Booking Cancelled",
      message: `Your booking has been cancelled. ${refundAmount > 0 ? `Refund amount: LKR ${refundAmount}` : ""}`,
      bookingId: booking._id,
    });

    await createNotification(providerUser._id, "booking_cancelled", {
      title: "Booking Cancelled",
      message: `A booking has been cancelled. Reason: ${reason}`,
      bookingId: booking._id,
    });

    logger.info(`Booking cancelled: ${booking._id}, Refund: LKR ${refundAmount}`);
    return booking;
  } catch (error) {
    logger.error("Error cancelling booking:", error);
    throw error;
  }
};

/**
 * Confirm a booking after payment
 * @param {object} booking - Booking object
 * @param {string} paymentId - PayHere payment ID
 * @returns {Promise<object>} - Updated booking
 */
const confirmBooking = async (booking, paymentId) => {
  try {
    booking.status = "confirmed";
    booking.payherePaymentId = paymentId;
    await booking.save();

    // Create revenue record from confirmed booking
    try {
      const paymentDetails = {
        paymentId: paymentId,
        paymentMethod: 'card', // Default to card, can be enhanced later
        paymentDate: new Date(),
        currency: booking.currency || 'LKR'
      };

      const revenue = await RevenueService.createRevenueFromBooking(booking, paymentDetails);
      logger.info(`Revenue record created for booking: ${booking._id}, revenue: ${revenue._id}`);
    } catch (revenueError) {
      logger.error("Error creating revenue record:", revenueError);
      // Don't fail the booking confirmation if revenue creation fails
    }

    // Create notifications
    const providerType = booking.artist ? "artist" : "studio";
    const provider = booking.artist || booking.studio;
    const providerUser = provider.user;

    await createNotification(booking.client, "booking_confirmed", {
      title: "Booking Confirmed",
      message: "Your payment has been processed and booking is confirmed.",
      bookingId: booking._id,
    });

    await createNotification(providerUser._id, "booking_confirmed", {
      title: "New Booking Confirmed",
      message: `You have a new confirmed booking from ${booking.client.name}.`,
      bookingId: booking._id,
    });

    // Emit socket events for real-time updates
    const providerId = booking.studio?._id;
    emitToProvider(providerType, providerId, "calendar_update", {
      action: "booking_confirmed",
      bookingId: booking._id,
      start: booking.start,
      end: booking.end,
    });

    logger.info(`Booking confirmed: ${booking._id}`);
    return booking;
  } catch (error) {
    logger.error("Error confirming booking:", error);
    throw error;
  }
};

/**
 * Update provider statistics
 * @param {string} providerType - 'studio'
 * @param {string} providerId - Provider ID
 * @param {number} amount - Booking amount
 */
const updateProviderStats = async (providerType, providerId, amount) => {
  if (providerType !== 'studio') return;
  
  await Studio.findByIdAndUpdate(providerId, {
    $inc: {
      completedBookings: 1,
      totalEarnings: amount,
    },
  });
};

/**
 * Calculate platform fee
 * @param {number} amount - Booking amount
 * @returns {number} - Platform fee
 */
const calculatePlatformFee = (amount) => {
  const feePercentage = 0.1; // 10% platform fee
  return Math.round(amount * feePercentage * 100) / 100; // Round to 2 decimal places
};

/**
 * Create notification
 * @param {string} userId - User ID
 * @param {string} type - Notification type
 * @param {object} data - Notification data
 */
const createNotification = async (userId, type, data) => {
  try {
    await Notification.create({
      user: userId,
      type,
      title: data.title,
      message: data.message,
      data: {
        bookingId: data.bookingId,
        amount: data.amount,
        currency: data.currency,
        url: data.url,
      },
    });

    // Emit real-time notification
    emitToUser(userId, "notification", data);
  } catch (error) {
    logger.error("Error creating notification:", error);
  }
};

/**
 * Send booking reminders
 * @param {Date} reminderDate - Date to send reminders for
 */
const sendBookingReminders = async (reminderDate = new Date()) => {
  try {
    const tomorrow = new Date(reminderDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Find bookings starting tomorrow that haven't had reminders sent
    const upcomingBookings = await Booking.find({
      start: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow,
      },
      status: "confirmed",
      reminderSent: false,
    }).populate([
      { path: "client", select: "name email" },
      { path: "studio", populate: { path: "user", select: "name email" } },
    ]);

    for (const booking of upcomingBookings) {
      const providerName = booking.studio.name;

      // Send reminder to client
      await createNotification(booking.client._id, "reminder", {
        title: "Booking Reminder",
        message: `Your booking with ${providerName} is tomorrow at ${new Date(booking.start).toLocaleTimeString()}.`,
        bookingId: booking._id,
      });

      // Send reminder to provider
      const providerUserId = booking.studio.user._id;
      await createNotification(providerUserId, "reminder", {
        title: "Booking Reminder",
        message: `You have a booking with ${booking.client.name} tomorrow at ${new Date(booking.start).toLocaleTimeString()}.`,
        bookingId: booking._id,
      });

      // Mark reminder as sent
      booking.reminderSent = true;
      await booking.save();
    }

    logger.info(`Sent ${upcomingBookings.length} booking reminders`);
  } catch (error) {
    logger.error("Error sending booking reminders:", error);
  }
};

module.exports = {
  completeBooking,
  cancelBooking,
  confirmBooking,
  updateProviderStats,
  calculatePlatformFee,
  createNotification,
  sendBookingReminders,
};
