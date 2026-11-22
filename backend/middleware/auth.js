/* ============================================================
   JWT Auth Middleware — Protects routes requiring authentication
   ============================================================ */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'agri_connect_local_dev_secret_2026';

/**
 * Verifies JWT token from Authorization header.
 * Attaches the authenticated user to req.user.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Bearer header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please log in.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find user (exclude password)
    const user = await User.findById(decoded.id).select(
      '-password -resetOTP -resetOTPHash -resetOTPExpiry -resetOTPAttempts -resetOTPRequestedAt'
    );
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Please log in again.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
    }
    next(error);
  }
};

/**
 * Role-based authorization middleware.
 * Usage: authorize('farmer', 'machine_owner')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    const hasRole = roles.some((role) => req.user.roles.includes(role));
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
