const mongoose = require('mongoose');
require('dotenv').config();

async function testRevenueCreation() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Load all models
    const User = require('./src/models/User');
    const Studio = require('./src/models/Studio');
    const Booking = require('./src/models/Booking');
    const Revenue = require('./src/models/Revenue');
    const RevenueService = require('./src/services/revenueService');
    
    // Get the most recent confirmed booking
    const booking = await Booking.findOne({ status: 'confirmed' })
      .sort({ createdAt: -1 })
      .populate('client')
      .populate('studio');
    
    if (!booking) {
      console.log('No confirmed booking found');
      process.exit(0);
    }
    
    console.log(`Testing revenue creation for booking: ${booking._id}`);
    console.log(`Booking status: ${booking.status}`);
    console.log(`Booking price: ${booking.price}`);
    console.log(`PayHere Payment ID: ${booking.payherePaymentId}`);
    
    // Check if revenue already exists
    const existingRevenue = await Revenue.findOne({ bookingId: booking._id });
    if (existingRevenue) {
      console.log('Revenue already exists for this booking:', existingRevenue._id);
      console.log('Total Amount:', existingRevenue.totalAmount);
      console.log('Platform Commission:', existingRevenue.platformCommission);
      console.log('Studio Amount:', existingRevenue.studioAmount);
      process.exit(0);
    }
    
    // Try to create revenue
    console.log('Attempting to create revenue record...');
    
    const paymentDetails = {
      paymentId: booking.payherePaymentId,
      paymentMethod: 'card',
      paymentDate: new Date(),
      currency: booking.currency || 'LKR'
    };
    
    const revenue = await RevenueService.createRevenueFromBooking(booking, paymentDetails);
    
    console.log('Revenue created successfully!');
    console.log('Revenue ID:', revenue._id);
    console.log('Total Amount:', revenue.totalAmount);
    console.log('Platform Commission:', revenue.platformCommission);
    console.log('Studio Amount:', revenue.studioAmount);
    console.log('Platform Commission Rate:', revenue.platformCommissionRate);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating revenue:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testRevenueCreation();