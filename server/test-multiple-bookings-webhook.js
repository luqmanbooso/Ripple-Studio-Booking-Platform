/**
 * Multiple Bookings PayHere Webhook Simulation Script
 *
 * This script simulates 7 PayHere payment webhook POST requests
 * totaling LKR 14,000 (2,000 per booking)
 *
 * Usage: node test-multiple-bookings-webhook.js <bookingId1> <bookingId2> ... <bookingId7>
 * Or: node test-multiple-bookings-webhook.js (will use test booking IDs)
 */

require("dotenv").config();
const crypto = require("crypto");
const axios = require("axios");

// Configuration
const WEBHOOK_URL = process.env.SERVER_URL || "http://localhost:5000";
const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID;
const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET;

// Get booking IDs from command line or use defaults
let BOOKING_IDS = process.argv.slice(2);

// If no booking IDs provided, you need to provide them
if (BOOKING_IDS.length === 0) {
  console.error("❌ Error: At least one Booking ID is required");
  console.log(
    "\n📖 Usage: node test-multiple-bookings-webhook.js <bookingId1> <bookingId2> ..."
  );
  console.log(
    "📖 Example: node test-multiple-bookings-webhook.js 672102... 672103... 672104...\n"
  );
  console.log(
    "💡 You can provide 1-7 booking IDs. The script will simulate payment for each.\n"
  );
  process.exit(1);
}

// Limit to 7 bookings
if (BOOKING_IDS.length > 7) {
  console.log(
    "⚠️  Warning: More than 7 booking IDs provided. Using first 7 only."
  );
  BOOKING_IDS = BOOKING_IDS.slice(0, 7);
}

console.log("\n🚀 Multiple Bookings PayHere Webhook Simulation Started");
console.log("=".repeat(80));
console.log(`📦 Number of Bookings: ${BOOKING_IDS.length}`);
console.log(`💰 Amount per Booking: LKR 2,000`);
console.log(`💵 Total Amount: LKR ${BOOKING_IDS.length * 2000}`);
console.log(`🔗 Webhook URL: ${WEBHOOK_URL}/api/webhooks/payhere`);
console.log(`🏪 Merchant ID: ${MERCHANT_ID}`);
console.log("=".repeat(80));

/**
 * Generate MD5 signature exactly like PayHere does
 */
function generateMD5Signature(
  merchantId,
  orderId,
  amount,
  currency,
  statusCode,
  merchantSecret
) {
  // PayHere signature format: MERCHANT_ID + ORDER_ID + AMOUNT + CURRENCY + STATUS_CODE + MD5(MERCHANT_SECRET)
  const merchantSecretMD5 = crypto
    .createHash("md5")
    .update(merchantSecret)
    .digest("hex")
    .toUpperCase();
  const signatureString = `${merchantId}${orderId}${amount}${currency}${statusCode}${merchantSecretMD5}`;
  const signature = crypto
    .createHash("md5")
    .update(signatureString)
    .digest("hex")
    .toUpperCase();

  return signature;
}

/**
 * Simulate single webhook
 */
async function simulateWebhook(bookingId, index) {
  try {
    // Generate realistic PayHere payload
    const orderId = `ORDER_${Date.now()}_${index}`;
    const amount = "2000.00"; // LKR 2,000 per booking
    const currency = "LKR";
    const statusCode = "2"; // 2 = Success
    const paymentId = `PH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Generate MD5 signature
    const md5sig = generateMD5Signature(
      MERCHANT_ID,
      orderId,
      amount,
      currency,
      statusCode,
      MERCHANT_SECRET
    );

    // PayHere webhook payload structure
    const payload = {
      merchant_id: MERCHANT_ID,
      order_id: orderId,
      payment_id: paymentId,
      payhere_amount: amount,
      payhere_currency: currency,
      status_code: statusCode,
      md5sig: md5sig,
      custom_1: bookingId, // Our booking ID
      custom_2: "",
      method: "TEST_CARD",
      card_holder_name: "Test User",
      card_no: "************2346",
      card_type: "VISA",
      status_message: "Successfully completed the payment.",
      recurring: "0",
    };

    console.log(`\n📤 Sending Webhook #${index + 1} for Booking: ${bookingId}`);
    console.log(`   Order ID: ${orderId}`);
    console.log(`   Payment ID: ${paymentId}`);
    console.log(`   Amount: ${currency} ${amount}`);

    // Send POST request to webhook endpoint
    const response = await axios.post(
      `${WEBHOOK_URL}/api/webhooks/payhere`,
      payload,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 10000,
      }
    );

    console.log(
      `✅ Webhook #${index + 1} Success: ${response.status} ${response.statusText}`
    );

    return { success: true, bookingId, amount };
  } catch (error) {
    console.error(`❌ Webhook #${index + 1} Failed for Booking: ${bookingId}`);

    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(
        `   Message: ${JSON.stringify(error.response.data, null, 2)}`
      );
    } else if (error.request) {
      console.error("   No response from server. Is the server running?");
    } else {
      console.error(`   Error: ${error.message}`);
    }

    return { success: false, bookingId, error: error.message };
  }
}

/**
 * Process all bookings sequentially with delay
 */
async function processAllBookings() {
  const results = [];
  let successCount = 0;
  let failCount = 0;
  let totalAmount = 0;

  for (let i = 0; i < BOOKING_IDS.length; i++) {
    const result = await simulateWebhook(BOOKING_IDS[i], i);
    results.push(result);

    if (result.success) {
      successCount++;
      totalAmount += 2000;
    } else {
      failCount++;
    }

    // Wait 1 second between requests to avoid overwhelming server
    if (i < BOOKING_IDS.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Summary
  console.log("\n" + "=".repeat(80));
  console.log("🎉 SIMULATION COMPLETED!");
  console.log("=".repeat(80));
  console.log(`✅ Successful: ${successCount}/${BOOKING_IDS.length}`);
  console.log(`❌ Failed: ${failCount}/${BOOKING_IDS.length}`);
  console.log(`💰 Total Amount Credited: LKR ${totalAmount.toLocaleString()}`);

  if (successCount > 0) {
    console.log("\n📊 Next Steps:");
    console.log(
      "   1. Check your terminal running the server for processing logs"
    );
    console.log(
      `   2. Verify ${successCount} bookings changed to "confirmed" status`
    );
    console.log(
      "   3. Check wallet balance increased by LKR " +
        totalAmount.toLocaleString()
    );
    console.log("   4. View transactions in wallet history");
    console.log("\n💡 Tip: Run this to check wallet balance:");
    console.log("   node check-all-wallets.js\n");
  }

  if (failCount > 0) {
    console.log("\n🔍 Troubleshooting Failed Webhooks:");
    console.log("   1. Ensure server is running: npm run dev");
    console.log("   2. Verify SERVER_URL in .env matches server port");
    console.log("   3. Check booking IDs exist in database");
    console.log("   4. Verify PAYHERE_MERCHANT_SECRET is correct");
    console.log(
      "   5. Make sure bookings are in 'reservation_pending' status\n"
    );
  }
}

// Run simulation
processAllBookings().catch((error) => {
  console.error("\n💥 Fatal Error:", error);
  process.exit(1);
});
