/**
 * ===========================================
 * LABORATORY MODULE TEST SCRIPT
 * ===========================================
 * Tests the laboratory controller and routes functionality
 * including role-based access control and sync logic
 */

const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api';

// Test tokens (you'll need to get these from actual login)
let adminToken = '';
let custodianToken = '';
let studentToken = '';
let testLabId = '';

// ===========================================
// TEST HELPERS
// ===========================================

const makeRequest = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {}
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.data = data;
      config.headers['Content-Type'] = 'application/json';
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      return error.response.data;
    }
    throw error;
  }
};

// ===========================================
// AUTHENTICATION SETUP
// ===========================================

const setupAuthentication = async () => {
  console.log('🔐 Setting up authentication...');
  
  try {
    // Register and login test users (if they don't exist)
    
    // Admin user
    const adminRegister = await makeRequest('POST', '/auth/register', {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin'
    });
    
    if (adminRegister.success) {
      console.log('✅ Admin registered');
      // You would verify OTP here in real scenario
    }

    // Login admin
    const adminLogin = await makeRequest('POST', '/auth/login', {
      email: 'admin@test.com',
      password: 'admin123'
    });

    if (adminLogin.success) {
      adminToken = adminLogin.data.token;
      console.log('✅ Admin logged in');
    }

    // Similar setup for custodian and student...
    console.log('⚠️  Note: Complete OTP verification for users before testing');
    
  } catch (error) {
    console.error('❌ Authentication setup error:', error.message);
  }
};

// ===========================================
// LABORATORY TESTS
// ===========================================

const testCreateLaboratory = async () => {
  console.log('\n🧪 Testing Laboratory Creation...');
  
  // Test with admin token
  const labData = {
    labCode: 'TEST001',
    labName: 'Test Computer Laboratory',
    location: 'Building A, Floor 2',
    description: 'Testing laboratory for development',
    numberOfWorkstations: 30
  };

  const result = await makeRequest('POST', '/laboratories', labData, adminToken);
  
  if (result.success) {
    console.log('✅ Laboratory created successfully');
    testLabId = result.data.id;
    console.log(`📋 Lab ID: ${testLabId}`);
  } else {
    console.log('❌ Laboratory creation failed:', result.message);
  }

  // Test validation errors
  const invalidData = {
    labCode: '',
    labName: '',
    numberOfWorkstations: -1
  };

  const validationTest = await makeRequest('POST', '/laboratories', invalidData, adminToken);
  console.log('✅ Validation test:', validationTest.success ? 'Failed' : 'Passed');

  return result;
};

const testGetLaboratories = async () => {
  console.log('\n🧪 Testing Get All Laboratories...');
  
  // Test with different users
  const adminResult = await makeRequest('GET', '/laboratories', null, adminToken);
  const studentResult = await makeRequest('GET', '/laboratories', null, studentToken);

  if (adminResult.success) {
    console.log(`✅ Admin can view laboratories: ${adminResult.data.length} labs found`);
  }

  if (studentResult.success) {
    console.log(`✅ Student can view laboratories: ${studentResult.data.length} labs found`);
  }

  // Test search functionality
  const searchResult = await makeRequest('GET', '/laboratories?search=test', null, adminToken);
  console.log(`🔍 Search test: Found ${searchResult.data?.length || 0} labs`);

  return adminResult;
};

const testGetLaboratoryById = async () => {
  console.log('\n🧪 Testing Get Laboratory by ID...');
  
  if (!testLabId) {
    console.log('❌ No test lab ID available');
    return;
  }

  const result = await makeRequest('GET', `/laboratories/${testLabId}`, null, adminToken);
  
  if (result.success) {
    console.log('✅ Laboratory retrieved by ID');
    console.log(`📊 Lab: ${result.data.labCode} - ${result.data.labName}`);
    console.log(`📊 Workstations: ${result.data.numberOfWorkstations}`);
    console.log(`📊 Reports: ${result.data.reportCount}`);
  } else {
    console.log('❌ Failed to retrieve laboratory:', result.message);
  }

  return result;
};

