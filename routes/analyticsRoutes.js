/**
 * ===========================================
 * ANALYTICS ROUTES
 * ===========================================
 * Defines all routes for analytics and reporting with proper role-based access control
 * Only lab_custodian and admin roles can access analytics endpoints
 */

const express = require('express');

// Import controllers
const {
  getSummary,
  getStatusCount,
  getReportsByLab,
  getCommonIssues,
  getMonthlyReports,
  getDailyTrend,
  getLabHeatmap,
  getCustodianPerformance,
  getTopStudents,
  getTopFaculty,
  getTopReporters,
  getTopCustodianWeek,
  getNewsAnalyticsSummary
} = require('../controllers/analyticsController');

// Import middleware
const { authMiddleware, requireRole } = require('../middleware');

const router = express.Router();

// Add logging to verify routes are being loaded
console.log('📊 Analytics routes loading...');

// ===========================================
// DEBUGGING MIDDLEWARE
// ===========================================

// Add debugging middleware to log all requests
router.use((req, res, next) => {
  console.log(`🛣️  Analytics route: ${req.method} ${req.originalUrl}`);
  console.log(`📊 Headers:`, req.headers.authorization ? 'Auth token present' : 'No auth token');
  console.log(`👤 User Role:`, req.user?.role || 'Not authenticated');
  next();
});

// ===========================================
// TEST ROUTES
// ===========================================

// Add a simple test route to verify the routes are working
router.get('/test', (req, res) => {
  console.log('🧪 Analytics test route accessed (GET)');
  res.json({
    success: true,
    message: 'Analytics routes are working! (GET)',
    method: 'GET',
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET /api/analytics/test',
      'POST /api/analytics/test',
      'GET /api/analytics/summary',
      'GET /api/analytics/status-count',
      'GET /api/analytics/by-lab',
      'GET /api/analytics/common-issues',
      'GET /api/analytics/monthly',
      'GET /api/analytics/daily',
      'GET /api/analytics/lab-heatmap',
      'GET /api/analytics/custodian-performance',
      'GET /api/analytics/top-students',
      'GET /api/analytics/top-faculty',
      'GET /api/analytics/top-reporters',
      'GET /api/analytics/top-custodian-week'
    ]
  });
});

router.post('/test', (req, res) => {
  console.log('🧪 Analytics test route accessed (POST)');
  res.json({
    success: true,
    message: 'Analytics routes are working! (POST)',
    method: 'POST',
    body: req.body,
    timestamp: new Date().toISOString(),
    note: 'This is a test endpoint. Use other routes for actual analytics operations.'
  });
});

// ===========================================
// ANALYTICS ENDPOINTS
// ===========================================

/**
 * @route   GET /api/analytics/summary
 * @desc    Get summary analytics metrics
 * @access  Private (Lab Custodian, Admin)
 */
router.get('/summary', (req, res, next) => {
  console.log('📊 Analytics summary route accessed');
  next();
}, authMiddleware, requireRole('lab_custodian', 'admin'), getSummary);

/**
 * @route   GET /api/analytics/status-count
 * @desc    Get report counts by status
 * @access  Private (Lab Custodian, Admin)
 */
router.get('/status-count', (req, res, next) => {
  console.log('📈 Status count analytics route accessed');
  next();
}, authMiddleware, requireRole('lab_custodian', 'admin'), getStatusCount);

/**
 * @route   GET /api/analytics/by-lab
 * @desc    Get report counts by laboratory
 * @access  Private (Lab Custodian, Admin)
 */
router.get('/by-lab', (req, res, next) => {
  console.log('🏢 Reports by laboratory analytics route accessed');
  next();
}, authMiddleware, requireRole('lab_custodian', 'admin'), getReportsByLab);

/**
 * @route   GET /api/analytics/common-issues
 * @desc    Get most common issue categories
 * @access  Private (Lab Custodian, Admin)
 */
router.get('/common-issues', (req, res, next) => {
  console.log('🔧 Common issues analytics route accessed');
  next();
}, authMiddleware, requireRole('lab_custodian', 'admin'), getCommonIssues);

/**
 * @route   GET /api/analytics/monthly
 * @desc    Get monthly report trend (last 12 months)
 * @access  Private (Lab Custodian, Admin)
 */
router.get('/monthly', (req, res, next) => {
  console.log('📅 Monthly trend analytics route accessed');
  next();
}, authMiddleware, requireRole('lab_custodian', 'admin'), getMonthlyReports);

