/**
 * ===========================================
 * NOTIFICATION HELPER
 * ===========================================
 * Utility functions for creating and managing notifications
 */

const mongoose = require('mongoose');
const { Notification, User } = require('../models');

/**
 * Send a notification to a user
 * @param {Object} notificationData - Notification details
 * @param {String} notificationData.userId - Target user ID
 * @param {String} notificationData.title - Notification title
 * @param {String} notificationData.message - Notification message
 * @param {String} [notificationData.type='general'] - Notification type
 * @param {String} [notificationData.reportId] - Related report ID
 * @param {String} [notificationData.performedBy] - User who performed the action
 * @param {String} [notificationData.performedByName] - Name of performer
 * @param {String} [notificationData.priority='medium'] - Priority level
 * @param {Object} [notificationData.metadata={}] - Additional metadata
 * @returns {Promise<Notification>} Created notification
 */
const sendNotification = async (notificationData) => {
  try {
    const {
      userId,
      title,
      message,
      type = 'general',
      reportId = null,
      performedBy = null,
      performedByName = '',
      priority = 'medium',
      metadata = {}
    } = notificationData;

    // Validate required fields
    if (!userId) {
      throw new Error('userId is required');
    }
    if (!title) {
      throw new Error('title is required');
    }
    if (!message) {
      throw new Error('message is required');
    }

    // Create notification
    const notification = new Notification({
      userId,
      title,
      message,
      type,
      reportId,
      performedBy,
      performedByName,
      priority,
      metadata
    });

    await notification.save();
    
    console.log(`📬 Notification sent to user ${userId}: ${title}`);
    
    return notification;

  } catch (error) {
    console.error('❌ Error sending notification:', error.message);
    throw error;
  }
};

/**
 * Send notification when a new report is created
 * @param {String} reporterId - ID of the report creator
 * @param {Object} report - Report document
 * @param {Object} laboratory - Laboratory document
 * @returns {Promise<Notification>} Created notification
 */
const sendReportCreatedNotification = async (reporterId, report, laboratory) => {
  if (!report || !laboratory) {
    throw new Error('report and laboratory are required to send report created notification');
  }

  const labCode = laboratory.labCode || null;
  const labName = laboratory.labName || null;

  const title = 'Report Submitted';
  const messageParts = [];

  if (labCode || labName) {
    const labIdentifier = [labCode, labName].filter(Boolean).join(' - ');
    messageParts.push(`Your report for ${labIdentifier} has been submitted.`);
  } else {
    messageParts.push('Your report has been submitted.');
  }

  messageParts.push('It is now awaiting review by the lab custodians.');

  const message = messageParts.join(' ');

  return await sendNotification({
    userId: reporterId,
    title,
    message,
    type: 'report_created',
    reportId: report._id,
    priority: 'high',
    metadata: {
      labCode,
      labName,
      issueCategory: report.issueCategory || null,
      workstationNumber: report.workstationNumber || null,
      status: report.status || null
    }
  });
};

/**
 * Send notifications to lab custodians and admins when a new report is created
 * @param {Object} report - Report document
 * @param {Object} reporter - User who created the report
 * @param {Object} laboratory - Laboratory document
 * @returns {Promise<Array>} Results from bulk notification sending
 */
