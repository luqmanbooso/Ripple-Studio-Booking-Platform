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

const createStudioSchema = {
  body: z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(2000).optional(),
    location: z.object({
      country: z.string().min(1),
      city: z.string().min(1),
      address: z.string().optional()
    }),
    equipment: z.array(z.string()).optional(),
    services: z.array(z.object({
      name: z.string(),
      price: z.number().min(0),
      durationMins: z.number().min(30),
      description: z.string().optional()
    })).optional(),
    amenities: z.array(z.string()).optional(),
    hourlyRate: z.number().min(0).optional(),
    capacity: z.number().min(1).optional(),
    genres: z.array(z.string()).optional(),
    socialMedia: z.object({
      instagram: z.string().optional(),
      twitter: z.string().optional(),
      facebook: z.string().optional(),
      youtube: z.string().optional()
    }).optional(),
    contactInfo: z.object({
      phone: z.string().optional(),
      email: z.string().email().optional(),
      website: z.string().url().optional()
    }).optional()
  })
};

const updateStudioSchema = {
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(2000).optional(),
    location: z.object({
      country: z.string().min(1),
      city: z.string().min(1),
      address: z.string().optional()
    }).optional(),
    equipment: z.array(z.string()).optional(),
    services: z.array(z.object({
      name: z.string(),
      price: z.number().min(0),
      durationMins: z.number().min(30),
      description: z.string().optional()
    })).optional(),
    amenities: z.array(z.string()).optional(),
    hourlyRate: z.number().min(0).optional(),
    capacity: z.number().min(1).optional(),
    genres: z.array(z.string()).optional(),
    socialMedia: z.object({
      instagram: z.string().optional(),
      twitter: z.string().optional(),
      facebook: z.string().optional(),
      youtube: z.string().optional()
    }).optional(),
    onboarded: z.boolean().optional()
  })
};

const availabilitySchema = {
  body: z.object({
    // For recurring slots
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional(),
    isRecurring: z.boolean().optional(),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    
    // For non-recurring slots
    date: z.string().optional(), // YYYY-MM-DD format
    startTime: z.number().min(0).max(1440).optional(), // minutes from midnight
    endTime: z.number().min(0).max(1440).optional(), // minutes from midnight
    
    // Common fields
    price: z.number().min(0).optional(),
    description: z.string().optional()
  }).refine(data => {
    // Validate recurring slots
    if (data.isRecurring) {
      return data.start && data.end && data.daysOfWeek && data.daysOfWeek.length > 0;
    }
    // Validate non-recurring slots
    if (data.isRecurring === false) {
      return data.date && typeof data.startTime === 'number' && typeof data.endTime === 'number';
    }
    // Default case (backward compatibility)
    return data.start && data.end;
  }, {
    message: "Invalid availability data: recurring slots need start, end, and daysOfWeek; non-recurring slots need date, startTime, and endTime"
  })
};

// Public routes
router.get('/', optionalAuth, validate(searchSchema), studioController.getStudios);
router.get('/:id', optionalAuth, studioController.getStudio);

// Protected routes
router.post('/', authenticate, allowRoles('studio', 'admin'), validate(createStudioSchema), studioController.createStudio);
router.patch('/:id', authenticate, allowRoles('studio', 'admin'), validate(updateStudioSchema), studioController.updateStudio);
router.post('/:id/availability', authenticate, allowRoles('studio'), validate(availabilitySchema), studioController.addAvailability);
router.delete('/:id/availability/:availabilityId', authenticate, allowRoles('studio'), studioController.deleteAvailability);
router.get('/:id/availability', studioController.getAvailability); // Public endpoint to check availability

// Admin only routes
router.get('/admin/all', authenticate, allowRoles('admin'), studioController.getAllStudiosForAdmin);
router.get('/admin/stats', authenticate, allowRoles('admin'), studioController.getStudioStats);
router.get('/admin/analytics', authenticate, allowRoles('admin'), studioController.getStudioAnalytics);
router.patch('/admin/:id/status', authenticate, allowRoles('admin'), studioController.updateStudioStatus);
router.patch('/admin/:id/feature', authenticate, allowRoles('admin'), studioController.toggleStudioFeature);
router.delete('/admin/:id', authenticate, allowRoles('admin'), studioController.deleteStudio);
router.post('/admin/bulk-actions', authenticate, allowRoles('admin'), studioController.bulkStudioActions);

module.exports = router;
