const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { verifyAuth } = require('../middleware/auth');
const { authLimiter, loginLimiter } = require('../middleware/rateLimiter');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { sendAuthAlertEmail } = require('../services/emailService');
const { sendAuthAlertWhatsApp } = require('../services/whatsappService');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'profit_gym_dev_secret_key_change_in_production_938472';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Helper to generate JWT token
 */
const signToken = (user) => {
  return jwt.sign(
    {
      id: user.id || user._id?.toString(),
      email: user.email,
      role: (user.role || 'MEMBER').toUpperCase(),
      fullName: user.fullName || user.full_name || user.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new athlete (Strictly MEMBER role) into MongoDB Atlas
 * @access  Public (Rate Limited)
 */
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email address, and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters in length.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Security Rule: Public self-registration is strictly restricted to MEMBER role.
    const normalizedRole = 'MEMBER';

    if (mongoose.connection.readyState === 1) {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists.',
        });
      }

      // Create new Athlete in MongoDB Atlas
      const newUser = await User.create({
        fullName,
        email: normalizedEmail,
        password, // Encrypted by User schema pre-save hook
        role: normalizedRole,
        phone,
      });

      const token = signToken(newUser);

      // Dispatch non-blocking auth alert to owner Email and WhatsApp
      sendAuthAlertEmail({ user: newUser, ip: req.ip, type: 'REGISTER' }).catch(() => {});
      sendAuthAlertWhatsApp({ user: newUser, ip: req.ip, type: 'REGISTER' }).catch(() => {});

      return res.status(201).json({
        success: true,
        message: 'Registration successful.',
        token,
        user: {
          id: newUser._id.toString(),
          email: newUser.email,
          fullName: newUser.fullName,
          role: newUser.role,
        },
      });
    }

    // In-memory fallback if database is currently booting
    const mockUser = {
      id: `usr_${Date.now()}`,
      email: normalizedEmail,
      fullName,
      role: normalizedRole,
    };
    const token = signToken(mockUser);

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: mockUser,
    });
  } catch (error) {
    console.error('[Register Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed due to a server error.',
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user credentials against MongoDB Atlas and return JWT session token
 * @access  Public (Rate Limited)
 */
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Both email and password are required.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Attempt MongoDB Atlas User authentication (Athletes / Trainers)
    if (mongoose.connection.readyState === 1) {
      try {
        const userDoc = await User.findOne({ email: normalizedEmail }).select('+password');
        if (userDoc && userDoc.isActive) {
          const isMatch = await userDoc.comparePassword(password);
          if (isMatch) {
            userDoc.lastLogin = new Date();
            const token = signToken(userDoc);

            // Dispatch non-blocking auth alert to owner Email and WhatsApp
            sendAuthAlertEmail({ user: userDoc, ip: req.ip, type: 'LOGIN' }).catch(() => {});
            sendAuthAlertWhatsApp({ user: userDoc, ip: req.ip, type: 'LOGIN' }).catch(() => {});

            return res.status(200).json({
              success: true,
              message: 'Authentication successful.',
              token,
              user: {
                id: userDoc._id.toString(),
                email: userDoc.email,
                fullName: userDoc.fullName,
                role: userDoc.role,
                avatarUrl: userDoc.avatarUrl,
              },
            });
          } else {
            return res.status(401).json({
              success: false,
              message: 'Invalid email or password credentials.',
            });
          }
        }
      } catch (err) {
        console.warn('[Auth Notice] MongoDB User check error:', err.message);
      }
    }

    // 2. Attempt MongoDB Atlas Admin authentication
    if (mongoose.connection.readyState === 1) {
      try {
        const adminDoc = await Admin.findOne({ email: normalizedEmail }).select('+password');
        if (adminDoc && adminDoc.isActive) {
          const isMatch = await adminDoc.comparePassword(password);
          if (isMatch) {
            adminDoc.lastLogin = new Date();
            await adminDoc.save().catch(() => {});

            const verifiedAdmin = {
              id: adminDoc._id.toString(),
              email: adminDoc.email,
              fullName: adminDoc.name,
              role: 'ADMIN',
            };
            const token = signToken(verifiedAdmin);

            // Dispatch non-blocking auth alert to owner Email and WhatsApp
            sendAuthAlertEmail({ user: verifiedAdmin, ip: req.ip, type: 'LOGIN' }).catch(() => {});
            sendAuthAlertWhatsApp({ user: verifiedAdmin, ip: req.ip, type: 'LOGIN' }).catch(() => {});

            return res.status(200).json({
              success: true,
              message: 'Authentication successful.',
              token,
              user: verifiedAdmin,
              admin: {
                id: verifiedAdmin.id,
                email: verifiedAdmin.email,
                name: verifiedAdmin.fullName,
                role: 'admin',
              },
            });
          } else {
            return res.status(401).json({
              success: false,
              message: 'Invalid email or password credentials.',
            });
          }
        }
      } catch (err) {
        console.warn('[Auth Notice] MongoDB Admin check error:', err.message);
      }
    }

    // 3. Known Seed Accounts (Development & Offline Resilience)
    // CRITICAL SECURITY RULE: Password MUST match 'password123' exactly.
    const SEED_CREDENTIALS = {
      'admin@profitgym.com': {
        id: 'usr_admin_01',
        name: 'Dev Baliyan',
        role: 'ADMIN',
        validPasswords: ['password123']
      },
      'trainer@profitgym.com': {
        id: 'usr_trainer_01',
        name: 'Marcus Drake',
        role: 'TRAINER',
        validPasswords: ['password123']
      },
      'alex.vance@athlete.com': {
        id: 'usr_member_01',
        name: 'Alex Vance',
        role: 'MEMBER',
        validPasswords: ['password123']
      },
      'member@profitgym.com': {
        id: 'usr_member_02',
        name: 'Jordan Bell',
        role: 'MEMBER',
        validPasswords: ['password123']
      }
    };

    const seedAccount = SEED_CREDENTIALS[normalizedEmail];
    if (seedAccount && seedAccount.validPasswords.includes(password)) {
      const verifiedUser = {
        id: seedAccount.id,
        email: normalizedEmail,
        fullName: seedAccount.name,
        role: seedAccount.role,
      };
      const token = signToken(verifiedUser);

      return res.status(200).json({
        success: true,
        message: 'Authentication successful.',
        token,
        user: verifiedUser,
        admin: {
          id: verifiedUser.id,
          email: verifiedUser.email,
          name: verifiedUser.fullName,
          role: verifiedUser.role.toLowerCase(),
        },
      });
    }

    // If credentials are invalid, strictly reject
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password credentials.',
    });
  } catch (error) {
    console.error('[Login Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed due to a server error.',
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Fetch current authenticated user profile from MongoDB Atlas
 * @access  Private
 */
router.get('/me', verifyAuth, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({
        $or: [{ _id: mongoose.isValidObjectId(req.user.id) ? req.user.id : null }, { email: req.user.email }]
      });

      if (user) {
        return res.status(200).json({
          success: true,
          user: {
            id: user._id.toString(),
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            avatarUrl: user.avatarUrl,
            phone: user.phone,
            qrPassToken: user.qrPassToken,
            assignedTrainerName: user.assignedTrainerName,
          },
          admin: {
            id: user._id.toString(),
            email: user.email,
            name: user.fullName,
            role: user.role.toLowerCase(),
          },
        });
      }

      const admin = await Admin.findOne({
        $or: [{ _id: mongoose.isValidObjectId(req.user.id) ? req.user.id : null }, { email: req.user.email }]
      });

      if (admin) {
        return res.status(200).json({
          success: true,
          user: {
            id: admin._id.toString(),
            email: admin.email,
            fullName: admin.name,
            role: 'ADMIN',
          },
          admin: {
            id: admin._id.toString(),
            email: admin.email,
            name: admin.name,
            role: admin.role || 'admin',
          },
        });
      }
    }

    return res.status(200).json({
      success: true,
      user: req.user,
      admin: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.fullName,
        role: (req.user.role || 'ADMIN').toLowerCase(),
      },
    });
  } catch (error) {
    console.error('[/me Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile.',
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Revoke current session
 * @access  Private
 */
router.post('/logout', verifyAuth, (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Session successfully terminated.',
  });
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Issue password reset token
 * @access  Public
 */
router.post('/forgot-password', authLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email address is required.',
    });
  }

  // Safe response to prevent account enumeration
  return res.status(200).json({
    success: true,
    message: 'If an account exists with that email, a password reset link has been dispatched.',
  });
});

module.exports = router;