const sendReportCreatedAdminNotifications = async (report, reporter, laboratory) => {
  if (!report || !laboratory) {
    throw new Error('report and laboratory are required to send admin report created notifications');
  }

  const labCode = laboratory.labCode || null;
  const labName = laboratory.labName || null;

  // Find all active lab custodians and admins
  const custodians = await User.find({
    role: { $in: ['lab_custodian', 'admin'] },
    isActive: true
  }).select('_id fullName email role');

  if (!custodians || custodians.length === 0) {
    return [];
  }

  const reporterId = reporter?.id || reporter?._id || null;

  const notifications = custodians
    .filter((user) => {
      if (!reporterId) return true;
      return String(user._id) !== String(reporterId);
    })
    .map((user) => {
      const title = 'New Report Submitted';

      const parts = [];
      if (reporter?.fullName) {
        parts.push(`${reporter.fullName} submitted a new report`);
      } else {
        parts.push('A new report has been submitted');
      }

      if (labCode || labName) {
        const labIdentifier = [labCode, labName].filter(Boolean).join(' - ');
        parts.push(`for ${labIdentifier}`);
      }

      if (report.issueCategory) {
        parts.push(`(Category: ${report.issueCategory})`);
      }

      const message = parts.join(' ') + '.';

      return {
        userId: user._id,
        title,
        message,
        type: 'report_created',
        reportId: report._id,
        priority: 'high',
        metadata: {
          labCode,
          labName,
          issueCategory: report.issueCategory || null,
          workstationNumber: report.workstationNumber || null,
          status: report.status || null,
          reporterName: reporter?.fullName || null,
          reporterEmail: reporter?.email || null,
          reporterRole: reporter?.role || null
        }
      };
    });

  if (notifications.length === 0) {
    return [];
  }

  return await sendBulkNotifications(notifications);
};

/**
 * Send notification about report status update
 * @param {String} reporterId - ID of the report creator
 * @param {String} newStatus - New report status
 * @param {String} reportId - Report ID
 * @param {Object} performer - User who performed the action
 * @param {String} performer.id - Performer user ID
 * @param {String} performer.fullName - Performer full name
 * @param {Object} [reportData={}] - Report details for metadata
 * @returns {Promise<Notification>} Created notification
 */
const sendReportStatusUpdateNotification = async (reporterId, newStatus, reportId, performer, reportData = {}) => {
  return await sendNotification({
    userId: reporterId,
    title: 'Report Status Updated',
    message: `Your report status has been updated to '${newStatus}' by ${performer.fullName}.`,
    type: 'report_status_update',
    reportId,
    performedBy: performer.id,
    performedByName: performer.fullName,
    priority: 'medium',
    metadata: {
      labCode: reportData.labCode || null,
      labName: reportData.labName || null,
      issueCategory: reportData.issueCategory || null,
      workstationNumber: reportData.workstationNumber || null,
      newStatus
    }
  });
};

/**
 * Send notification about custodian note addition
 * @param {String} reporterId - ID of the report creator
 * @param {String} reportId - Report ID
 * @param {Object} performer - User who performed the action
 * @param {String} performer.id - Performer user ID
 * @param {String} performer.fullName - Performer full name
 * @param {Object} [reportData={}] - Report details for metadata
 * @returns {Promise<Notification>} Created notification
 */
const sendCustodianNoteNotification = async (reporterId, reportId, performer, reportData = {}) => {
  return await sendNotification({
    userId: reporterId,
    title: 'Progress Update from Custodian',
    message: `${performer.fullName} added a progress update to your report.`,
    type: 'report_note_added',
    reportId,
    performedBy: performer.id,
    performedByName: performer.fullName,
    priority: 'medium',
    metadata: {
      labCode: reportData.labCode || null,
      labName: reportData.labName || null,
      issueCategory: reportData.issueCategory || null,
      workstationNumber: reportData.workstationNumber || null,
      notePreview: reportData.noteContent ? reportData.noteContent.substring(0, 100) : null
    }
  });
};

/**
 * Send notification about report details update
 * @param {String} reporterId - ID of the report creator
 * @param {String} reportId - Report ID
 * @param {Object} performer - User who performed the action
 * @param {String} performer.id - Performer user ID
 * @param {String} performer.fullName - Performer full name
 * @param {Object} [reportData={}] - Report details for metadata
 * @returns {Promise<Notification>} Created notification
 */
