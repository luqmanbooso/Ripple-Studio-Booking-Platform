const mongoose = require('mongoose');
require('dotenv').config();

async function checkRevenueRecord() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Load models
    const Revenue = require('./src/models/Revenue');
    
    // Get the revenue record we just created
    const revenue = await Revenue.findById('68ee6757c40ded6f4083f46f');
    
    if (revenue) {
      console.log('=== REVENUE RECORD DETAILS ===');
      console.log(`Revenue ID: ${revenue._id}`);
      console.log(`Booking ID: ${revenue.bookingId}`);
      console.log(`Subtotal: ${revenue.subtotal}`);
      console.log(`Platform Commission Rate: ${revenue.platformCommissionRate}`);
      console.log(`Platform Commission: ${revenue.platformCommission}`);
      console.log(`Studio Earnings: ${revenue.studioEarnings}`);
      console.log(`Total Amount: ${revenue.totalAmount}`);
      console.log(`Status: ${revenue.status}`);
      console.log('Breakdown:', JSON.stringify(revenue.breakdown, null, 2));
      console.log('Payment Details:', JSON.stringify(revenue.paymentDetails, null, 2));
    } else {
      console.log('Revenue record not found');
    }
    
    // Check all revenue records
    const allRevenues = await Revenue.find({}).select('_id bookingId subtotal platformCommission studioEarnings totalAmount status');
    console.log(`\n=== ALL REVENUE RECORDS (${allRevenues.length}) ===`);
    allRevenues.forEach((rev, i) => {
      console.log(`${i+1}. ID: ${rev._id}`);
      console.log(`   Booking: ${rev.bookingId}`);
      console.log(`   Subtotal: ${rev.subtotal}`);
      console.log(`   Platform Commission: ${rev.platformCommission}`);
      console.log(`   Studio Earnings: ${rev.studioEarnings}`);
      console.log(`   Total: ${rev.totalAmount}`);
      console.log(`   Status: ${rev.status}`);
      console.log('---');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkRevenueRecord();