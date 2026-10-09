const jwt = require('jsonwebtoken');

/**
 * Core Authentication Middleware
 * Validates JWT Bearer tokens and attaches the authenticated user to req.user
 */
const verifyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Missing or malformed Bearer token.',
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'profit_gym_dev_secret_key_change_in_production_938472';

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Session expired. Please log in again.',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid or forged authentication token.',
      });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: (decoded.role || 'MEMBER').toUpperCase(),
      fullName: decoded.fullName,
    };

    next();
  } catch (error) {
    console.error('[Auth Middleware Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication processing failed.',
    });
  }
};

/**
 * Role-Based Access Control Middleware Generator
 * @param  {...string} allowedRoles Roles permitted to access the route
 */
const requireRole = (...allowedRoles) => {
  const normalized = allowedRoles.map((r) => r.toUpperCase());

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const userRole = (req.user.role || '').toUpperCase();
    if (!normalized.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${userRole}' is not authorized for this resource.`,
      });
    }

    next();
  };
};

const requireAdmin = [verifyAuth, requireRole('ADMIN')];
const requireTrainer = [verifyAuth, requireRole('TRAINER', 'ADMIN')];
const requireMember = [verifyAuth, requireRole('MEMBER', 'TRAINER', 'ADMIN')];

module.exports = {
  verifyAuth,
  requireRole,
  requireAdmin,
  requireTrainer,
  requireMember,
  // Backward compatibility
  verifyAdmin: requireAdmin,
};
