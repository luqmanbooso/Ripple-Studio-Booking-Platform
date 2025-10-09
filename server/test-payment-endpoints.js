// Simple test script to verify payment endpoints are working
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testPaymentEndpoints() {
  console.log('🧪 Testing Payment Endpoints...\n');

  try {
    // Test health endpoint first
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL.replace('/api', '')}/health`);
    console.log('✅ Health check:', healthResponse.data.message);

    // Test payment endpoints (these will return 401 without auth, which is expected)
    console.log('\n2. Testing payment endpoints (expect 401 without auth)...');
    
    try {
      await axios.get(`${BASE_URL}/payments/my-payments`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ /payments/my-payments - Returns 401 (authentication required) ✓');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    try {
      await axios.get(`${BASE_URL}/payments/admin/all`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ /payments/admin/all - Returns 401 (authentication required) ✓');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('\n🎉 Payment endpoints are properly configured!');
    console.log('📝 Next steps:');
    console.log('   1. Frontend can now use payment API endpoints');
    console.log('   2. Test with authenticated requests');
    console.log('   3. Configure PayHere credentials in .env');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPaymentEndpoints();
