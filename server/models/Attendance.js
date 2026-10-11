const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    memberName: {
      type: String,
      required: true,
      trim: true,
    },
    gymLocation: {
      type: String,
      default: 'NYC - NoHo Flagship (Sanctuary 01)',
      trim: true,
    },
    method: {
      type: String,
      enum: ['qr_scan', 'manual', 'nfc'],
      default: 'qr_scan',
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    checkInTime: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
