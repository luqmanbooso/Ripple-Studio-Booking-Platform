const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { protect } = require('../middleware/auth');

// Validation middleware
const validateEquipment = [
  body('name')
    .notEmpty()
    .withMessage('Equipment name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('category')
    .isIn([
      'Microphones',
      'Audio Interfaces', 
      'Monitors',
      'Headphones',
      'Instruments',
      'Amplifiers',
      'Effects',
      'Recording',
      'Mixing',
      'Mastering',
      'Lighting',
      'Cameras',
      'Other'
    ])
    .withMessage('Invalid category'),
  body('studio')
    .notEmpty()
    .withMessage('Studio ID is required')
    .isMongoId()
    .withMessage('Must be a valid studio ID'),
  body('brand')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Brand cannot exceed 50 characters'),
  body('model')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Model cannot exceed 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('condition')
    .optional()
    .isIn(['New', 'Excellent', 'Good', 'Fair', 'Poor'])
    .withMessage('Invalid condition'),
  body('purchasePrice')
    .optional()
    .isNumeric()
    .withMessage('Purchase price must be a number'),
  body('currentValue')
    .optional()
    .isNumeric()
    .withMessage('Current value must be a number'),
  body('serialNumber')
    .optional()
    .isString()
    .withMessage('Serial number must be a string'),
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
  body('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('isInsured')
    .optional()
    .isBoolean()
    .withMessage('isInsured must be a boolean')
];

const validateEquipmentUpdate = [
  body('name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('category')
    .optional()
    .isIn([
      'Microphones',
      'Audio Interfaces', 
      'Monitors',
      'Headphones',
      'Instruments',
      'Amplifiers',
      'Effects',
      'Recording',
      'Mixing',
      'Mastering',
      'Lighting',
      'Cameras',
      'Other'
    ])
    .withMessage('Invalid category'),
  body('brand')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Brand cannot exceed 50 characters'),
  body('model')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Model cannot exceed 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('condition')
    .optional()
    .isIn(['New', 'Excellent', 'Good', 'Fair', 'Poor'])
    .withMessage('Invalid condition'),
  body('purchasePrice')
    .optional()
    .isNumeric()
    .withMessage('Purchase price must be a number'),
  body('currentValue')
    .optional()
    .isNumeric()
    .withMessage('Current value must be a number'),
  body('serialNumber')
    .optional()
    .isString()
    .withMessage('Serial number must be a string'),
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
  body('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('isInsured')
    .optional()
    .isBoolean()
    .withMessage('isInsured must be a boolean')
];

const validateMaintenance = [
  body('date')
    .notEmpty()
    .withMessage('Maintenance date is required')
    .isISO8601()
    .withMessage('Date must be in valid format'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('cost')
    .optional()
    .isNumeric()
    .withMessage('Cost must be a number'),
  body('performedBy')
    .optional()
    .isString()
    .withMessage('Performed by must be a string')
];

// Public routes
router.get('/categories', equipmentController.getCategories);
router.get('/studio/:studioId', equipmentController.getStudioEquipment);
router.get('/studio/:studioId/stats', equipmentController.getEquipmentStats);
router.get('/search', equipmentController.searchEquipment);
router.get('/:id', equipmentController.getEquipment);

// Protected routes
router.use(protect);

router.post('/', validateEquipment, equipmentController.createEquipment);
router.put('/:id', validateEquipmentUpdate, equipmentController.updateEquipment);
router.delete('/:id', equipmentController.deleteEquipment);
router.post('/:id/maintenance', validateMaintenance, equipmentController.addMaintenance);

module.exports = router;
