const logger = require('../utils/logger');

// Initialize stripe only if a valid key is provided
let stripe = null
if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('here')) {
  try {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
  } catch (err) {
    logger.warn('Stripe initialization failed, falling back to demo mode')
    stripe = null
  }
} else {
  logger.warn('No valid STRIPE_SECRET_KEY provided - running in demo payment mode')
}

/**
 * Create Stripe checkout session
 * @param {object} booking - Booking object
 * @returns {Promise<object>} - Stripe session
 */
const createCheckoutSession = async (booking) => {
  // If Stripe is not initialized, return demo/mock session
  if (!stripe) {
    const demoSession = {
      id: `cs_demo_${Math.random().toString(36).substr(2, 9)}`,
      object: 'checkout.session',
      url: `${process.env.CORS_ORIGIN}/booking/demo-checkout?session_id=cs_demo`,
      payment_status: 'unpaid',
      amount_total: Math.round(booking.price * 100),
      currency: booking.currency?.toLowerCase() || 'usd'
    }

    // Save a demo session id on the booking for local testing
    booking.stripeSessionId = demoSession.id
    await booking.save()

    logger.info(`Demo checkout session created: ${demoSession.id} for booking: ${booking._id}`)
    return demoSession
  }

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
  // If demo mode or stripe not initialized, return a demo session if the id matches demo pattern
  if (!stripe && sessionId && sessionId.startsWith('cs_demo_')) {
    return {
      id: sessionId,
      object: 'checkout.session',
      payment_status: 'unpaid',
      url: `${process.env.CORS_ORIGIN}/booking/demo-checkout?session_id=${sessionId}`,
      amount_total: null
    }
  }

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
