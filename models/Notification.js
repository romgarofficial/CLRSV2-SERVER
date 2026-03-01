/**
 * ===========================================
 * NOTIFICATION MODEL
 * ===========================================
 * Mongoose model for managing user notifications with custodian tracking
 */

const mongoose = require('mongoose');

// ===========================================
// NOTIFICATION SCHEMA
// ===========================================

const notificationSchema = new mongoose.Schema({
  // The user who should receive this notification
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, 'User ID is required']
  },

  // Notification content
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxLength: [100, 'Title cannot exceed 100 characters']
  },

  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxLength: [500, 'Message cannot exceed 500 characters']
  },

  // Type of notification for categorization
  type: {
    type: String,
    enum: [
      'report_created',
      'report_status_update',
      'report_note_added',
      'report_details_updated',
      'system_announcement',
      'general'
    ],
    default: 'general'
  },

  // Related report (if applicable)
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Report",
    default: null
  },

  // Custodian who performed the action (if applicable)
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  // Store custodian name to avoid issues with user deletions
  performedByName: {
    type: String,
    default: "",
    trim: true
  },

  // Read status
  isRead: {
    type: Boolean,
    default: false
  },

  // Read timestamp
  readAt: {
    type: Date,
    default: null
  },

  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }

}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true
  }
});

// ===========================================
// INDEXES
// ===========================================

// Compound index for efficient user notification queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ reportId: 1 });
notificationSchema.index({ performedBy: 1 });
notificationSchema.index({ type: 1 });

// TTL index to auto-delete old read notifications (optional)
// notificationSchema.index({ readAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 }); // 30 days

// ===========================================
// VIRTUAL FIELDS
// ===========================================

// Check if notification is recent (within 24 hours)
notificationSchema.virtual('isRecent').get(function() {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  return this.createdAt >= oneDayAgo;
});

// Get relative time
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffMs = now - this.createdAt;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return this.createdAt.toLocaleDateString();
});

// ===========================================
// INSTANCE METHODS
// ===========================================

/**
 * Mark notification as read
 */
notificationSchema.methods.markAsRead = function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

/**
 * Mark notification as unread
 */
notificationSchema.methods.markAsUnread = function() {
  if (this.isRead) {
    this.isRead = false;
    this.readAt = null;
    return this.save();
  }
  return Promise.resolve(this);
};

// ===========================================
// STATIC METHODS
// ===========================================

/**
 * Get unread count for a user
 */
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ userId, isRead: false });
};

/**
 * Mark all notifications as read for a user
 */
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { userId, isRead: false },
    { 
      $set: { 
        isRead: true, 
        readAt: new Date() 
      }
    }
  );
};

/**
 * Get notifications for a user with pagination
 */
notificationSchema.statics.getForUser = function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    isRead = null,
    type = null,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  const query = { userId };
  if (isRead !== null) query.isRead = isRead;
  if (type) query.type = type;

  const sortObj = {};
  sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (page - 1) * limit;

  return this.find(query)
    .populate('performedBy', 'fullName email role')
    .populate('reportId', 'labNameCache issueCategory status')
    .sort(sortObj)
    .skip(skip)
    .limit(limit);
};

/**
 * Clean up old read notifications
 */
notificationSchema.statics.cleanupOldNotifications = function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    isRead: true,
    readAt: { $lt: cutoffDate }
  });
};

// ===========================================
// PRE MIDDLEWARE
// ===========================================

// Validate performedBy and performedByName consistency
notificationSchema.pre('save', async function(next) {
  // If performedBy is set but performedByName is empty, fetch the name
  if (this.performedBy && !this.performedByName) {
    try {
      const User = mongoose.model('User');
      const user = await User.findById(this.performedBy).select('fullName');
      if (user) {
        this.performedByName = user.fullName;
      }
    } catch (error) {
      console.warn('Could not fetch performer name:', error.message);
    }
  }
  
  next();
});

// ===========================================
// POST MIDDLEWARE
// ===========================================

// Log notification creation for debugging
notificationSchema.post('save', function(doc) {
  if (doc.isNew) {
    console.log(`📬 Notification created for user ${doc.userId}: ${doc.title}`);
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
