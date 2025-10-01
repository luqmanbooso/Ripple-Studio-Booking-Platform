const express = require('express');
const { z } = require('zod');
const bookingController = require('../controllers/bookingController');
const { validate, objectId } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { bookingLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// Note: Most booking routes require authentication, but some public endpoints
// (like fetching booked slots for a provider/date) should be accessible
// without auth so unauthenticated users can see availability when booking.

// Validation schemas
const createBookingSchema = {
  body: z.object({
    studioId: objectId,
    service: z.object({
      name: z.string(),
      price: z.number().min(0).optional(),
      durationMins: z.number().min(30).optional(),
      description: z.string().optional()
    }),
    start: z.string().datetime(),
    end: z.string().datetime(),
    notes: z.string().max(1000).optional()
  })
};

const cancelBookingSchema = {
  body: z.object({
    reason: z.string().max(500).optional()
  })
};

const completeBookingSchema = {
  body: z.object({
    notes: z.string().max(1000).optional()
  })
};

const getBookingsSchema = {
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(1000).default(10),
    status: z.enum(['pending', 'payment_pending', 'confirmed', 'completed', 'cancelled', 'refunded']).optional(),
    upcoming: z.enum(['true', 'false']).optional()
  })
};

const getBookedSlotsSchema = {
  query: z.object({
    studioId: objectId,
    date: z.string().min(10).max(10) // YYYY-MM-DD
  })
};

// Routes
// Public route to fetch booked slots for a given studio and date
router.get('/by-provider', validate(getBookedSlotsSchema), bookingController.getBookedSlots);

// Protected booking routes
router.post('/', bookingLimiter, validate(createBookingSchema), authenticate, bookingController.createBooking);
router.get('/my', validate(getBookingsSchema), authenticate, bookingController.getMyBookings);
router.get('/:id', authenticate, bookingController.getBooking);
router.patch('/:id/cancel', validate(cancelBookingSchema), authenticate, bookingController.cancelBooking);
router.patch('/:id/complete', validate(completeBookingSchema), authenticate, bookingController.completeBooking);

module.exports = router;
