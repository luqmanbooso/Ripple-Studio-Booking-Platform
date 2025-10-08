const express = require('express');
const Booking = require('../models/Booking');
const paymentService = require('../services/paymentService');
const bookingService = require('../services/bookingService');
const logger = require('../utils/logger');
const { emitToUser, emitToProvider } = require('../utils/sockets');

const router = express.Router();

// Test endpoint to verify webhook route is working
router.get('/test', (req, res) => {
  logger.info('PayHere webhook test endpoint accessed');
  res.json({ 
    status: 'success', 
    message: 'PayHere webhook route is working',
    timestamp: new Date().toISOString()
  });
});

// Manual webhook trigger for testing (development only)
router.post('/test-webhook', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Only available in development' });
  }

  try {
    const { bookingId } = req.body;
    
    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId is required' });
    }

    const booking = await Booking.findById(bookingId).populate([
      { path: 'client', select: 'name email' },
      { path: 'studio', populate: { path: 'user', select: 'name email' } }
    ]);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Simulate successful payment webhook
    const confirmedBooking = await bookingService.confirmBooking(booking, 'test_payment_' + Date.now());

    logger.info(`Test webhook triggered for booking: ${bookingId}`);
    
    res.json({
      status: 'success',
      message: 'Test webhook processed successfully',
      booking: {
        id: confirmedBooking._id,
        status: confirmedBooking.status
      }
    });
  } catch (error) {
    logger.error('Test webhook error:', error);
    res.status(500).json({ error: 'Test webhook failed' });
  }
});

// PayHere webhook endpoint
router.post('/payhere', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const payload = req.body;
    const receivedHash = payload.md5sig;

    // Log webhook payload for debugging
    logger.info('PayHere webhook received:', {
      order_id: payload.order_id,
      payment_id: payload.payment_id,
      status_code: payload.status_code,
      custom_1: payload.custom_1,
      payhere_amount: payload.payhere_amount,
      payhere_currency: payload.payhere_currency
    });

    // Verify webhook signature
    if (!paymentService.verifyWebhookSignature(payload, receivedHash)) {
      logger.error('PayHere webhook signature verification failed', {
        received_hash: receivedHash,
        payload: payload
      });
      return res.status(400).send('Invalid signature');
    }

    // Handle different payment statuses
    switch (parseInt(payload.status_code)) {
      case 2: // Success
        await handlePaymentSuccess(payload);
        break;
      case 0: // Pending
        await handlePaymentPending(payload);
        break;
      case -1: // Canceled
        await handlePaymentCanceled(payload);
        break;
      case -2: // Failed
        await handlePaymentFailed(payload);
        break;
      case -3: // Chargedback
        await handlePaymentChargeback(payload);
        break;
      default:
        logger.info(`Unhandled PayHere status code: ${payload.status_code}`);
    }

    res.status(200).send('OK');
  } catch (error) {
    logger.error('PayHere webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

/**
 * Handle successful payment
 */
const handlePaymentSuccess = async (payload) => {
  try {
    const bookingId = payload.custom_1; // We stored booking ID in custom_1
    if (!bookingId) {
      logger.error('No booking ID in PayHere webhook payload');
      return;
    }

    const booking = await Booking.findById(bookingId)
      .populate([
        { path: 'client', select: 'name email' },
        { path: 'artist', populate: { path: 'user', select: 'name email' } },
        { path: 'studio', populate: { path: 'user', select: 'name email' } }
      ]);

    if (!booking) {
      logger.error(`Booking not found: ${bookingId}`);
      return;
    }

    // Store PayHere payment details
    booking.payherePaymentId = payload.payment_id;
    booking.paymentMethod = payload.method;
    booking.paymentCardType = payload.card_type;
    
    // Confirm the booking
    await bookingService.confirmBooking(booking, payload.payment_id);

    logger.info(`Booking confirmed via PayHere webhook: ${bookingId}`);
  } catch (error) {
    logger.error('Error handling PayHere payment success:', error);
  }
};

/**
 * Handle pending payment
 */
const handlePaymentPending = async (payload) => {
  try {
    const bookingId = payload.custom_1;
    if (!bookingId) return;

    const booking = await Booking.findById(bookingId);
    if (booking) {
      booking.status = 'payment_pending';
      booking.payherePaymentId = payload.payment_id;
      await booking.save();

      logger.info(`Payment pending for booking: ${bookingId}`);
    }
  } catch (error) {
    logger.error('Error handling payment pending:', error);
  }
};

/**
 * Handle canceled payment
 */
const handlePaymentCanceled = async (payload) => {
  try {
    const bookingId = payload.custom_1;
    if (!bookingId) return;

    const booking = await Booking.findById(bookingId).populate('client');
    if (booking) {
      booking.status = 'cancelled';
      booking.cancellationReason = 'Payment canceled by user';
      await booking.save();

      // Notify client of cancellation
      await bookingService.createNotification(booking.client._id, 'payment_cancelled', {
        title: 'Payment Cancelled',
        message: 'Your payment was cancelled. You can try booking again.',
        bookingId: booking._id
      });

      logger.info(`Payment cancelled for booking: ${bookingId}`);
    }
  } catch (error) {
    logger.error('Error handling payment cancellation:', error);
  }
};

/**
 * Handle failed payment
 */
const handlePaymentFailed = async (payload) => {
  try {
    const bookingId = payload.custom_1;
    if (!bookingId) return;

    const booking = await Booking.findById(bookingId).populate('client');
    if (booking) {
      booking.status = 'payment_failed';
      await booking.save();

      // Notify client of payment failure
      await bookingService.createNotification(booking.client._id, 'payment_failed', {
        title: 'Payment Failed',
        message: 'Your payment could not be processed. Please try again.',
        bookingId: booking._id
      });

      logger.info(`Payment failed for booking: ${bookingId}`);
    }
  } catch (error) {
    logger.error('Error handling payment failure:', error);
  }
};

/**
 * Handle payment chargeback
 */
const handlePaymentChargeback = async (payload) => {
  try {
    const bookingId = payload.custom_1;
    if (!bookingId) return;

    const booking = await Booking.findById(bookingId)
      .populate([
        { path: 'client' },
        { path: 'artist', populate: { path: 'user' } },
        { path: 'studio', populate: { path: 'user' } }
      ]);

    if (booking) {
      // Notify relevant parties about the chargeback
      const providerUser = booking.artist ? booking.artist.user : booking.studio.user;
      
      await bookingService.createNotification(providerUser._id, 'chargeback_created', {
        title: 'Payment Chargeback',
        message: 'A payment chargeback has been initiated for one of your bookings.',
        bookingId: booking._id
      });

      logger.info(`Chargeback initiated for booking: ${bookingId}`);
    }
  } catch (error) {
    logger.error('Error handling chargeback:', error);
  }
};

module.exports = router;
