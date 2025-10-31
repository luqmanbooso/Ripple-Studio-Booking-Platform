/**
 * Quick Test: Create 7 Bookings and Process Payments
 * Total: LKR 14,000 (2,000 per booking)
 *
 * This script will:
 * 1. Find or list existing reservation_pending bookings
 * 2. Show you the booking IDs
 * 3. Instructions to run the webhook simulation
 */

require("dotenv").config();
const mongoose = require("mongoose");

async function findPendingBookings() {
  try {
    console.log("\n🔍 Searching for pending bookings...\n");

    await mongoose.connect(process.env.MONGO_URI);

    const Booking = require("./src/models/Booking");

    // Find bookings that are pending payment
    const pendingBookings = await Booking.find({
      status: { $in: ["reservation_pending", "payment_pending"] },
    })
      .sort({ createdAt: -1 })
      .limit(7)
      .populate("client", "name email")
      .populate("studio", "name");

    if (pendingBookings.length === 0) {
      console.log("❌ No pending bookings found.");
      console.log(
        "\n💡 Create some bookings first from the frontend, then run this script again.\n"
      );
      process.exit(0);
    }

    console.log(`✅ Found ${pendingBookings.length} pending booking(s)\n`);
    console.log("=".repeat(80));

    const bookingIds = [];

    pendingBookings.forEach((booking, index) => {
      console.log(`\n📦 Booking #${index + 1}:`);
      console.log(`   ID: ${booking._id}`);
      console.log(`   Client: ${booking.client?.name || "N/A"}`);
      console.log(`   Studio: ${booking.studio?.name || "N/A"}`);
      console.log(`   Service: ${booking.service?.name || "N/A"}`);
      console.log(
        `   Amount: LKR ${booking.price?.toLocaleString() || booking.totalAmount?.toLocaleString() || "N/A"}`
      );
      console.log(`   Status: ${booking.status}`);

      bookingIds.push(booking._id.toString());
    });

    console.log("\n" + "=".repeat(80));
    console.log("\n🚀 TO SIMULATE PAYMENTS FOR THESE BOOKINGS:\n");
    console.log("Copy and paste this command:\n");
    console.log(
      `node test-multiple-bookings-webhook.js ${bookingIds.join(" ")}`
    );
    console.log("\n" + "=".repeat(80));
    console.log(
      "\n💰 This will credit wallets with payments for these bookings"
    );
    console.log("📊 Total amount will depend on actual booking prices\n");

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

findPendingBookings();
