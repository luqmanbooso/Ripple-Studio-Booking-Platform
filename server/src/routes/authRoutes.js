const express = require('express');
const { z } = require('zod');
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// Validation schemas
const registerSchema = {
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['client', 'artist', 'studio']).optional(),
    hourlyRate: z.number().min(0).optional(),
    genres: z.array(z.string()).optional(),
    instruments: z.array(z.string()).optional(),
    bio: z.string().max(2000).optional(),
    studioName: z.string().max(100).optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    services: z.array(z.object({
      name: z.string(),
      price: z.number().min(0),
      durationMins: z.number().min(30)
    })).optional()
  })
};

const loginSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  })
};

// Apply rate limiting to auth routes
router.use(authLimiter);

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
