/**
 * ===========================================
 * TEST NOTIFICATION SYSTEM
 * ===========================================
 * Test script to verify notification system functionality
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models and helpers
const { User, Report, Laboratory, Notification } = require('./models');
const {
  sendNotification,
  sendReportStatusUpdateNotification,
  sendCustodianNoteNotification,
  sendReportDetailsUpdateNotification,
  getUserNotifications,
  getNotificationStats
} = require('./utils/notificationHelper');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected for testing');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Test notification system
const testNotificationSystem = async () => {
  try {
    console.log('\n🧪 Testing Notification System...\n');

    // 1. Test basic notification creation
    console.log('1. Testing basic notification creation...');
    
    // Find a test user (or create one)
    let testUser = await User.findOne({ role: 'student' });
    if (!testUser) {
      console.log('❌ No student user found for testing');
      return;
    }

    console.log(`📋 Using test user: ${testUser.fullName} (${testUser.email})`);

    // Create a basic notification
    const basicNotification = await sendNotification({
      userId: testUser._id,
      title: 'Test Notification',
      message: 'This is a test notification to verify the system works.',
      type: 'general',
      priority: 'medium'
    });

    console.log('✅ Basic notification created:', basicNotification.title);

    // 2. Test custodian-triggered notifications
    console.log('\n2. Testing custodian-triggered notifications...');
    
    // Find a custodian user
    let custodianUser = await User.findOne({ role: { $in: ['lab_custodian', 'admin'] } });
    if (!custodianUser) {
      console.log('❌ No custodian user found for testing');
      return;
    }

    console.log(`👨‍🔬 Using custodian: ${custodianUser.fullName} (${custodianUser.email})`);

    // Find or create a test report
    let testReport = await Report.findOne({ reporterId: testUser._id });
    if (!testReport) {
      // Create a test laboratory first
      let testLab = await Laboratory.findOne({ isActive: true });
      if (!testLab) {
        testLab = new Laboratory({
          labCode: 'TEST001',
          labName: 'Test Laboratory',
          location: 'Test Building',
          numberOfWorkstations: 20,
          isActive: true
        });
        await testLab.save();
        console.log('✅ Test laboratory created');
      }

      // Create test report
      testReport = new Report({
        labId: testLab._id,
        labNameCache: testLab.labName,
        reporterId: testUser._id,
        workstationNumber: '1',
        issueCategory: 'hardware',
        description: 'This is a test report for notification system testing.',
        status: 'Submitted'
      });
      await testReport.save();
      console.log('✅ Test report created');
    }

    console.log(`📊 Using test report: ${testReport._id}`);

    // Test status update notification
    const statusNotification = await sendReportStatusUpdateNotification(
      testUser._id,
      'In Progress',
      testReport._id,
      {
        id: custodianUser._id,
        fullName: custodianUser.fullName
      }
    );
    console.log('✅ Status update notification sent');

    // Test custodian note notification
    const noteNotification = await sendCustodianNoteNotification(
      testUser._id,
      testReport._id,
      {
        id: custodianUser._id,
        fullName: custodianUser.fullName
      }
    );
    console.log('✅ Custodian note notification sent');

    // Test report details update notification
    const detailsNotification = await sendReportDetailsUpdateNotification(
      testUser._id,
      testReport._id,
      {
        id: custodianUser._id,
        fullName: custodianUser.fullName
      }
    );
    console.log('✅ Report details update notification sent');

    // 3. Test notification retrieval
    console.log('\n3. Testing notification retrieval...');
    
    const userNotifications = await getUserNotifications(testUser._id, {
      page: 1,
      limit: 10
    });

    console.log(`📬 Retrieved ${userNotifications.notifications.length} notifications`);
    console.log(`📊 Unread count: ${userNotifications.unreadCount}`);

    // Display notification details
    userNotifications.notifications.forEach((notification, index) => {
      console.log(`   ${index + 1}. ${notification.title}`);
      console.log(`      Message: ${notification.message}`);
      console.log(`      Type: ${notification.type}`);
      console.log(`      Read: ${notification.isRead ? '✅' : '📬'}`);
      if (notification.performedByName) {
        console.log(`      Performed by: ${notification.performedByName}`);
      }
      console.log(`      Created: ${notification.createdAt.toLocaleString()}`);
      console.log('');
    });

    // 4. Test notification statistics
    console.log('4. Testing notification statistics...');
    
    const stats = await getNotificationStats(testUser._id);
    console.log('📊 Notification Statistics:');
    console.log(`   Total: ${stats.total}`);
    console.log(`   Unread: ${stats.unread}`);
    console.log(`   Read: ${stats.read}`);
    console.log(`   By Type:`, stats.byType);
    console.log(`   By Priority:`, stats.byPriority);

    // 5. Test marking as read
    console.log('\n5. Testing mark as read functionality...');
    
    if (userNotifications.notifications.length > 0) {
      const firstNotification = userNotifications.notifications[0];
      if (!firstNotification.isRead) {
        await firstNotification.markAsRead();
        console.log('✅ First notification marked as read');
      } else {
        console.log('ℹ️  First notification was already read');
      }
    }

    console.log('\n🎉 All notification tests completed successfully!\n');

    // 6. Cleanup test data (optional)
    console.log('6. Cleaning up test data...');
    await Notification.deleteMany({ 
      userId: testUser._id,
      title: { $regex: 'Test' } 
    });
    console.log('✅ Test notifications cleaned up');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
};

// Run the test
const runTest = async () => {
  await connectDB();
  await testNotificationSystem();
  
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

module.exports = { testNotificationSystem };
