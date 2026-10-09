const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const { verifyAdmin } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate administrator and return JWT token
 * @access  Public (Rate Limited)
 */
router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Both email and password are required.',
    });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database is currently offline. Please ensure MONGODB_URI is configured.',
    });
  }

  try {
    // Explicitly select password field which is excluded by default
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!admin || !admin.isActive) {
      // Use generic error message to prevent user enumeration
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Sign JWT Token
    const secret = process.env.JWT_SECRET || 'profit_gym_default_secret_key_change_in_prod';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        name: admin.name,
      },
      secret,
      { expiresIn }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin,
      },
    });
  } catch (error) {
    console.error('[Admin Login Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated admin profile
 * @access  Private
 */
router.get('/me', verifyAdmin, async (req, res) => {
  return res.status(200).json({
    success: true,
    admin: req.admin,
  });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Client-side token invalidation confirmation
 * @access  Public
 */
router.post('/logout', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Session terminated successfully.',
  });
});

module.exports = router;
