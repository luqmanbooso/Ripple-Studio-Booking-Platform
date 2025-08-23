const express = require('express');
const { z } = require('zod');
const userController = require('../controllers/userController');
const { validate, objectId } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

const updateProfileSchema = {
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    phone: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    bio: z.string().max(2000).optional(),
    genres: z.array(z.string()).optional(),
    instruments: z.array(z.string()).optional(),
    hourlyRate: z.number().min(0).optional(),
  })
};

// Routes
router.patch('/me', validate(updateProfileSchema), userController.updateProfile);
router.post('/avatar', uploadSingle('avatar'), userController.uploadAvatar);
router.get('/:id', userController.getUser);

module.exports = router;
