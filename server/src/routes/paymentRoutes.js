const express = require("express");
const paymentController = require("../controllers/paymentController");
const { authenticate } = require("../middleware/auth");
const { allowRoles } = require("../middleware/rbac");

const router = express.Router();

// PayHere verification endpoint (no auth needed as it comes from return URL)
router.post("/verify-payhere", paymentController.verifyPayherePayment);

// All other payment routes require authentication
router.use(authenticate);

// Checkout and payment operations
router.post(
  "/create-checkout-session",
  paymentController.createCheckoutSession
);

// Demo-only endpoint to complete a checkout session for local testing
router.post("/demo-complete", paymentController.demoCompleteSession);

// Test endpoint to create sample payment (development only)
router.post("/create-test-payment", paymentController.createTestPayment);

// Payment tracking endpoints
router.get("/my-payments", paymentController.getMyPayments);
router.get("/booking/:bookingId/payments", paymentController.getBookingPayments);
router.get("/:paymentId", paymentController.getPayment);

// Admin payment management
router.get(
  "/admin/all",
  allowRoles("admin"),
  paymentController.getAllPayments
);

// Refund operations
router.post(
  "/refund/:bookingId",
  allowRoles("admin"),
  paymentController.refundBooking
);

router.post(
  "/:paymentId/refund",
  allowRoles("admin", "studio"),
  paymentController.initiateRefund
);

module.exports = router;
