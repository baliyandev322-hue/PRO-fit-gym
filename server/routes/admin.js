const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const MembershipEnquiry = require('../models/MembershipEnquiry');
const Contact = require('../models/Contact');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply verifyAdmin middleware to all endpoints in this router
router.use(verifyAdmin);

/**
 * @route   GET /api/admin/metrics
 * @desc    Aggregate dashboard statistics
 * @access  Private (Admin)
 */
router.get('/metrics', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database is currently offline.',
    });
  }

  try {
    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
      trialPasses,
      coachedSessions,
      totalMemberships,
      totalContacts,
      recentBookings,
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'Pending' }),
      Booking.countDocuments({ status: 'Confirmed' }),
      Booking.countDocuments({ status: 'Cancelled' }),
      Booking.countDocuments({ status: 'Completed' }),
      Booking.countDocuments({ type: 'trial_pass' }),
      Booking.countDocuments({ type: 'coached_session' }),
      MembershipEnquiry.countDocuments(),
      Contact.countDocuments(),
      Booking.find().sort({ createdAt: -1 }).limit(5).select('bookingReference fullName type status createdAt'),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          cancelled: cancelledBookings,
          completed: completedBookings,
          trialPasses,
          coachedSessions,
        },
        memberships: {
          total: totalMemberships,
        },
        contacts: {
          total: totalContacts,
        },
        recentActivity: recentBookings,
      },
    });
  } catch (error) {
    console.error('[Admin Metrics Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving dashboard metrics.',
    });
  }
});

/**
 * @route   GET /api/admin/bookings
 * @desc    Get paginated, searchable, and filterable list of bookings
 * @access  Private (Admin)
 */
router.get('/bookings', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ success: false, message: 'Database offline.' });
  }

  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = {};

    // Filter by status
    if (req.query.status && ['Pending', 'Confirmed', 'Cancelled', 'Completed'].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    // Filter by type
    if (req.query.type && ['coached_session', 'trial_pass'].includes(req.query.type)) {
      filter.type = req.query.type;
    }

    // Text search by name, email, phone, or reference
    if (req.query.search && req.query.search.trim()) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { bookingReference: searchRegex },
      ];
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Booking.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('[Admin Bookings Error]', error);
    return res.status(500).json({ success: false, message: 'Error retrieving bookings.' });
  }
});

/**
 * @route   PATCH /api/admin/bookings/:id/status
 * @desc    Update booking status (Pending, Confirmed, Cancelled, Completed)
 * @access  Private (Admin)
 */
router.patch('/bookings/:id/status', async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    });
  }

  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking record not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}.`,
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update booking status.' });
  }
});

/**
 * @route   DELETE /api/admin/bookings/:id
 * @desc    Delete a booking record
 * @access  Private (Admin)
 */
router.delete('/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }
    return res.status(200).json({ success: true, message: 'Booking removed successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to remove booking.' });
  }
});

/**
 * @route   GET /api/admin/memberships
 * @desc    Get paginated membership enquiries
 * @access  Private (Admin)
 */
router.get('/memberships', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ success: false, message: 'Database offline.' });
  }

  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [enquiries, total] = await Promise.all([
      MembershipEnquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      MembershipEnquiry.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: enquiries,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving memberships.' });
  }
});

/**
 * @route   PATCH /api/admin/memberships/:id/status
 * @desc    Update membership enquiry status
 * @access  Private (Admin)
 */
router.patch('/memberships/:id/status', async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'Contacted', 'Enrolled', 'Closed'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid membership status.' });
  }

  try {
    const enquiry = await MembershipEnquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }
    return res.status(200).json({ success: true, message: 'Status updated.', data: enquiry });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
});

/**
 * @route   GET /api/admin/contacts
 * @desc    Get paginated contact messages
 * @access  Private (Admin)
 */
router.get('/contacts', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ success: false, message: 'Database offline.' });
  }

  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [contacts, total] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Contact.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: contacts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving contacts.' });
  }
});

/**
 * @route   PATCH /api/admin/contacts/:id/status
 * @desc    Update contact inquiry status
 * @access  Private (Admin)
 */
router.patch('/contacts/:id/status', async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['New', 'Read', 'Replied', 'Archived'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid contact status.' });
  }

  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }
    return res.status(200).json({ success: true, message: 'Status updated.', data: contact });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
});

module.exports = router;
