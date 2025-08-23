const express = require('express');
const { z } = require('zod');
const studioController = require('../controllers/studioController');
const { validate, objectId, pagination } = require('../middleware/validate');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');

const router = express.Router();

const searchSchema = {
  query: pagination.extend({
    q: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    service: z.string().optional(),
    sort: z.string().optional()
  })
};

const updateStudioSchema = {
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(2000).optional(),
    equipment: z.array(z.string()).optional(),
    services: z.array(z.object({
      name: z.string(),
      price: z.number().min(0),
      durationMins: z.number().min(30),
      description: z.string().optional()
    })).optional(),
    amenities: z.array(z.string()).optional()
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
router.get('/', optionalAuth, validate(searchSchema), studioController.getStudios);
router.get('/:id', optionalAuth, studioController.getStudio);

// Protected routes
router.patch('/:id', authenticate, allowRoles('studio', 'admin'), validate(updateStudioSchema), studioController.updateStudio);
router.post('/:id/availability', authenticate, allowRoles('studio'), validate(availabilitySchema), studioController.addAvailability);

module.exports = router;
