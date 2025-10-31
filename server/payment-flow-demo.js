/**
 * Complete Payment Flow Test
 *
 * This script demonstrates the complete flow from booking to wallet credit:
 * 1. Customer creates booking
 * 2. Customer pays via PayHere
 * 3. PayHere sends webhook
 * 4. Booking confirmed
 * 5. Wallet credited automatically
 */

require("dotenv").config();
const mongoose = require("mongoose");
require("./src/models/User");
const Studio = require("./src/models/Studio");
const Booking = require("./src/models/Booking");
const { Wallet, WalletTransaction } = require("./src/models/Wallet");

async function demonstrateFlow() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("\n✅ Connected to database\n");
    console.log("═".repeat(80));
    console.log("               COMPLETE PAYMENT TO WALLET FLOW");
    console.log("═".repeat(80));

    // Step 1: Show a pending booking
    console.log("\n📋 STEP 1: Customer Creates Booking");
    console.log("─".repeat(80));

    const pendingBookings = await Booking.find({ status: "pending" })
      .populate("client", "name email")
      .populate({
        path: "studio",
        populate: { path: "user", select: "name email" },
      })
      .limit(1);

    if (pendingBookings.length > 0) {
      const booking = pendingBookings[0];
      console.log(`✓ Booking ID: ${booking._id}`);
      console.log(`  Client: ${booking.client.name}`);
      console.log(`  Studio: ${booking.studio.name}`);
      console.log(`  Amount: LKR ${booking.price}`);
      console.log(`  Status: ${booking.status}`);
      console.log(`  PayHere Order ID: ${booking.payhereOrderId}`);
    } else {
      console.log(
        "⚠️  No pending bookings found (all bookings are confirmed/completed)"
      );
    }

    // Step 2: Explain payment process
    console.log("\n💳 STEP 2: Customer Pays via PayHere");
    console.log("─".repeat(80));
    console.log("  1. Customer redirected to PayHere payment page");
    console.log(
      "  2. Customer enters card details (or uses sandbox test card)"
    );
    console.log("  3. PayHere processes payment");
    console.log("  4. Payment successful → PayHere triggers webhook");

    // Step 3: Webhook received
    console.log("\n🔔 STEP 3: PayHere Webhook Received");
    console.log("─".repeat(80));
    console.log("  Endpoint: POST /api/webhooks/payhere");
    console.log("  Payload includes:");
    console.log("    - status_code: 2 (success)");
    console.log("    - payment_id: PH_xxxxx");
    console.log("    - order_id: ORD-xxxxx");
    console.log("    - custom_1: <booking_id>");
    console.log("    - payhere_amount: <amount>");
    console.log("    - md5sig: <signature>");
    console.log("  ");
    console.log("  ✓ Webhook signature verified");
    console.log("  ✓ Calls handlePaymentSuccess()");

    // Step 4: Booking confirmed
    console.log("\n✅ STEP 4: Booking Confirmation");
    console.log("─".repeat(80));
    console.log("  bookingService.confirmBooking():");
    console.log('    - Changes booking.status to "confirmed"');
    console.log("    - Stores PayHere payment ID");
    console.log("    - Creates revenue record");
    console.log("    - Sends notifications to client & studio");

    // Step 5: Wallet credited
    console.log("\n💰 STEP 5: Wallet Credit (Automatic)");
    console.log("─".repeat(80));
    console.log("  Wallet.creditFromBooking():");
    console.log("    1. Find/create wallet for studio owner");
    console.log("    2. Calculate commission:");
    console.log("       - Platform commission: 7.1%");
    console.log("       - Studio receives: 92.9%");
    console.log("    3. Create wallet transaction:");
    console.log("       - Type: credit");
    console.log("       - Status: completed");
    console.log("       - Amount: gross price");
    console.log("       - Net amount: price - commission");
    console.log("    4. Update wallet balance:");
    console.log("       - balance.available += net amount");
    console.log("       - totalEarnings += gross amount");
    console.log("       - totalCommissions += commission");

    // Show actual example
    console.log("\n📊 EXAMPLE CALCULATION");
    console.log("─".repeat(80));
    const examplePrice = 5000;
    const commission = examplePrice * 0.071;
    const netAmount = examplePrice - commission;

    console.log(
      `  Booking Price:        LKR ${examplePrice.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`
    );
    console.log(
      `  Platform Commission:  LKR ${commission.toLocaleString("en-LK", { minimumFractionDigits: 2 })} (7.1%)`
    );
    console.log(`  ────────────────────────────────`);
    console.log(
      `  Studio Receives:      LKR ${netAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })} (92.9%)`
    );

    // Show current wallet balances
    console.log("\n💼 CURRENT WALLET BALANCES");
    console.log("─".repeat(80));

    const wallets = await Wallet.find()
      .populate("user", "name email")
      .sort({ "balance.available": -1 });

    if (wallets.length > 0) {
      for (const wallet of wallets) {
        const transactions = await WalletTransaction.countDocuments({
          user: wallet.user._id,
        });
        console.log(`\n  ${wallet.user.name} (${wallet.user.email})`);
        console.log(
          `    Available Balance:  LKR ${wallet.balance.available.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`
        );
        console.log(
          `    Total Earnings:     LKR ${wallet.totalEarnings.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`
        );
        console.log(
          `    Total Commissions:  LKR ${wallet.totalCommissions.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`
        );
        console.log(`    Transactions:       ${transactions}`);
      }
    } else {
      console.log("  No wallets found");
    }

    // Summary
    console.log("\n");
    console.log("═".repeat(80));
    console.log("                              SUMMARY");
    console.log("═".repeat(80));
    console.log("\n✅ AUTOMATIC FLOW (No Manual Intervention Needed):");
    console.log("   1. Customer pays → PayHere webhook triggered");
    console.log(
      '   2. Webhook confirms booking → status changes to "confirmed"'
    );
    console.log(
      "   3. Wallet credited automatically → studio owner can withdraw"
    );
    console.log("\n📱 REAL-TIME UPDATES:");
    console.log(
      "   - Studio owner sees booking confirmed instantly (Socket.IO)"
    );
    console.log("   - Wallet balance updates in real-time");
    console.log("   - Dashboard shows updated earnings");
    console.log("\n🔧 FOR TESTING:");
    console.log(
      "   - Use: node test-payhere-webhook-simulation.js <booking_id>"
    );
    console.log("   - Simulates PayHere webhook without needing ngrok");
    console.log("   - Credits wallet exactly like real payment");
    console.log("\n💡 FOR PRODUCTION:");
    console.log("   - Deploy backend to public server (Render, Railway, etc.)");
    console.log(
      "   - Configure PayHere notify URL to: https://your-domain.com/api/webhooks/payhere"
    );
    console.log("   - All payments will automatically credit wallets");
    console.log("\n" + "═".repeat(80) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

demonstrateFlow();
