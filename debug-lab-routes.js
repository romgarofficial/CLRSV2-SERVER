/**
 * ===========================================
 * QUICK LABORATORY ROUTES TEST
 * ===========================================
 * Simple test to verify laboratory routes are working
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testLaboratoryRoutes() {
  console.log('🧪 Testing Laboratory Routes...\n');

  try {
    // Test 1: Test route (no auth required)
    console.log('1. Testing basic route...');
    try {
      const testResponse = await axios.get(`${BASE_URL}/api/laboratories/test`);
      console.log('✅ Test route working:', testResponse.data.message);
    } catch (error) {
      console.log('❌ Test route failed:', error.response?.data?.message || error.message);
    }

    // Test 2: Get laboratories (auth required, should get 401)
    console.log('\n2. Testing get laboratories (without auth)...');
    try {
      const getResponse = await axios.get(`${BASE_URL}/api/laboratories`);
      console.log('⚠️  Unexpected success (should require auth):', getResponse.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly requires authentication:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }

    // Test 3: Check if server is running
    console.log('\n3. Testing server health...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      console.log('✅ Server is healthy:', healthResponse.data.status);
    } catch (error) {
      console.log('❌ Server health check failed:', error.message);
    }

    // Test 4: Check API status
    console.log('\n4. Testing API status...');
    try {
      const apiResponse = await axios.get(`${BASE_URL}/api/status`);
      console.log('✅ API is running:', apiResponse.data.server);
    } catch (error) {
      console.log('❌ API status check failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }

  console.log('\n🏁 Test completed!');
  console.log('\n💡 If tests pass but you still get "Route not found":');
  console.log('   1. Make sure the server is running (npm start)');
  console.log('   2. Check the exact URL you are accessing');
  console.log('   3. Ensure there are no trailing slashes');
  console.log('   4. Verify authentication headers if required');
}

// Run tests
testLaboratoryRoutes();
