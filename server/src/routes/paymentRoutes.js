const express = require("express");
const paymentController = require("../controllers/paymentController");
const { authenticate } = require("../middleware/auth");
const { allowRoles } = require("../middleware/rbac");

const router = express.Router();

// PayHere verification endpoint (no auth needed as it comes from return URL)
router.post("/verify-payhere", paymentController.verifyPayherePayment);

// All other payment routes require authentication
router.use(authenticate);

router.post(
  "/create-checkout-session",
  paymentController.createCheckoutSession
);
// Demo-only endpoint to complete a checkout session for local testing (no Stripe)
router.post("/demo-complete", paymentController.demoCompleteSession);
router.post(
  "/refund/:bookingId",
  allowRoles("admin"),
  paymentController.refundBooking
);

module.exports = router;
