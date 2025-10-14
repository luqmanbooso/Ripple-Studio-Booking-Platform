const mongoose = require('mongoose');
require('dotenv').config();

async function checkBookings() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Load all models to avoid missing schema errors
    const User = require('./src/models/User');
    const Studio = require('./src/models/Studio');
    const Booking = require('./src/models/Booking');
    const Revenue = require('./src/models/Revenue');
    
    // Get recent bookings
    const recentBookings = await Booking.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id status payherePaymentId payhereOrderId price createdAt client studio')
      .populate('client', 'name email')
      .populate('studio', 'studioName');
    
    console.log('\n=== RECENT BOOKINGS ===');
    recentBookings.forEach((booking, i) => {
      console.log(`${i+1}. ID: ${booking._id}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Price: ${booking.price}`);
      console.log(`   PayHere Payment ID: ${booking.payherePaymentId || 'None'}`);
      console.log(`   PayHere Order ID: ${booking.payhereOrderId || 'None'}`);
      console.log(`   Client: ${booking.client?.name}`);
      console.log(`   Studio: ${booking.studio?.studioName}`);
      console.log(`   Created: ${booking.createdAt}`);
      console.log('---');
    });
    
    // Check revenue records
    const revenueCount = await Revenue.countDocuments();
    console.log(`\nTotal Revenue Records: ${revenueCount}`);
    
    if (revenueCount > 0) {
      const recentRevenue = await Revenue.find({})
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('booking', '_id status price')
        .populate('studio', 'studioName');
        
      console.log('\n=== RECENT REVENUE RECORDS ===');
      recentRevenue.forEach((rev, i) => {
        console.log(`${i+1}. Revenue ID: ${rev._id}`);
        console.log(`   Booking: ${rev.booking?._id}`);
        console.log(`   Total Amount: ${rev.totalAmount}`);
        console.log(`   Platform Commission: ${rev.platformCommission}`);
        console.log(`   Studio Amount: ${rev.studioAmount}`);
        console.log(`   Created: ${rev.createdAt}`);
        console.log('---');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkBookings();