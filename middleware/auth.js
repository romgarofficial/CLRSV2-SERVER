const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ===========================================
// AUTH MIDDLEWARE
// ===========================================

/**
 * Authentication middleware
 * - Validates JWT token from Authorization header
 * - Attaches decoded user info to req.user
 * - Blocks users who have not verified their email
 */
const authMiddleware = async (req, res, next) => {
  let token;

  try {
    // 1. Extract token from headers.authorization = "Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. If missing → return error
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided.'
      });
    }

    // 3. Verify token using jsonwebtoken
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.'
      });
    }

    // 4. Decode token → extract userId and role
    const { userId, role } = decoded;

    // 5. Fetch user from DB using userId
    const user = await User.findById(userId);

    // 6. Block if user does NOT exist
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Block if user is not active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated.'
      });
    }

    // 6. Block if user.isEmailVerified === false
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email to continue.'
      });
    }

    // 7. Attach user to request
    req.user = {
      id: user._id,
      role: user.role,
      email: user.email,
      fullName: user.fullName
    };

    // 8. Allow request to continue
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

// Legacy middleware (keeping for backward compatibility)
const protect = authMiddleware;

// Legacy authorize function (keeping for backward compatibility)  
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { authMiddleware, protect, authorize };
