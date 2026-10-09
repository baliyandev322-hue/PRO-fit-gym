const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const { validateBooking } = require('../middleware/validate');
const { formSubmitLimiter } = require('../middleware/rateLimiter');
const { generateReference } = require('../utils/referenceGenerator');
const { sendBookingAlert } = require('../services/emailService');
const whatsappService = require('../services/whatsappService');

const router = express.Router();

/**
 * @route   POST /api/bookings
 * @desc    Create a new coached session or 7-day trial pass booking
 * @access  Public
 */
router.post('/', formSubmitLimiter, validateBooking, async (req, res) => {
  // Check database connectivity
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database is currently offline. Please ensure MONGODB_URI is configured.',
    });
  }

  try {
    const { type, fullName, email, phone, program, trainer, date, time, notes } = req.body;

    // Duplicate check: Same email, type, and date submitted within the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
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

    // Generate prefix based on booking type
    const refPrefix = type === 'trial_pass' ? 'TR' : 'PT';
    const bookingReference = generateReference(refPrefix);

    // Save to database
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

    // Asynchronously dispatch owner email notification (non-blocking)
    sendBookingAlert(newBooking)
      .then(async (result) => {
        await Booking.findByIdAndUpdate(newBooking._id, {
          'notificationStatus.emailSent': Boolean(result && result.success),
          'notificationStatus.emailError': result && result.error ? result.error : null,
        });
      })
      .catch(async (err) => {
        await Booking.findByIdAndUpdate(newBooking._id, {
          'notificationStatus.emailSent': false,
          'notificationStatus.emailError': err.message,
        });
      });

    // Asynchronously dispatch owner WhatsApp notification (independent & non-blocking)
    whatsappService.sendBookingAlert(newBooking)
      .then(async (result) => {
        await Booking.findByIdAndUpdate(newBooking._id, {
          'notificationStatus.whatsappSent': Boolean(result && result.success),
          'notificationStatus.whatsappError': result && result.error ? result.error : null,
        });
      })
      .catch(async (err) => {
        await Booking.findByIdAndUpdate(newBooking._id, {
          'notificationStatus.whatsappSent': false,
          'notificationStatus.whatsappError': err.message,
        });
      });

    // Response returned only after successfully saved in database
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
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database is currently offline.',
    });
  }

  try {
    const { reference } = req.params;
    const booking = await Booking.findOne({
      bookingReference: reference.toUpperCase().trim(),
    }).select('bookingReference type fullName program trainer date time status createdAt');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'No booking record found for the provided reference code.',
      });
    }

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during booking lookup.',
    });
  }
});

module.exports = router;
