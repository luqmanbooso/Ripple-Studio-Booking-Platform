const express = require('express');
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');

const router = express.Router();

// All payment routes require authentication
router.use(authenticate); // All payment routes require authentication

router.post('/create-checkout-session', paymentController.createCheckoutSession);
// Demo-only endpoint to complete a checkout session for local testing (no Stripe)
router.post('/demo-complete', paymentController.demoCompleteSession);
router.post('/refund/:bookingId', allowRoles('admin'), paymentController.refundBooking);

module.exports = router;
