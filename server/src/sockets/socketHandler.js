const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Simple cookie parser for socket handshake
const parseCookies = (cookieHeader = '') => {
  return cookieHeader.split(';').map(c => c.trim()).filter(Boolean).reduce((acc, pair) => {
    const idx = pair.indexOf('=')
    if (idx === -1) return acc
    const key = pair.slice(0, idx).trim()
    const val = pair.slice(idx + 1).trim()
    acc[key] = decodeURIComponent(val)
    return acc
  }, {})
}

const setupSocket = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      // If access token provided, verify it
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) return next(new Error('User not found'))

        socket.userId = user._id.toString();
        socket.userRole = user.role;
        return next()
      }

      // Fallback: check cookies (useful for httpOnly refresh tokens)
      const cookieHeader = socket.handshake.headers && socket.handshake.headers.cookie
      if (!cookieHeader) {
        return next(new Error('Authentication error'))
      }

      const cookies = parseCookies(cookieHeader)
      const refreshToken = cookies.refreshToken
      if (!refreshToken) {
        return next(new Error('Authentication error'))
      }

      // Verify refresh token using the refresh secret
      let decodedRefresh
      try {
        decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
      } catch (err) {
        return next(new Error('Authentication error'))
      }

      const user = await User.findById(decodedRefresh.id).select('+refreshToken -password')
      if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
        return next(new Error('Authentication error'))
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      return next()
    } catch (error) {
      console.error('Socket auth error:', error)
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Handle joining provider rooms (for real-time booking updates)
    socket.on('join-provider-room', ({ providerId, providerType }) => {
      socket.join(`${providerType}:${providerId}`);
    });

    // Handle holding/releasing booking slots
    socket.on('hold-slot', ({ providerId, providerType, start, end }) => {
      socket.to(`${providerType}:${providerId}`).emit('slot-held', {
        start,
        end,
        heldBy: socket.userId
      });
    });

    socket.on('release-slot', ({ providerId, providerType, start, end }) => {
      socket.to(`${providerType}:${providerId}`).emit('slot-released', {
        start,
        end,
        releasedBy: socket.userId
      });
    });

    // Handle booking updates
    socket.on('booking-update', ({ bookingId, status, providerId, providerType }) => {
      socket.to(`${providerType}:${providerId}`).emit('booking-updated', {
        bookingId,
        status
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });
};

// Utility functions to emit events from other parts of the app
const emitToUser = (io, userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
};

const emitToProvider = (io, providerId, providerType, event, data) => {
  io.to(`${providerType}:${providerId}`).emit(event, data);
};

module.exports = {
  setupSocket,
  emitToUser,
  emitToProvider
};
