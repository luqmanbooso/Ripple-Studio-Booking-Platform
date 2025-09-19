const express = require('express');
const { z } = require('zod');
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validate');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// Validation schemas
const registerSchema = {
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['client', 'artist', 'studio']),
    country: z.string().optional(),
    city: z.string().optional()
  })
};

const loginSchema = {
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
  })
};

const verifyEmailSchema = {
  body: z.object({
    token: z.string().min(1, 'Verification token is required')
  })
};

const forgotPasswordSchema = {
  body: z.object({
    email: z.string().email('Invalid email format')
  })
};

const resetPasswordSchema = {
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(6, 'Password must be at least 6 characters')
  })
};

// Apply rate limiting to auth routes
router.use(authLimiter);

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
// Support GET for refresh as well so browsers sending Lax cookies on top-level GETs
router.post('/refresh', authController.refreshToken);
router.get('/refresh', authController.refreshToken);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;
