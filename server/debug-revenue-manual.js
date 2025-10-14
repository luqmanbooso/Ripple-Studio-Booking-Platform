const mongoose = require('mongoose');
require('dotenv').config();

async function testRevenueWithDebug() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Load all models
    const User = require('./src/models/User');
    const Studio = require('./src/models/Studio');
    const Booking = require('./src/models/Booking');
    const Revenue = require('./src/models/Revenue');
    
    // Get the most recent confirmed booking
    const booking = await Booking.findOne({ status: 'confirmed' })
      .sort({ createdAt: -1 })
      .populate('client')
      .populate('studio');
    
    // Create a simple breakdown for testing
    const breakdown = {
      slots: { amount: 1311, hours: 1, rate: 1311 },
      services: [{ name: 'Mixing', amount: 75, category: 'recording' }],
      equipment: [{ name: 'SM57', amount: 1161, hours: 1, rate: 1161 }],
      addOns: []
    };
    
    console.log('Creating revenue with breakdown:', JSON.stringify(breakdown, null, 2));
    
    // Test creating revenue step by step
    const revenue = new Revenue({
      bookingId: booking._id,
      studio: booking.studio._id,
      client: booking.client._id,
      breakdown: breakdown,
      platformCommissionRate: 0.03,
      paymentDetails: {
        paymentId: booking.payherePaymentId,
        paymentMethod: 'card',
        paymentDate: new Date(),
        currency: 'LKR'
      },
      status: 'confirmed'
    });
    
    console.log('\nRevenue object created');
    console.log('Breakdown exists:', !!revenue.breakdown);
    console.log('Breakdown.slots.amount:', revenue.breakdown?.slots?.amount);
    console.log('platformCommissionRate:', revenue.platformCommissionRate);
    
    // Try to trigger the calculation manually
    console.log('\nTesting calculation manually...');
    const slotsTotal = revenue.breakdown.slots.amount || 0;
    const servicesTotal = revenue.breakdown.services.reduce((sum, service) => sum + service.amount, 0);
    const equipmentTotal = revenue.breakdown.equipment.reduce((sum, equipment) => sum + equipment.amount, 0);
    const addOnsTotal = revenue.breakdown.addOns.reduce((sum, addOn) => sum + addOn.amount, 0);
    
    const manualSubtotal = slotsTotal + servicesTotal + equipmentTotal + addOnsTotal;
    console.log('Manual calculation:');
    console.log('- slotsTotal:', slotsTotal);
    console.log('- servicesTotal:', servicesTotal);
    console.log('- equipmentTotal:', equipmentTotal);
    console.log('- addOnsTotal:', addOnsTotal);
    console.log('- subtotal:', manualSubtotal);
    
    // Set values manually before save to test
    revenue.subtotal = manualSubtotal;
    revenue.platformCommission = manualSubtotal * 0.03;
    revenue.studioEarnings = manualSubtotal - (manualSubtotal * 0.03);
    revenue.totalAmount = manualSubtotal;
    
    console.log('\nAfter manual setting:');
    console.log('- subtotal:', revenue.subtotal);
    console.log('- platformCommission:', revenue.platformCommission);
    console.log('- studioEarnings:', revenue.studioEarnings);
    console.log('- totalAmount:', revenue.totalAmount);
    
    // Now try to save
    console.log('\nAttempting to save...');
    await revenue.save();
    
    console.log('Revenue saved successfully!');
    console.log('Final Revenue ID:', revenue._id);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testRevenueWithDebug();