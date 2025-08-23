const express = require('express');
const Booking = require('../models/Booking');
const paymentService = require('../services/paymentService');
const bookingService = require('../services/bookingService');
const logger = require('../utils/logger');
const { emitToUser, emitToProvider } = require('../utils/sockets');

const router = express.Router();

// Stripe webhook endpoint
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = paymentService.verifyWebhookSignature(req.body, sig);
  } catch (err) {
    logger.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object);
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

/**
 * Handle successful checkout session completion
 */
const handleCheckoutCompleted = async (session) => {
  try {
    const bookingId = session.metadata.bookingId;
    if (!bookingId) {
      logger.error('No booking ID in session metadata');
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

    // Confirm the booking
    await bookingService.confirmBooking(booking, session.payment_intent);

    logger.info(`Booking confirmed via webhook: ${bookingId}`);
  } catch (error) {
    logger.error('Error handling checkout completion:', error);
  }
};

/**
 * Handle successful payment
 */
const handlePaymentSucceeded = async (paymentIntent) => {
  try {
    // Find booking by payment intent ID
    const booking = await Booking.findOne({ 
      paymentIntentId: paymentIntent.id 
    });

    if (booking && booking.status !== 'confirmed') {
      await bookingService.confirmBooking(booking, paymentIntent.id);
      logger.info(`Payment succeeded for booking: ${booking._id}`);
    }
  } catch (error) {
    logger.error('Error handling payment success:', error);
  }
};

/**
 * Handle failed payment
 */
const handlePaymentFailed = async (paymentIntent) => {
  try {
    const booking = await Booking.findOne({ 
      paymentIntentId: paymentIntent.id 
    }).populate('client');

    if (booking) {
      booking.status = 'payment_failed';
      await booking.save();

      // Notify client of payment failure
      await bookingService.createNotification(booking.client._id, 'payment_failed', {
        title: 'Payment Failed',
        message: 'Your payment could not be processed. Please try again.',
        bookingId: booking._id
      });

      logger.info(`Payment failed for booking: ${booking._id}`);
    }
  } catch (error) {
    logger.error('Error handling payment failure:', error);
  }
};

/**
 * Handle dispute creation
 */
const handleDisputeCreated = async (charge) => {
  try {
    // Find booking by charge ID or payment intent
    const booking = await Booking.findOne({
      $or: [
        { stripeChargeId: charge.id },
        { paymentIntentId: charge.payment_intent }
      ]
    }).populate([
      { path: 'client' },
      { path: 'artist', populate: { path: 'user' } },
      { path: 'studio', populate: { path: 'user' } }
    ]);

    if (booking) {
      // Notify relevant parties about the dispute
      const providerUser = booking.artist ? booking.artist.user : booking.studio.user;
      
      await bookingService.createNotification(providerUser._id, 'dispute_created', {
        title: 'Payment Dispute',
        message: 'A payment dispute has been created for one of your bookings.',
        bookingId: booking._id
      });

      logger.info(`Dispute created for booking: ${booking._id}`);
    }
  } catch (error) {
    logger.error('Error handling dispute creation:', error);
  }
};

module.exports = router;
