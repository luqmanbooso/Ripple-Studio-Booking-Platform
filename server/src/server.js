const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const { createServer } = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const artistRoutes = require("./routes/artistRoutes");
const studioRoutes = require("./routes/studioRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const webhookRoutes = require("./webhooks/payhereWebhook");
const mediaRoutes = require("./routes/mediaRoutes");
const equipmentRoutes = require("./routes/equipmentRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const ticketRoutes = require("./routes/ticketRoutes");

// Import middleware
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const { rateLimiter } = require("./middleware/rateLimit");

// Import socket handlers
const { setupSocket } = require("./sockets/socketHandler");

// Import services
const { startReservationCleanup } = require("./services/reservationService");

const app = express();
const server = createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Setup socket handlers
setupSocket(io);

// Make io available throughout the app
app.set("io", io);

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:", "http://localhost:5000", "http://localhost:5173"],
        connectSrc: ["'self'", "http://localhost:5000", "ws://localhost:5000"],
      },
    },
  })
);

// CORS setup
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
  })
);

// Rate limiting
app.use(rateLimiter);

// Body parsing middleware
app.use("/api/webhooks", express.urlencoded({ extended: true })); // PayHere sends form data
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Serve static files (uploads) with CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static('uploads'));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running!",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/studios", studioRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/tickets", ticketRoutes);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
  });
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database connection
const connectDB = async (retries = 5) => {
  try {
    console.log("Attempting MongoDB connection...");
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000, // 45 second socket timeout
      maxPoolSize: 10,
      bufferCommands: false,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(
      `❌ MongoDB connection failed (${6 - retries}/5):`,
      error.message
    );

    if (retries > 1) {
      console.log(`⏳ Retrying in 3 seconds...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return connectDB(retries - 1);
    } else {
      console.error("💀 All MongoDB connection attempts failed");
      process.exit(1);
    }
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Start reservation cleanup job
    startReservationCleanup();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
    mongoose.connection.close();
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
    mongoose.connection.close();
  });
});

startServer();

module.exports = app;
