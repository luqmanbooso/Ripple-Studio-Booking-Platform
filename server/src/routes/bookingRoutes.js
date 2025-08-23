const express = require('express');
const { z } = require('zod');
const bookingController = require('../controllers/bookingController');
const { validate, objectId } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { bookingLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// All booking routes require authentication
router.use(authenticate);

// Validation schemas
const createBookingSchema = {
  body: z.object({
    artistId: objectId.optional(),
    studioId: objectId.optional(),
    service: z.object({
      name: z.string(),
      price: z.number().min(0).optional(),
      durationMins: z.number().min(30).optional(),
      description: z.string().optional()
    }),
    start: z.string().datetime(),
    end: z.string().datetime(),
    notes: z.string().max(1000).optional()
  }).refine(data => data.artistId || data.studioId, {
    message: "Either artistId or studioId must be provided"
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
    limit: z.coerce.number().min(1).max(50).default(10),
    status: z.enum(['pending', 'payment_pending', 'confirmed', 'completed', 'cancelled', 'refunded']).optional(),
    upcoming: z.enum(['true', 'false']).optional()
  })
};

// Routes
router.post('/', bookingLimiter, validate(createBookingSchema), bookingController.createBooking);
router.get('/my', validate(getBookingsSchema), bookingController.getMyBookings);
router.get('/:id', bookingController.getBooking);
router.patch('/:id/cancel', validate(cancelBookingSchema), bookingController.cancelBooking);
router.patch('/:id/complete', validate(completeBookingSchema), bookingController.completeBooking);

module.exports = router;
