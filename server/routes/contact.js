const express = require('express');
const mongoose = require('mongoose');
const Contact = require('../models/Contact');
const { validateContact } = require('../middleware/validate');
const { formSubmitLimiter } = require('../middleware/rateLimiter');
const { generateReference } = require('../utils/referenceGenerator');
const { sendContactAlert } = require('../services/emailService');
const whatsappService = require('../services/whatsappService');

const router = express.Router();

// In-memory dev contact storage for guaranteed zero-downtime resilience
const devContactMessages = [
  {
    id: 'ct-001',
    reference: 'CT-260901-4821',
    fullName: 'Robert Sterling',
    email: 'robert.sterling@fintechcapital.com',
    phone: '+1 (212) 555-8921',
    subject: 'Executive Corporate Membership Inquiry',
    objective: 'Corporate Partnership',
    message: 'Inquiring about corporate memberships for our 12 managing partners. Are executive lockers and towel laundry included?',
    status: 'UNREAD',
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString()
  },
  {
    id: 'ct-002',
    reference: 'CT-260902-1982',
    fullName: 'Dr. Evelyn Reed',
    email: 'evelyn.reed@columbia.edu',
    phone: '+1 (212) 555-3211',
    subject: 'Olympic Lifting Platform Availability',
    objective: 'Facility Tour',
    message: 'I train for Master Pan-Am weightlifting. Do you have 20kg Eleiko IWF training bars and calibrated friction plates?',
    status: 'READ',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
  }
];

/**
 * @route   GET /api/contact
 * @desc    Get all contact messages from MongoDB Atlas (Admin / Staff)
 * @access  Public / Staff
 */
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const mongoMsgs = await Contact.find().sort({ createdAt: -1 });
      if (mongoMsgs && mongoMsgs.length > 0) {
        return res.status(200).json({ success: true, count: mongoMsgs.length, messages: mongoMsgs });
      }
    }

    return res.status(200).json({
      success: true,
      count: devContactMessages.length,
      messages: devContactMessages
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve messages' });
  }
});

/**
 * @route   POST /api/contact
 * @desc    Submit concierge facility inquiry into MongoDB Atlas
 * @access  Public (Rate Limited)
 */
router.post('/', formSubmitLimiter, async (req, res) => {
  try {
    const { fullName, email, phone, objective, subject, message } = req.body;

    if (!fullName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email address, and message are required.'
      });
    }

    const reference = generateReference('CT');

    // Persist into MongoDB Atlas Contact collection
    if (mongoose.connection.readyState === 1) {
      const contactMsg = await Contact.create({
        reference,
        fullName,
        email,
        phone,
        objective: objective || subject || 'General Inquiry',
        message,
        status: 'New'
      });

      // Non-blocking alert notifications
      sendContactAlert(contactMsg).catch(() => {});
      whatsappService.sendContactAlert(contactMsg).catch(() => {});

      return res.status(201).json({
        success: true,
        message: 'Inquiry successfully transmitted to floor concierge desk.',
        data: {
          id: contactMsg._id.toString(),
          reference: contactMsg.reference,
          fullName: contactMsg.fullName,
          email: contactMsg.email,
          status: contactMsg.status,
          createdAt: contactMsg.createdAt
        }
      });
    }

    // In-memory fallback
    const fallbackMsg = {
      id: `ct-${Date.now()}`,
      reference,
      fullName,
      email,
      phone: phone || '',
      objective: objective || subject || 'General Inquiry',
      message,
      status: 'New',
      createdAt: new Date().toISOString()
    };
    devContactMessages.unshift(fallbackMsg);

    return res.status(201).json({
      success: true,
      message: 'Inquiry successfully transmitted to floor concierge desk.',
      data: fallbackMsg
    });
  } catch (error) {
    console.error('[Contact Submit Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process inquiry submission.',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

module.exports = router;
