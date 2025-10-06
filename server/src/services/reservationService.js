const Booking = require('../models/Booking');
const cron = require('node-cron');

/**
 * Clean up expired reservations that haven't been paid for
 * Reservations expire after 15 minutes
 */
const cleanupExpiredReservations = async () => {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    const expiredReservations = await Booking.find({
      status: 'reservation_pending',
      createdAt: { $lt: fifteenMinutesAgo }
    });

    if (expiredReservations.length > 0) {
      await Booking.deleteMany({
        status: 'reservation_pending',
        createdAt: { $lt: fifteenMinutesAgo }
      });

      console.log(`Cleaned up ${expiredReservations.length} expired reservations`);
    }
  } catch (error) {
    console.error('Error cleaning up expired reservations:', error);
  }
};

/**
 * Start the reservation cleanup cron job
 * Runs every 5 minutes to clean up expired reservations
 */
const startReservationCleanup = () => {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', cleanupExpiredReservations);
  console.log('Reservation cleanup job started - runs every 5 minutes');
  
  // Also run cleanup immediately on startup
  cleanupExpiredReservations();
};

/**
 * Check if a reservation is expired
 * @param {Object} booking - Booking object
 * @returns {boolean} - True if reservation is expired
 */
const isReservationExpired = (booking) => {
  if (booking.status !== 'reservation_pending') return false;
  
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  return booking.createdAt < fifteenMinutesAgo;
};

/**
 * Get reservation expiry time
 * @param {Object} booking - Booking object
 * @returns {Date|null} - Expiry date or null if not a reservation
 */
const getReservationExpiry = (booking) => {
  if (booking.status !== 'reservation_pending') return null;
  
  return new Date(booking.createdAt.getTime() + 15 * 60 * 1000);
};

/**
 * Get time remaining for reservation in minutes
 * @param {Object} booking - Booking object
 * @returns {number} - Minutes remaining (0 if expired)
 */
const getReservationTimeRemaining = (booking) => {
  if (booking.status !== 'reservation_pending') return 0;
  
  const expiry = getReservationExpiry(booking);
  const now = new Date();
  const remaining = Math.max(0, Math.floor((expiry - now) / (1000 * 60)));
  
  return remaining;
};

module.exports = {
  cleanupExpiredReservations,
  startReservationCleanup,
  isReservationExpired,
  getReservationExpiry,
  getReservationTimeRemaining
};
