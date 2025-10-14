const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

class GoogleAuthService {
  constructor() {
    this.client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Verify Google ID token and extract user information
   * @param {string} idToken - Google ID token from frontend
   * @returns {Object} - Verified user payload
   */
  async verifyGoogleToken(idToken) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      
      if (!payload) {
        throw new ApiError('Invalid Google token', 400);
      }

      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        emailVerified: payload.email_verified
      };
    } catch (error) {
      console.error('Google token verification failed:', error);
      throw new ApiError('Invalid Google token', 400);
    }
  }

  /**
   * Handle Google Sign-In/Sign-Up for clients only
   * @param {string} idToken - Google ID token
   * @returns {Object} - User data and tokens
   */
  async handleGoogleAuth(idToken) {
    try {
      // Verify the Google token
      const googleUser = await this.verifyGoogleToken(idToken);

      // Check if user already exists
      let user = await User.findOne({ 
        $or: [
          { email: googleUser.email },
          { googleId: googleUser.googleId }
        ]
      });

      if (user) {
        // Existing user - update Google info if needed
        if (!user.googleId) {
          user.googleId = googleUser.googleId;
        }
        if (!user.avatar && googleUser.picture) {
          user.avatar = { url: googleUser.picture };
        }
        if (!user.isEmailVerified && googleUser.emailVerified) {
          user.isEmailVerified = true;
          user.emailVerificationToken = undefined;
          user.emailVerificationExpires = undefined;
        }
        await user.save();
      } else {
        // New user - create account (clients only)
        user = await User.create({
          name: googleUser.name,
          email: googleUser.email,
          googleId: googleUser.googleId,
          role: 'client', // Force client role for Google auth
          avatar: googleUser.picture ? { url: googleUser.picture } : undefined,
          isEmailVerified: googleUser.emailVerified,
          country: 'Sri Lanka', // Default country
          authProvider: 'google'
        });
      }

      // Ensure user is a client (Google auth only for clients)
      if (user.role !== 'client') {
        throw new ApiError('Google authentication is only available for client accounts', 403);
      }

      return user;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Google authentication error:', error);
      throw new ApiError('Google authentication failed', 500);
    }
  }
}

module.exports = new GoogleAuthService();
