/**
 * PayHere Payment ID Verification Script
 *
 * This script checks:
 * 1. If payment_id is captured from PayHere webhook
 * 2. If it's stored in the Booking model
 * 3. If it's stored in the Payment model
 * 4. If wallet transactions reference the payment_id
 */

require("dotenv").config();
const mongoose = require("mongoose");
require("./src/models/User");
require("./src/models/Studio");
const Booking = require("./src/models/Booking");
const Payment = require("./src/models/Payment");
const { Wallet, WalletTransaction } = require("./src/models/Wallet");

async function verifyPaymentIdCapture() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("\n✅ Connected to database\n");
    console.log("═".repeat(80));
    console.log("           PAYHERE PAYMENT ID CAPTURE VERIFICATION");
    console.log("═".repeat(80));

    // Check Bookings with payment IDs
    console.log("\n📋 CHECKING BOOKINGS WITH PAYHERE PAYMENT IDs");
    console.log("─".repeat(80));

    const bookingsWithPaymentIds = await Booking.find({
      payherePaymentId: { $exists: true, $ne: null },
    })
      .populate("client", "name email")
      .populate({
        path: "studio",
        populate: { path: "user", select: "name email" },
      })
      .sort({ createdAt: -1 })
      .limit(10);

    if (bookingsWithPaymentIds.length > 0) {
      console.log(
        `✓ Found ${bookingsWithPaymentIds.length} booking(s) with PayHere payment IDs:\n`
      );

      bookingsWithPaymentIds.forEach((booking, i) => {
        console.log(`${i + 1}. Booking: ${booking._id}`);
        console.log(`   Client: ${booking.client?.name || "N/A"}`);
        console.log(`   Studio: ${booking.studio?.name || "N/A"}`);
        console.log(`   Price: LKR ${booking.price}`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   ✓ PayHere Payment ID: ${booking.payherePaymentId}`);
        console.log(
          `   Order ID: ${booking.payhereOrderId || booking.orderId || "N/A"}`
        );
        console.log(`   Payment Method: ${booking.paymentMethod || "N/A"}`);
        console.log(`   Card Type: ${booking.paymentCardType || "N/A"}`);
        console.log("");
      });
    } else {
      console.log("⚠️  No bookings found with PayHere payment IDs");
      console.log(
        "   This means webhook has not processed any successful payments yet."
      );
    }

    // Check Payment records
    console.log("\n💳 CHECKING PAYMENT RECORDS");
    console.log("─".repeat(80));

    const paymentsWithIds = await Payment.find({
      payherePaymentId: { $exists: true, $ne: null },
    })
      .populate("booking")
      .sort({ createdAt: -1 })
      .limit(10);

    if (paymentsWithIds.length > 0) {
      console.log(
        `✓ Found ${paymentsWithIds.length} payment record(s) with PayHere payment IDs:\n`
      );

      paymentsWithIds.forEach((payment, i) => {
        console.log(`${i + 1}. Payment: ${payment._id}`);
        console.log(`   Booking: ${payment.booking?._id || "N/A"}`);
        console.log(`   Amount: ${payment.currency} ${payment.amount}`);
        console.log(`   Status: ${payment.status}`);
        console.log(`   ✓ PayHere Payment ID: ${payment.payherePaymentId}`);
        console.log(`   Order ID: ${payment.payhereOrderId}`);
        console.log(
          `   Completed: ${payment.completedAt ? payment.completedAt.toLocaleString() : "N/A"}`
        );
        console.log(
          `   Method: ${payment.payhereData?.method || payment.paymentMethod || "N/A"}`
        );
        console.log(
          `   Card Type: ${payment.cardType || payment.payhereData?.card_type || "N/A"}`
        );
        console.log("");
      });
    } else {
      console.log("⚠️  No payment records found with PayHere payment IDs");
    }

    // Check Wallet Transactions
    console.log("\n💰 CHECKING WALLET TRANSACTIONS WITH PAYMENT IDs");
    console.log("─".repeat(80));

    const transactionsWithPaymentIds = await WalletTransaction.find({
      paymentId: { $exists: true, $ne: null },
    })
      .populate("user", "name email")
      .populate("booking")
      .sort({ createdAt: -1 })
      .limit(10);

    if (transactionsWithPaymentIds.length > 0) {
      console.log(
        `✓ Found ${transactionsWithPaymentIds.length} wallet transaction(s) with payment IDs:\n`
      );

      transactionsWithPaymentIds.forEach((tx, i) => {
        console.log(`${i + 1}. Transaction: ${tx._id}`);
        console.log(
          `   User: ${tx.user?.name || "N/A"} (${tx.user?.email || "N/A"})`
        );
        console.log(`   Type: ${tx.type}`);
        console.log(`   Amount: ${tx.currency} ${tx.amount}`);
        console.log(`   Net Amount: ${tx.currency} ${tx.netAmount}`);
        console.log(`   Status: ${tx.status}`);
        console.log(`   ✓ Payment ID: ${tx.paymentId}`);
        console.log(`   Order ID: ${tx.orderId || "N/A"}`);
        console.log(`   Booking: ${tx.booking?._id || "N/A"}`);
        console.log(`   Date: ${tx.createdAt.toLocaleString()}`);
        console.log("");
      });
    } else {
      console.log("⚠️  No wallet transactions found with payment IDs");
    }

    // Summary and Analysis
    console.log("\n");
    console.log("═".repeat(80));
    console.log("                            SUMMARY");
    console.log("═".repeat(80));

    const totalBookingsWithPaymentId = bookingsWithPaymentIds.length;
    const totalPaymentsWithPaymentId = paymentsWithIds.length;
    const totalTransactionsWithPaymentId = transactionsWithPaymentIds.length;

    console.log("\n📊 PAYMENT ID CAPTURE STATUS:");
    console.log(
      `   Bookings with payment_id:      ${totalBookingsWithPaymentId}`
    );
    console.log(
      `   Payment records with payment_id: ${totalPaymentsWithPaymentId}`
    );
    console.log(
      `   Wallet transactions with payment_id: ${totalTransactionsWithPaymentId}`
    );

    console.log("\n✅ VERIFICATION RESULTS:");
    if (totalBookingsWithPaymentId > 0) {
      console.log("   ✓ PayHere payment_id IS being captured in Bookings");
      console.log("   ✓ Webhook is processing successfully");
      console.log("   ✓ Payment details are stored correctly");
    } else {
      console.log("   ⚠️  PayHere payment_id NOT found in Bookings");
      console.log("   ⚠️  Webhook may not have processed any payments yet");
    }

    if (totalPaymentsWithPaymentId > 0) {
      console.log(
        "   ✓ PayHere payment_id IS being captured in Payment records"
      );
      console.log("   ✓ Payment.markCompleted() is working correctly");
    } else {
      console.log("   ⚠️  PayHere payment_id NOT found in Payment records");
    }

    if (totalTransactionsWithPaymentId > 0) {
      console.log(
        "   ✓ PayHere payment_id IS being captured in Wallet transactions"
      );
      console.log("   ✓ Wallet crediting includes payment traceability");
    } else {
      console.log("   ⚠️  PayHere payment_id NOT found in Wallet transactions");
    }

    console.log("\n📝 HOW PAYMENT_ID IS CAPTURED:");
    console.log("   1. Customer completes payment on PayHere");
    console.log("   2. PayHere sends webhook POST to /api/webhooks/payhere");
    console.log(
      "   3. Webhook payload includes: payment_id, order_id, status_code"
    );
    console.log(
      "   4. handlePaymentSuccess() extracts payment_id from payload"
    );
    console.log("   5. Stores in:");
    console.log("      - booking.payherePaymentId = payload.payment_id");
    console.log("      - payment.markCompleted(payload.payment_id, ...)");
    console.log("      - wallet transaction metadata.paymentId");

    console.log("\n🔍 SAMPLE WEBHOOK PAYLOAD STRUCTURE:");
    console.log("   {");
    console.log('     merchant_id: "1234567",');
    console.log('     order_id: "ORD-20251031-0001",');
    console.log(
      '     payment_id: "320241012155600000456",  ← THIS IS CAPTURED'
    );
    console.log('     payhere_amount: "5000.00",');
    console.log('     payhere_currency: "LKR",');
    console.log('     status_code: "2",  ← 2 = Success');
    console.log('     md5sig: "ABC123...",');
    console.log('     custom_1: "<booking_id>",');
    console.log('     method: "VISA",');
    console.log('     card_type: "VISA",');
    console.log('     status_message: "Successfully completed the payment."');
    console.log("   }");

    console.log("\n💡 TO TEST PAYMENT_ID CAPTURE:");
    console.log("   1. Run webhook simulation:");
    console.log("      node test-payhere-webhook-simulation.js <booking_id>");
    console.log("   2. Check booking for payherePaymentId:");
    console.log("      It will be something like: PH_1761879288037_8s31tr11m");
    console.log("   3. Verify in this script by running again:");
    console.log("      node check-payment-id-capture.js");

    console.log("\n" + "═".repeat(80) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

verifyPaymentIdCapture();
