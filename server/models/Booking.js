const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['coached_session', 'trial_pass'],
      default: 'coached_session',
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      minlength: [7, 'Phone number must have at least 7 digits'],
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
    },
    program: {
      type: String,
      trim: true,
      default: '7-Day Provisional Pass',
    },
    trainer: {
      type: String,
      trim: true,
      default: 'Any Available Master Coach',
    },
    date: {
      type: String,
      required: [true, 'Preferred session or start date is required'],
      trim: true,
    },
    time: {
      type: String,
      trim: true,
      default: 'Floor Walkthrough Hours',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
      default: 'Pending',
      index: true,
    },
    notificationStatus: {
      emailSent: { type: Boolean, default: false },
      emailError: { type: String, default: null },
      whatsappSent: { type: Boolean, default: false },
      whatsappError: { type: String, default: null },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to help prevent exact duplicate submissions within a short window
bookingSchema.index({ email: 1, date: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
