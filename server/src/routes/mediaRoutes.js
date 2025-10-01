const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { authenticate } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// Validation middleware
const validateMedia = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('type')
    .isIn(['image', 'video', 'audio'])
    .withMessage('Type must be image, video, or audio'),
  body('url')
    .notEmpty()
    .withMessage('URL is required')
    .isURL()
    .withMessage('Must be a valid URL'),
  body('studio')
    .notEmpty()
    .withMessage('Studio ID is required')
    .isMongoId()
    .withMessage('Must be a valid studio ID'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('fileSize')
    .optional()
    .isNumeric()
    .withMessage('File size must be a number'),
  body('duration')
    .optional()
    .isNumeric()
    .withMessage('Duration must be a number'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean')
];

const validateMediaUpdate = [
  body('title')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('type')
    .optional()
    .isIn(['image', 'video', 'audio'])
    .withMessage('Type must be image, video, or audio'),
  body('url')
    .optional()
    .isURL()
    .withMessage('Must be a valid URL'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('fileSize')
    .optional()
    .isNumeric()
    .withMessage('File size must be a number'),
  body('duration')
    .optional()
    .isNumeric()
    .withMessage('Duration must be a number'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean')
];

// Routes
router.get('/studio/:studioId', mediaController.getStudioMedia);
router.get('/search', mediaController.searchMedia);
router.get('/:id', mediaController.getMedia);

// Protected routes
router.use(authenticate);

router.post('/', uploadSingle('file'), mediaController.createMedia);
router.put('/:id', validateMediaUpdate, mediaController.updateMedia);
router.delete('/:id', mediaController.deleteMedia);
router.patch('/:id/featured', mediaController.toggleFeatured);

module.exports = router;
