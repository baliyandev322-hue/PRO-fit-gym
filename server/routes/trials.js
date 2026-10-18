const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const { formSubmitLimiter } = require('../middleware/rateLimiter');
const { generateReference } = require('../utils/referenceGenerator');
const { readStore, saveRecord } = require('../config/localStore');

const router = express.Router();

// Seed trial leads storage with persistent local fallback
const defaultTrialSeed = [
  {
    id: 'trial-001',
    reference: 'PRO-TR-260901-8391',
    fullName: 'David Sterling',
    email: 'david.sterling@hedgefund.com',
    phone: '+1 (212) 555-0144',
    discipline: 'Powerlifting / 1RM Testing',
    preferredDate: '2026-10-12',
    notes: 'Looking for a private lifting sanctuary with calibrated Eleiko competition plates and calibrated barbells.',
    status: 'NEW',
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString()
  },
  {
    id: 'trial-002',
    reference: 'PRO-TR-260902-4729',
    fullName: 'Sophia Martinez',
    email: 'sophia.martinez@architects.ny',
    phone: '+1 (212) 555-0199',
    discipline: 'Biomechanics & Injury Rehab',
    preferredDate: '2026-10-14',
    notes: 'Prior ACL reconstruction 14 months ago; interested in Chloe Sterling CSCS screening.',
    status: 'CONTACTED',
    createdAt: new Date(Date.now() - 20 * 3600000).toISOString()
  }
];

const storedTrials = readStore().trials || [];
const devTrialRequests = storedTrials.length > 0 ? storedTrials : [...defaultTrialSeed];

/**
 * @route   GET /api/trials
 * @desc    Get all trial session leads from MongoDB Atlas (Admin / Staff)
 * @access  Public / Staff
 */
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const mongoBookings = await Booking.find({ type: 'trial_pass' }).sort({ createdAt: -1 });
      if (mongoBookings && mongoBookings.length > 0) {
        const formatted = mongoBookings.map(b => ({
          id: b._id.toString(),
          reference: b.bookingReference,
          fullName: b.fullName,
          email: b.email,
          phone: b.phone,
          discipline: b.program,
          preferredDate: b.date,
          notes: b.notes,
          status: b.status,
          createdAt: b.createdAt
        }));
        return res.status(200).json({ success: true, count: formatted.length, trials: formatted, data: formatted });
      }
    }

    return res.status(200).json({
      success: true,
      count: devTrialRequests.length,
      trials: devTrialRequests,
      data: devTrialRequests
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve trial requests' });
  }
});

/**
 * @route   POST /api/trials
 * @desc    Submit a request for complimentary trial workout & persist into MongoDB Atlas
 * @access  Public (Rate Limited)
 */
router.post('/', formSubmitLimiter, async (req, res) => {
  try {
    const { fullName, email, phone, discipline = 'Athletic Strength & Conditioning', preferredDate, notes } = req.body;

    if (!fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email address, and phone number are required.'
      });
    }

    const reference = generateReference('TR');

    // Persist into MongoDB Atlas Booking collection
    if (mongoose.connection.readyState === 1) {
      const mongoBooking = await Booking.create({
        bookingReference: reference,
        type: 'trial_pass',
        fullName,
        email,
        phone,
        program: discipline,
        trainer: 'Master Coach on Duty',
        date: preferredDate || new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        notes: notes || 'Complimentary Trial Lead',
        status: 'Confirmed'
      });

      // Automatically dispatch WhatsApp confirmation directly to the athlete (non-blocking)
      try {
        const { sendTrialPassWhatsApp, sendBookingAlert } = require('../services/whatsappService');
        sendTrialPassWhatsApp({ fullName, phone, reference, discipline, date: preferredDate }).catch(() => {});
        sendBookingAlert(mongoBooking).catch(() => {});
      } catch (waErr) {}

      return res.status(201).json({
        success: true,
        message: 'Trial pass application confirmed! Concierge pass issued.',
        data: {
          id: mongoBooking._id.toString(),
          reference: mongoBooking.bookingReference,
          fullName: mongoBooking.fullName,
          email: mongoBooking.email,
          discipline,
          status: 'NEW',
          createdAt: mongoBooking.createdAt
        }
      });
    }

    // Resilient In-Memory fallback
    const fallbackTrial = {
      id: `trial-${Date.now()}`,
      reference,
      fullName,
      email,
      phone,
      discipline,
      preferredDate: preferredDate || new Date().toISOString().split('T')[0],
      notes: notes || '',
      status: 'NEW',
      createdAt: new Date().toISOString()
    };
    devTrialRequests.unshift(fallbackTrial);
    saveRecord('trials', fallbackTrial);

    try {
      const { sendTrialPassWhatsApp } = require('../services/whatsappService');
      sendTrialPassWhatsApp({ fullName, phone, reference, discipline, date: preferredDate }).catch(() => {});
    } catch (waErr) {}

    return res.status(201).json({
      success: true,
      message: 'Trial pass application confirmed! Concierge pass issued.',
      data: fallbackTrial
    });
  } catch (error) {
    console.error('[Trial Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Server error processing trial pass request.',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

module.exports = router;
