const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

/**
 * Middleware to authenticate requests to protected admin endpoints using JWT tokens.
 */
const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Valid Bearer authentication token is required.',
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'profit_gym_default_secret_key_change_in_prod';

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Your admin session has expired. Please log in again.',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization token.',
      });
    }

    // Verify admin in database if connected
    if (mongoose.connection.readyState === 1) {
      const admin = await Admin.findById(decoded.id).select('-password');
      if (!admin || !admin.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Admin account not found or has been deactivated.',
        });
      }
      req.admin = admin;
    } else {
      // In development fallback if database is restarting
      req.admin = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
    }

    next();
  } catch (error) {
    console.error('[Auth Middleware Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
    });
  }
};

module.exports = { verifyAdmin };
