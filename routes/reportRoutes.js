/**
 * ===========================================
 * REPORT ROUTES
 * ===========================================
 * Defines all routes for report management with proper role-based access control.
 */

const express = require('express');

// Import controllers
const {
  createReport,
  getMyReports,
  getAllReports,
  getReportById,
  updateReportStatus,
  addCustodianNote,
  updateReportDetails,
  deleteReport,
  getReportStats
} = require('../controllers/reportController');

// Import middleware
const { authMiddleware, requireRole } = require('../middleware');

const router = express.Router();

// Add logging to verify routes are being loaded
console.log('📋 Report routes loading...');

// ===========================================
// DEBUGGING MIDDLEWARE
// ===========================================

// Add debugging middleware to log all requests
router.use((req, res, next) => {
  console.log(`🛣️  Report route: ${req.method} ${req.originalUrl}`);
  console.log(`📊 Headers:`, req.headers.authorization ? 'Auth token present' : 'No auth token');
  console.log(`👤 User Role:`, req.user?.role || 'Not authenticated');
  next();
});

// ===========================================
// TEST ROUTES
// ===========================================

// Add a simple test route to verify the routes are working
router.get('/test', (req, res) => {
  console.log('🧪 Report test route accessed (GET)');
  res.json({
    success: true,
    message: 'Report routes are working! (GET)',
    method: 'GET',
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET /api/reports/test',
      'POST /api/reports/test',
      'POST /api/reports',
      'GET /api/reports/me',
      'GET /api/reports/stats',
      'GET /api/reports',
      'GET /api/reports/:id',
      'PUT /api/reports/:id/status',
      'POST /api/reports/:id/notes',
      'PUT /api/reports/:id',
      'DELETE /api/reports/:id'
    ]
  });
});

router.post('/test', (req, res) => {
  console.log('🧪 Report test route accessed (POST)');
  res.json({
    success: true,
    message: 'Report routes are working! (POST)',
    method: 'POST',
    body: req.body,
    timestamp: new Date().toISOString(),
    note: 'This is a test endpoint. Use other routes for actual report operations.'
  });
});

// ===========================================
// REPORT STATISTICS (Must be before /:id routes)
// ===========================================

/**
 * @route   GET /api/reports/stats
 * @desc    Get report statistics
 * @access  Private (Lab Custodian, Admin)
 */
router.get('/stats', (req, res, next) => {
  console.log('📊 Report stats route accessed');
  next();
}, authMiddleware, requireRole('lab_custodian', 'admin'), getReportStats);

// ===========================================
// USER'S OWN REPORTS (Must be before /:id routes)
// ===========================================

/**
 * @route   GET /api/reports/me
 * @desc    Get current user's reports
 * @access  Private (All authenticated users)
 */
router.get('/me', (req, res, next) => {
  console.log('👤 Get my reports route accessed');
  next();
}, authMiddleware, getMyReports);

// ===========================================
// CREATE REPORT
// ===========================================

/**
 * @route   POST /api/reports
 * @desc    Create new report
 * @access  Private (Student, Faculty, Lab Custodian, Admin)
 */
router.post('/', (req, res, next) => {
  console.log('📝 Create report route accessed');
  next();
}, 
authMiddleware, 
requireRole('student', 'faculty', 'lab_custodian', 'admin'),
createReport);

// ===========================================
// GET ALL REPORTS
// ===========================================

/**
 * @route   GET /api/reports
 * @desc    Get all reports (with filters)
 * @access  Private (Lab Custodian, Admin)
 */
router.get('/', (req, res, next) => {
  console.log('📋 Get all reports route accessed');
  console.log('🔍 Query params:', req.query);
  next();
}, authMiddleware, requireRole('lab_custodian', 'admin'), getAllReports);

// ===========================================
// GET SINGLE REPORT
// ===========================================

/**
 * @route   GET /api/reports/:id
 * @desc    Get single report by ID
 * @access  Private (Reporter can view own, Custodian/Admin can view all)
 */
router.get('/:id', (req, res, next) => {
  console.log(`🔍 Get report by ID route accessed: ${req.params.id}`);
  next();
}, authMiddleware, getReportById);

// ===========================================
// UPDATE REPORT STATUS
// ===========================================

/**
 * @route   PUT /api/reports/:id/status
 * @desc    Update report status
 * @access  Private (Lab Custodian, Admin)
 */
router.put('/:id/status', (req, res, next) => {
  console.log(`🔄 Update report status route accessed: ${req.params.id}`);
  console.log(`📊 New status:`, req.body.newStatus);
  next();
}, authMiddleware, requireRole('lab_custodian', 'admin'), updateReportStatus);

// ===========================================
// ADD CUSTODIAN NOTE
// ===========================================

/**
 * @route   POST /api/reports/:id/notes
 * @desc    Add custodian note to report
 * @access  Private (Lab Custodian, Admin)
 */
router.post('/:id/notes', (req, res, next) => {
  console.log(`📝 Add custodian note route accessed: ${req.params.id}`);
  next();
}, authMiddleware, requireRole('lab_custodian', 'admin'), addCustodianNote);

// ===========================================
// UPDATE REPORT DETAILS
// ===========================================

/**
 * @route   PUT /api/reports/:id
 * @desc    Update report details
 * @access  Private (Lab Custodian, Admin)
 */
router.put('/:id', (req, res, next) => {
  console.log(`✏️  Update report details route accessed: ${req.params.id}`);
  next();
}, 
authMiddleware, 
requireRole('lab_custodian', 'admin'),
updateReportDetails);

// ===========================================
// DELETE REPORT
// ===========================================

/**
 * @route   DELETE /api/reports/:id
 * @desc    Soft delete report
 * @access  Private (Admin only)
 */
router.delete('/:id', (req, res, next) => {
  console.log(`🗑️  Delete report route accessed: ${req.params.id}`);
  next();
}, authMiddleware, requireRole('admin'), deleteReport);

console.log('✅ Report routes loaded successfully');

// Log all registered routes for debugging
console.log('📋 Registered Report Routes:');
console.log('   GET  /test                    - Test route (public)');
console.log('   POST /test                    - Test route (public)');
console.log('   GET  /stats                   - Get statistics (custodian/admin)');
console.log('   GET  /me                      - Get my reports (authenticated)');
console.log('   POST /                        - Create report (student+/auth)');
console.log('   GET  /                        - Get all reports (custodian/admin)');
console.log('   GET  /:id                     - Get report by ID (owner/custodian/admin)');
console.log('   PUT  /:id/status              - Update status (custodian/admin)');
console.log('   POST /:id/notes               - Add note (custodian/admin)');
console.log('   PUT  /:id                     - Update details (custodian/admin)');
console.log('   DELETE /:id                   - Delete report (admin)');

module.exports = router;
