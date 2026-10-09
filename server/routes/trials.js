const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const { formSubmitLimiter } = require('../middleware/rateLimiter');
const { generateReference } = require('../utils/referenceGenerator');

const router = express.Router();

// Prisma client initialization with graceful fallback
let prisma;
try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
} catch (err) {
  console.warn('[Prisma Warning] Prisma Client loading deferred in trials route:', err.message);
}

// In-memory dev trial leads storage
const devTrialRequests = [
  {
    id: 'trial-001',
    reference: 'TR-260901-8391',
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
    reference: 'TR-260902-4729',
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

/**
 * @route   GET /api/trials
 * @desc    Get all trial session leads (Admin / Staff)
 * @access  Public / Staff
 */
router.get('/', async (req, res) => {
  try {
    if (prisma) {
      try {
        const trials = await prisma.trialRequest.findMany({
          orderBy: { createdAt: 'desc' }
        });
        if (trials && trials.length > 0) {
          return res.status(200).json({ success: true, count: trials.length, trials });
        }
      } catch (err) {
        console.warn('Prisma trial lookup deferred:', err.message);
      }
    }

    return res.status(200).json({
      success: true,
      count: devTrialRequests.length,
      trials: devTrialRequests
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve trial requests' });
  }
});

/**
 * @route   POST /api/trials
 * @desc    Submit a request for complimentary trial workout & biomechanics audit
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

    // 1. Try Prisma persistence
    if (prisma) {
      try {
        const savedTrial = await prisma.trialRequest.create({
          data: {
            fullName,
            email,
            phone,
            discipline,
            preferredDate: preferredDate ? new Date(preferredDate) : null,
            notes: notes || null,
            status: 'NEW'
          }
        });

        return res.status(201).json({
          success: true,
          message: 'Trial pass application confirmed! Concierge pass issued.',
          data: {
            id: savedTrial.id,
            reference,
            fullName: savedTrial.fullName,
            email: savedTrial.email,
            discipline: savedTrial.discipline,
            status: savedTrial.status,
            createdAt: savedTrial.createdAt
          }
        });
      } catch (err) {
        console.warn('Prisma trial insert fallback:', err.message);
      }
    }

    // 2. Try MongoDB Booking persistence if available
    if (mongoose.connection.readyState === 1) {
      try {
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

        return res.status(201).json({
          success: true,
          message: 'Trial pass application confirmed! Concierge pass issued.',
          data: {
            reference: mongoBooking.bookingReference,
            fullName: mongoBooking.fullName,
            email: mongoBooking.email,
            discipline,
            status: 'NEW',
            createdAt: mongoBooking.createdAt
          }
        });
      } catch (err) {
        console.warn('Mongo trial booking fallback:', err.message);
      }
    }

    // 3. Resilient In-Memory fallback
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
