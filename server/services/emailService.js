const { Resend } = require('resend');

/**
 * PROFIT Training Club - Automated Email Notification Service
 * Dispatches high-priority dispatch notifications to the gym owner upon new athlete bookings.
 */

// Initialize Resend client only if API key is present
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  return new Resend(apiKey);
};

/**
 * Dispatches owner email notification for new trial passes or coached sessions.
 * @param {Object} booking - Booking document
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
const sendBookingAlert = async (booking) => {
  const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL;
  const resend = getResendClient();

  if (!resend || !ownerEmail) {
    const missing = [];
    if (!resend) missing.push('RESEND_API_KEY');
    if (!ownerEmail) missing.push('OWNER_NOTIFICATION_EMAIL');
    console.warn('\x1b[33m%s\x1b[0m', `[Email Notice] Email alert skipped. Missing environment variables: ${missing.join(', ')}`);
    return {
      success: false,
      error: `Service unconfigured: ${missing.join(', ')} missing in .env`,
    };
  }

  const isTrial = booking.type === 'trial_pass';
  const typeLabel = isTrial ? '7-Day Provisional Trial Pass' : 'Coached Session Reservation';
  const fromAddress = process.env.EMAIL_FROM || 'PROFIT Training Club <onboarding@resend.dev>';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { margin: 0; padding: 0; background-color: #0d0e10; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #f5f6f8; }
        .container { max-width: 600px; margin: 20px auto; background-color: #141518; border: 1px solid #23252a; }
        .header { background-color: #0d0e10; border-bottom: 2px solid #ccff00; padding: 25px 30px; }
        .brand { font-size: 24px; font-weight: 900; letter-spacing: 2px; color: #ffffff; }
        .brand-accent { color: #ccff00; }
        .subhead { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #9aa0ac; margin-top: 5px; }
        .content { padding: 30px; }
        .alert-banner { background-color: rgba(204, 255, 0, 0.08); border-left: 3px solid #ccff00; padding: 12px 16px; margin-bottom: 25px; }
        .alert-title { font-size: 12px; font-weight: 700; letter-spacing: 1px; color: #ccff00; text-transform: uppercase; }
        .ref-code { font-family: monospace; font-size: 18px; font-weight: bold; color: #ffffff; margin-top: 4px; }
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
        .data-table td { padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.06); font-size: 14px; }
        .label { color: #9aa0ac; text-transform: uppercase; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; width: 35%; }
        .val { color: #ffffff; font-weight: 500; }
        .val a { color: #ccff00; text-decoration: none; }
        .notes-box { background-color: #0d0e10; border: 1px solid #23252a; padding: 15px; margin-bottom: 25px; }
        .notes-title { font-size: 11px; font-weight: 700; color: #9aa0ac; text-transform: uppercase; margin-bottom: 8px; }
        .notes-body { font-size: 13px; color: #d1d5db; line-height: 1.5; white-space: pre-wrap; }
        .footer { background-color: #0d0e10; border-top: 1px solid #23252a; padding: 20px 30px; text-align: center; font-size: 12px; color: #676c78; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="brand">PRO<span class="brand-accent">FIT</span> TRAINING CLUB</div>
          <div class="subhead">COACHING FLOOR DESK // NEW ATHLETE INTAKE DISPATCH</div>
        </div>

        <div class="content">
          <div class="alert-banner">
            <div class="alert-title">ACTION REQUIRED // NEW INTAKE CONFIRMATION</div>
            <div class="ref-code">${booking.bookingReference}</div>
          </div>

          <table class="data-table">
            <tr>
              <td class="label">ATHLETE NAME</td>
              <td class="val"><strong>${booking.fullName}</strong></td>
            </tr>
            <tr>
              <td class="label">CONTACT EMAIL</td>
              <td class="val"><a href="mailto:${booking.email}">${booking.email}</a></td>
            </tr>
            <tr>
              <td class="label">PHONE NUMBER</td>
              <td class="val"><a href="tel:${booking.phone}">${booking.phone}</a></td>
            </tr>
            <tr>
              <td class="label">BOOKING TYPE</td>
              <td class="val">${typeLabel}</td>
            </tr>
            <tr>
              <td class="label">DISCIPLINE / PROGRAM</td>
              <td class="val">${booking.program || '7-Day Pass'}</td>
            </tr>
            <tr>
              <td class="label">ASSIGNED COACH</td>
              <td class="val">${booking.trainer || 'Any Master Coach'}</td>
            </tr>
            <tr>
              <td class="label">TARGET DATE & SLOT</td>
              <td class="val"><strong>${booking.date}</strong> // ${booking.time || 'Standard Hours'}</td>
            </tr>
            <tr>
              <td class="label">CURRENT STATUS</td>
              <td class="val"><span style="color: #f59e0b; font-weight: bold;">● Pending Floor Verification</span></td>
            </tr>
          </table>

          <div class="notes-title">TRAINING BACKGROUND / INJURIES</div>
          <div class="notes-box">
            <div class="notes-body">${booking.notes ? booking.notes : 'None stated.'}</div>
          </div>

          <p style="font-size: 13px; color: #9aa0ac; line-height: 1.5; margin: 0;">
            Please contact the athlete to verify platform roster capacity and conduct pre-movement screening within 4 business hours.
          </p>
        </div>

        <div class="footer">
          PROFIT Training Club NoHo NYC • 740 Broadway • Operations Dispatch Alert
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const data = await resend.emails.send({
      from: fromAddress,
      to: ownerEmail,
      subject: `⚡ [NEW BOOKING] ${booking.bookingReference} - ${booking.fullName} (${booking.type === 'trial_pass' ? 'Trial' : 'PT'})`,
      html,
    });

    if (data.error) {
      console.error('\x1b[31m%s\x1b[0m', `[Resend Error] Delivery failed: ${data.error.message}`);
      return { success: false, error: data.error.message };
    }

    console.log('\x1b[32m%s\x1b[0m', `[Email Sent] Booking notification delivered to ${ownerEmail} (ID: ${data.data?.id})`);
    return { success: true, id: data.data?.id };
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `[Email Service Exception] ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Dispatches owner email notification for contact / concierge form inquiries.
 * @param {Object} contact - Contact message document
 */
