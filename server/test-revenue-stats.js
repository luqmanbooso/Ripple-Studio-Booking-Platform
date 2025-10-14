const mongoose = require('mongoose');
require('dotenv').config();

async function testRevenueStats() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const Revenue = require('./src/models/Revenue');
    const RevenueService = require('./src/services/revenueService');
    
    console.log('=== TESTING REVENUE STATISTICS ===');
    
    // Test with the same filter as the API
    const startDateStr = '2025-09-14';
    const endDateStr = '2025-10-14';
    
    // Replicate the exact filter from the controller
    const filter = { status: 'confirmed' };
    
    const start = new Date(startDateStr);
    start.setUTCHours(0, 0, 0, 0);
    
    const end = new Date(endDateStr);
    end.setUTCHours(23, 59, 59, 999);
    
    filter.createdAt = { $gte: start, $lte: end };
    
    console.log('Using filter:', JSON.stringify(filter, null, 2));
    
    // Test the model static method directly
    console.log('\\n1. Testing Revenue.getRevenueStats()...');
    const modelStats = await Revenue.getRevenueStats(filter);
    console.log('Model stats result:', modelStats);
    
    // Test the service method
    console.log('\\n2. Testing RevenueService.getRevenueStatistics()...');
    const serviceStats = await RevenueService.getRevenueStatistics(filter);
    console.log('Service stats keys:', Object.keys(serviceStats));
    console.log('Service stats basic values:', {
      totalRevenue: serviceStats.totalRevenue,
      totalCommission: serviceStats.totalCommission,
      totalStudioEarnings: serviceStats.totalStudioEarnings,
      totalBookings: serviceStats.totalBookings
    });
    
    // Test without filter to see if any records exist
    console.log('\\n3. Testing without date filter...');
    const noFilterStats = await Revenue.getRevenueStats({ status: 'confirmed' });
    console.log('No filter stats:', noFilterStats);
    
    // Test record count
    console.log('\\n4. Testing record count...');
    const count = await Revenue.countDocuments(filter);
    console.log('Record count with filter:', count);
    
    const totalCount = await Revenue.countDocuments({ status: 'confirmed' });
    console.log('Total confirmed records:', totalCount);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testRevenueStats();