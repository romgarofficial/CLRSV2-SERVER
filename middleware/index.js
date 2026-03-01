/**
 * ===========================================
 * MIDDLEWARE INDEX
 * ===========================================
 * Centralized exports for all middleware functions
 */

const { authMiddleware } = require('./authMiddleware');
const { requireRole } = require('./roleMiddleware');
const { protect, authorize } = require('./auth'); // Legacy middleware for backward compatibility
const errorHandler = require('./errorHandler');
const upload = require('./upload');

module.exports = {
  // New middleware (recommended)
  authMiddleware,
  requireRole,
  
  // Legacy middleware (for backward compatibility)
  protect,
  authorize,
  
  // Other middleware
  errorHandler,
  upload
};
