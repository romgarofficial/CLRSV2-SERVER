/**
 * ===========================================
 * MODEL TEST SCRIPT
 * ===========================================
 * Test script for Laboratory and Report models
 * Tests the auto-sync functionality and model relationships
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { Laboratory, Report, User } = require('./models');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected for testing');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Test Laboratory Model
const testLaboratoryModel = async () => {
  console.log('\n🧪 Testing Laboratory Model...');
  
  try {
    // Create a test laboratory
    const lab = new Laboratory({
      labCode: 'TEST001',
      labName: 'Test Computer Laboratory',
      location: 'Building A, Floor 2',
      description: 'Testing laboratory for development',
      numberOfWorkstations: 25
    });
    
    await lab.save();
    console.log('✅ Laboratory created:', lab.fullIdentifier);
    
    // Test virtual fields
    console.log('📊 Virtual fields:');
    console.log(`   - Full Identifier: ${lab.fullIdentifier}`);
    console.log(`   - Workstation Range: ${lab.workstationRange}`);
    
    // Test instance methods
    console.log('🔧 Instance methods:');
    console.log(`   - Valid workstation 15: ${lab.isValidWorkstation(15)}`);
    console.log(`   - Valid workstation 30: ${lab.isValidWorkstation(30)}`);
    console.log(`   - Workstation numbers: ${lab.getWorkstationNumbers().slice(0, 5)}...`);
    
    return lab;
  } catch (error) {
    console.error('❌ Laboratory test error:', error);
    throw error;
  }
};

// Test Report Model
const testReportModel = async (laboratory) => {
  console.log('\n🧪 Testing Report Model...');
  
  try {
    // Find a test user (you might need to create one first)
    let testUser = await User.findOne({ role: 'student' });
    if (!testUser) {
      // Create a test user if none exists
      testUser = new User({
        firstName: 'Test',
        lastName: 'Student',
        email: 'test.student@example.com',
        passwordHash: 'hashedpassword123',
        role: 'student',
        isEmailVerified: true
      });
      await testUser.save();
      console.log('✅ Test user created');
    }
    
    // Create a test report
    const report = new Report({
      labId: laboratory._id,
      workstationNumber: '15',
      issueCategory: 'hardware',
      description: 'Monitor not working properly, flickering screen and occasional blackouts',
      reporterId: testUser._id
    });
    
    await report.save();
    console.log('✅ Report created with auto-populated labNameCache:', report.labNameCache);
    
    // Test virtual fields
    console.log('📊 Virtual fields:');
    console.log(`   - Age in days: ${report.ageInDays}`);
    console.log(`   - Workstation display: ${report.workstationDisplay}`);
    
    // Test custodian note functionality
    console.log('🔧 Testing custodian notes...');
    
    // Find or create a custodian
    let custodian = await User.findOne({ role: 'lab_custodian' });
    if (!custodian) {
      custodian = new User({
        firstName: 'Test',
        lastName: 'Custodian',
        email: 'test.custodian@example.com',
        passwordHash: 'hashedpassword123',
        role: 'lab_custodian',
        isEmailVerified: true
      });
      await custodian.save();
      console.log('✅ Test custodian created');
    }
    
    // Add a custodian note
    await report.addCustodianNote('Issue verified and acknowledged', custodian._id);
    console.log('✅ Custodian note added');
    
    // Update status
    await report.updateStatus('Verified by Lab Custodian', custodian._id, 'Moving to verification stage');
    console.log('✅ Status updated to:', report.status);
    
    return { report, testUser, custodian };
  } catch (error) {
    console.error('❌ Report test error:', error);
    throw error;
  }
};

// Test Auto-Sync Functionality
const testAutoSync = async (laboratory, report) => {
  console.log('\n🔄 Testing Auto-Sync Functionality...');
  
  try {
    console.log('📋 Before update:');
    console.log(`   Laboratory name: ${laboratory.labName}`);
    console.log(`   Report labNameCache: ${report.labNameCache}`);
    
    // Update laboratory name
    const updatedLab = await Laboratory.findOneAndUpdate(
      { _id: laboratory._id },
      { $set: { labName: 'Updated Test Computer Laboratory' } },
      { new: true }
    );
    
    console.log('✅ Laboratory name updated');
    
    // Wait a moment for the hook to execute
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fetch the updated report
    const updatedReport = await Report.findById(report._id);
    
    console.log('📋 After update:');
    console.log(`   Laboratory name: ${updatedLab.labName}`);
    console.log(`   Report labNameCache: ${updatedReport.labNameCache}`);
    
    if (updatedReport.labNameCache === updatedLab.labName) {
      console.log('✅ Auto-sync working correctly!');
    } else {
      console.log('❌ Auto-sync failed!');
    }
    
  } catch (error) {
    console.error('❌ Auto-sync test error:', error);
    throw error;
  }
};

// Test Static Methods
const testStaticMethods = async () => {
  console.log('\n🔍 Testing Static Methods...');
  
  try {
    // Test Laboratory static methods
    const activeLabs = await Laboratory.findActive();
    console.log(`✅ Found ${activeLabs.length} active laboratories`);
    
    const labByCode = await Laboratory.findByCode('TEST001');
    console.log(`✅ Found lab by code: ${labByCode ? labByCode.labName : 'Not found'}`);
    
    // Test Report static methods
    const submittedReports = await Report.findByStatus('Submitted');
    console.log(`✅ Found ${submittedReports.length} submitted reports`);
    
    // Test report statistics
    const stats = await Report.getStatistics();
    console.log('📊 Report statistics:', stats);
    
  } catch (error) {
    console.error('❌ Static methods test error:', error);
    throw error;
  }
};

// Cleanup Test Data
const cleanup = async () => {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    await Report.deleteMany({ labNameCache: /Test/ });
    await Laboratory.deleteMany({ labCode: 'TEST001' });
    await User.deleteMany({ email: /test\./ });
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  }
};

// Main Test Function
const runTests = async () => {
  try {
    console.log('🚀 Starting Model Tests...');
    
    await connectDB();
    
    const laboratory = await testLaboratoryModel();
    const { report, testUser, custodian } = await testReportModel(laboratory);
    await testAutoSync(laboratory, report);
    await testStaticMethods();
    
    console.log('\n✅ All tests completed successfully!');
    
    // Ask user if they want to keep test data
    console.log('\n❓ Would you like to clean up test data? (The script will clean up automatically in 10 seconds)');
    
    setTimeout(async () => {
      await cleanup();
      process.exit(0);
    }, 10000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await cleanup();
    process.exit(1);
  }
};

// Run tests if called directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testLaboratoryModel,
  testReportModel,
  testAutoSync,
  testStaticMethods,
  cleanup
};
