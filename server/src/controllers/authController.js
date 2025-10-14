const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Studio = require('../models/Studio');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { 
  generateVerificationToken, 
  sendClientVerificationEmail, 
  sendAdminStudioNotification 
} = require('../services/emailService');
const NotificationService = require('../services/notificationService');

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m'
  });

  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d'
  });

  return { accessToken, refreshToken };
};

// Helper to build cookie options for refresh tokens
const getRefreshCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  const sameSite = process.env.COOKIE_SAME_SITE || 'lax'; // 'lax' by default to allow cross-site POSTs from dev frontends
  const secureFlag = isProd && (process.env.COOKIE_SECURE === 'true' || process.env.COOKIE_SECURE === undefined);

  const opts = {
    httpOnly: true,
    secure: secureFlag,
    sameSite,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  // If a specific cookie domain is provided (useful for deployed setups), include it
  if (process.env.COOKIE_DOMAIN) {
    opts.domain = process.env.COOKIE_DOMAIN;
  }

  return opts;
}

const register = catchAsync(async (req, res) => {
  const { name, email, password, role, country, city, phone, artist, studio } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError('User already exists with this email', 400);
  }

  // Determine allowed role (artist role removed); default to client unless 'studio'
  const userRole = role === 'studio' ? 'studio' : 'client';

  // Create user - always set country to Sri Lanka
  const user = await User.create({
    name,
    email,
    password,
    role: userRole,
    country: 'Sri Lanka', // Always set to Sri Lanka
    city,
    phone
  });

  // Generate verification token for clients
  if (userRole === 'client') {
    const verificationToken = generateVerificationToken();
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // Send verification email
    try {
      await sendClientVerificationEmail(user, verificationToken);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't fail registration if email fails
    }
  }

  // Create role-specific profile
  if (userRole === 'studio') {
    try {
      const studioData = {
        user: user._id,
        name: studio?.name || `${name}'s Studio`,
        description: studio?.description || '',
        studioType: studio?.studioType || 'Recording',
        hourlyRate: studio?.hourlyRate || 0,
        capacity: studio?.capacity || 1,
        location: { 
          country: 'Sri Lanka',
          city: city,
          address: studio?.location?.address || ''
        },
        services: [],
        equipment: [],
        amenities: [],
        gallery: [],
        availability: [],
        isApproved: false
      };
      
      const studioProfile = await Studio.create(studioData);
      
      user.studio = studioProfile._id;
      await user.save();

      // Notify admin about new studio registration
      try {
        await sendAdminStudioNotification(user, studioProfile);
        await NotificationService.notifyStudioRegistration(studioProfile, user);
      } catch (error) {
        console.error('Failed to send admin notification:', error);
      }
    } catch (error) {
      console.error('Failed to create studio profile:', error);
      // Delete the user if studio creation fails to maintain consistency
      await User.findByIdAndDelete(user._id);
      throw new ApiError(`Failed to create studio profile: ${error.message}`, 500);
    }
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save();

  // Set refresh token cookie
  res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());

  // Send user registration notification to admin (async, don't wait)
  NotificationService.notifyUserRegistration(user).catch(error => {
    console.error('Failed to send user registration notification:', error);
  });

  const responseMessage = userRole === 'client' 
    ? 'Registration successful! Please check your email to verify your account.'
    : 'Studio registration successful! Your studio is pending admin approval.';

  res.status(201).json({
    status: 'success',
    message: responseMessage,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        ...(userRole === 'studio' && { studioApproved: false })
      },
      accessToken
    }
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password for comparison, populate studio if exists
  const user = await User.findOne({ email }).select('+password').populate('studio');
  if (!user) {
    throw new ApiError('Invalid credentials', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ApiError('Account has been deactivated', 401);
  }

  // Check if studio account is approved (for studio role)
  if (user.role === 'studio') {
    if (!user.studio) {
      throw new ApiError('Studio profile not found. Please contact support.', 401);
    }
    
    if (!user.studio.isApproved) {
      throw new ApiError('Your studio is pending admin approval. You will be notified once approved.', 403);
    }
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError('Invalid credentials', 401);
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Save refresh token
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  // Set refresh token cookie
  res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());

  res.json({
    status: 'success',
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        avatar: user.avatar,
        ...(user.role === 'studio' && user.studio && { studio: user.studio._id })
      },
      accessToken
    }
  });
});

