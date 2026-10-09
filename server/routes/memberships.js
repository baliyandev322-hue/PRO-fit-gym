const express = require('express');
const mongoose = require('mongoose');
const MembershipEnquiry = require('../models/MembershipEnquiry');
const { validateMembership } = require('../middleware/validate');
const { formSubmitLimiter } = require('../middleware/rateLimiter');
const { generateReference } = require('../utils/referenceGenerator');
const { sendMembershipAlert } = require('../services/emailService');

const router = express.Router();

/**
 * @route   POST /api/memberships
 * @desc    Submit membership tier admission reservation
 * @access  Public
 */
router.post('/', formSubmitLimiter, validateMembership, async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database is currently offline. Please ensure MONGODB_URI is configured.',
    });
  }

  try {
    const { tier, fullName, email, phone, contactPreference, notes } = req.body;

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existingRecent = await MembershipEnquiry.findOne({
      email,
      tier,
      createdAt: { $gte: fiveMinutesAgo },
    });

    if (existingRecent) {
      return res.status(409).json({
        success: false,
        message: 'A membership reservation with this email was already logged recently.',
        reference: existingRecent.reference,
      });
    }

    const reference = generateReference('MB');

    const enquiry = await MembershipEnquiry.create({
      reference,
      tier,
      fullName,
      email,
      phone,
      contactPreference,
      notes,
      status: 'Pending',
    });

    // Asynchronously dispatch owner email notification (non-blocking)
    sendMembershipAlert(enquiry)
      .then(async (result) => {
        await MembershipEnquiry.findByIdAndUpdate(enquiry._id, {
          'notificationStatus.emailSent': Boolean(result && result.success),
          'notificationStatus.emailError': result && result.error ? result.error : null,
        });
      })
      .catch(async (err) => {
        await MembershipEnquiry.findByIdAndUpdate(enquiry._id, {
          'notificationStatus.emailSent': false,
          'notificationStatus.emailError': err.message,
        });
      });

    return res.status(201).json({
      success: true,
      message: 'Membership admission reservation successfully submitted.',
      data: {
        reference: enquiry.reference,
        tier: enquiry.tier,
        fullName: enquiry.fullName,
        email: enquiry.email,
        phone: enquiry.phone,
        contactPreference: enquiry.contactPreference,
        status: enquiry.status,
        createdAt: enquiry.createdAt,
      },
    });
  } catch (error) {
    console.error('[Membership Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Server error saving membership reservation.',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
});

module.exports = router;
