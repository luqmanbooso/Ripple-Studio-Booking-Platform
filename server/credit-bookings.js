require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");
const { Wallet } = require("./src/models/Wallet");
const Booking = require("./src/models/Booking");
const Studio = require("./src/models/Studio");

const creditExistingBookings = async () => {
  try {
    console.log("\n💰 Credit Existing Confirmed Bookings to Wallet\n");
    console.log("=".repeat(70));

    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to database\n");

    // Find all confirmed bookings that haven't been credited
    const confirmedBookings = await Booking.find({
      status: "confirmed",
    })
      .populate({
        path: "studio",
        populate: { path: "user", select: "name email" },
      })
      .populate("client", "name email")
      .sort({ createdAt: -1 });

    console.log(`📊 Found ${confirmedBookings.length} confirmed booking(s)\n`);

    if (confirmedBookings.length === 0) {
      console.log("⚠️  No confirmed bookings to credit");
      console.log("   Make a test booking and complete the payment first\n");
      process.exit(0);
    }

    const platformCommissionRate = 0.071;
    let totalCredited = 0;
    let bookingsCredited = 0;

    for (const booking of confirmedBookings) {
      if (!booking.studio || !booking.studio.user) {
        console.log(
          `⚠️  Skipping booking ${booking._id} - No studio owner found`
        );
        continue;
      }

      console.log(
        `\n📝 Processing Booking: ${booking.bookingId || booking._id}`
      );
      console.log(`   Studio: ${booking.studio.name}`);
      console.log(`   Owner: ${booking.studio.user.name}`);
      console.log(`   Client: ${booking.client?.name || "Unknown"}`);
      console.log(`   Amount: LKR ${booking.price.toFixed(2)}`);
      console.log(`   Date: ${new Date(booking.start).toLocaleDateString()}`);

      // Get or create wallet
      let wallet = await Wallet.findOne({ user: booking.studio.user._id });
      if (!wallet) {
        console.log(`   📁 Creating wallet for ${booking.studio.user.name}...`);
        wallet = await Wallet.createWallet(booking.studio.user._id);
      }

      // Check if this booking was already credited
      const alreadyCredited = wallet.transactions?.some(
        (tx) =>
          tx.metadata?.bookingId?.toString() === booking._id.toString() ||
          tx.metadata?.bookingId === booking.bookingId
      );

      if (alreadyCredited) {
        console.log(`   ⏭️  Already credited - skipping`);
        continue;
      }

      // Calculate amounts
      const grossAmount = booking.price;
      const platformCommission = grossAmount * platformCommissionRate;
      const netAmount = grossAmount - platformCommission;

      console.log(`   💵 Gross: LKR ${grossAmount.toFixed(2)}`);
      console.log(`   📉 Fee (7.1%): LKR ${platformCommission.toFixed(2)}`);
      console.log(`   ✅ Net: LKR ${netAmount.toFixed(2)}`);

      // Add transaction
      await wallet.addTransaction({
        type: "credit",
        amount: grossAmount,
        netAmount: netAmount,
        platformCommission: {
          rate: platformCommissionRate,
          amount: platformCommission,
        },
        description: `Payment for booking ${booking.bookingId || booking._id}`,
        status: "completed",
        metadata: {
          bookingId: booking._id,
          customBookingId: booking.bookingId,
          clientId: booking.client?._id,
          studioId: booking.studio._id,
          paymentDate: new Date(),
          manualCredit: true,
        },
      });

      console.log(`   ✅ Wallet credited successfully!`);

      totalCredited += netAmount;
      bookingsCredited++;
    }

    console.log("\n" + "=".repeat(70));
    console.log("\n📊 Summary:");
    console.log(`   Bookings Credited: ${bookingsCredited}`);
    console.log(`   Total Net Amount: LKR ${totalCredited.toFixed(2)}`);

    // Show wallet balances for all studio owners
    console.log("\n💰 Wallet Balances:\n");
    const wallets = await Wallet.find().populate("user", "name email");

    for (const wallet of wallets) {
      console.log(`   ${wallet.user.name}:`);
      console.log(
        `      Available: LKR ${wallet.balance.available.toFixed(2)}`
      );
      console.log(
        `      Total Earnings: LKR ${wallet.totalEarnings.toFixed(2)}`
      );
      console.log(`      Transactions: ${wallet.transactions?.length || 0}`);
      console.log();
    }

    console.log("=".repeat(70));
    console.log("\n✅ All confirmed bookings have been credited!");
    console.log("\n💡 Next steps:");
    console.log(
      "   1. Refresh your wallet page: http://localhost:5173/dashboard/wallet"
    );
    console.log(
      "   2. Refresh bookings page: http://localhost:5173/dashboard/bookings"
    );
    console.log("   3. Both should now show the correct amounts");
    console.log("\n=".repeat(70) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
};

creditExistingBookings();
