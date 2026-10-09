const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for public form submissions (Bookings, Memberships, Contact).
 * Restricts repetitive spam or automated script attacks.
 */
const formSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 submissions per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many submissions received from this IP address. Please wait 15 minutes before trying again.',
  },
});

/**
 * Strict rate limiter for admin authentication attempts.
 * Protects against password guessing and brute force attacks.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 login attempts per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. For security reasons, please try again in 15 minutes.',
  },
});

module.exports = {
  formSubmitLimiter,
  authLimiter,
};
