const express = require('express');
const { 
  registerUser, 
  verifyOTP,
  resendOTP,
  loginUser, 
  getMe,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const { authMiddleware, requireRole } = require('../middleware');
const { protect } = require('../middleware/auth'); // Legacy middleware for backward compatibility

const router = express.Router();

// ===========================================
// PUBLIC ROUTES
// ===========================================

// @route   POST /api/auth/register
// @desc    Register a new user and send OTP
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/verify-otp
// @desc    Verify email using OTP
// @access  Public
router.post('/verify-otp', verifyOTP);

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP for email verification
// @access  Public
router.post('/resend-otp', resendOTP);

// @route   POST /api/auth/login
// @desc    Login user (requires email verification)
// @access  Public
router.post('/login', loginUser);

// ===========================================
// PROTECTED ROUTES
// ===========================================

// @route   GET /api/auth/me
// @desc    Get current logged in user (using new authMiddleware)
// @access  Private
router.get('/me', authMiddleware, getMe);

// @route   PUT /api/auth/me
// @desc    Update current user's profile details (name, contact)
// @access  Private
router.put('/me', authMiddleware, updateProfile);

// @route   GET /api/auth/profile
// @desc    Get user profile (alternative endpoint using new middleware)
// @access  Private
router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      user: req.user
    }
  });
});

// @route   PUT /api/auth/change-password
// @desc    Change current user's password
// @access  Private
router.put('/change-password', authMiddleware, changePassword);

// ===========================================
// ROLE-BASED PROTECTED ROUTES (EXAMPLES)
// ===========================================

// @route   GET /api/auth/admin-test
// @desc    Test admin access
// @access  Private (Admin only)
router.get('/admin-test', authMiddleware, requireRole('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Admin access granted',
    user: req.user
  });
});

// @route   GET /api/auth/faculty-test
// @desc    Test faculty and admin access
// @access  Private (Faculty and Admin only)
router.get('/faculty-test', authMiddleware, requireRole('faculty', 'admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Faculty/Admin access granted',
    user: req.user
  });
});

module.exports = router;
