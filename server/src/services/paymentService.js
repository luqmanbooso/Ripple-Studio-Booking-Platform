const { Payhere } = require("@payhere-js-sdk/client");
const crypto = require("crypto");
const logger = require("../utils/logger");

// Initialize PayHere with configuration
const payhere = new Payhere({
  merchant_id: process.env.PAYHERE_MERCHANT_ID,
  merchant_secret: process.env.PAYHERE_MERCHANT_SECRET,
  app_id: process.env.PAYHERE_APP_ID,
  app_secret: process.env.PAYHERE_APP_SECRET,
  mode: process.env.PAYHERE_MODE || "sandbox", // 'sandbox' or 'live'
});

/**
 * Create PayHere checkout session
 * @param {object} booking - Booking object
 * @returns {Promise<object>} - PayHere checkout data
 */
const createCheckoutSession = async (booking) => {
  // Check if PayHere is properly configured
  if (
    !process.env.PAYHERE_MERCHANT_ID ||
    !process.env.PAYHERE_MERCHANT_SECRET
  ) {
    const demoSession = {
      id: `cs_demo_${Math.random().toString(36).substr(2, 9)}`,
      object: "checkout.session",
      url: `${process.env.CORS_ORIGIN}/booking/demo-checkout?session_id=cs_demo`,
      payment_status: "unpaid",
      amount_total: Math.round(booking.price * 100),
      currency: booking.currency?.toLowerCase() || "lkr",
    };

    // Save a demo session id on the booking for local testing
    booking.payhereOrderId = demoSession.id;
    await booking.save();

    logger.info(
      `Demo checkout session created: ${demoSession.id} for booking: ${booking._id}`
    );
    return demoSession;
  }

  try {
    // Generate unique order ID
    const orderId = `booking_${booking._id}_${Date.now()}`;

    const checkoutData = {
      merchant_id: process.env.PAYHERE_MERCHANT_ID,
      return_url: `${process.env.CORS_ORIGIN}/booking/success`,
      cancel_url: `${process.env.CORS_ORIGIN}/booking/cancelled`,
      notify_url: `${process.env.SERVER_URL}/api/webhooks/payhere`,
      order_id: orderId,
      items: booking.service.name,
      currency: booking.currency || "LKR",
      amount: booking.price.toFixed(2),
      first_name: booking.client.name.split(" ")[0] || "Customer",
      last_name: booking.client.name.split(" ").slice(1).join(" ") || "",
      email: booking.client.email,
      phone: booking.client.phone || "",
      address: "",
      city: "",
      country: "LK", // Sri Lanka
      delivery_address: "",
      delivery_city: "",
      delivery_country: "LK",
      custom_1: booking._id.toString(), // Store booking ID for webhook processing
      custom_2: "ripple_booking",
    };

    // Generate hash for security
    const hash = generatePayHereHash(checkoutData);
    checkoutData.hash = hash;

    // Store order ID in booking
    booking.payhereOrderId = orderId;
    await booking.save();

    // PayHere doesn't create a session like Stripe, instead returns checkout data
    // The frontend will use this data to redirect to PayHere checkout
    const checkoutUrl =
      process.env.PAYHERE_MODE === "live"
        ? "https://www.payhere.lk/pay/checkout"
        : "https://sandbox.payhere.lk/pay/checkout";

    logger.info(`PayHere checkout data created for booking: ${booking._id}`);
    return {
      id: orderId,
      url: checkoutUrl,
      checkoutData,
    };
  } catch (error) {
    logger.error("Error creating PayHere checkout:", error);
    throw error;
  }
};

/**
 * Generate PayHere hash for security
 * @param {object} data - Payment data
 * @returns {string} - Generated hash
 */
const generatePayHereHash = (data) => {
  const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET;
  const hashedSecret = crypto
    .createHash("md5")
    .update(merchant_secret)
    .digest("hex")
    .toUpperCase();

  const hashString =
    data.merchant_id +
    data.order_id +
    data.amount +
    data.currency +
    hashedSecret;

  return crypto
    .createHash("md5")
    .update(hashString)
    .digest("hex")
    .toUpperCase();
};

/**
 * Refund a payment (PayHere doesn't have direct API refund, this is for manual tracking)
 * @param {string} paymentId - PayHere payment ID
 * @param {number} amount - Amount to refund
 * @returns {Promise<object>} - Refund object
 */
const refundPayment = async (paymentId, amount) => {
  try {
    // Note: PayHere doesn't have automatic refund API like Stripe
    // This is mainly for tracking purposes
    // Actual refunds need to be processed through PayHere merchant portal

    const refundData = {
      id: `refund_${Date.now()}`,
      payment_id: paymentId,
      amount: amount,
      currency: "LKR",
      status: "pending_manual_processing",
      created: new Date(),
      reason: "booking_cancellation",
    };

    logger.info(
      `Refund request created: ${refundData.id} for amount: ${amount} (requires manual processing in PayHere portal)`
    );
    return refundData;
  } catch (error) {
    logger.error("Error creating refund request:", error);
    throw error;
  }
};

/**
 * Retrieve payment details (PayHere doesn't have direct API for this)
 * @param {string} paymentId - PayHere payment ID
 * @returns {Promise<object>} - Payment object
 */
const retrievePayment = async (paymentId) => {
  try {
    // PayHere doesn't provide direct API to retrieve payment details
    // This would need to be implemented using their merchant API if available
    logger.info(
      `Payment retrieval requested for: ${paymentId} (limited API support in PayHere)`
    );
    return {
      id: paymentId,
      status: "unknown",
      note: "PayHere payment retrieval requires merchant portal access",
    };
  } catch (error) {
    logger.error("Error retrieving payment:", error);
    throw error;
  }
};

/**
 * Verify PayHere webhook signature
 * @param {object} payload - Webhook payload
 * @param {string} receivedHash - Received hash from PayHere
 * @returns {boolean} - Verification result
 */
const verifyWebhookSignature = (payload, receivedHash) => {
  try {
    const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET;
    const hashedSecret = crypto
      .createHash("md5")
      .update(merchant_secret)
      .digest("hex")
      .toUpperCase();

    const hashString =
      payload.merchant_id +
      payload.order_id +
      payload.payhere_amount +
      payload.payhere_currency +
      payload.status_code +
      hashedSecret;

    const computedHash = crypto
      .createHash("md5")
      .update(hashString)
      .digest("hex")
      .toUpperCase();

    return computedHash === receivedHash.toUpperCase();
  } catch (error) {
    logger.error("PayHere webhook signature verification failed:", error);
    return false;
  }
};

module.exports = {
  createCheckoutSession,
  refundPayment,
  retrievePayment,
  verifyWebhookSignature,
  generatePayHereHash,
};