const testUpdateLaboratory = async () => {
  console.log('\n🧪 Testing Laboratory Update (with sync logic)...');
  
  if (!testLabId) {
    console.log('❌ No test lab ID available');
    return;
  }

  const updateData = {
    labName: 'Updated Test Computer Laboratory',
    location: 'Building B, Floor 3',
    numberOfWorkstations: 35
  };

  const result = await makeRequest('PUT', `/laboratories/${testLabId}`, updateData, adminToken);
  
  if (result.success) {
    console.log('✅ Laboratory updated successfully');
    console.log(`📋 New name: ${result.data.labName}`);
    console.log('🔄 Sync logic should have updated related reports');
  } else {
    console.log('❌ Laboratory update failed:', result.message);
  }

  // Test role-based access
  const unauthorizedUpdate = await makeRequest('PUT', `/laboratories/${testLabId}`, updateData, studentToken);
  console.log('🔒 Student update test:', unauthorizedUpdate.success ? 'Failed' : 'Passed');

  return result;
};

const testDeleteLaboratory = async () => {
  console.log('\n🧪 Testing Laboratory Soft Delete...');
  
  if (!testLabId) {
    console.log('❌ No test lab ID available');
    return;
  }

  const result = await makeRequest('DELETE', `/laboratories/${testLabId}`, null, adminToken);
  
  if (result.success) {
    console.log('✅ Laboratory soft deleted (isActive = false)');
    console.log(`📋 Active reports count: ${result.data.activeReportsCount}`);
  } else {
    console.log('❌ Laboratory deletion failed:', result.message);
  }

  // Verify lab is now inactive
  const getResult = await makeRequest('GET', `/laboratories/${testLabId}`, null, adminToken);
  if (getResult.success && !getResult.data.isActive) {
    console.log('✅ Laboratory correctly marked as inactive');
  }

  return result;
};

const testRoleBasedAccess = async () => {
  console.log('\n🧪 Testing Role-Based Access Control...');
  
  const testData = {
    labCode: 'ROLE001',
    labName: 'Role Test Laboratory',
    numberOfWorkstations: 20
  };

  // Test unauthorized creation
  const studentCreate = await makeRequest('POST', '/laboratories', testData, studentToken);
  console.log('🔒 Student create test:', studentCreate.success ? 'Failed' : 'Passed');

  // Test authorized creation
  const adminCreate = await makeRequest('POST', '/laboratories', testData, adminToken);
  console.log('✅ Admin create test:', adminCreate.success ? 'Passed' : 'Failed');

  if (adminCreate.success) {
    const roleTestLabId = adminCreate.data.id;
    
    // Clean up
    await makeRequest('DELETE', `/laboratories/${roleTestLabId}`, null, adminToken);
    console.log('🧹 Role test lab cleaned up');
  }
};

const testLaboratoryStats = async () => {
  console.log('\n🧪 Testing Laboratory Statistics...');
  
  const result = await makeRequest('GET', '/laboratories/admin/stats', null, adminToken);
  
  if (result.success) {
    console.log('✅ Laboratory statistics retrieved');
    console.log(`📊 Total labs: ${result.data.summary.totalLabs}`);
    console.log(`📊 Active labs: ${result.data.summary.activeLabs}`);
    console.log(`📊 Inactive labs: ${result.data.summary.inactiveLabs}`);
  } else {
    console.log('❌ Failed to retrieve statistics:', result.message);
  }

  return result;
};

// ===========================================
// MAIN TEST RUNNER
// ===========================================

const runAllTests = async () => {
  console.log('🚀 Starting Laboratory Module Tests...\n');
  
  try {
    // Setup
    await setupAuthentication();
    
    // If no tokens, skip tests
    if (!adminToken) {
      console.log('⚠️  Skipping tests - no admin token available');
      console.log('💡 Please ensure users are registered and email verified');
      return;
    }

    // Run tests
    await testCreateLaboratory();
    await testGetLaboratories();
    await testGetLaboratoryById();
    await testUpdateLaboratory();
    await testRoleBasedAccess();
    await testLaboratoryStats();
    await testDeleteLaboratory(); // Keep this last as it deactivates the lab

    console.log('\n✅ All Laboratory Module Tests Completed!');
    console.log('🔍 Check server logs for sync logic output');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
  }
};

// ===========================================
// USAGE INSTRUCTIONS
// ===========================================

console.log('📋 Laboratory Module Test Instructions:');
console.log('1. Start the server: npm start');
console.log('2. Register admin, custodian, and student users');
console.log('3. Verify their emails using OTP');
console.log('4. Update the token variables in this script');
console.log('5. Run: node test-laboratory-module.js\n');

// Auto-run tests if tokens are provided
if (process.argv.includes('--run')) {
  runAllTests();
}

module.exports = {
  makeRequest,
  testCreateLaboratory,
  testGetLaboratories,
  testGetLaboratoryById,
  testUpdateLaboratory,
  testDeleteLaboratory,
  testRoleBasedAccess,
  testLaboratoryStats,
  runAllTests
};
