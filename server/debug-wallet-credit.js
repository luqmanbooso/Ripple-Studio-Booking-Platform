/**
 * Debug script to test wallet crediting directly
 */

require("dotenv").config();
const mongoose = require("mongoose");
require("./src/models/User");
const Studio = require("./src/models/Studio");
const Booking = require("./src/models/Booking");
const { Wallet, WalletTransaction } = require("./src/models/Wallet");

async function testWalletCredit() {
  try {
    console.log("\n🔍 Debugging Wallet Credit Issue\n");
    console.log("=".repeat(70));

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to database\n");

    // Get the booking
    const bookingId = "69030470f89ebdbd4cb72338";
    console.log(`📦 Fetching booking: ${bookingId}`);

    const booking = await Booking.findById(bookingId).populate([
      { path: "client", select: "name email" },
      { path: "studio", populate: { path: "user", select: "name email" } },
    ]);

    if (!booking) {
      console.error("❌ Booking not found!");
      process.exit(1);
    }

    console.log("✅ Booking found:");
    console.log(`   Status: ${booking.status}`);
    console.log(`   Price: LKR ${booking.price}`);
    console.log(`   TotalAmount: ${booking.totalAmount || "NOT SET"}`);
    console.log(`   Studio: ${booking.studio.name}`);
    console.log(
      `   Studio Owner: ${booking.studio.user.name} (${booking.studio.user.email})`
    );
    console.log(`   Studio User ID: ${booking.studio.user._id}`);

    // Check if wallet exists
    console.log(`\n💰 Checking wallet for user: ${booking.studio.user._id}`);
    let wallet = await Wallet.findOne({ user: booking.studio.user._id });

    if (!wallet) {
      console.log("⚠️  Wallet not found, creating...");
      wallet = await Wallet.createWallet(booking.studio.user._id);
      console.log("✅ Wallet created");
    } else {
      console.log("✅ Wallet exists");
      console.log(`   Available: LKR ${wallet.balance.available}`);
      console.log(`   Total: LKR ${wallet.balance.total}`);
      console.log(`   Total Earnings: LKR ${wallet.totalEarnings}`);
    }

    // Test creditFromBooking
    console.log("\n🧪 Testing Wallet.creditFromBooking()...");

    const paymentDetails = {
      paymentId: `TEST_${Date.now()}`,
      orderId: `ORDER_TEST_${Date.now()}`,
      method: "TEST_CARD",
    };

    console.log("Payment Details:", paymentDetails);

    try {
      const transaction = await Wallet.creditFromBooking(
        booking,
        paymentDetails
      );
      console.log("\n✅ Transaction created successfully!");
      console.log(`   Transaction ID: ${transaction._id}`);
      console.log(`   Type: ${transaction.type}`);
      console.log(`   Amount: LKR ${transaction.amount}`);
      console.log(`   Net Amount: LKR ${transaction.netAmount}`);
      console.log(
        `   Commission: LKR ${transaction.platformCommission.amount}`
      );
      console.log(`   Status: ${transaction.status}`);

      // Check wallet balance again
      const updatedWallet = await Wallet.findOne({
        user: booking.studio.user._id,
      });
      console.log("\n💰 Updated Wallet Balance:");
      console.log(`   Available: LKR ${updatedWallet.balance.available}`);
      console.log(`   Total: LKR ${updatedWallet.balance.total}`);
      console.log(`   Total Earnings: LKR ${updatedWallet.totalEarnings}`);
      console.log(
        `   Total Commissions: LKR ${updatedWallet.totalCommissions}`
      );

      // Check transactions
      const transactions = await WalletTransaction.find({
        user: booking.studio.user._id,
      })
        .sort({ createdAt: -1 })
        .limit(5);

      console.log(`\n📝 Recent Transactions (${transactions.length}):`);
      transactions.forEach((tx, i) => {
        console.log(
          `   ${i + 1}. ${tx.type} - LKR ${tx.amount} (${tx.status}) - ${tx.createdAt.toLocaleString()}`
        );
      });

      console.log("\n" + "=".repeat(70));
      console.log("✅ TEST PASSED! Wallet crediting works correctly.\n");
    } catch (error) {
      console.error("\n❌ ERROR in creditFromBooking:");
      console.error("   Message:", error.message);
      console.error("   Stack:", error.stack);
      console.log("\n" + "=".repeat(70));
      console.log("❌ TEST FAILED!\n");
    }

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Fatal Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testWalletCredit();