const sendReportDetailsUpdateNotification = async (reporterId, reportId, performer, reportData = {}) => {
  return await sendNotification({
    userId: reporterId,
    title: 'Report Updated',
    message: `Your report was updated by ${performer.fullName}.`,
    type: 'report_details_updated',
    reportId,
    performedBy: performer.id,
    performedByName: performer.fullName,
    priority: 'medium',
    metadata: {
      labCode: reportData.labCode || null,
      labName: reportData.labName || null,
      issueCategory: reportData.issueCategory || null,
      workstationNumber: reportData.workstationNumber || null,
      updateFields: reportData.updateFields || []
    }
  });
};

/**
 * Send bulk notifications to multiple users
 * @param {Array} notifications - Array of notification objects
 * @returns {Promise<Array>} Array of created notifications
 */
const sendBulkNotifications = async (notifications) => {
  try {
    const results = [];
    
    for (const notificationData of notifications) {
      try {
        const notification = await sendNotification(notificationData);
        results.push({ success: true, notification });
      } catch (error) {
        results.push({ 
          success: false, 
          error: error.message,
          data: notificationData
        });
      }
    }
    
    return results;

  } catch (error) {
    console.error('❌ Error sending bulk notifications:', error.message);
    throw error;
  }
};

/**
 * Get notifications for a user with pagination
 * @param {String} userId - User ID
 * @param {Object} options - Query options
 * @param {Number} [options.page=1] - Page number
 * @param {Number} [options.limit=20] - Items per page
 * @param {Boolean} [options.isRead] - Filter by read status
 * @param {String} [options.type] - Filter by notification type
 * @returns {Promise<Object>} Notifications with pagination info
 */
const getUserNotifications = async (userId, options = {}) => {
  try {
    const {
      page = 1,
      limit = 20,
      isRead = null,
      type = null
    } = options;

    const notifications = await Notification.getForUser(userId, {
      page,
      limit,
      isRead,
      type
    });

    const totalCount = await Notification.countDocuments({
      userId,
      ...(isRead !== null && { isRead }),
      ...(type && { type })
    });

    const unreadCount = await Notification.getUnreadCount(userId);

    return {
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalNotifications: totalCount,
        hasNextPage: (parseInt(page) * parseInt(limit)) < totalCount,
        hasPrevPage: parseInt(page) > 1
      },
      unreadCount
    };

  } catch (error) {
    console.error('❌ Error fetching user notifications:', error.message);
    throw error;
  }
};

/**
 * Mark notification as read
 * @param {String} notificationId - Notification ID
 * @param {String} userId - User ID (for security)
 * @returns {Promise<Notification>} Updated notification
 */
const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOne({
      _id: notificationId,
      userId: userId
    });

    if (!notification) {
      throw new Error('Notification not found or access denied');
    }

    return await notification.markAsRead();

  } catch (error) {
    console.error('❌ Error marking notification as read:', error.message);
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Update result
 */
const markAllNotificationsAsRead = async (userId) => {
  try {
    const result = await Notification.markAllAsRead(userId);
    console.log(`📬 Marked ${result.modifiedCount} notifications as read for user ${userId}`);
    return result;

  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error.message);
    throw error;
  }
};

/**
 * Get notification statistics for a user
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Notification statistics
 */
const getNotificationStats = async (userId) => {
  try {
    const stats = await Notification.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: {
            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
          },
          byType: {
            $push: '$type'
          },
          byPriority: {
            $push: '$priority'
          }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      unread: 0,
      byType: [],
      byPriority: []
    };

    // Count by type
    const typeCounts = {};
    result.byType.forEach(type => {
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    // Count by priority
    const priorityCounts = {};
    result.byPriority.forEach(priority => {
      priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
    });

    return {
      total: result.total,
      unread: result.unread,
      read: result.total - result.unread,
      byType: typeCounts,
      byPriority: priorityCounts
    };

  } catch (error) {
    console.error('❌ Error fetching notification stats:', error.message);
    throw error;
  }
};

module.exports = {
  sendNotification,
  sendReportCreatedNotification,
  sendReportCreatedAdminNotifications,
  sendReportStatusUpdateNotification,
  sendCustodianNoteNotification,
  sendReportDetailsUpdateNotification,
  sendBulkNotifications,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotificationStats
};
