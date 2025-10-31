require("dotenv").config();
const mongoose = require("mongoose");
require("./src/models/User"); // Load User model first
require("./src/models/Studio"); // Load Studio model
const Booking = require("./src/models/Booking");

async function listBookings() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("\n✅ Connected to database\n");

    const bookings = await Booking.find()
      .select("_id status price client studio startDate")
      .populate("client", "name")
      .populate("studio", "name")
      .sort({ createdAt: -1 });

    console.log(`📋 Found ${bookings.length} booking(s):\n`);
    console.log("=".repeat(70));

    bookings.forEach((booking, i) => {
      console.log(`\n${i + 1}. Booking ID: ${booking._id}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Price: LKR ${booking.price}`);
      console.log(`   Client: ${booking.client?.name || "N/A"}`);
      console.log(`   Studio: ${booking.studio?.name || "N/A"}`);
      console.log(
        `   Date: ${booking.startDate ? new Date(booking.startDate).toLocaleDateString() : "N/A"}`
      );
    });

    console.log("\n" + "=".repeat(70));
    console.log("\n💡 Use one of these IDs with the webhook simulation:");
    console.log("   node test-payhere-webhook-simulation.js <booking_id>\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

listBookings();