const sendContactAlert = async (contact) => {
  const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL;
  const resend = getResendClient();

  if (!resend || !ownerEmail) {
    return { success: false, error: 'Email service credentials not configured in .env' };
  }

  const fromAddress = process.env.EMAIL_FROM || 'PROFIT Training Club <onboarding@resend.dev>';

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="background-color: #0d0e10; color: #f5f6f8; font-family: sans-serif; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #141518; border: 1px solid #23252a; padding: 25px;">
        <h2 style="color: #ccff00; margin-top: 0;">PROFIT CONCIERGE INQUIRY</h2>
        <p><strong>Reference:</strong> ${contact.reference}</p>
        <p><strong>Sender:</strong> ${contact.fullName} (<a href="mailto:${contact.email}" style="color: #ccff00;">${contact.email}</a> / <a href="tel:${contact.phone}" style="color: #ccff00;">${contact.phone}</a>)</p>
        <p><strong>Primary Objective:</strong> ${contact.objective}</p>
        <div style="background: #0d0e10; padding: 15px; border: 1px solid #23252a; margin-top: 15px;">
          <strong>Message:</strong><br>${contact.message || 'No additional text provided.'}
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const data = await resend.emails.send({
      from: fromAddress,
      to: ownerEmail,
      subject: `📩 [CONCIERGE INQUIRY] ${contact.reference} - ${contact.fullName}`,
      html,
    });

    if (data.error) return { success: false, error: data.error.message };
    return { success: true, id: data.data?.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Dispatches owner email notification for membership admissions.
 * @param {Object} membership - Membership Enquiry document
 */
const sendMembershipAlert = async (membership) => {
  const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL;
  const resend = getResendClient();

  if (!resend || !ownerEmail) {
    return { success: false, error: 'Email service credentials not configured in .env' };
  }

  const fromAddress = process.env.EMAIL_FROM || 'PROFIT Training Club <onboarding@resend.dev>';

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="background-color: #0d0e10; color: #f5f6f8; font-family: sans-serif; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #141518; border: 1px solid #23252a; padding: 25px;">
        <h2 style="color: #ccff00; margin-top: 0;">MEMBERSHIP RESERVATION</h2>
        <p><strong>Reference:</strong> ${membership.reference}</p>
        <p><strong>Candidate:</strong> ${membership.fullName} (<a href="mailto:${membership.email}" style="color: #ccff00;">${membership.email}</a> / <a href="tel:${membership.phone}" style="color: #ccff00;">${membership.phone}</a>)</p>
        <p><strong>Selected Tier:</strong> <strong style="color: #ccff00;">${membership.tier} Tier</strong></p>
        <p><strong>Contact Preference:</strong> ${membership.contactPreference}</p>
        <div style="background: #0d0e10; padding: 15px; border: 1px solid #23252a; margin-top: 15px;">
          <strong>Lifting Goals / Start Date:</strong><br>${membership.notes || 'None stated.'}
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const data = await resend.emails.send({
      from: fromAddress,
      to: ownerEmail,
      subject: `🎟️ [MEMBERSHIP ADMISSION] ${membership.reference} - ${membership.fullName} (${membership.tier} Tier)`,
      html,
    });

    if (data.error) return { success: false, error: data.error.message };
    return { success: true, id: data.data?.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendBookingAlert,
  sendContactAlert,
  sendMembershipAlert,
};
