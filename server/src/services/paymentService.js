const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const logger = require('../utils/logger');

/**
 * Create Stripe checkout session
 * @param {object} booking - Booking object
 * @returns {Promise<object>} - Stripe session
 */
const createCheckoutSession = async (booking) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: booking.currency.toLowerCase(),
            product_data: {
              name: booking.service.name,
              description: `Booking with ${booking.artist ? 'Artist' : 'Studio'}`,
            },
            unit_amount: Math.round(booking.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CORS_ORIGIN}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CORS_ORIGIN}/booking/cancelled`,
      metadata: {
        bookingId: booking._id.toString(),
      },
    });

    // Store session ID in booking
    booking.stripeSessionId = session.id;
    await booking.save();

    logger.info(`Checkout session created: ${session.id} for booking: ${booking._id}`);
    return session;
  } catch (error) {
    logger.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Refund a payment
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @param {number} amount - Amount to refund
 * @returns {Promise<object>} - Refund object
 */
const refundPayment = async (paymentIntentId, amount) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: Math.round(amount * 100), // Convert to cents
    });

    logger.info(`Refund created: ${refund.id} for amount: $${amount}`);
    return refund;
  } catch (error) {
    logger.error('Error creating refund:', error);
    throw error;
  }
};

/**
 * Retrieve payment intent
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {Promise<object>} - Payment intent object
 */
const retrievePaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    logger.error('Error retrieving payment intent:', error);
    throw error;
  }
};

/**
 * Retrieve checkout session
 * @param {string} sessionId - Stripe session ID
 * @returns {Promise<object>} - Session object
 */
const retrieveCheckoutSession = async (sessionId) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    logger.error('Error retrieving checkout session:', error);
    throw error;
  }
};

/**
 * Verify webhook signature
 * @param {string} payload - Webhook payload
 * @param {string} signature - Webhook signature
 * @returns {object} - Verified event
 */
const verifyWebhookSignature = (payload, signature) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (error) {
    logger.error('Webhook signature verification failed:', error);
    throw error;
  }
};

module.exports = {
  createCheckoutSession,
  refundPayment,
  retrievePaymentIntent,
  retrieveCheckoutSession,
  verifyWebhookSignature
};
