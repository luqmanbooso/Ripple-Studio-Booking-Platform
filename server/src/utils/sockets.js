const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('./logger');

let io;

// In-memory store for slot holds (in production, use Redis)
const slotHolds = new Map();

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true
    }
  });

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
    logger.info(`User connected: ${socket.userId}`);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);
    
    // Join role-specific room
    socket.join(`role:${socket.userRole}`);

    // Join provider rooms if applicable
    socket.on('join-provider-room', (data) => {
      const { providerId, providerType } = data;
      if (providerType === 'artist' || providerType === 'studio') {
        socket.join(`${providerType}:${providerId}`);
        logger.debug(`User ${socket.userId} joined ${providerType}:${providerId}`);
      }
    });

    // Handle slot hold requests
    socket.on('hold-slot', (data) => {
      const { providerId, providerType, start, end } = data;
      const slotKey = `${providerType}:${providerId}:${start}:${end}`;
      const holdKey = `${socket.userId}:${slotKey}`;

      // Check if slot is already held by someone else
      const existingHold = Array.from(slotHolds.keys()).find(key => 
        key.endsWith(slotKey) && !key.startsWith(socket.userId)
      );

      if (existingHold) {
        socket.emit('slot-hold-failed', { 
          message: 'Slot is already being held by another user' 
        });
        return;
      }

      // Hold the slot for 10 minutes
      slotHolds.set(holdKey, {
        userId: socket.userId,
        providerId,
        providerType,
        start,
        end,
        expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutes
      });

      // Notify others that slot is held
      socket.to(`${providerType}:${providerId}`).emit('slot-held', {
        start,
        end,
        heldBy: socket.userId
      });

      socket.emit('slot-hold-success', { start, end });

      // Auto-release after timeout
      setTimeout(() => {
        releaseSlot(holdKey, socket);
      }, 10 * 60 * 1000);
    });

    // Handle slot release
    socket.on('release-slot', (data) => {
      const { providerId, providerType, start, end } = data;
      const slotKey = `${providerType}:${providerId}:${start}:${end}`;
      const holdKey = `${socket.userId}:${slotKey}`;
      
      releaseSlot(holdKey, socket);
    });

    // Handle booking updates
    socket.on('booking-update', (data) => {
      const { bookingId, status, providerId, providerType } = data;
      
      // Notify provider room
      socket.to(`${providerType}:${providerId}`).emit('booking-updated', {
        bookingId,
        status
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.userId}`);
      
      // Release all slots held by this user
      for (const [key, hold] of slotHolds.entries()) {
        if (hold.userId === socket.userId) {
          releaseSlot(key, socket);
        }
      }
    });
  });

  // Clean up expired holds every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, hold] of slotHolds.entries()) {
      if (hold.expiresAt < now) {
        slotHolds.delete(key);
        io.to(`${hold.providerType}:${hold.providerId}`).emit('slot-released', {
          start: hold.start,
          end: hold.end
        });
      }
    }
  }, 5 * 60 * 1000);

  return io;
};

const releaseSlot = (holdKey, socket) => {
  const hold = slotHolds.get(holdKey);
  if (hold) {
    slotHolds.delete(holdKey);
    socket.to(`${hold.providerType}:${hold.providerId}`).emit('slot-released', {
      start: hold.start,
      end: hold.end
    });
    socket.emit('slot-release-success', {
      start: hold.start,
      end: hold.end
    });
  }
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

const emitToProvider = (providerType, providerId, event, data) => {
  if (io) {
    io.to(`${providerType}:${providerId}`).emit(event, data);
  }
};

const emitToRole = (role, event, data) => {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitToUser,
  emitToProvider,
  emitToRole
};
