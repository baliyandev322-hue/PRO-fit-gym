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
 * Strict Rate Limiter for Login Endpoint (/api/auth/login).
 * Allows max 5 login attempts per 1 minute (60 seconds) window per IP.
 * Prevents automated password guessing and brute force credential stuffing attacks.
 */
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute (60,000 ms)
  max: 5, // Max 5 login attempts per 1 minute window
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Security cooldown active: please wait 1 minute before trying again.',
  },
});

/**
 * Strict rate limiter for admin authentication attempts.
 * Protects against password guessing and brute force attacks.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 100, // Max 10 in production, 100 in dev
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. For security reasons, please try again in 15 minutes.',
  },
});

module.exports = {
  formSubmitLimiter,
  loginLimiter,
  authLimiter,
};
