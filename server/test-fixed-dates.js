const mongoose = require('mongoose');
require('dotenv').config();

async function testFixedDateHandling() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const Revenue = require('./src/models/Revenue');
    
    console.log('=== TESTING FIXED DATE HANDLING ===');
    
    // Simulate the fixed backend date handling
    const startDateStr = '2025-09-14';
    const endDateStr = '2025-10-14';
    
    console.log('Input date strings:', startDateStr, 'to', endDateStr);
    
    // Fixed date handling (same as in controller)
    const start = new Date(startDateStr);
    start.setUTCHours(0, 0, 0, 0);
    
    const end = new Date(endDateStr);
    end.setUTCHours(23, 59, 59, 999);
    
    console.log('Processed date range:', start.toISOString(), 'to', end.toISOString());
    
    // Test the query
    const filter = {
      status: 'confirmed',
      createdAt: { $gte: start, $lte: end }
    };
    
    const revenues = await Revenue.find(filter).select('totalAmount platformCommission createdAt');
    console.log(`\\nRevenue records found: ${revenues.length}`);
    
    revenues.forEach((rev, i) => {
      console.log(`${i+1}. Total: ${rev.totalAmount}, Commission: ${rev.platformCommission}, Created: ${rev.createdAt.toISOString()}`);
    });
    
    // Test aggregation
    const aggregationResult = await Revenue.aggregate([
      { $match: filter },
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
    
    console.log('\\n=== AGGREGATION RESULT ===');
    console.log(aggregationResult[0] || 'No data');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testFixedDateHandling();