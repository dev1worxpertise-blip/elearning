/**
 * JWT Authentication & Role Authorization Middleware (Hardened for VAPT)
 */
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'learnpulse_jwt_secret_key_default';

/**
 * Strict JWT Verification Middleware
 * Requires a valid Bearer token in the Authorization header.
 * Rejects missing or invalid tokens with HTTP 401 Unauthorized.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Missing or malformed Authorization header. Bearer token required.',
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token || token.trim() === '') {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Empty token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session Expired: Your authentication token has expired. Please sign in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Invalid or tampered authentication token.',
    });
  }
};

/**
 * Optional Auth Middleware
 * Attaches user if valid token exists, but permits guests.
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      // Ignore invalid token in optional mode
    }
  }
  next();
};

/**
 * Strict Role Guard Middleware (RBAC)
 * Enforces that the authenticated user possesses one of the allowed roles.
 * Rejects unauthorized users with HTTP 403 Forbidden.
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before checking role authorization.',
      });
    }

    const userRole = (req.user.role || '').toLowerCase();
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Insufficient permissions. Required role: [${allowedRoles.join(', ')}], your role: [${req.user.role || 'unknown'}].`,
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  optionalAuth,
  requireRole,
};
