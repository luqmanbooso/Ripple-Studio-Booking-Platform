const express = require('express');
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');

const router = express.Router();

// All payment routes require authentication
router.use(authenticate);

router.post('/create-checkout-session', paymentController.createCheckoutSession);
router.post('/refund/:bookingId', allowRoles('admin'), paymentController.refundBooking);

module.exports = router;
