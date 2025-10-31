const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const path = require("path");
const { createServer } = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// Environment validation
const requiredEnvVars = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:", missingEnvVars.join(', '));
  console.error("Please set these variables in your Vercel project settings.");
  process.exit(1);
}

console.log("✅ All required environment variables are present");

// Import routes with error handling
let authRoutes, userRoutes, artistRoutes, studioRoutes, bookingRoutes, reviewRoutes;
let paymentRoutes, uploadRoutes, adminRoutes, notificationRoutes, webhookRoutes;
let mediaRoutes, equipmentRoutes, serviceRoutes, ticketRoutes, revenueRoutes, walletRoutes;

try {
  console.log("Loading route modules...");
  authRoutes = require("./routes/authRoutes");
  userRoutes = require("./routes/userRoutes");
  artistRoutes = require("./routes/artistRoutes");
  studioRoutes = require("./routes/studioRoutes");
  bookingRoutes = require("./routes/bookingRoutes");
  reviewRoutes = require("./routes/reviewRoutes");
  paymentRoutes = require("./routes/paymentRoutes");
  uploadRoutes = require("./routes/uploadRoutes");
  adminRoutes = require("./routes/adminRoutes");
  notificationRoutes = require("./routes/notificationRoutes");
  webhookRoutes = require("./webhooks/payhereWebhook");
  mediaRoutes = require("./routes/mediaRoutes");
  equipmentRoutes = require("./routes/equipmentRoutes");
  serviceRoutes = require("./routes/serviceRoutes");
  ticketRoutes = require("./routes/ticketRoutes");
  revenueRoutes = require("./routes/revenueRoutes");
  walletRoutes = require("./routes/walletRoutes");
  console.log("✅ All route modules loaded successfully");
} catch (error) {
  console.error("❌ Error loading route modules:", error.message);
  console.error("Stack trace:", error.stack);
  process.exit(1);
}

// Import middleware
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

// Initialize platform settings from database
const initializePlatformSettings = async () => {
  try {
    const Settings = require("./models/Settings");
    const commissionRate = await Settings.getCommissionRate();
    process.env.PLATFORM_COMMISSION_RATE = commissionRate.toString();
    console.log(
      `✅ Platform commission rate loaded: ${(commissionRate * 100).toFixed(1)}%`
    );
  } catch (error) {
    console.log(
      `⚠️  Could not load platform settings, using defaults: ${error.message}`
    );
  }
};
const { rateLimiter } = require("./middleware/rateLimit");

// Import socket handlers
const { setupSocket } = require("./sockets/socketHandler");

// Import services
const { startReservationCleanup } = require("./services/reservationService");

const app = express();
const server = createServer(app);

// CORS origins configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://ripple-studio-booking-platform-eight.vercel.app",
  "https://ripple-studio-booking-platform-ten.vercel.app",
  "https://ripple-studio-booking-platform-adq9.vercel.app", // Current deployment
  process.env.CORS_ORIGIN
].filter(Boolean);

// Socket.IO setup - disabled in serverless environment
let io;
if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  // Only setup Socket.IO in non-serverless environments
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
    },
  });

  // Setup socket handlers
  setupSocket(io);
  console.log("✅ Socket.IO enabled for non-serverless environment");
} else {
  console.log("⚠️ Socket.IO disabled in serverless environment");
  // Create a mock io object for serverless
  io = {
    emit: () => {},
    to: () => ({ emit: () => {} }),
    sockets: { emit: () => {} }
  };
}

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
        imgSrc: [
          "'self'",
          "data:",
          "https:",
          "http://localhost:5000",
          "http://localhost:5173",
        ],
        connectSrc: ["'self'", "http://localhost:5000", "ws://localhost:5000"],
      },
    },
  })
);

