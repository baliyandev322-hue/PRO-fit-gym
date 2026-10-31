const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { verifyAuth } = require('../middleware/auth');
const { authLimiter, loginLimiter } = require('../middleware/rateLimiter');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Otp = require('../models/Otp');
const Membership = require('../models/Membership');
const { sendOtpVerificationEmail, sendAuthAlertEmail } = require('../services/emailService');
const { sendAuthAlertWhatsApp } = require('../services/whatsappService');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'profit_gym_super_secure_jwt_secret_key_2026_x92';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const bcrypt = require('bcryptjs');
const { readStore, saveRecord } = require('../config/localStore');

// In-memory OTP storage fallback (active during dev/testing or when DB is booting)
const devOtpStore = new Map();

// In-memory User storage fallback loaded with local persistent store
const inMemoryUsersStore = new Map();
try {
  const storedUsers = readStore().users || [];
  storedUsers.forEach((u) => {
    if (u && u.email) inMemoryUsersStore.set(u.email.toLowerCase().trim(), u);
  });
} catch {}

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
 * @route   POST /api/auth/send-otp
 * @desc    Generate and dispatch 6-digit email authorization OTP
 * @access  Public (Rate Limited)
 */
router.post('/send-otp', authLimiter, async (req, res) => {
  try {
    const { email, fullName = 'Athlete' } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required to dispatch an OTP.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if account already exists
    if (mongoose.connection.readyState === 1) {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists. Please log in.',
        });
      }
    }

    // Generate 6-digit numeric OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save to Database if connected
    if (mongoose.connection.readyState === 1) {
      try {
        await Otp.deleteMany({ email: normalizedEmail });
        await Otp.create({
          email: normalizedEmail,
          otp: otpCode,
          verified: false,
          expiresAt,
        });
      } catch (dbErr) {
        console.warn('[OTP Notice] Failed to save OTP in MongoDB, using in-memory fallback:', dbErr.message);
      }
    }

    // Save in in-memory fallback store
    devOtpStore.set(normalizedEmail, {
      otp: otpCode,
      verified: false,
      expiresAt,
    });

    // Send email via emailService
    const emailResult = await sendOtpVerificationEmail(normalizedEmail, otpCode, fullName);
    if (emailResult && !emailResult.success && emailResult.error) {
      return res.status(400).json({
        success: false,
        message: `Email dispatch failed: ${emailResult.error}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${normalizedEmail}.`,


    });
  } catch (error) {
    console.error('[Send OTP Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send verification code. Please try again.',
    });
  }
});

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify the 6-digit code provided by the athlete
 * @access  Public
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and 6-digit verification code are required.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();
    let isMatched = false;

    // Check MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      const record = await Otp.findOne({ email: normalizedEmail, otp: cleanOtp });
      if (record && record.expiresAt > new Date()) {
        record.verified = true;
        await record.save();
        isMatched = true;
      }
    }

    // Check in-memory store fallback
    if (!isMatched && devOtpStore.has(normalizedEmail)) {
      const record = devOtpStore.get(normalizedEmail);
      if (record.otp === cleanOtp && record.expiresAt > new Date()) {
        record.verified = true;
        isMatched = true;
      }
    }

    if (!isMatched) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code. Please request a new code.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Email address successfully verified.',
      email: normalizedEmail,
      isVerified: true,
    });
  } catch (error) {
    console.error('[Verify OTP Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Verification failed due to a server error.',
    });
  }
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new athlete with 4-step comprehensive onboarding data
 * @access  Public (Rate Limited)
 */
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { 
      email, 
      password, 
      fullName, 
      phone,
      dateOfBirth,
      gender,
      avatarUrl,
      address,
      membershipDetails,
      fitnessProfile
    } = req.body;

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
    const normalizedRole = 'MEMBER';

    // Calculate dates for membership
    const chosenPlan = membershipDetails || {
      planId: 'plan-performance',
      planName: 'Performance Tier',
      billingCycle: 'MONTHLY',
      price: 249,
    };

    const startDate = chosenPlan.startDate ? new Date(chosenPlan.startDate) : new Date();
    let daysToAdd = 30;
    if (chosenPlan.billingCycle === 'QUARTERLY') daysToAdd = 90;
    if (chosenPlan.billingCycle === 'ANNUAL') daysToAdd = 365;

    const expiryDate = chosenPlan.expiryDate 
      ? new Date(chosenPlan.expiryDate) 
      : new Date(startDate.getTime() + daysToAdd * 86400000);

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
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || '',
        avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        address: address || {},
        membershipDetails: {
          planId: chosenPlan.planId,
          planName: chosenPlan.planName,
          billingCycle: chosenPlan.billingCycle,
          startDate,
          expiryDate,
          price: chosenPlan.price || 249,
        },
        fitnessProfile: fitnessProfile || {},
      });

      // Provision active Membership record
      try {
        await Membership.create({
          userId: newUser._id.toString(),
          memberEmail: newUser.email,
          memberName: newUser.fullName,
          planId: chosenPlan.planId,
          planName: chosenPlan.planName,
          status: 'ACTIVE',
          startDate,
          expiryDate,
          price: chosenPlan.price || 249,
          daysRemaining: Math.ceil((expiryDate - new Date()) / 86400000),
          autoRenew: true,
        });
      } catch (mErr) {
        console.warn('[Membership Provision Notice]', mErr.message);
      }

      const token = signToken(newUser);

      // Dispatch non-blocking auth alert to owner Email and WhatsApp
      sendAuthAlertEmail({ user: newUser, ip: req.ip, type: 'REGISTER' }).catch(() => {});
      sendAuthAlertWhatsApp({ user: newUser, ip: req.ip, type: 'REGISTER' }).catch(() => {});

      return res.status(201).json({
        success: true,
        message: 'Athlete account created and access activated successfully.',
        token,
        user: {
          id: newUser._id.toString(),
          email: newUser.email,
          fullName: newUser.fullName,
          role: newUser.role,
          avatarUrl: newUser.avatarUrl,
          qrPassToken: newUser.qrPassToken,
          membershipDetails: newUser.membershipDetails,
          fitnessProfile: newUser.fitnessProfile,
        },
      });
    }

    // In-memory fallback if database is currently booting
    const mockUser = {
      id: `usr_${Date.now()}`,
      email: normalizedEmail,
      fullName,
      role: normalizedRole,
      phone,
      dateOfBirth,
      gender,
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      address: address || {},
      membershipDetails: {
        ...chosenPlan,
        startDate,
        expiryDate,
      },
      fitnessProfile: fitnessProfile || {},
      qrPassToken: `QR_${Date.now()}_MOCK`,
    };

    // Store in in-memory registry so the athlete can log in anytime (using bcrypt hash only)
    const passwordHash = await bcrypt.hash(password, 12);
    const userRecord = {
      ...mockUser,
      passwordHash,
    };
    inMemoryUsersStore.set(normalizedEmail, userRecord);
    saveRecord('users', userRecord);

    const token = signToken(mockUser);

    return res.status(201).json({
      success: true,
      message: 'Athlete account created and access activated successfully.',
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

    // 3. Attempt In-Memory Registered Athlete authentication (Non-Production fallback only)
    if (process.env.NODE_ENV !== 'production' && inMemoryUsersStore.has(normalizedEmail)) {
      const stored = inMemoryUsersStore.get(normalizedEmail);
      let isMatch = false;
      // Strictly require bcrypt hash verification; never compare plaintext passwords
      if (stored.passwordHash) {
        try {
          isMatch = await bcrypt.compare(password, stored.passwordHash);
        } catch (hashErr) {
          console.warn('[Auth Warning] In-memory hash comparison error:', hashErr.message);
        }
      }

      // Security Guardrail: In-memory store can NEVER issue administrative JWTs
      const assignedRole = (stored.role || 'MEMBER').toUpperCase();
      if (isMatch && assignedRole !== 'ADMIN') {
        const verifiedUser = {
          id: stored.id,
          email: stored.email,
          fullName: stored.fullName,
          role: assignedRole,
          avatarUrl: stored.avatarUrl,
        };
        const token = signToken(verifiedUser);
        return res.status(200).json({
          success: true,
          message: 'Authentication successful.',
          token,
          user: verifiedUser,
        });
      }
    }

    // Production Guardrail: Ensure production requests never bypass database authentication
    if (process.env.NODE_ENV === 'production' && mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Authentication service temporarily unavailable. Database connection offline.',
      });
    }

    // Strictly reject invalid credentials - no hardcoded seed backdoors permitted
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
