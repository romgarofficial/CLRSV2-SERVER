/**
 * ===========================================
 * LABORATORY ROUTES
 * ===========================================
 * Defines all routes for laboratory management with proper role-based access control
 */

const express = require('express');
const {
  createLab,
  getLabs,
  getLabById,
  updateLab,
  deleteLab,
  reactivateLab,
  getLabStats
} = require('../controllers/laboratoryController');

// Import middleware
const { authMiddleware, requireRole } = require('../middleware');

const router = express.Router();

// Add logging to verify routes are being loaded
console.log('📋 Laboratory routes loading...');

// Test that Express router is working
console.log('🔧 Router type:', typeof router);
console.log('🔧 Router methods available:', typeof router.get, typeof router.post);

// Add debugging middleware to log all requests
router.use((req, res, next) => {
  console.log(`🛣️  Laboratory route: ${req.method} ${req.originalUrl}`);
  console.log(`📊 Headers:`, req.headers.authorization ? 'Auth token present' : 'No auth token');
  next();
});

// Add a simple test route to verify the routes are working (both GET and POST)
router.get('/test', (req, res) => {
  console.log('🧪 Laboratory test route accessed (GET)');
  res.json({
    success: true,
    message: 'Laboratory routes are working! (GET)',
    method: 'GET',
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET /api/laboratories/test',
      'POST /api/laboratories/test',
      'GET /api/laboratories',
      'GET /api/laboratories/:id',
      'GET /api/laboratories/admin/stats',
      'POST /api/laboratories',
      'PUT /api/laboratories/:id',
      'DELETE /api/laboratories/:id',
      'PATCH /api/laboratories/:id/reactivate'
    ]
  });
});

router.post('/test', (req, res) => {
  console.log('🧪 Laboratory test route accessed (POST)');
  res.json({
    success: true,
    message: 'Laboratory routes are working! (POST)',
    method: 'POST',
    body: req.body,
    timestamp: new Date().toISOString(),
    note: 'This is a test endpoint. Use other routes for actual lab operations.'
  });
});

// ===========================================
// PUBLIC ROUTES (All Authenticated Users)
// ===========================================

/**
 * @route   GET /api/laboratories/admin/stats
 * @desc    Get laboratory statistics
 * @access  Private (Admin + Lab Custodian only)
 * @note    This route must be defined before /:id to avoid conflicts
 */
router.get('/admin/stats', (req, res, next) => {
  console.log('📊 Laboratory stats route accessed');
  next();
}, authMiddleware, requireRole('admin', 'lab_custodian'), getLabStats);

/**
 * @route   GET /api/laboratories
 * @desc    Get all active laboratories
 * @access  Private (All authenticated users)
 */
router.get('/', (req, res, next) => {
  console.log('📋 GET /api/laboratories accessed');
  next();
}, authMiddleware, getLabs);

/**
 * @route   GET /api/laboratories/:id
 * @desc    Get single laboratory by ID
 * @access  Private (All authenticated users)
 */
router.get('/:id', authMiddleware, getLabById);

// ===========================================
// ADMIN + LAB CUSTODIAN ROUTES
// ===========================================

/**
 * @route   POST /api/laboratories
 * @desc    Create new laboratory
 * @access  Private (Admin + Lab Custodian only)
 */
router.post('/', 
  authMiddleware, 
  requireRole('admin', 'lab_custodian'), 
  createLab
);

/**
 * @route   PUT /api/laboratories/:id
 * @desc    Update laboratory
 * @access  Private (Admin + Lab Custodian only)
 */
router.put('/:id', 
  authMiddleware, 
  requireRole('admin', 'lab_custodian'), 
  updateLab
);

/**
 * @route   DELETE /api/laboratories/:id
 * @desc    Soft delete laboratory (set isActive = false)
 * @access  Private (Admin + Lab Custodian only)
 */
router.delete('/:id', 
  authMiddleware, 
  requireRole('admin', 'lab_custodian'), 
  deleteLab
);

// ===========================================
// ADMIN ONLY ROUTES
// ===========================================

/**
 * @route   PATCH /api/laboratories/:id/reactivate
 * @desc    Reactivate laboratory (set isActive = true)
 * @access  Private (Admin only)
 */
router.patch('/:id/reactivate', 
  authMiddleware, 
  requireRole('admin'), 
  reactivateLab
);

console.log('✅ Laboratory routes loaded successfully');

// Log all registered routes for debugging
console.log('📋 Registered Laboratory Routes:');
console.log('   GET  /test                    - Test route (public)');
console.log('   POST /test                    - Test route (public)');  
console.log('   GET  /admin/stats             - Get statistics (admin/custodian)');
console.log('   GET  /                        - Get all labs (authenticated)');
console.log('   GET  /:id                     - Get lab by ID (authenticated)');
console.log('   POST /                        - Create lab (admin/custodian)');
console.log('   PUT  /:id                     - Update lab (admin/custodian)');
console.log('   DELETE /:id                   - Delete lab (admin/custodian)');
console.log('   PATCH /:id/reactivate         - Reactivate lab (admin)');

module.exports = router;
