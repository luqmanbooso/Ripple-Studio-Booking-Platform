require("dotenv").config();
const mongoose = require("mongoose");
const { Wallet } = require("./src/models/Wallet");
const Booking = require("./src/models/Booking");
const User = require("./src/models/User");
const Studio = require("./src/models/Studio");

const testWalletCredit = async () => {
  try {
    console.log("\n🔍 Testing Wallet Credit System\n");
    console.log("=".repeat(60));

    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to database");

    // Find a studio owner
    const studio = await Studio.findOne().populate("user");
    if (!studio) {
      console.log("❌ No studio found in database");
      console.log("   Create a studio first to test wallet functionality");
      process.exit(1);
    }

    console.log(`\n✅ Found studio: ${studio.name}`);
    console.log(`   Owner: ${studio.user.name} (${studio.user.email})`);
    console.log(`   User ID: ${studio.user._id}`);

    // Check if wallet exists
    let wallet = await Wallet.findOne({ user: studio.user._id });
    if (!wallet) {
      console.log("\n📝 Creating wallet for studio owner...");
      wallet = await Wallet.createWallet(studio.user._id);
      console.log("✅ Wallet created");
    } else {
      console.log("\n✅ Wallet already exists");
    }

    console.log("\n💰 Current Wallet Status:");
    console.log(
      `   Available Balance: LKR ${wallet.balance.available.toFixed(2)}`
    );
    console.log(`   Total Balance: LKR ${wallet.balance.total.toFixed(2)}`);
    console.log(`   Total Earnings: LKR ${wallet.totalEarnings.toFixed(2)}`);
    console.log(
      `   Total Commissions: LKR ${wallet.totalCommissions.toFixed(2)}`
    );

    // Check for confirmed bookings
    const confirmedBookings = await Booking.find({
      studio: studio._id,
      status: "confirmed",
    })
      .populate("client", "name email")
      .sort({ createdAt: -1 });

    console.log(`\n📊 Found ${confirmedBookings.length} confirmed booking(s)`);

    if (confirmedBookings.length === 0) {
      console.log("\n💡 No confirmed bookings found.");
      console.log("   Creating a test credit transaction...");

      // Create test transaction
      const testAmount = 5000;
      const platformCommissionRate = 0.071;
      const platformCommission = testAmount * platformCommissionRate;
      const netAmount = testAmount - platformCommission;

      await wallet.addTransaction({
        type: "credit",
        amount: testAmount,
        netAmount: netAmount,
        platformCommission: {
          rate: platformCommissionRate,
          amount: platformCommission,
        },
        description: "Test booking payment (manual test)",
        status: "completed",
        metadata: {
          bookingId: "TEST-" + Date.now(),
          testTransaction: true,
        },
      });

      console.log(`\n✅ Test transaction created:`);
      console.log(`   Gross Amount: LKR ${testAmount.toFixed(2)}`);
      console.log(
        `   Platform Fee (7.1%): LKR ${platformCommission.toFixed(2)}`
      );
      console.log(`   Net Amount: LKR ${netAmount.toFixed(2)}`);

      // Reload wallet to see updated balance
      wallet = await Wallet.findOne({ user: studio.user._id });
    } else {
      console.log("\n📋 Recent confirmed bookings:");
      confirmedBookings.slice(0, 3).forEach((booking, index) => {
        console.log(
          `\n   ${index + 1}. Booking ID: ${booking.bookingId || booking._id}`
        );
        console.log(`      Client: ${booking.client?.name || "Unknown"}`);
        console.log(`      Price: LKR ${booking.price.toFixed(2)}`);
        console.log(`      Status: ${booking.status}`);
        console.log(
          `      Date: ${new Date(booking.start).toLocaleDateString()}`
        );
      });

      console.log("\n💡 These bookings should have credited the wallet.");
      console.log(
        "   If wallet is still empty, the webhook might not have triggered."
      );
    }

    // Show updated wallet balance
    console.log("\n💰 Updated Wallet Status:");
    console.log(
      `   Available Balance: LKR ${wallet.balance.available.toFixed(2)}`
    );
    console.log(`   Total Balance: LKR ${wallet.balance.total.toFixed(2)}`);
    console.log(`   Total Earnings: LKR ${wallet.totalEarnings.toFixed(2)}`);
    console.log(
      `   Total Commissions: LKR ${wallet.totalCommissions.toFixed(2)}`
    );

    // Show recent transactions
    const recentTransactions = wallet.transactions
      ? wallet.transactions
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 5)
      : [];

    if (recentTransactions.length > 0) {
      console.log("\n📝 Recent Transactions:");
      recentTransactions.forEach((tx, index) => {
        console.log(
          `\n   ${index + 1}. ${tx.type.toUpperCase()} - ${tx.status}`
        );
        console.log(`      Amount: LKR ${tx.amount.toFixed(2)}`);
        console.log(`      Net: LKR ${tx.netAmount.toFixed(2)}`);
        console.log(`      Date: ${new Date(tx.createdAt).toLocaleString()}`);
        console.log(`      Description: ${tx.description}`);
      });
    } else {
      console.log("\n📝 No transactions yet");
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ Test completed successfully!");
    console.log("\n💡 Next steps:");
    console.log("   1. Refresh your wallet page in the browser");
    console.log("   2. The balance should now show the test amount");
    console.log("   3. Make a real booking to test the full flow");
    console.log("=".repeat(60) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
};

testWalletCredit();
