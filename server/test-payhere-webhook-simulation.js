/**
 * PayHere Webhook Simulation Script
 *
 * This script simulates a PayHere payment webhook POST request to test
 * the complete payment flow including wallet crediting.
 *
 * It sends the exact same payload structure that PayHere would send,
 * including proper MD5 signature verification.
 *
 * Usage: node test-payhere-webhook-simulation.js <bookingId>
 */

require("dotenv").config();
const crypto = require("crypto");
const axios = require("axios");

// Configuration
const WEBHOOK_URL = process.env.SERVER_URL || "http://localhost:5000";
const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID;
const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET;

// Get booking ID from command line or use default
const BOOKING_ID = process.argv[2];

if (!BOOKING_ID) {
  console.error("❌ Error: Booking ID is required");
  console.log(
    "\n📖 Usage: node test-payhere-webhook-simulation.js <bookingId>"
  );
  console.log(
    "📖 Example: node test-payhere-webhook-simulation.js 6721027fb1ce9195cca7dd2b\n"
  );
  process.exit(1);
}

console.log("\n🚀 PayHere Webhook Simulation Started");
console.log("=".repeat(60));
console.log(`📦 Booking ID: ${BOOKING_ID}`);
console.log(`🔗 Webhook URL: ${WEBHOOK_URL}/api/webhooks/payhere`);
console.log(`🏪 Merchant ID: ${MERCHANT_ID}`);
console.log("=".repeat(60));

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

  console.log("\n🔐 Signature Generation:");
  console.log(`   Merchant Secret MD5: ${merchantSecretMD5}`);
  console.log(`   Signature String: ${signatureString}`);
  console.log(`   Final MD5 Hash: ${signature}`);

  return signature;
}

/**
 * Simulate PayHere webhook payload
 */
async function simulateWebhook() {
  try {
    // Generate realistic PayHere payload
    const orderId = `ORDER_${Date.now()}`;
    const amount = "5000.00"; // LKR 5,000
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
      custom_1: BOOKING_ID, // Our booking ID
      custom_2: "",
      method: "TEST_CARD",
      card_holder_name: "Test User",
      card_no: "************2346",
      card_type: "VISA",
      status_message: "Successfully completed the payment.",
      recurring: "0",
    };

    console.log("\n📤 Sending Webhook Payload:");
    console.log(JSON.stringify(payload, null, 2));

    // Send POST request to webhook endpoint
    console.log("\n⏳ Posting to webhook endpoint...");
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

    console.log("\n✅ Webhook Response:");
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Data: ${response.data}`);

    console.log("\n🎉 SUCCESS! Webhook simulation completed.");
    console.log("\n📊 Next Steps:");
    console.log(
      "   1. Check your terminal running the server for processing logs"
    );
    console.log('   2. Verify booking status changed to "confirmed"');
    console.log("   3. Check wallet balance was credited");
    console.log("   4. View transaction in wallet history");
    console.log("\n💡 Tip: Run this to check wallet balance:");
    console.log(`   node test-wallet-credit.js\n`);
  } catch (error) {
    console.error("\n❌ Webhook Simulation Failed:");

    if (error.response) {
      // Server responded with error
      console.error(`   Status: ${error.response.status}`);
      console.error(
        `   Message: ${JSON.stringify(error.response.data, null, 2)}`
      );
    } else if (error.request) {
      // No response received
      console.error("   No response from server. Is the server running?");
      console.error(`   Make sure server is running at: ${WEBHOOK_URL}`);
    } else {
      // Other error
      console.error(`   Error: ${error.message}`);
    }

    console.log("\n🔍 Troubleshooting:");
    console.log("   1. Ensure server is running: npm run dev");
    console.log("   2. Verify SERVER_URL in .env matches server port");
    console.log("   3. Check booking ID exists in database");
    console.log("   4. Verify PAYHERE_MERCHANT_SECRET is correct\n");

    process.exit(1);
  }
}

// Run simulation
simulateWebhook();
