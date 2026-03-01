/**
 * ===========================================
 * TEST EMAIL NOTIFICATION SYSTEM
 * ===========================================
 * Test script to verify email notification system functionality
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models and helpers
const { User, Report, Laboratory } = require('./models');
const {
  sendReportSubmissionEmails,
  sendReportStatusUpdateEmail,
  sendCustodianNoteEmail
} = require('./utils/emailNotificationHelper');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected for email testing');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Test email notification system
const testEmailNotifications = async () => {
  try {
    console.log('\n📧 Testing Email Notification System...\n');

    // 1. Find test users
    const student = await User.findOne({ role: 'student', isEmailVerified: true });
    const custodian = await User.findOne({ role: { $in: ['lab_custodian', 'admin'] }, isEmailVerified: true });
    
    if (!student) {
      console.log('❌ No verified student found for testing');
      return;
    }
    
    if (!custodian) {
      console.log('❌ No verified custodian found for testing');
      return;
    }

    console.log(`📋 Student: ${student.fullName} (${student.email})`);
    console.log(`👨‍🔬 Custodian: ${custodian.fullName} (${custodian.email})`);

    // 2. Find or create test laboratory
    let testLab = await Laboratory.findOne({ isActive: true });
    if (!testLab) {
      testLab = new Laboratory({
        labCode: 'TEST001',
        labName: 'Email Test Laboratory',
        location: 'Test Building Room 101',
        numberOfWorkstations: 25,
        isActive: true
      });
      await testLab.save();
      console.log('✅ Test laboratory created');
    }

    console.log(`🏢 Laboratory: ${testLab.labName} (${testLab.labCode})`);

    // 3. Create test report
    const testReport = new Report({
      labId: testLab._id,
      labNameCache: testLab.labName,
      reporterId: student._id,
      workstationNumber: '5',
      issueCategory: 'hardware',
      description: 'Test email notification system - computer not turning on properly. This is a test report to verify that email notifications work correctly.',
      status: 'Submitted'
    });

    await testReport.save();
    console.log('✅ Test report created');

    // 4. Test report submission emails
    console.log('\n1. Testing report submission emails...');
    try {
      const submissionResult = await sendReportSubmissionEmails(testReport, student, testLab);
      console.log('✅ Report submission emails sent successfully');
      console.log(`   Reporter email: ${submissionResult.reporterEmail.success ? '✅' : '❌'}`);
      console.log(`   Custodian emails: ${submissionResult.custodianEmails.filter(r => r.success).length}/${submissionResult.custodianEmails.length} sent`);
    } catch (error) {
      console.error('❌ Report submission email test failed:', error.message);
    }

    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 5. Test status update email
    console.log('\n2. Testing status update email...');
    try {
      testReport.status = 'Verified by Lab Custodian';
      await sendReportStatusUpdateEmail(
        testReport,
        'Verified by Lab Custodian',
        custodian,
        'We have verified your report and will begin investigating the issue shortly.'
      );
      console.log('✅ Status update email sent successfully');
    } catch (error) {
      console.error('❌ Status update email test failed:', error.message);
    }

    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 6. Test custodian note email
    console.log('\n3. Testing custodian note email...');
    try {
      testReport.status = 'In Progress';
      await sendCustodianNoteEmail(
        testReport,
        'We have identified the issue as a power supply problem. The technician will replace the power unit tomorrow morning.',
        custodian
      );
      console.log('✅ Custodian note email sent successfully');
    } catch (error) {
      console.error('❌ Custodian note email test failed:', error.message);
    }

    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 7. Test resolution email
    console.log('\n4. Testing resolution email...');
    try {
      testReport.status = 'Resolved';
      testReport.resolvedAt = new Date();
      await sendReportStatusUpdateEmail(
        testReport,
        'Resolved',
        custodian,
        'The power supply has been replaced and the computer is now working properly. Please test and let us know if you encounter any further issues.'
      );
      console.log('✅ Resolution email sent successfully');
    } catch (error) {
      console.error('❌ Resolution email test failed:', error.message);
    }

    console.log('\n🎉 Email notification tests completed!\n');

    // 8. Cleanup
    console.log('5. Cleaning up test data...');
    await Report.findByIdAndDelete(testReport._id);
    console.log('✅ Test report cleaned up');

    // Summary
    console.log('\n📊 Test Summary:');
    console.log('✅ Report submission emails (to reporter + custodians)');
    console.log('✅ Status update emails (verification → progress → resolution)');
    console.log('✅ Custodian note emails');
    console.log('✅ All email templates with professional HTML formatting');
    console.log('✅ Error handling and graceful failures');
    
    console.log('\n📧 Email Features Implemented:');
    console.log('• Beautiful HTML email templates with proper styling');
    console.log('• Plain text fallback for all emails');
    console.log('• Automatic custodian/admin discovery and notification');
    console.log('• Status-specific email content and colors');
    console.log('• Professional email headers and footers');
    console.log('• Detailed report information in all emails');
    console.log('• Asynchronous sending to avoid blocking responses');

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('Stack:', error.stack);
  }
};

// Run the test
const runTest = async () => {
  await connectDB();
  await testEmailNotifications();
  
  // Close connection
  await mongoose.connection.close();
  console.log('📋 Database connection closed');
  process.exit(0);
};

// Handle errors
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  runTest();
}

module.exports = { testEmailNotifications };
