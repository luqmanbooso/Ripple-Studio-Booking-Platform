const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticate } = require('../middleware/auth');

// Validation middleware
const validateService = [
  body('name')
    .notEmpty()
    .withMessage('Service name is required')
    .isLength({ max: 100 })
    .withMessage('Service name cannot exceed 100 characters'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isNumeric()
    .withMessage('Price must be a number')
    .custom(value => {
      if (parseFloat(value) < 0) {
        throw new Error('Price cannot be negative');
      }
      return true;
    }),
  body('durationMins')
    .notEmpty()
    .withMessage('Duration is required')
    .isInt({ min: 30 })
    .withMessage('Duration must be at least 30 minutes'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
];

const validateServiceUpdate = [
  body('name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Service name cannot exceed 100 characters'),
  body('price')
    .optional()
    .isNumeric()
    .withMessage('Price must be a number')
    .custom(value => {
      if (value !== undefined && parseFloat(value) < 0) {
        throw new Error('Price cannot be negative');
      }
      return true;
    }),
  body('durationMins')
    .optional()
    .isInt({ min: 30 })
    .withMessage('Duration must be at least 30 minutes'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
];

// Public routes
router.get('/studio/:studioId', serviceController.getStudioServices);
router.get('/studio/:studioId/stats', serviceController.getServiceStats);

// Protected routes
router.use(authenticate);

router.post('/studio/:studioId', validateService, serviceController.addService);
router.put('/studio/:studioId/:serviceId', validateServiceUpdate, serviceController.updateService);
router.delete('/studio/:studioId/:serviceId', serviceController.deleteService);

module.exports = router;