// CORS setup - handle multiple origins
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Log the rejected origin for debugging
      console.log(`CORS rejected origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
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
app.use(
  "/uploads",
  (req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static("uploads")
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running!",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    hasMongoUri: !!process.env.MONGO_URI,
    hasJwtSecret: !!process.env.JWT_ACCESS_SECRET,
  });
});

// Simple test endpoint that doesn't require database
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Ripple Studio API is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// Handle favicon requests to prevent 404 errors
app.get("/favicon.ico", (req, res) => {
  res.status(204).end(); // No content
});

app.get("/favicon.png", (req, res) => {
  res.status(204).end(); // No content
});

// Database connection with serverless optimization
let isConnected = false;

const connectDB = async (retries = 5) => {
  // If already connected, return existing connection
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log("✅ Using existing MongoDB connection");
    return mongoose.connection;
  }

  try {
    console.log("Attempting MongoDB connection...");
    
    // For serverless environments, use optimized settings
    const connectionOptions = {
      serverSelectionTimeoutMS: 5000, // 5 second timeout for serverless
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      bufferCommands: true, // Enable buffering for serverless
      // Note: bufferMaxEntries is not a valid option in current Mongoose versions
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, connectionOptions);
    
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });

    // Initialize platform settings
    await initializePlatformSettings();

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
      
      // In serverless environment, don't exit process, just throw error
      if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
        throw new Error("Failed to connect to MongoDB");
      } else {
        process.exit(1);
      }
    }
  }
};

// Middleware to ensure database connection before handling requests
const ensureDBConnection = async (req, res, next) => {
  try {
    if (!isConnected || mongoose.connection.readyState !== 1) {
      console.log("Database not connected, establishing connection...");
      await connectDB();
    }
    next();
  } catch (error) {
    console.error("Failed to establish database connection:", error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// API routes with database connection middleware
app.use("/api/auth", ensureDBConnection, authRoutes);
app.use("/api/users", ensureDBConnection, userRoutes);
app.use("/api/artists", ensureDBConnection, artistRoutes);
app.use("/api/studios", ensureDBConnection, studioRoutes);
app.use("/api/bookings", ensureDBConnection, bookingRoutes);
app.use("/api/reviews", ensureDBConnection, reviewRoutes);
app.use("/api/payments", ensureDBConnection, paymentRoutes);
app.use("/api/upload", ensureDBConnection, uploadRoutes);
app.use("/api/admin", ensureDBConnection, adminRoutes);
app.use("/api/notifications", ensureDBConnection, notificationRoutes);
app.use("/api/webhooks", ensureDBConnection, webhookRoutes);
app.use("/api/media", ensureDBConnection, mediaRoutes);
app.use("/api/equipment", ensureDBConnection, equipmentRoutes);
app.use("/api/services", ensureDBConnection, serviceRoutes);
app.use("/api/tickets", ensureDBConnection, ticketRoutes);
app.use("/api/revenue", ensureDBConnection, revenueRoutes);
app.use("/api/wallet", ensureDBConnection, walletRoutes);

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

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Start reservation cleanup job
    startReservationCleanup();

    server.listen(PORT, () => {
      console.log("\n" + "=".repeat(70));
      console.log(`🚀 Server running on port ${PORT}`);
      console.log("=".repeat(70));
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);

      // PayHere webhook diagnostic
      const serverUrl = process.env.SERVER_URL || `http://localhost:${PORT}`;
      console.log("\n🔔 PayHere Webhook Configuration:");
      console.log(`   Webhook URL: ${serverUrl}/api/webhooks/payhere`);
      console.log(`   Test URL:    ${serverUrl}/api/webhooks/test`);

      // Check critical environment variables
      const missingVars = [];
      if (!process.env.PAYHERE_MERCHANT_ID)
        missingVars.push("PAYHERE_MERCHANT_ID");
      if (!process.env.PAYHERE_MERCHANT_SECRET)
        missingVars.push("PAYHERE_MERCHANT_SECRET");

      if (missingVars.length > 0) {
        console.log(
          `\n⚠️  WARNING: Missing PayHere configuration: ${missingVars.join(", ")}`
        );
        console.log("   Payment processing will not work!");
      } else {
        console.log(`   Merchant ID: ${process.env.PAYHERE_MERCHANT_ID}`);
        console.log(`   Mode: ${process.env.PAYHERE_MODE || "sandbox"}`);
      }

      // Localhost warning
      if (serverUrl.includes("localhost")) {
        console.log("\n⚠️  IMPORTANT: Using localhost URL");
        console.log("   PayHere webhooks cannot reach localhost!");
        console.log("   Run diagnostic: node diagnose-webhook.js");
        console.log("   Or use ngrok: ngrok http " + PORT);
      } else {
        console.log(`\n✅ Using public URL: ${serverUrl}`);
        console.log("   PayHere webhooks should work correctly");
      }

      console.log("\n📝 Quick Commands:");
      console.log(
        `   Test webhook: curl http://localhost:${PORT}/api/webhooks/test`
      );
      console.log(`   Diagnose:     node diagnose-webhook.js`);
      console.log(`   Test server:  node test-webhook-server.js`);
      console.log("=".repeat(70) + "\n");
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

startServer().catch((error) => {
  console.error("❌ Fatal server startup error:", error);
  console.error("Stack trace:", error.stack);
  process.exit(1);
});

module.exports = app;
