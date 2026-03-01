/**
 * ===========================================
 * NOTIFICATION ROUTES
 * ===========================================
 * Defines all routes for notification management with proper role-based access control
 */

const express = require('express');

// Import controllers
const {
  getNotifications,
  getUnreadNotifications,
  getStats,
  getNotificationById,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  deleteNotification,
  deleteAllRead
} = require('../controllers/notificationController');

// Import middleware
const { authMiddleware } = require('../middleware');

const router = express.Router();

// Add logging to verify routes are being loaded
console.log('📋 Notification routes loading...');

// ===========================================
// DEBUGGING MIDDLEWARE
// ===========================================

// Add debugging middleware to log all requests
router.use((req, res, next) => {
  console.log(`🛣️  Notification route: ${req.method} ${req.originalUrl}`);
  console.log(`📊 Headers:`, req.headers.authorization ? 'Auth token present' : 'No auth token');
  console.log(`👤 User Role:`, req.user?.role || 'Not authenticated');
  next();
});

// ===========================================
// TEST ROUTES
// ===========================================

// Add a simple test route to verify the routes are working
router.get('/test', (req, res) => {
  console.log('🧪 Notification test route accessed (GET)');
  res.json({
    success: true,
    message: 'Notification routes are working! (GET)',
    method: 'GET',
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET /api/notifications/test',
      'POST /api/notifications/test',
      'GET /api/notifications/unread',
      'GET /api/notifications/stats',
      'GET /api/notifications',
      'GET /api/notifications/:id',
      'PATCH /api/notifications/:id/read',
      'PATCH /api/notifications/:id/unread',
      'PATCH /api/notifications/read-all',
      'DELETE /api/notifications/:id',
      'DELETE /api/notifications/read'
    ]
  });
});

router.post('/test', (req, res) => {
  console.log('🧪 Notification test route accessed (POST)');
  res.json({
    success: true,
    message: 'Notification routes are working! (POST)',
    method: 'POST',
    body: req.body,
    timestamp: new Date().toISOString(),
    note: 'This is a test endpoint. Use other routes for actual notification operations.'
  });
});

// ===========================================
// SPECIAL ROUTES (Must be before /:id routes)
// ===========================================

/**
 * @route   GET /api/notifications/unread
 * @desc    Get unread notifications for current user
 * @access  Private (All authenticated users)
 */
router.get('/unread', (req, res, next) => {
  console.log('📬 Get unread notifications route accessed');
  next();
}, authMiddleware, getUnreadNotifications);

/**
 * @route   GET /api/notifications/stats
 * @desc    Get notification statistics for current user
 * @access  Private (All authenticated users)
 */
router.get('/stats', (req, res, next) => {
  console.log('📊 Notification stats route accessed');
  next();
}, authMiddleware, getStats);

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all notifications as read for current user
 * @access  Private (All authenticated users)
 */
router.patch('/read-all', (req, res, next) => {
  console.log('✅ Mark all notifications as read route accessed');
  next();
}, authMiddleware, markAllAsRead);

/**
 * @route   DELETE /api/notifications/read
 * @desc    Delete all read notifications for current user
 * @access  Private (All authenticated users)
 */
router.delete('/read', (req, res, next) => {
  console.log('🗑️  Delete all read notifications route accessed');
  next();
}, authMiddleware, deleteAllRead);

// ===========================================
// GET ALL NOTIFICATIONS
// ===========================================

/**
 * @route   GET /api/notifications
 * @desc    Get notifications for current user (with pagination and filters)
 * @access  Private (All authenticated users)
 */
router.get('/', (req, res, next) => {
  console.log('📋 Get notifications route accessed');
  console.log('🔍 Query params:', req.query);
  next();
}, authMiddleware, getNotifications);

// ===========================================
// SINGLE NOTIFICATION ROUTES
// ===========================================

/**
 * @route   GET /api/notifications/:id
 * @desc    Get single notification by ID
 * @access  Private (Notification owner only)
 */
router.get('/:id', (req, res, next) => {
  console.log(`🔍 Get notification by ID route accessed: ${req.params.id}`);
  next();
}, authMiddleware, getNotificationById);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private (Notification owner only)
 */
router.patch('/:id/read', (req, res, next) => {
  console.log(`✅ Mark notification as read route accessed: ${req.params.id}`);
  next();
}, authMiddleware, markAsRead);

/**
 * @route   PATCH /api/notifications/:id/unread
 * @desc    Mark notification as unread
 * @access  Private (Notification owner only)
 */
router.patch('/:id/unread', (req, res, next) => {
  console.log(`📬 Mark notification as unread route accessed: ${req.params.id}`);
  next();
}, authMiddleware, markAsUnread);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Private (Notification owner only)
 */
router.delete('/:id', (req, res, next) => {
  console.log(`🗑️  Delete notification route accessed: ${req.params.id}`);
  next();
}, authMiddleware, deleteNotification);

console.log('✅ Notification routes loaded successfully');

// Log all registered routes for debugging
console.log('📋 Registered Notification Routes:');
console.log('   GET  /test                    - Test route (public)');
console.log('   POST /test                    - Test route (public)');
console.log('   GET  /unread                  - Get unread notifications (authenticated)');
console.log('   GET  /stats                   - Get statistics (authenticated)');
console.log('   PATCH /read-all               - Mark all as read (authenticated)');
console.log('   DELETE /read                  - Delete all read (authenticated)');
console.log('   GET  /                        - Get all notifications (authenticated)');
console.log('   GET  /:id                     - Get notification by ID (owner)');
console.log('   PATCH /:id/read               - Mark as read (owner)');
console.log('   PATCH /:id/unread             - Mark as unread (owner)');
console.log('   DELETE /:id                   - Delete notification (owner)');

module.exports = router;
