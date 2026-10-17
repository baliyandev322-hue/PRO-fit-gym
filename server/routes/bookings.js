const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const { validateBooking } = require('../middleware/validate');
const { formSubmitLimiter } = require('../middleware/rateLimiter');
const { generateReference } = require('../utils/referenceGenerator');
const { sendBookingAlert } = require('../services/emailService');
const whatsappService = require('../services/whatsappService');
const { readStore, saveRecord } = require('../config/localStore');

const router = express.Router();

// Persistent bookings fallback store
const storedBookings = readStore().bookings || [];
const devBookings = [...storedBookings];

/**
 * @route   POST /api/bookings
 * @desc    Create a new coached session or 7-day trial pass booking
 * @access  Public
 */
router.post('/', formSubmitLimiter, validateBooking, async (req, res) => {
  try {
    const { type, fullName, email, phone, program, trainer, date, time, notes } = req.body;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const refPrefix = type === 'trial_pass' ? 'TR' : 'PT';
    const bookingReference = generateReference(refPrefix);

    // 1. If MongoDB Atlas is connected
    if (mongoose.connection.readyState === 1) {
      const existingRecentBooking = await Booking.findOne({
        email,
        type,
        date,
        createdAt: { $gte: fiveMinutesAgo },
      });

      if (existingRecentBooking) {
        return res.status(409).json({
          success: false,
          message: 'A booking request with these details was already received recently.',
          bookingReference: existingRecentBooking.bookingReference,
        });
      }

      const newBooking = await Booking.create({
        bookingReference,
        type,
        fullName,
        email,
        phone,
        program,
        trainer,
        date,
        time,
        notes,
        status: 'Pending',
      });

      // Async owner alerts
      sendBookingAlert(newBooking).catch(() => {});
      whatsappService.sendBookingAlert(newBooking).catch(() => {});

      return res.status(201).json({
        success: true,
        message:
          type === 'trial_pass'
            ? 'Provisional 7-Day Trial Pass successfully registered.'
            : 'Coaching session reservation successfully logged.',
        data: {
          bookingReference: newBooking.bookingReference,
          type: newBooking.type,
          fullName: newBooking.fullName,
          email: newBooking.email,
          phone: newBooking.phone,
          program: newBooking.program,
          trainer: newBooking.trainer,
          date: newBooking.date,
          time: newBooking.time,
          status: newBooking.status,
          createdAt: newBooking.createdAt,
        },
      });
    }

    // 2. Offline / Resilient Local Persistence Fallback
    const existingDev = devBookings.find(
      (b) => b.email === email && b.type === type && b.date === date && new Date(b.createdAt) >= fiveMinutesAgo
    );
    if (existingDev) {
      return res.status(409).json({
        success: false,
        message: 'A booking request with these details was already received recently.',
        bookingReference: existingDev.bookingReference,
      });
    }

    const fallbackBooking = {
      id: `bk_${Date.now()}`,
      bookingReference,
      type,
      fullName,
      email,
      phone,
      program: program || 'Coached Session',
      trainer: trainer || 'Master Coach on Duty',
      date,
      time: time || '10:00 AM',
      notes: notes || '',
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    devBookings.unshift(fallbackBooking);
    saveRecord('bookings', fallbackBooking);

    return res.status(201).json({
      success: true,
      message:
        type === 'trial_pass'
          ? 'Provisional 7-Day Trial Pass successfully registered.'
          : 'Coaching session reservation successfully logged.',
      data: fallbackBooking,
    });
  } catch (error) {
    console.error('[Booking Error]', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while saving your booking. Please try again.',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
});

/**
 * @route   GET /api/bookings/lookup/:reference
 * @desc    Public lookup endpoint for an athlete to check their booking status
 * @access  Public
 */
router.get('/lookup/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    const cleanRef = reference.toUpperCase().trim();

    if (mongoose.connection.readyState === 1) {
      const booking = await Booking.findOne({
        bookingReference: cleanRef,
      }).select('bookingReference type fullName program trainer date time status createdAt');

      if (booking) {
        return res.status(200).json({
          success: true,
          data: booking,
        });
      }
    }

    // Resilient offline search in local persistent store
    const localMatch = devBookings.find(
      (b) => b.bookingReference && b.bookingReference.toUpperCase().trim() === cleanRef
    );

    if (localMatch) {
      return res.status(200).json({
        success: true,
        data: localMatch,
      });
    }

    return res.status(404).json({
      success: false,
      message: 'No booking record found for the provided reference code.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during booking lookup.',
    });
  }
});

module.exports = router;
