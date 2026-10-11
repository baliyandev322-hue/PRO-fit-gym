const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    memberName: {
      type: String,
      trim: true,
    },
    planId: {
      type: String,
    },
    planName: {
      type: String,
      default: 'Performance Tier',
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    gateway: {
      type: String,
      enum: ['RAZORPAY', 'STRIPE', 'CASH'],
      default: 'STRIPE',
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
      default: 'COMPLETED',
      index: true,
    },
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    razorpayOrderId: {
      type: String,
      sparse: true,
    },
    razorpayPaymentId: {
      type: String,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
