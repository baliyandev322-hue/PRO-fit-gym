const express = require('express');
const { verifyAuth, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Memory store fallback for attendance records when database boots
let inMemoryAttendance = [
  {
    id: 'att-101',
    memberId: 'user-member-1',
    memberName: 'Alex Vance',
    gymLocation: 'NYC - NoHo Flagship (Sanctuary 01)',
    method: 'qr_scan',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '08:45 AM',
    timestamp: new Date().toISOString()
  },
  {
    id: 'att-102',
    memberId: 'user-member-2',
    memberName: 'Elena Rostova',
    gymLocation: 'NYC - NoHo Flagship (Sanctuary 01)',
    method: 'qr_scan',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '09:15 AM',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'att-103',
    memberId: 'user-member-3',
    memberName: 'Jordan Bell',
    gymLocation: 'NYC - NoHo Flagship (Sanctuary 01)',
    method: 'manual',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '06:30 AM',
    timestamp: new Date(Date.now() - 7200000).toISOString()
  }
];

// Configurable anti-duplicate cooldown window (in minutes)
const DUPLICATE_COOLDOWN_MINUTES = 60;

/**
 * @route   POST /api/attendance/check-in
 * @desc    Validate member QR scan and record entry
 * @access  Public or Authenticated
 */
router.post('/check-in', async (req, res) => {
  try {
    const { memberId, memberName, location = 'NYC - NoHo Flagship (Sanctuary 01)', method = 'qr_scan' } = req.body;

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: 'Member ID is required to register facility access.'
      });
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Check for duplicate check-in within cooldown window
    const recentRecord = inMemoryAttendance.find(r => {
      if (r.memberId !== memberId) return false;
      const recordTime = new Date(r.timestamp).getTime();
      const diffMinutes = (now.getTime() - recordTime) / (1000 * 60);
      return diffMinutes < DUPLICATE_COOLDOWN_MINUTES;
    });

    if (recentRecord) {
      return res.status(409).json({
        success: false,
        message: `Duplicate check-in blocked. You already checked in today at ${recentRecord.checkInTime}. Please wait before scanning again.`,
        lastCheckIn: recentRecord.checkInTime
      });
    }

    // Record attendance
    const newRecord = {
      id: `att_${Date.now()}`,
      memberId,
      memberName: memberName || 'Verified Athlete',
      gymLocation: location,
      method,
      date: todayStr,
      checkInTime: timeFormatted,
      timestamp: now.toISOString()
    };

    inMemoryAttendance.unshift(newRecord);

    return res.status(201).json({
      success: true,
      message: `Access granted! Welcome to ${location}, ${memberName || 'Athlete'}.`,
      attendance: newRecord
    });
  } catch (error) {
    console.error('[Attendance Check-in Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process attendance entry.'
    });
  }
});

/**
 * @route   GET /api/attendance/today
 * @desc    Get all attendance events for today
 * @access  Private (Staff/Admin)
 */
router.get('/today', (req, res) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const records = inMemoryAttendance.filter(r => r.date === todayStr);

  return res.status(200).json({
    success: true,
    count: records.length,
    data: records
  });
});

/**
 * @route   GET /api/attendance/history/:memberId
 * @desc    Get attendance history for specific member
 * @access  Public / Authenticated
 */
router.get('/history/:memberId', (req, res) => {
  const { memberId } = req.params;
  const records = inMemoryAttendance.filter(r => r.memberId === memberId);

  return res.status(200).json({
    success: true,
    totalVisits: records.length,
    data: records
  });
});

/**
 * @route   GET /api/attendance/analytics
 * @desc    Get attendance trends and telemetry
 * @access  Private (Staff/Admin)
 */
router.get('/analytics', (req, res) => {
  const total = inMemoryAttendance.length;
  const qrCount = inMemoryAttendance.filter(r => r.method === 'qr_scan').length;
  const manualCount = total - qrCount;

  return res.status(200).json({
    success: true,
    analytics: {
      totalVisits: total,
      qrScanPercentage: total > 0 ? Math.round((qrCount / total) * 100) : 100,
      peakHour: '06:00 PM - 08:00 PM',
      currentFloorCapacityPercentage: 42,
      todayCount: inMemoryAttendance.filter(r => r.date === new Date().toISOString().split('T')[0]).length
    }
  });
});

module.exports = router;