const logout = catchAsync(async (req, res) => {
  const userId = req.user._id;

  // Clear refresh token from database
  await User.findByIdAndUpdate(userId, { refreshToken: null });

  // Clear refresh token cookie
  // Clear cookie using same path/domain/sameSite so browser removes it reliably
  res.clearCookie('refreshToken', Object.assign({}, getRefreshCookieOptions(), { maxAge: 0 }));

  res.json({
    status: 'success',
    message: 'Logout successful'
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;

  // DEBUG: indicate presence of cookie
  console.log('[DEBUG][auth.refreshToken] cookie present:', !!refreshToken)

  if (!refreshToken) {
    console.log('[DEBUG][auth.refreshToken] no refresh token cookie provided')
    throw new ApiError('Refresh token not provided', 401);
  }

  // Verify refresh token
  let decoded
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
  } catch (err) {
    console.log('[DEBUG][auth.refreshToken] refresh token verification failed:', err && err.name)
    throw new ApiError('Invalid refresh token', 401)
  }
  
  // Find user and verify refresh token
  const user = await User.findById(decoded.id);
  // DEBUG: show whether user has a stored refresh token and whether it matches
  console.log('[DEBUG][auth.refreshToken] decoded.id:', decoded && decoded.id)
  console.log('[DEBUG][auth.refreshToken] user found:', !!user, 'userId:', user?._id)
  console.log('[DEBUG][auth.refreshToken] hasStoredRefresh:', !!(user && user.refreshToken))

  // If user not found, reject
  if (!user) {
    console.log('[DEBUG][auth.refreshToken] no user for decoded id')
    throw new ApiError('Invalid refresh token', 401);
  }

  // If stored refresh token is present but doesn't match the cookie, log it and proceed to rotate.
  if (user.refreshToken && user.refreshToken !== refreshToken) {
    console.log('[DEBUG][auth.refreshToken] stored refresh token does not match cookie. Rotating token for user:', user._id)
    // Note: allowing rotation improves resiliency for legitimate cases where the DB value was cleared or out-of-sync.
  }

  // Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

  // Update refresh token in database
  user.refreshToken = newRefreshToken;
  await user.save();

  // Set new refresh token cookie
  res.cookie('refreshToken', newRefreshToken, getRefreshCookieOptions());

  res.json({
    status: 'success',
    data: {
      accessToken
    }
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpires');
  // Always return a generic success response to avoid user enumeration
  if (!user) {
    return res.json({
      status: 'success',
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }

  // Generate reset token (raw token will only be sent via email)
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  // Prepare reset URL for email (frontend should handle route /reset-password)
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

  // Send email if SMTP is configured, otherwise log for development
  try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailFrom = process.env.FROM_EMAIL || process.env.MAIL_FROM || `no-reply@${process.env.DOMAIN || 'ripple.app'}`;

      await transporter.sendMail({
        from: mailFrom,
        to: user.email,
        subject: 'Reset your Ripple password',
        html: `
          <p>Hi ${user.name || ''},</p>
          <p>You requested a password reset. Click the link below to set a new password. This link expires in 10 minutes.</p>
          <p><a href="${resetUrl}">Reset your password</a></p>
          <p>If you didn't request this, you can ignore this email.</p>
        `,
      });
      console.log('Password reset email sent to', user.email);
    } else {
      // Dev fallback: log the reset URL (do not expose in API response)
      console.log('Password reset URL (dev):', resetUrl);
    }
  } catch (err) {
    console.error('Error sending password reset email:', err);
    // Do not fail the request - respond generically
  }

  return res.json({
    status: 'success',
    message: 'If an account with that email exists, a password reset link has been sent.'
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const { token, password } = req.body;

  // Hash token and find user
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError('Invalid or expired reset token', 400);
  }

  // Update password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({
    status: 'success',
    message: 'Password reset successful'
  });
});

// Google sign-in using ID token from client (Google Identity Services)
const googleAuth = catchAsync(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new ApiError('ID token is required', 400);
  }

  // Verify ID token by calling Google's tokeninfo endpoint
  const https = require('https');
  const tokenInfoUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;

  const verified = await new Promise((resolve, reject) => {
    https
      .get(tokenInfoUrl, (resp) => {
        let data = '';
        resp.on('data', (chunk) => (data += chunk));
        resp.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            // tokeninfo returns an error_description if invalid
            if (parsed.error_description || parsed.error) {
              return reject(new Error(parsed.error_description || parsed.error));
            }
            return resolve(parsed);
          } catch (err) {
            return reject(err);
          }
        });
      })
      .on('error', (err) => reject(err));
  });

  // tokeninfo returns fields like email, email_verified, name, picture, sub (google id), aud (client id)
  const { email, email_verified, name, picture, sub } = verified;
  // Verify the token audience matches the configured Google client id (if provided)
  const configuredAud = process.env.GOOGLE_CLIENT_ID;
  if (configuredAud && verified.aud && verified.aud !== configuredAud) {
    console.log('[DEBUG][auth.googleAuth] token audience mismatch:', verified.aud, 'expected:', configuredAud);
    throw new ApiError('Google ID token audience mismatch', 400);
  }

  if (!email || email_verified !== 'true' && email_verified !== true) {
    throw new ApiError('Google account email not verified', 400);
  }

  // Find or create user by email
  let user = await User.findOne({ email });
  if (!user) {
    // Create a new user with role 'client' by default
    user = await User.create({
      name: name || 'Google User',
      email,
      password: crypto.randomBytes(16).toString('hex'), // random password (not used)
      role: 'client',
      verified: true,
      avatar: picture || undefined
    });
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Save refresh token
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  // Set refresh token cookie
  res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());

  res.json({
    status: 'success',
    message: 'Google login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        avatar: user.avatar
      },
      accessToken
    }
  });
});

// Verify email
const verifyEmail = catchAsync(async (req, res) => {
  const { token, email } = req.query;

  if (!token || !email) {
    throw new ApiError('Invalid verification link', 400);
  }

  // Find user with verification token
  const user = await User.findOne({
    email,
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError('Invalid or expired verification token', 400);
  }

  // Verify the user
  user.verified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.json({
    status: 'success',
    message: 'Email verified successfully! You can now start booking studios.'
  });
});

// Resend verification email
const resendVerification = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError('User not found', 404);
  }

  if (user.verified) {
    throw new ApiError('Email is already verified', 400);
  }

  // Generate new verification token
  const verificationToken = generateVerificationToken();
  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await user.save();

  // Send verification email
  try {
    await sendClientVerificationEmail(user, verificationToken);
    res.json({
      status: 'success',
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new ApiError('Failed to send verification email', 500);
  }
});

// Get current user
const getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('studio', 'name _id isApproved verificationStatus')
    .select('-password -refreshToken');

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  res.json({
    status: 'success',
    data: {
      user
    }
  });
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  googleAuth,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe
};
