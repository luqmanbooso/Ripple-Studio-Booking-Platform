const mongoose = require('mongoose');
require('dotenv').config();

async function testDateRange() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const Revenue = require('./src/models/Revenue');
    
    // Test with different date ranges
    console.log('=== TESTING DIFFERENT DATE RANGES ===');
    
    // Current frontend date range
    const frontendStart = new Date('2025-09-14');
    const frontendEnd = new Date('2025-10-14');
    console.log('Frontend range:', frontendStart.toISOString(), 'to', frontendEnd.toISOString());
    
    let result = await Revenue.find({
      status: 'confirmed',
      createdAt: { $gte: frontendStart, $lte: frontendEnd }
    }).count();
    console.log('Records found with frontend range:', result);
    
    // Extended date range to end of today
    const extendedEnd = new Date('2025-10-15'); // Next day
    console.log('\\nExtended range:', frontendStart.toISOString(), 'to', extendedEnd.toISOString());
    
    result = await Revenue.find({
      status: 'confirmed',
      createdAt: { $gte: frontendStart, $lte: extendedEnd }
    }).count();
    console.log('Records found with extended range:', result);
    
    // Test with specific revenue record creation time
    const sampleRevenue = await Revenue.findOne().select('createdAt');
    if (sampleRevenue) {
      console.log('\\nSample revenue created at:', sampleRevenue.createdAt.toISOString());
      
      // Check if it's within the frontend range
      const isInRange = sampleRevenue.createdAt >= frontendStart && sampleRevenue.createdAt <= frontendEnd;
      console.log('Is sample revenue in frontend date range?', isInRange);
      
      if (!isInRange) {
        console.log('Frontend end date:', frontendEnd.toISOString());
        console.log('Revenue creation date:', sampleRevenue.createdAt.toISOString());
        console.log('Revenue is after end date by:', sampleRevenue.createdAt.getTime() - frontendEnd.getTime(), 'ms');
      }
    }
    
    // Test the correct aggregation with extended range
    const platformRevenue = await Revenue.aggregate([
      {
        $match: {
          status: 'confirmed',
          createdAt: { $gte: frontendStart, $lte: extendedEnd }
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
    
    console.log('\\n=== AGGREGATION WITH EXTENDED RANGE ===');
    console.log('Platform revenue result:', platformRevenue);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testDateRange();