/**
 * @route   GET /api/analytics/daily
 * @desc    Get daily report trend (last 30 days)
 * @access  Private (Lab Custodian, Admin)
 */
router.get('/daily', (req, res, next) => {
  console.log('📊 Daily trend analytics route accessed');
  next();
}, authMiddleware, requireRole('lab_custodian', 'admin'), getDailyTrend);

/**
 * @route   GET /api/analytics/lab-heatmap
 * @desc    Get laboratory workstation problem heatmap
 * @access  Private (Lab Custodian, Admin)
 */
router.get('/lab-heatmap', (req, res, next) => {
  console.log('🗺️  Laboratory heatmap analytics route accessed');
  next();
}, authMiddleware, requireRole('lab_custodian', 'admin'), getLabHeatmap);

/**
 * @route   GET /api/analytics/custodian-performance
 * @desc    Get custodian performance metrics
 * @access  Private (Lab Custodian, Admin)
 */
router.get('/custodian-performance', (req, res, next) => {
  console.log('👨‍🔧 Custodian performance analytics route accessed');
  next();
}, authMiddleware, requireRole('lab_custodian', 'admin'), getCustodianPerformance);

/**
 * @route   GET /api/analytics/top-students
 * @desc    Get top reporting students
 * @access  Private (Lab Custodian, Admin)
 */
router.get('/top-students', (req, res, next) => {
  console.log('🎓 Top students analytics route accessed');
  next();
}, authMiddleware, requireRole('lab_custodian', 'admin'), getTopStudents);

/**
 * @route   GET /api/analytics/top-faculty
 * @desc    Get top reporting faculty
 * @access  Private (Lab Custodian, Admin)
 */
router.get('/top-faculty', (req, res, next) => {
  console.log('👨‍🏫 Top faculty analytics route accessed');
  next();
}, authMiddleware, requireRole('lab_custodian', 'admin'), getTopFaculty);

/**
 * @route   GET /api/analytics/top-reporters
 * @desc    Get top reporters (students and faculty combined)
 * @access  Private (Lab Custodian, Admin)
 */
router.get('/top-reporters', (req, res, next) => {
  console.log('🏆 Top reporters analytics route accessed');
  next();
}, authMiddleware, requireRole('lab_custodian', 'admin'), getTopReporters);

/**
 * @route   GET /api/analytics/top-custodian-week
 * @desc    Get top custodian of the week
 * @access  Private (Lab Custodian, Admin)
 */
router.get('/top-custodian-week', (req, res, next) => {
  console.log('🏅 Top custodian weekly analytics route accessed');
  next();
}, authMiddleware, requireRole('lab_custodian', 'admin'), getTopCustodianWeek);

/**
 * @route   GET /api/analytics/news-summary
 * @desc    Get news and reactions analytics summary
 * @access  Private (Lab Custodian, Admin)
 */
router.get('/news-summary', (req, res, next) => {
  console.log('📰 News analytics summary route accessed');
  next();
}, authMiddleware, requireRole('lab_custodian', 'admin'), getNewsAnalyticsSummary);

console.log('✅ Analytics routes loaded successfully');

// Log all registered routes for debugging
console.log('📊 Registered Analytics Routes:');
console.log('   GET  /test                         - Test route (public)');
console.log('   POST /test                         - Test route (public)');
console.log('   GET  /summary                      - Summary metrics (lab_custodian, admin)');
console.log('   GET  /status-count                 - Status count (lab_custodian, admin)');
console.log('   GET  /by-lab                       - Reports by lab (lab_custodian, admin)');
console.log('   GET  /common-issues                - Common issues (lab_custodian, admin)');
console.log('   GET  /monthly                      - Monthly trend (lab_custodian, admin)');
console.log('   GET  /daily                        - Daily trend (lab_custodian, admin)');
console.log('   GET  /lab-heatmap                  - Lab heatmap (lab_custodian, admin)');
console.log('   GET  /custodian-performance        - Custodian performance (lab_custodian, admin)');
console.log('   GET  /top-students                 - Top students (lab_custodian, admin)');
console.log('   GET  /top-faculty                  - Top faculty (lab_custodian, admin)');
console.log('   GET  /top-reporters                - Top reporters (lab_custodian, admin)');
console.log('   GET  /top-custodian-week           - Weekly custodian leaderboard (lab_custodian, admin)');

module.exports = router;
