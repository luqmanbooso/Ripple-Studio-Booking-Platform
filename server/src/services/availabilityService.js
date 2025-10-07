const Booking = require('../models/Booking');
const Studio = require('../models/Studio');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

/**
 * Check if a time slot is available for booking
 * @param {string} providerType - 'studio' (artist removed)
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
  if (providerType !== 'studio') return false;
  const provider = await Studio.findById(providerId);

  if (!provider || !provider.isActive) {
    return false;
  }

  // If no availability slots defined, assume always available (9 AM - 10 PM, all days)
  if (!provider.availability || provider.availability.length === 0) {
    const startHour = dayjs(start).hour();
    const endHour = dayjs(end).hour();
    // Allow bookings between 9 AM and 10 PM
    return startHour >= 9 && endHour <= 22;
  }
  
  const result = provider.availability.some(slot => {
    return slot.isRecurring 
      ? checkRecurringAvailability(slot, start, end)
      : checkOneTimeAvailability(slot, start, end);
  });
  
  return result;
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
  
  // For recurring slots, just check the time ranges (ignore the year/date)
  const slotStartTime = dayjs(slot.start).format('HH:mm');
  const slotEndTime = dayjs(slot.end).format('HH:mm');
  const requestStartTime = startDay.format('HH:mm');
  const requestEndTime = endDay.format('HH:mm');
  
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
  const requestStart = dayjs(start);
  const requestEnd = dayjs(end);
  
  // Handle new format: date + startTime/endTime in minutes
  if (slot.date && typeof slot.startTime === 'number' && typeof slot.endTime === 'number') {
    const requestDate = requestStart.format('YYYY-MM-DD');
    
    // Check if dates match
    if (slot.date !== requestDate) {
      return false;
    }
    
    // Convert request times to minutes since midnight
    const requestStartMinutes = requestStart.hour() * 60 + requestStart.minute();
    const requestEndMinutes = requestEnd.hour() * 60 + requestEnd.minute();
    
    return requestStartMinutes >= slot.startTime && requestEndMinutes <= slot.endTime;
  }
  
  // Handle old format: start/end datetime fields (fallback)
  if (slot.start && slot.end) {
    const slotStart = dayjs(slot.start);
    const slotEnd = dayjs(slot.end);
    
    return requestStart.isSameOrAfter(slotStart) && requestEnd.isSameOrBefore(slotEnd);
  }
  
  return false;
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
    studio: providerId,
    // According to PRD: Only 'confirmed' (Booked) and 'completed' bookings block availability
    // 'reservation_pending' should not block (temporary reservations)
    // 'cancel_pending' should still block until resolved
    status: { $in: ['confirmed', 'completed', 'active', 'cancel_pending'] },
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
 * @param {string} providerType - 'studio'
 * @param {string} providerId - Provider ID
 * @param {Date|string} date - Date to check
 * @param {number} durationMins - Duration in minutes
 * @returns {Promise<Array>} - Array of available time slots
 */
const getAvailableSlots = async (providerType, providerId, date, durationMins = 60) => {
  if (providerType !== 'studio') return [];
  const provider = await Studio.findById(providerId);

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

  const providerType = 'studio';
  const providerId = booking.studio;

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
