/**
 * ===========================================
 * MIDDLEWARE USAGE EXAMPLES
 * ===========================================
 * This file demonstrates how to use the new authentication and role middleware
 */

const express = require('express');
const { authMiddleware, requireRole } = require('../middleware');

const router = express.Router();

// ===========================================
// USAGE EXAMPLES
// ===========================================

// 1. Basic authenticated route (any verified user)
router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'User profile accessed',
    user: req.user
  });
});

// 2. Admin only route
router.get('/admin-dashboard', authMiddleware, requireRole('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Admin dashboard accessed',
    user: req.user
  });
});

// 3. Faculty and Admin route
router.get('/faculty-resources', authMiddleware, requireRole('faculty', 'admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Faculty resources accessed',
    user: req.user
  });
});

// 4. Lab Custodian and Admin route
router.get('/lab-management', authMiddleware, requireRole('lab_custodian', 'admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Lab management accessed',
    user: req.user
  });
});

// 5. Student, Faculty, and Admin route
router.get('/reports', authMiddleware, requireRole('student', 'faculty', 'admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Reports accessed',
    user: req.user
  });
});

// 6. Multiple middleware example
router.post('/admin-create-user', 
  authMiddleware,           // First: Authenticate user
  requireRole('admin'),     // Second: Check if user is admin
  (req, res) => {          // Third: Handle the request
    res.json({
      success: true,
      message: 'User creation endpoint (admin only)',
      user: req.user
    });
  }
);

module.exports = router;

/*
===========================================
MIDDLEWARE FLOW EXPLANATION:
===========================================

1. authMiddleware:
   - Extracts JWT token from Authorization header
   - Verifies token validity
   - Fetches user from database
   - Checks if user exists and is active
   - Checks if user has verified their email
   - Attaches user info to req.user
   - If any check fails, returns appropriate error

2. requireRole(...roles):
   - Assumes req.user exists (set by authMiddleware)
   - Checks if user.role is in the allowed roles list
   - If not authorized, returns 403 error
   - If authorized, continues to next middleware/handler

3. Request Flow:
   Request → authMiddleware → requireRole → Route Handler
   
   If authMiddleware fails: Return 401/403 error
   If requireRole fails: Return 403 error
   If both pass: Execute route handler

===========================================
EXAMPLE ERROR RESPONSES:
===========================================

No token:
{
  "success": false,
  "message": "No authorization token provided."
}

Invalid token:
{
  "success": false,
  "message": "Invalid or expired token."
}

Email not verified:
{
  "success": false,
  "message": "Please verify your email to continue."
}

Insufficient permissions:
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}

*/
