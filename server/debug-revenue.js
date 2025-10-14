const mongoose = require('mongoose');
require('dotenv').config();

async function testRevenueBreakdown() {
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
    
    console.log('=== BOOKING DETAILS ===');
    console.log(`Booking ID: ${booking._id}`);
    console.log(`Price: ${booking.price}`);
    console.log(`Start: ${booking.start}`);
    console.log(`End: ${booking.end}`);
    console.log(`Service:`, booking.service);
    console.log(`Services:`, booking.services);
    console.log(`Equipment:`, booking.equipment);
    
    // Test breakdown calculation
    console.log('\n=== TESTING BREAKDOWN CALCULATION ===');
    const breakdown = await RevenueService.calculateRevenueBreakdown(booking);
    console.log('Calculated breakdown:', JSON.stringify(breakdown, null, 2));
    
    // Calculate totals
    const slotsTotal = breakdown.slots.amount || 0;
    const servicesTotal = breakdown.services.reduce((sum, service) => sum + service.amount, 0);
    const equipmentTotal = breakdown.equipment.reduce((sum, equipment) => sum + equipment.amount, 0);
    const addOnsTotal = breakdown.addOns.reduce((sum, addOn) => sum + addOn.amount, 0);
    const subtotal = slotsTotal + servicesTotal + equipmentTotal + addOnsTotal;
    
    console.log('\n=== CALCULATED TOTALS ===');
    console.log(`Slots Total: ${slotsTotal}`);
    console.log(`Services Total: ${servicesTotal}`);
    console.log(`Equipment Total: ${equipmentTotal}`);
    console.log(`Add-ons Total: ${addOnsTotal}`);
    console.log(`Subtotal: ${subtotal}`);
    console.log(`Platform Commission (3%): ${subtotal * 0.03}`);
    console.log(`Studio Earnings: ${subtotal - (subtotal * 0.03)}`);
    
    // Test creating revenue with manual values
    console.log('\n=== TESTING REVENUE CREATION ===');
    
    try {
      const revenue = new Revenue({
        bookingId: booking._id,
        studio: booking.studio,
        client: booking.client,
        breakdown,
        platformCommissionRate: 0.03,
        paymentDetails: {
          paymentId: booking.payherePaymentId,
          paymentMethod: 'card',
          paymentDate: new Date(),
          currency: booking.currency || 'LKR'
        },
        status: 'confirmed'
      });
      
      console.log('Revenue object before save:');
      console.log(`- subtotal: ${revenue.subtotal}`);
      console.log(`- platformCommission: ${revenue.platformCommission}`);
      console.log(`- studioEarnings: ${revenue.studioEarnings}`);
      console.log(`- totalAmount: ${revenue.totalAmount}`);
      
      await revenue.save();
      
      console.log('\nRevenue saved successfully!');
      console.log(`Revenue ID: ${revenue._id}`);
      console.log(`Final subtotal: ${revenue.subtotal}`);
      console.log(`Final platformCommission: ${revenue.platformCommission}`);
      console.log(`Final studioEarnings: ${revenue.studioEarnings}`);
      console.log(`Final totalAmount: ${revenue.totalAmount}`);
      
    } catch (saveError) {
      console.error('Error saving revenue:', saveError.message);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testRevenueBreakdown();