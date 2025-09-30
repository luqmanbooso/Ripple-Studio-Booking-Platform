const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const studioRoutes = require("./studioRoutes");
const bookingRoutes = require("./bookingRoutes");
const reviewRoutes = require("./reviewRoutes");
const paymentRoutes = require("./paymentRoutes");
const adminRoutes = require("./adminRoutes");
const uploadRoutes = require("./uploadRoutes");
const feedbackRoutes = require("./feedbackRoutes");

const payhereWebhook = require("../webhooks/payhereWebhook");

const mediaRoutes = require("./mediaRoutes");
const equipmentRoutes = require("./equipmentRoutes");


const router = express.Router();

// Mount routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/studios", studioRoutes);
router.use("/bookings", bookingRoutes);
router.use("/reviews", reviewRoutes);
router.use("/payments", paymentRoutes);
router.use("/admin", adminRoutes);
router.use("/upload", uploadRoutes);
router.use("/feedback", feedbackRoutes);

router.use("/webhook", payhereWebhook);

router.use("/media", mediaRoutes);
router.use("/equipment", equipmentRoutes);


module.exports = router;
