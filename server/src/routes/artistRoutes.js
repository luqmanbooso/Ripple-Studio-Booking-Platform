const express = require('express');
const { z } = require('zod');
const artistController = require('../controllers/artistController');
const { validate, objectId, pagination } = require('../middleware/validate');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');

const router = express.Router();

const searchSchema = {
  query: pagination.extend({
    q: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    genre: z.string().optional(),
    instrument: z.string().optional(),
    minRate: z.coerce.number().min(0).optional(),
    maxRate: z.coerce.number().min(0).optional(),
    sort: z.string().optional()
  })
};

const updateArtistSchema = {
  body: z.object({
    genres: z.array(z.string()).optional(),
    instruments: z.array(z.string()).optional(),
    bio: z.string().max(2000).optional(),
    hourlyRate: z.number().min(0).optional(),
    socialLinks: z.object({
      website: z.string().url().optional(),
      spotify: z.string().url().optional(),
      soundcloud: z.string().url().optional()
    }).optional()
  })
};

const availabilitySchema = {
  body: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
    isRecurring: z.boolean().optional(),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional()
  })
};

// Public routes
router.get('/', optionalAuth, validate(searchSchema), artistController.getArtists);
router.get('/:id', optionalAuth, artistController.getArtist);

// Protected routes
router.patch('/:id', authenticate, allowRoles('artist', 'admin'), validate(updateArtistSchema), artistController.updateArtist);
router.post('/:id/availability', authenticate, allowRoles('artist'), validate(availabilitySchema), artistController.addAvailability);

module.exports = router;
