const express = require('express');
const uploadController = require('../controllers/uploadController');
const { authenticate } = require('../middleware/auth');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// All upload routes require authentication
router.use(authenticate);
router.use(uploadLimiter);

router.post('/image', uploadSingle('image'), uploadController.uploadImage);
router.post('/images', uploadMultiple('images', 5), uploadController.uploadImages);

module.exports = router;
