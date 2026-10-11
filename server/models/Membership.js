const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    memberEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    memberName: {
      type: String,
      trim: true,
    },
    planId: {
      type: String,
      required: true,
    },
    planName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'CANCELLED'],
      default: 'ACTIVE',
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
      index: true,
    },
    daysRemaining: {
      type: Number,
      default: 30,
    },
    price: {
      type: Number,
      default: 0,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    razorpaySubscriptionId: {
      type: String,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Membership', membershipSchema);
