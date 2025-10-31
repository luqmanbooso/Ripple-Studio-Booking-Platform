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

const resendVerificationSchema = {
  body: z.object({
    email: z.string().email('Invalid email format')
  })
};

const completeProfileSchema = {
  body: z.object({
    phone: z.string().optional(),
    country: z.string().min(1, 'Country is required'),
    city: z.string().min(1, 'City is required')
  })
};

// Apply rate limiting to auth routes
router.use(authLimiter);

// Root auth endpoint - provides information about available auth endpoints
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Authentication API endpoints',
    endpoints: {
      public: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login with email and password',
        'POST /api/auth/google': 'Login with Google OAuth',
        'POST /api/auth/refresh': 'Refresh access token',
        'GET /api/auth/refresh': 'Refresh access token (GET)',
        'GET /api/auth/verify-email': 'Verify email address',
        'POST /api/auth/resend-verification': 'Resend verification email',
        'POST /api/auth/forgot-password': 'Request password reset',
        'POST /api/auth/reset-password': 'Reset password with token'
      },
      protected: {
        'POST /api/auth/logout': 'Logout (requires authentication)',
        'GET /api/auth/me': 'Get current user info (requires authentication)',
        'PUT /api/auth/complete-profile': 'Complete user profile (requires authentication)'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
// Support GET for refresh as well so browsers sending Lax cookies on top-level GETs
router.post('/refresh', authController.refreshToken);
router.get('/refresh', authController.refreshToken);
// Google sign-in (client sends Google ID token)
router.post('/google', authController.googleAuth);

// Email verification routes (public)
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', validate(resendVerificationSchema), authController.resendVerification);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.put('/complete-profile', authenticate, validate(completeProfileSchema), authController.completeProfile);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;
