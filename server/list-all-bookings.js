/**
 * List All Bookings - Show any bookings in the database
 */

require("dotenv").config();
const mongoose = require("mongoose");

async function listAllBookings() {
  try {
    console.log("\n🔍 Searching for all bookings...\n");

    await mongoose.connect(process.env.MONGO_URI);

    // Load all models to avoid schema errors
    const User = require("./src/models/User");
    const Studio = require("./src/models/Studio");
    const Booking = require("./src/models/Booking");

    // Find all bookings
    const allBookings = await Booking.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("client", "name email")
      .populate("studio", "name");

    if (allBookings.length === 0) {
      console.log("❌ No bookings found in database.");
      console.log("\n💡 Create some bookings from the frontend first.\n");
      process.exit(0);
    }

    console.log(`✅ Found ${allBookings.length} booking(s)\n`);
    console.log("=".repeat(80));

    const bookingIds = [];

    allBookings.forEach((booking, index) => {
      console.log(`\n📦 Booking #${index + 1}:`);
      console.log(`   ID: ${booking._id}`);
      console.log(`   Client: ${booking.client?.name || "N/A"}`);
      console.log(`   Studio: ${booking.studio?.name || "N/A"}`);
      console.log(`   Service: ${booking.service?.name || "N/A"}`);
      console.log(
        `   Amount: LKR ${booking.price?.toLocaleString() || booking.totalAmount?.toLocaleString() || "N/A"}`
      );
      console.log(`   Status: ${booking.status}`);
      console.log(`   Created: ${booking.createdAt}`);

      bookingIds.push(booking._id.toString());
    });

    console.log("\n" + "=".repeat(80));

    // Find which ones can be used for webhook simulation
    const testableBookings = allBookings
      .filter((b) =>
        ["reservation_pending", "payment_pending"].includes(b.status)
      )
      .slice(0, 7);

    if (testableBookings.length > 0) {
      const testableIds = testableBookings.map((b) => b._id.toString());
      console.log(
        `\n✅ Found ${testableBookings.length} bookings suitable for payment simulation\n`
      );
      console.log("🚀 TO SIMULATE PAYMENTS:\n");
      console.log(
        `node test-multiple-bookings-webhook.js ${testableIds.join(" ")}`
      );
    } else {
      console.log("\n⚠️  No pending bookings available for simulation.");
      console.log("💡 All bookings are already confirmed or completed.");
      console.log(
        "💡 Create new bookings from the frontend to test payment webhooks."
      );
    }

    console.log("\n" + "=".repeat(80) + "\n");

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

listAllBookings();
