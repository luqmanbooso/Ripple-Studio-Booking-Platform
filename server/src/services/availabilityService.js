const Booking = require('../models/Booking');
const Artist = require('../models/Artist');
const Studio = require('../models/Studio');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Check if a time slot is available for booking
 * @param {string} providerType - 'artist' or 'studio'
 * @param {string} providerId - Provider ID
 * @param {Date|string} start - Start time
 * @param {Date|string} end - End time
 * @returns {Promise<boolean>} - True if available
 */
const checkAvailability = async (providerType, providerId, start, end) => {
  const startTime = new Date(start);
  const endTime = new Date(end);

  // Check if provider has availability for this time slot
  const hasAvailability = await checkProviderAvailability(providerType, providerId, startTime, endTime);
  if (!hasAvailability) {
    return false;
  }

  // Check for conflicting bookings
  const hasConflict = await checkBookingConflicts(providerType, providerId, startTime, endTime);
  if (hasConflict) {
    return false;
  }

  return true;
};

/**
 * Check if provider has defined availability for the time slot
 * @param {string} providerType - 'artist' or 'studio'
 * @param {string} providerId - Provider ID
 * @param {Date} start - Start time
 * @param {Date} end - End time
 * @returns {Promise<boolean>} - True if provider is available
 */
const checkProviderAvailability = async (providerType, providerId, start, end) => {
  const Model = providerType === 'artist' ? Artist : Studio;
  const provider = await Model.findById(providerId);

  if (!provider || !provider.isActive) {
    return false;
  }

  // If no availability slots defined, assume always available
  if (!provider.availability || provider.availability.length === 0) {
    return true;
  }

  return provider.availability.some(slot => {
    if (slot.isRecurring) {
      return checkRecurringAvailability(slot, start, end);
    } else {
      return checkOneTimeAvailability(slot, start, end);
    }
  });
};

/**
 * Check recurring availability slot
 * @param {object} slot - Availability slot
 * @param {Date} start - Start time
 * @param {Date} end - End time
 * @returns {boolean} - True if available
 */
const checkRecurringAvailability = (slot, start, end) => {
  const startDay = dayjs(start);
  const endDay = dayjs(end);
  
  // Check if the days of week match
  const startDayOfWeek = startDay.day();
  const endDayOfWeek = endDay.day();
  
  if (!slot.daysOfWeek.includes(startDayOfWeek) || !slot.daysOfWeek.includes(endDayOfWeek)) {
    return false;
  }
  
  // Check time ranges
  const slotStart = dayjs(slot.start).utc();
  const slotEnd = dayjs(slot.end).utc();
  const requestStart = startDay.utc();
  const requestEnd = endDay.utc();
  
  // Compare times (ignore dates for recurring slots)
  const slotStartTime = slotStart.format('HH:mm');
  const slotEndTime = slotEnd.format('HH:mm');
  const requestStartTime = requestStart.format('HH:mm');
  const requestEndTime = requestEnd.format('HH:mm');
  
  return requestStartTime >= slotStartTime && requestEndTime <= slotEndTime;
};

/**
 * Check one-time availability slot
 * @param {object} slot - Availability slot
 * @param {Date} start - Start time
 * @param {Date} end - End time
 * @returns {boolean} - True if available
 */
const checkOneTimeAvailability = (slot, start, end) => {
  const slotStart = dayjs(slot.start);
  const slotEnd = dayjs(slot.end);
  const requestStart = dayjs(start);
  const requestEnd = dayjs(end);
  
  return requestStart.isAfter(slotStart) && requestEnd.isBefore(slotEnd);
};

/**
 * Check for booking conflicts
 * @param {string} providerType - 'artist' or 'studio'
 * @param {string} providerId - Provider ID
 * @param {Date} start - Start time
 * @param {Date} end - End time
 * @param {string} excludeBookingId - Booking ID to exclude from conflict check
 * @returns {Promise<boolean>} - True if there's a conflict
 */
const checkBookingConflicts = async (providerType, providerId, start, end, excludeBookingId = null) => {
  const query = {
    [providerType]: providerId,
    status: { $in: ['confirmed', 'payment_pending'] },
    $or: [
      // Booking starts during the requested time
      {
        start: { $lt: end },
        end: { $gt: start }
      }
    ]
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBooking = await Booking.findOne(query);
  return !!conflictingBooking;
};

/**
 * Get available time slots for a provider on a specific date
 * @param {string} providerType - 'artist' or 'studio'
 * @param {string} providerId - Provider ID
 * @param {Date|string} date - Date to check
 * @param {number} durationMins - Duration in minutes
 * @returns {Promise<Array>} - Array of available time slots
 */
const getAvailableSlots = async (providerType, providerId, date, durationMins = 60) => {
  const Model = providerType === 'artist' ? Artist : Studio;
  const provider = await Model.findById(providerId);

  if (!provider || !provider.isActive) {
    return [];
  }

  const targetDate = dayjs(date).startOf('day');
  const availableSlots = [];

  // Get provider's availability for the date
  const dayAvailability = provider.availability.filter(slot => {
    if (slot.isRecurring) {
      return slot.daysOfWeek.includes(targetDate.day());
    } else {
      const slotDate = dayjs(slot.start).startOf('day');
      return slotDate.isSame(targetDate);
    }
  });

  for (const availability of dayAvailability) {
    let slotStart, slotEnd;
    
    if (availability.isRecurring) {
      // For recurring availability, use the date but time from the slot
      const slotTime = dayjs(availability.start);
      slotStart = targetDate.hour(slotTime.hour()).minute(slotTime.minute());
      slotEnd = targetDate.hour(dayjs(availability.end).hour()).minute(dayjs(availability.end).minute());
    } else {
      slotStart = dayjs(availability.start);
      slotEnd = dayjs(availability.end);
    }

    // Generate time slots within the availability window
    let currentStart = slotStart;
    while (currentStart.add(durationMins, 'minute').isSameOrBefore(slotEnd)) {
      const currentEnd = currentStart.add(durationMins, 'minute');
      
      // Check if this specific slot has no conflicts
      const hasConflict = await checkBookingConflicts(
        providerType, 
        providerId, 
        currentStart.toDate(), 
        currentEnd.toDate()
      );

      if (!hasConflict) {
        availableSlots.push({
          start: currentStart.toISOString(),
          end: currentEnd.toISOString()
        });
      }

      currentStart = currentStart.add(30, 'minute'); // 30-minute intervals
    }
  }

  return availableSlots;
};

/**
 * Check if a booking can be moved to a new time slot
 * @param {string} bookingId - Booking ID
 * @param {Date|string} newStart - New start time
 * @param {Date|string} newEnd - New end time
 * @returns {Promise<boolean>} - True if booking can be moved
 */
const canReschedule = async (bookingId, newStart, newEnd) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return false;
  }

  const providerType = booking.artist ? 'artist' : 'studio';
  const providerId = booking.artist || booking.studio;

  return await checkAvailability(providerType, providerId, newStart, newEnd) &&
         !(await checkBookingConflicts(providerType, providerId, newStart, newEnd, bookingId));
};

module.exports = {
  checkAvailability,
  checkProviderAvailability,
  checkBookingConflicts,
  getAvailableSlots,
  canReschedule
};
