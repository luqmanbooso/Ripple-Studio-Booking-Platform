const mongoose = require('mongoose');
require('dotenv').config();

async function testRevenueAPI() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Load models
    const Revenue = require('./src/models/Revenue');
    
    // Test the exact query from the API
    const startDate = new Date('2025-09-14');
    const endDate = new Date('2025-10-14');
    
    console.log('=== TESTING REVENUE API QUERIES ===');
    console.log('Date range:', startDate.toISOString().split('T')[0], 'to', endDate.toISOString().split('T')[0]);
    
    // 1. Test platform revenue query (exact same as API)
    const platformRevenue = await Revenue.aggregate([
      {
        $match: {
          status: 'confirmed',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalCommission: { $sum: '$platformCommission' },
          totalStudioEarnings: { $sum: '$studioEarnings' },
          bookingCount: { $sum: 1 }
        }
      }
    ]);
    
    console.log('Platform revenue aggregation result:', platformRevenue);
    
    // 2. Test if revenue records exist in the date range
    const revenueInRange = await Revenue.find({
      status: 'confirmed',
      createdAt: { $gte: startDate, $lte: endDate }
    }).select('totalAmount platformCommission studioEarnings createdAt');
    
    console.log(`\nRevenue records in date range: ${revenueInRange.length}`);
    revenueInRange.forEach((rev, i) => {
      console.log(`${i+1}. Total: ${rev.totalAmount}, Commission: ${rev.platformCommission}, Created: ${rev.createdAt}`);
    });
    
    // 3. Test all revenue records regardless of date
    const allRevenue = await Revenue.find({ status: 'confirmed' })
      .select('totalAmount platformCommission studioEarnings createdAt');
    
    console.log(`\nAll revenue records: ${allRevenue.length}`);
    allRevenue.forEach((rev, i) => {
      console.log(`${i+1}. Total: ${rev.totalAmount}, Commission: ${rev.platformCommission}, Created: ${rev.createdAt}`);
    });
    
    // 4. Test the summary calculation
    const totalCommission = allRevenue.reduce((sum, rev) => sum + rev.platformCommission, 0);
    const totalRevenue = allRevenue.reduce((sum, rev) => sum + rev.totalAmount, 0);
    const totalStudioEarnings = allRevenue.reduce((sum, rev) => sum + rev.studioEarnings, 0);
    
    console.log('\n=== SUMMARY ===');
    console.log(`Total Revenue: ${totalRevenue}`);
    console.log(`Total Platform Commission: ${totalCommission}`);
    console.log(`Total Studio Earnings: ${totalStudioEarnings}`);
    console.log(`Booking Count: ${allRevenue.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testRevenueAPI();