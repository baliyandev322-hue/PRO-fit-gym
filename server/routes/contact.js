const express = require('express');
const mongoose = require('mongoose');
const Contact = require('../models/Contact');
const { validateContact } = require('../middleware/validate');
const { formSubmitLimiter } = require('../middleware/rateLimiter');
const { generateReference } = require('../utils/referenceGenerator');
const { sendContactAlert } = require('../services/emailService');
const whatsappService = require('../services/whatsappService');

const router = express.Router();

/**
 * @route   POST /api/contact
 * @desc    Submit concierge facility inquiry / contact message
 * @access  Public
 */
router.post('/', formSubmitLimiter, validateContact, async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database is currently offline. Please ensure MONGODB_URI is configured.',
    });
  }

  try {
    const { fullName, email, phone, objective, message } = req.body;

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existingRecent = await Contact.findOne({
      email,
      objective,
      createdAt: { $gte: fiveMinutesAgo },
    });

    if (existingRecent) {
      return res.status(409).json({
        success: false,
        message: 'Your message was already received recently. Our team will contact you shortly.',
        reference: existingRecent.reference,
      });
    }

    const reference = generateReference('CT');

    const contactMsg = await Contact.create({
      reference,
      fullName,
      email,
      phone,
      objective,
      message,
      status: 'New',
    });

    // Asynchronously dispatch owner email notification (non-blocking)
    sendContactAlert(contactMsg)
      .then(async (result) => {
        await Contact.findByIdAndUpdate(contactMsg._id, {
          'notificationStatus.emailSent': Boolean(result && result.success),
          'notificationStatus.emailError': result && result.error ? result.error : null,
        });
      })
      .catch(async (err) => {
        await Contact.findByIdAndUpdate(contactMsg._id, {
          'notificationStatus.emailSent': false,
          'notificationStatus.emailError': err.message,
        });
      });

    // Asynchronously dispatch owner WhatsApp notification (independent & non-blocking)
    whatsappService.sendContactAlert(contactMsg)
      .then(async (result) => {
        await Contact.findByIdAndUpdate(contactMsg._id, {
          'notificationStatus.whatsappSent': Boolean(result && result.success),
          'notificationStatus.whatsappError': result && result.error ? result.error : null,
        });
      })
      .catch(async (err) => {
        await Contact.findByIdAndUpdate(contactMsg._id, {
          'notificationStatus.whatsappSent': false,
          'notificationStatus.whatsappError': err.message,
        });
      });

    return res.status(201).json({
      success: true,
      message: 'Inquiry successfully transmitted to floor concierge desk.',
      data: {
        reference: contactMsg.reference,
        fullName: contactMsg.fullName,
        email: contactMsg.email,
        phone: contactMsg.phone,
        objective: contactMsg.objective,
        status: contactMsg.status,
        createdAt: contactMsg.createdAt,
      },
    });
  } catch (error) {
    console.error('[Contact Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Server error saving contact message.',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
});

module.exports = router;
