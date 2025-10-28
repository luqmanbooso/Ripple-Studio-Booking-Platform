const express = require("express");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const { Wallet } = require("../models/Wallet");
const paymentService = require("../services/paymentService");
const bookingService = require("../services/bookingService");
const logger = require("../utils/logger");
const { emitToUser, emitToProvider } = require("../utils/sockets");

const router = express.Router();

// Test endpoint to verify webhook route is working
router.get("/test", (req, res) => {
  logger.info("PayHere webhook test endpoint accessed");
  res.json({
    status: "success",
    message: "PayHere webhook route is working",
    timestamp: new Date().toISOString(),
  });
});

// Manual webhook trigger for testing (development only)
router.post("/test-webhook", async (req, res) => {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ error: "Only available in development" });
  }

  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: "bookingId is required" });
    }

    const booking = await Booking.findById(bookingId).populate([
      { path: "client", select: "name email" },
      { path: "studio", populate: { path: "user", select: "name email" } },
    ]);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Simulate successful payment webhook
    const confirmedBooking = await bookingService.confirmBooking(
      booking,
      "test_payment_" + Date.now()
    );

    logger.info(`Test webhook triggered for booking: ${bookingId}`);

    res.json({
      status: "success",
      message: "Test webhook processed successfully",
      booking: {
        id: confirmedBooking._id,
        status: confirmedBooking.status,
      },
    });
  } catch (error) {
    logger.error("Test webhook error:", error);
    res.status(500).json({ error: "Test webhook failed" });
  }
});

// PayHere webhook endpoint
router.post(
  "/payhere",
  express.urlencoded({ extended: true }),
  async (req, res) => {
    try {
      const payload = req.body;
      const receivedHash = payload.md5sig;

      // Log webhook payload for debugging
      logger.info("PayHere webhook received:", {
        order_id: payload.order_id,
        payment_id: payload.payment_id,
        status_code: payload.status_code,
        custom_1: payload.custom_1,
        payhere_amount: payload.payhere_amount,
        payhere_currency: payload.payhere_currency,
      });

      // Verify webhook signature
      if (!paymentService.verifyWebhookSignature(payload, receivedHash)) {
        logger.error("PayHere webhook signature verification failed", {
          received_hash: receivedHash,
          payload: payload,
        });
        return res.status(400).send("Invalid signature");
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

      res.status(200).send("OK");
    } catch (error) {
      logger.error("PayHere webhook handler error:", error);
      res.status(500).json({ error: "Webhook handler failed" });
    }
  }
);

/**
 * Handle successful payment
 */
const handlePaymentSuccess = async (payload) => {
  try {
    const bookingId = payload.custom_1; // We stored booking ID in custom_1
    if (!bookingId) {
      logger.error("No booking ID in PayHere webhook payload");
      return;
    }

    const booking = await Booking.findById(bookingId).populate([
      { path: "client", select: "name email" },
      { path: "artist", populate: { path: "user", select: "name email" } },
      { path: "studio", populate: { path: "user", select: "name email" } },
    ]);

    if (!booking) {
      logger.error(`Booking not found: ${bookingId}`);
      return;
    }

    // Store PayHere payment details
    booking.payherePaymentId = payload.payment_id;
    booking.paymentMethod = payload.method;
    booking.paymentCardType = payload.card_type;

    // Update payment record with completed status
    const payment = await Payment.findOne({
      booking: bookingId,
      payhereOrderId: booking.payhereOrderId,
    });

    if (payment) {
      payment.markCompleted(payload.payment_id, {
        merchant_id: payload.merchant_id,
        method: payload.method,
        status_message: payload.status_message,
        card_holder_name: payload.card_holder_name,
        card_no: payload.card_no,
        card_type: payload.card_type,
        custom_1: payload.custom_1,
        custom_2: payload.custom_2,
      });
      payment.webhookPayload = payload;
      await payment.save();
      logger.info(`Payment record updated to Completed: ${payment._id}`);
    } else {
      logger.warn(`Payment record not found for booking: ${bookingId}`);
    }

    // Confirm the booking
    await bookingService.confirmBooking(booking, payload.payment_id);

    // Credit wallet for studio/artist owner
    try {
      const paymentDetails = {
        paymentId: payload.payment_id,
        orderId: payload.order_id,
        method: payload.method,
      };

      await Wallet.creditFromBooking(booking, paymentDetails);
      logger.info(
        `Wallet credited for booking: ${bookingId}, payment: ${payload.payment_id}`
      );
    } catch (walletError) {
      logger.error(
        `Failed to credit wallet for booking ${bookingId}:`,
        walletError
      );
      // Don't fail the webhook if wallet crediting fails
    }

    // Emit real-time updates
    emitToUser(booking.client._id, "booking:confirmed", {
      bookingId: booking._id,
      status: "confirmed",
    });

    const provider = booking.artist || booking.studio;
    if (provider) {
      emitToProvider(provider._id, "booking:new", {
        bookingId: booking._id,
        client: booking.client,
      });

      // Emit wallet update to provider
      emitToProvider(provider.user._id || provider._id, "wallet:transaction", {
        type: "credit",
        amount: booking.totalAmount,
        bookingId: booking._id,
      });
    }

    logger.info(`Booking confirmed via PayHere webhook: ${bookingId}`);
  } catch (error) {
    logger.error("Error handling PayHere payment success:", error);
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
      booking.status = "payment_pending";
      booking.payherePaymentId = payload.payment_id;
      await booking.save();

      // Update payment record
      const payment = await Payment.findOne({
        booking: bookingId,
        payhereOrderId: booking.payhereOrderId,
      });

      if (payment) {
        payment.payherePaymentId = payload.payment_id;
        payment.webhookReceived = true;
        payment.webhookReceivedAt = new Date();
        payment.webhookPayload = payload;
        await payment.save();
      }

      logger.info(`Payment pending for booking: ${bookingId}`);
    }
  } catch (error) {
    logger.error("Error handling payment pending:", error);
  }
};

