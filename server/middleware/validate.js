const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates and sanitizes personal training and trial bookings.
 */
const validateBooking = (req, res, next) => {
  const { type = 'coached_session', fullName, email, phone, date, program, trainer, time, notes } = req.body;
  const errors = {};

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    errors.fullName = 'Full name is required (minimum 2 characters).';
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.email = 'A valid email address is required.';
  }

  const cleanPhone = phone ? String(phone).replace(/\D/g, '') : '';
  if (!cleanPhone || cleanPhone.length < 7) {
    errors.phone = 'A valid contact phone number is required (minimum 7 digits).';
  }

  if (!date || typeof date !== 'string' || !date.trim()) {
    errors.date = 'Preferred session or trial start date is required.';
  }

  if (!['coached_session', 'trial_pass'].includes(type)) {
    errors.type = 'Booking type must be either "coached_session" or "trial_pass".';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please correct the highlighted errors.',
      errors,
    });
  }

  // Sanitize cleaned fields onto request body
  req.body.type = type;
  req.body.fullName = fullName.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.phone = String(phone).trim();
  req.body.date = date.trim();
  req.body.program = (program && String(program).trim()) || (type === 'trial_pass' ? '7-Day Provisional Pass' : 'General Coaching');
  req.body.trainer = (trainer && String(trainer).trim()) || 'Any Available Master Coach';
  req.body.time = (time && String(time).trim()) || 'Standard Facility Hours';
  req.body.notes = (notes && String(notes).trim().slice(0, 1000)) || '';

  next();
};

/**
 * Validates and sanitizes membership reservation requests.
 */
const validateMembership = (req, res, next) => {
  const { tier, fullName, email, phone, contactPreference, notes } = req.body;
  const errors = {};

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    errors.fullName = 'Full name is required (minimum 2 characters).';
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.email = 'A valid email address is required.';
  }

  const cleanPhone = phone ? String(phone).replace(/\D/g, '') : '';
  if (!cleanPhone || cleanPhone.length < 7) {
    errors.phone = 'A valid contact phone number is required (minimum 7 digits).';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please correct the highlighted errors.',
      errors,
    });
  }

  req.body.tier = (tier && String(tier).trim()) || 'Performance';
  req.body.fullName = fullName.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.phone = String(phone).trim();
  req.body.contactPreference = ['WhatsApp', 'Email', 'Phone Call'].includes(contactPreference)
    ? contactPreference
    : 'WhatsApp';
  req.body.notes = (notes && String(notes).trim().slice(0, 1000)) || '';

  next();
};

/**
 * Validates and sanitizes contact concierge messages.
 */
const validateContact = (req, res, next) => {
  const { fullName, email, phone, objective, message } = req.body;
  const errors = {};

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    errors.fullName = 'Full name is required (minimum 2 characters).';
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.email = 'A valid email address is required.';
  }

  const cleanPhone = phone ? String(phone).replace(/\D/g, '') : '';
  if (!cleanPhone || cleanPhone.length < 7) {
    errors.phone = 'A valid contact phone number is required (minimum 7 digits).';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please correct the highlighted errors.',
      errors,
    });
  }

  req.body.fullName = fullName.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.phone = String(phone).trim();
  req.body.objective = (objective && String(objective).trim()) || 'General Facility Inquiry';
  req.body.message = (message && String(message).trim().slice(0, 2000)) || '';

  next();
};

module.exports = {
  validateBooking,
  validateMembership,
  validateContact,
};
