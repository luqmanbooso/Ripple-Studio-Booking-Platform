const mongoose = require('mongoose');
require('dotenv').config();

async function createRevenueForOtherBookings() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Load all models
    const User = require('./src/models/User');
    const Studio = require('./src/models/Studio');
    const Booking = require('./src/models/Booking');
    const Revenue = require('./src/models/Revenue');
    const RevenueService = require('./src/services/revenueService');
    
    // Get confirmed bookings without revenue records
    const confirmedBookings = await Booking.find({ status: 'confirmed' })
      .populate('client')
      .populate('studio');
    
    console.log(`Found ${confirmedBookings.length} confirmed bookings`);
    
    for (const booking of confirmedBookings) {
      const existingRevenue = await Revenue.findOne({ bookingId: booking._id });
      
      if (!existingRevenue) {
        console.log(`\nCreating revenue for booking: ${booking._id}`);
        console.log(`Booking price: ${booking.price}`);
        console.log(`PayHere Payment ID: ${booking.payherePaymentId}`);
        
        try {
          const paymentDetails = {
            paymentId: booking.payherePaymentId,
            paymentMethod: 'card',
            paymentDate: new Date(),
            currency: booking.currency || 'LKR'
          };
          
          const revenue = await RevenueService.createRevenueFromBooking(booking, paymentDetails);
          
          console.log(`✅ Revenue created: ${revenue._id}`);
          console.log(`   Subtotal: ${revenue.subtotal}`);
          console.log(`   Platform Commission: ${revenue.platformCommission}`);
          console.log(`   Studio Earnings: ${revenue.studioEarnings}`);
          
        } catch (error) {
          console.log(`❌ Error creating revenue: ${error.message}`);
        }
      } else {
        console.log(`✓ Revenue already exists for booking: ${booking._id}`);
      }
    }
    
    // Final count
    const totalRevenues = await Revenue.countDocuments();
    console.log(`\n🎯 Total revenue records: ${totalRevenues}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createRevenueForOtherBookings();