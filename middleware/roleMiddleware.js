/**
 * ===========================================
 * ROLE MIDDLEWARE
 * ===========================================
 * Create a middleware factory for role-based access control
 */

/**
 * Role-based access control middleware factory
 * @param {...string} allowedRoles - List of roles that are allowed to access the route
 * @returns {Function} Express middleware function
 * 
 * Usage example:
 * router.get("/admin-only", authMiddleware, requireRole("admin"), handler)
 * router.post("/faculty-and-admin", authMiddleware, requireRole("faculty", "admin"), handler)
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user exists on request (should be set by authMiddleware)
      if (!req.user || !req.user.role) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.'
        });
      }

      // Check if the user's role is NOT in allowedRoles
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.'
        });
      }

      // User has required role, continue to next middleware/handler
      next();

    } catch (error) {
      console.error('Role middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during role verification.'
      });
    }
  };
};

module.exports = { requireRole };