/**
 * Handle canceled payment
 */
const handlePaymentCanceled = async (payload) => {
  try {
    const bookingId = payload.custom_1;
    if (!bookingId) return;

    const booking = await Booking.findById(bookingId).populate("client");
    if (booking) {
      booking.status = "cancelled";
      booking.cancellationReason = "Payment canceled by user";
      await booking.save();

      // Update payment record to Failed
      const payment = await Payment.findOne({
        booking: bookingId,
        payhereOrderId: booking.payhereOrderId,
      });

      if (payment) {
        payment.markFailed("Payment canceled by user", "-1");
        payment.webhookPayload = payload;
        await payment.save();
      }

      // Notify client of cancellation
      await bookingService.createNotification(
        booking.client._id,
        "payment_cancelled",
        {
          title: "Payment Cancelled",
          message: "Your payment was cancelled. You can try booking again.",
          bookingId: booking._id,
        }
      );

      logger.info(`Payment cancelled for booking: ${bookingId}`);
    }
  } catch (error) {
    logger.error("Error handling payment cancellation:", error);
  }
};

/**
 * Handle failed payment
 */
const handlePaymentFailed = async (payload) => {
  try {
    const bookingId = payload.custom_1;
    if (!bookingId) return;

    const booking = await Booking.findById(bookingId).populate("client");
    if (booking) {
      booking.status = "payment_failed";
      await booking.save();

      // Update payment record to Failed
      const payment = await Payment.findOne({
        booking: bookingId,
        payhereOrderId: booking.payhereOrderId,
      });

      if (payment) {
        payment.markFailed(
          payload.status_message || "Payment failed",
          payload.status_code
        );
        payment.webhookPayload = payload;
        await payment.save();
      }

      // Notify client of payment failure
      await bookingService.createNotification(
        booking.client._id,
        "payment_failed",
        {
          title: "Payment Failed",
          message: "Your payment could not be processed. Please try again.",
          bookingId: booking._id,
        }
      );

      logger.info(`Payment failed for booking: ${bookingId}`);
    }
  } catch (error) {
    logger.error("Error handling payment failure:", error);
  }
};

/**
 * Handle payment chargeback
 */
const handlePaymentChargeback = async (payload) => {
  try {
    const bookingId = payload.custom_1;
    if (!bookingId) return;

    const booking = await Booking.findById(bookingId).populate([
      { path: "client" },
      { path: "artist", populate: { path: "user" } },
      { path: "studio", populate: { path: "user" } },
    ]);

    if (booking) {
      // Update payment record to Chargeback
      const payment = await Payment.findOne({
        booking: bookingId,
        payhereOrderId: booking.payhereOrderId,
      });

      if (payment) {
        payment.status = "Chargeback";
        payment.addStatusChange(
          "Chargeback",
          null,
          "Chargeback initiated by customer"
        );
        payment.webhookPayload = payload;
        await payment.save();
      }

      // Notify relevant parties about the chargeback
      const providerUser = booking.artist
        ? booking.artist.user
        : booking.studio.user;

      await bookingService.createNotification(
        providerUser._id,
        "chargeback_created",
        {
          title: "Payment Chargeback",
          message:
            "A payment chargeback has been initiated for one of your bookings.",
          bookingId: booking._id,
        }
      );

      logger.info(`Chargeback initiated for booking: ${bookingId}`);
    }
  } catch (error) {
    logger.error("Error handling chargeback:", error);
  }
};

module.exports = router;
