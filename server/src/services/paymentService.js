const crypto = require("crypto");
const logger = require("../utils/logger");
const Payment = require("../models/Payment");

/**
 * Create MD5 hash
 * @param {string} str - String to hash
 * @returns {string} - MD5 hash
 */
const getMd5Hash = (str) => {
  return crypto.createHash("md5").update(str).digest("hex");
};

/**
 * Generate PayHere hash for security
 * @param {object} data - Payment data
 * @returns {string} - MD5 hash
 */
const generatePayHereHash = (data) => {
  const { merchant_id, order_id, amount, currency, merchant_secret } = data;

  // PayHere hash format: merchant_id + order_id + amount + currency + md5(merchant_secret)
  const hashedSecret = getMd5Hash(merchant_secret).toUpperCase();
  const hashString = merchant_id + order_id + amount + currency + hashedSecret;

  console.log("Hash components:", {
    merchant_id,
    order_id,
    amount,
    currency,
    hashedSecret,
    hashString,
  });

  return getMd5Hash(hashString).toUpperCase();
};

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
    throw new Error(
      "PayHere configuration missing. Please check environment variables."
    );
  }

  try {
    const orderId = `booking_${booking._id}_${Date.now()}`;

    // Prepare payment data according to PayHere API
    const paymentData = {
      merchant_id: process.env.PAYHERE_MERCHANT_ID,
      return_url: `${process.env.CORS_ORIGIN}/booking/success`,
      cancel_url: `${process.env.CORS_ORIGIN}/checkout`,
      notify_url: `${process.env.SERVER_URL}/api/webhooks/payhere`,
      order_id: orderId,
      items: booking.service?.name || "Studio Booking",
      currency: (booking.currency || "LKR").toUpperCase(),
      amount: parseFloat(booking.price).toFixed(2),
      first_name: booking.client.name.split(" ")[0] || "Customer",
      last_name: booking.client.name.split(" ").slice(1).join(" ") || "",
      email: booking.client.email,
      phone: booking.client.phone || "",
      address: booking.client.address || "",
      city: booking.client.city || "",
      country: "LK",
      custom_1: booking._id.toString(), // Pass booking ID for webhook
      custom_2: booking.studio._id.toString(), // Pass studio ID for reference
      merchant_secret: process.env.PAYHERE_MERCHANT_SECRET,
    };

    // Generate hash for security
    const hash = generatePayHereHash(paymentData);
    logger.info("PayHere payment data:", {
      merchant_id: paymentData.merchant_id,
      order_id: paymentData.order_id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      hash: hash,
    });

    // Remove merchant_secret from the data that goes to frontend
    const { merchant_secret, ...checkoutData } = paymentData;
    checkoutData.hash = hash;

    // Store order ID in booking
    booking.payhereOrderId = orderId;
    booking.payherePaymentData = checkoutData;
    await booking.save();

    // Create payment record for tracking
    try {
      await Payment.createFromBooking(booking, orderId);
      logger.info(`Payment record created for booking: ${booking._id}`);
    } catch (error) {
      logger.error(`Failed to create payment record:`, error);
      // Don't fail the checkout process if payment record creation fails
    }

    logger.info(
      `PayHere checkout session created: ${orderId} for booking: ${booking._id}`
    );

    // Return checkout data for frontend
    return {
      id: orderId,
      url:
        process.env.PAYHERE_MODE === "sandbox"
          ? "https://sandbox.payhere.lk/pay/checkout"
          : "https://sandbox.payhere.lk/pay/checkout",
      checkoutData,
      amount_total: Math.round(booking.price * 100), // in cents
      currency: booking.currency?.toLowerCase() || "lkr",
      payment_status: "unpaid",
    };
  } catch (error) {
    logger.error("Error creating PayHere checkout:", error);
    throw error;
  }
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
    const hashedSecret = getMd5Hash(merchant_secret).toUpperCase();

    const hashString = [
      payload.merchant_id,
      payload.order_id,
      payload.payhere_amount,
      payload.payhere_currency,
      payload.status_code,
      hashedSecret,
    ].join("");

    const computedHash = getMd5Hash(hashString).toUpperCase();

    logger.info(
      `Webhook verification - Received: ${receivedHash}, Computed: ${computedHash}`
    );

    return computedHash === receivedHash.toUpperCase();
  } catch (error) {
    logger.error("Error verifying webhook signature:", error);
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
