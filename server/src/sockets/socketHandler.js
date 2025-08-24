const jwt = require('jsonwebtoken');
const User = require('../models/User');

const setupSocket = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      next();
    } catch (error) {
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
