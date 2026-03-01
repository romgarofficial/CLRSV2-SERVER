/**
 * ===========================================
 * NOTIFICATION CONTROLLER
 * ===========================================
 * Handles all notification-related operations including CRUD operations,
 * read status management, and user notification preferences
 */

const { Notification } = require('../models');
const {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotificationStats
} = require('../utils/notificationHelper');

// ===========================================
// GET USER NOTIFICATIONS
// ===========================================

/**
 * @desc    Get notifications for current user
 * @route   GET /api/notifications
 * @access  Private (All authenticated users)
 */
const getNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      isRead = null,
      type = null,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Convert string 'true'/'false' to boolean for isRead
    let readFilter = null;
    if (isRead === 'true') readFilter = true;
    if (isRead === 'false') readFilter = false;

    const result = await getUserNotifications(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      isRead: readFilter,
      type,
      sortBy,
      sortOrder
    });

    res.status(200).json({
      success: true,
      message: `Found ${result.notifications.length} notifications`,
      data: result
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// GET UNREAD NOTIFICATIONS
// ===========================================

/**
 * @desc    Get unread notifications for current user
 * @route   GET /api/notifications/unread
 * @access  Private (All authenticated users)
 */
const getUnreadNotifications = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const result = await getUserNotifications(req.user.id, {
      page: 1,
      limit: parseInt(limit),
      isRead: false,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    res.status(200).json({
      success: true,
      message: `Found ${result.unreadCount} unread notifications`,
      data: {
        notifications: result.notifications,
        unreadCount: result.unreadCount
      }
    });

  } catch (error) {
    console.error('Get unread notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching unread notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// GET NOTIFICATION STATISTICS
// ===========================================

/**
 * @desc    Get notification statistics for current user
 * @route   GET /api/notifications/stats
 * @access  Private (All authenticated users)
 */
const getStats = async (req, res) => {
  try {
    const stats = await getNotificationStats(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Notification statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notification statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// GET SINGLE NOTIFICATION
// ===========================================

/**
 * @desc    Get single notification by ID
 * @route   GET /api/notifications/:id
 * @access  Private (Notification owner only)
 */
const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID format'
      });
    }

    // Find notification and ensure user owns it
    const notification = await Notification.findOne({
      _id: id,
      userId: req.user.id
    })
    .populate('performedBy', 'fullName email role')
    .populate('reportId', 'labNameCache issueCategory status workstationNumber');

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification retrieved successfully',
      data: notification
    });

  } catch (error) {
    console.error('Get notification by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notification',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// MARK NOTIFICATION AS READ
// ===========================================

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private (Notification owner only)
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID format'
      });
    }

    const notification = await markNotificationAsRead(id, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });

  } catch (error) {
    console.error('Mark notification as read error:', error);
    
    if (error.message === 'Notification not found or access denied') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating notification',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// MARK NOTIFICATION AS UNREAD
// ===========================================

/**
 * @desc    Mark notification as unread
 * @route   PATCH /api/notifications/:id/unread
 * @access  Private (Notification owner only)
 */
const markAsUnread = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID format'
      });
    }

    // Find notification and ensure user owns it
    const notification = await Notification.findOne({
      _id: id,
      userId: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or access denied'
      });
    }

    const updatedNotification = await notification.markAsUnread();

    res.status(200).json({
      success: true,
      message: 'Notification marked as unread',
      data: updatedNotification
    });

  } catch (error) {
    console.error('Mark notification as unread error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating notification',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// MARK ALL NOTIFICATIONS AS READ
// ===========================================

/**
 * @desc    Mark all notifications as read for current user
 * @route   PATCH /api/notifications/read-all
 * @access  Private (All authenticated users)
 */
const markAllAsRead = async (req, res) => {
  try {
    const result = await markAllNotificationsAsRead(req.user.id);

    res.status(200).json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
      data: {
        modifiedCount: result.modifiedCount,
        acknowledged: result.acknowledged
      }
    });

  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// DELETE NOTIFICATION
// ===========================================

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private (Notification owner only)
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID format'
      });
    }

    // Find and delete notification (ensure user owns it)
    const deletedNotification = await Notification.findOneAndDelete({
      _id: id,
      userId: req.user.id
    });

    if (!deletedNotification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
      data: {
        deletedId: id,
        title: deletedNotification.title
      }
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting notification',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// DELETE ALL READ NOTIFICATIONS
// ===========================================

/**
 * @desc    Delete all read notifications for current user
 * @route   DELETE /api/notifications/read
 * @access  Private (All authenticated users)
 */
const deleteAllRead = async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      userId: req.user.id,
      isRead: true
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} read notifications`,
      data: {
        deletedCount: result.deletedCount
      }
    });

  } catch (error) {
    console.error('Delete all read notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadNotifications,
  getStats,
  getNotificationById,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  deleteNotification,
  deleteAllRead
};
