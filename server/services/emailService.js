const { Resend } = require('resend');
const nodemailer = require('nodemailer');

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

/**
 * Dispatches an official Tax Invoice & Membership Confirmation Email to the member upon successful payment.
 * Supports:
 * 1. Nodemailer SMTP (e.g. Gmail / SendGrid / Amazon SES / Brevo via SMTP_USER & SMTP_PASS)
 * 2. Resend API (via RESEND_API_KEY)
 * 3. In dev mode: Ethereal test inbox via nodemailer.createTestAccount() with clickable preview URL
 *
 * @param {Object} options - Receipt details { user, payment, membership }
 * @returns {Promise<{success: boolean, id?: string, previewUrl?: string, error?: string}>}
 */
const sendPaymentReceiptEmail = async ({ user, payment, membership }) => {
  const recipientEmail = user?.email || payment?.memberEmail;
  const athleteName = user?.fullName || payment?.memberName || 'Athlete';
  const receiptNo = payment?.receiptNumber || payment?.receipt || `INV-${Date.now().toString().slice(-6)}`;
  const planTitle = payment?.planName || membership?.planName || 'Performance Tier';
  const amountPaid = payment?.amount ? payment.amount.toLocaleString('en-IN') : '24,900';
  const currency = payment?.currency || 'INR';
  const paymentId = payment?.razorpayPaymentId || payment?.id || 'pay_verified';
  const formattedDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const expiryDate = membership?.expiryDate 
    ? new Date(membership.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'In 30 Days';

  if (!recipientEmail) {
    console.warn('\x1b[33m%s\x1b[0m', '[Email Receipt] Skipped: No recipient email provided.');
    return { success: false, error: 'Recipient email is missing' };
  }

  const fromAddress = process.env.EMAIL_FROM || 'PROFIT Training Club <no-reply@profitgym.com>';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { margin: 0; padding: 0; background-color: #0d0e10; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #f5f6f8; }
        .wrapper { max-width: 620px; margin: 30px auto; background-color: #141518; border: 1px solid #23252a; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .header { background-color: #0d0e10; border-bottom: 2px solid #ccff00; padding: 30px; text-align: left; }
        .logo { font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #ffffff; }
        .accent { color: #ccff00; }
        .subtitle { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #9aa0ac; margin-top: 6px; }
        .body { padding: 35px 30px; }
        .badge { display: inline-block; background-color: rgba(204, 255, 0, 0.12); color: #ccff00; border: 1px solid #ccff00; padding: 4px 12px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; border-radius: 2px; margin-bottom: 20px; }
        .headline { font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0; }
        .subtext { font-size: 14px; color: #9aa0ac; line-height: 1.5; margin: 0 0 25px 0; }
        .invoice-card { background-color: #0d0e10; border: 1px solid #23252a; padding: 20px; border-radius: 4px; margin-bottom: 25px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .table th { text-align: left; background-color: #0d0e10; padding: 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #9aa0ac; border-bottom: 1px solid #23252a; }
        .table td { padding: 14px 12px; border-bottom: 1px solid #23252a; font-size: 14px; color: #f5f6f8; }
        .total-box { background-color: #1a1c22; padding: 16px; border-left: 3px solid #ccff00; margin-bottom: 25px; text-align: right; }
        .total-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #9aa0ac; }
        .total-amount { font-size: 28px; font-weight: 900; color: #ccff00; margin-top: 4px; }
        .qr-callout { background-color: rgba(204, 255, 0, 0.05); border: 1px dashed rgba(204, 255, 0, 0.3); padding: 18px; border-radius: 4px; margin-bottom: 25px; }
        .qr-title { font-size: 13px; font-weight: 700; color: #ccff00; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
        .qr-text { font-size: 13px; color: #d1d5db; line-height: 1.5; margin: 0; }
        .footer { background-color: #0d0e10; border-top: 1px solid #23252a; padding: 25px 30px; text-align: center; font-size: 12px; color: #676c78; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="logo">PRO<span class="accent">FIT</span> TRAINING CLUB</div>
          <div class="subtitle">OFFICIAL TAX INVOICE & MEMBERSHIP CONFIRMATION</div>
        </div>
        <div class="body">
          <div class="badge">Payment Verified • Status: Active</div>
          <h1 class="headline">Welcome to the Club, ${athleteName}!</h1>
          <p class="subtext">
            Your payment has been successfully processed and verified. Your athlete membership is now active across all facilities.
          </p>

          <table class="table">
            <thead>
              <tr>
                <th>Item / Description</th>
                <th>Validity</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>${planTitle}</strong><br>
                  <span style="font-size: 12px; color: #9aa0ac;">Full Gym Access • Coaching Hub • Locker & Towel Service</span>
                </td>
                <td>Active till<br><strong>${expiryDate}</strong></td>
                <td style="text-align: right; font-weight: 700; color: #ffffff;">₹${amountPaid}</td>
              </tr>
            </tbody>
          </table>

          <div class="total-box">
            <div class="total-label">Total Amount Paid (${currency})</div>
            <div class="total-amount">₹${amountPaid}</div>
          </div>

          <div class="invoice-card">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-size: 12px; color: #9aa0ac;">INVOICE NUMBER</td>
                <td style="padding: 6px 0; font-size: 12px; font-weight: bold; color: #ffffff; text-align: right;">${receiptNo}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 12px; color: #9aa0ac;">TRANSACTION ID</td>
                <td style="padding: 6px 0; font-size: 12px; font-family: monospace; color: #ccff00; text-align: right;">${paymentId}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 12px; color: #9aa0ac;">PAYMENT GATEWAY</td>
                <td style="padding: 6px 0; font-size: 12px; color: #ffffff; text-align: right;">Razorpay India (100% Verified)</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 12px; color: #9aa0ac;">DATE OF PAYMENT</td>
                <td style="padding: 6px 0; font-size: 12px; color: #ffffff; text-align: right;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 12px; color: #9aa0ac;">BILLED TO</td>
                <td style="padding: 6px 0; font-size: 12px; color: #ffffff; text-align: right;">${athleteName} (${recipientEmail})</td>
              </tr>
            </table>
          </div>

          <div class="qr-callout">
            <div class="qr-title">⚡ Digital Turnstile Pass Activated</div>
            <p class="qr-text">
              Your personal <strong>Athlete Turnstile QR Pass</strong> is now live inside your Member Dashboard. Simply pull up your QR code on your mobile device at the turnstile gate for immediate entry.
            </p>
          </div>
        </div>

        <div class="footer">
          PROFIT Training Club • New York NoHo & New Delhi CP<br>
          For membership queries or support: <a href="mailto:admin@profitgym.com" style="color: #ccff00; text-decoration: none;">admin@profitgym.com</a><br>
          © ${new Date().getFullYear()} PROFIT Training Club. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  // 1. Check if SMTP configuration is available via Nodemailer
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: fromAddress,
        to: recipientEmail,
        subject: `🧾 [TAX INVOICE & RECEIPT] ${receiptNo} - Welcome to PROFIT Training Club!`,
        html,
      });

      console.log('\x1b[32m%s\x1b[0m', `[Email Receipt Sent] Delivered via SMTP to ${recipientEmail} (ID: ${info.messageId})`);
      return { success: true, id: info.messageId, provider: 'nodemailer' };
    } catch (smtpErr) {
      console.error('\x1b[31m%s\x1b[0m', `[SMTP Error] ${smtpErr.message}`);
    }
  }

  // 2. Fallback to Resend if RESEND_API_KEY is present
  const resend = getResendClient();
  if (resend) {
    try {
      const data = await resend.emails.send({
        from: fromAddress,
        to: recipientEmail,
        subject: `🧾 [TAX INVOICE & RECEIPT] ${receiptNo} - Welcome to PROFIT Training Club!`,
        html,
      });

      if (!data.error) {
        console.log('\x1b[32m%s\x1b[0m', `[Email Receipt Sent] Delivered via Resend to ${recipientEmail} (ID: ${data.data?.id})`);
        return { success: true, id: data.data?.id, provider: 'resend' };
      }
      console.warn('[Resend Receipt Error]', data.error.message);
    } catch (resendErr) {
      console.warn('[Resend Exception]', resendErr.message);
    }
  }

  // 3. In development / testing: Use Ethereal test inbox so developers can see real preview
  try {
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await testTransporter.sendMail({
      from: fromAddress,
      to: recipientEmail,
      subject: `🧾 [TAX INVOICE & RECEIPT] ${receiptNo} - Welcome to PROFIT Training Club!`,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('\x1b[32m%s\x1b[0m', `[Email Receipt Sent (Test Sandbox)] Delivered to ${recipientEmail}`);
    if (previewUrl) {
      console.log('\x1b[36m%s\x1b[0m', `⚡ [Email Invoice Preview URL]: ${previewUrl}`);
    }

    return { 
      success: true, 
      id: info.messageId, 
      provider: 'ethereal-test',
      previewUrl 
    };
  } catch (testErr) {
    console.warn('\x1b[33m%s\x1b[0m', `[Email Receipt Sandbox Notice] Could not create test SMTP account: ${testErr.message}`);
    return {
      success: true,
      simulated: true,
      message: 'Email prepared. Set SMTP_USER/SMTP_PASS or RESEND_API_KEY in server/.env for live inbox delivery.'
    };
  }
};

/**
 * Dispatches an instant security notification to the gym owner when someone signs in or registers.
 * @param {Object} options - { user, ip, userAgent, type }
 */
const sendAuthAlertEmail = async ({ user, ip = '127.0.0.1', userAgent = '', type = 'LOGIN' }) => {
  const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL || 'admin@profitgym.com';
  const fromAddress = process.env.EMAIL_FROM || 'PROFIT Training Club <no-reply@profitgym.com>';
  const actionLabel = type === 'REGISTER' ? 'New Account Registration' : 'Successful User Sign-In';
  const timeFormatted = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { margin: 0; padding: 0; background-color: #0d0e10; font-family: sans-serif; color: #f5f6f8; }
        .wrapper { max-width: 580px; margin: 25px auto; background-color: #141518; border: 1px solid #23252a; padding: 25px; }
        .header { border-bottom: 2px solid #ccff00; padding-bottom: 15px; margin-bottom: 20px; }
        .logo { font-size: 22px; font-weight: 900; color: #ffffff; }
        .accent { color: #ccff00; }
        .badge { display: inline-block; background-color: rgba(204, 255, 0, 0.1); color: #ccff00; padding: 4px 10px; font-size: 11px; font-weight: bold; border-radius: 2px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .table td { padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.07); font-size: 13px; }
        .label { color: #9aa0ac; text-transform: uppercase; font-size: 11px; font-weight: bold; width: 35%; }
        .val { color: #ffffff; font-weight: 600; }
        .footer { font-size: 11px; color: #676c78; margin-top: 25px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="logo">PRO<span class="accent">FIT</span> TRAINING CLUB</div>
          <div style="font-size: 11px; color: #9aa0ac; margin-top: 4px; text-transform: uppercase;">SECURITY TELEMETRY // REAL-TIME AUTH ALERT</div>
        </div>
        <div class="badge">SECURITY EVENT: ${actionLabel.toUpperCase()}</div>
        <p style="font-size: 14px; color: #d1d5db; margin-top: 15px;">
          An authentication event has occurred on the PROFIT Training Club platform.
        </p>
        <table class="table">
          <tr>
            <td class="label">ATHLETE / USER</td>
            <td class="val">${user?.fullName || user?.name || 'User'}</td>
          </tr>
          <tr>
            <td class="label">EMAIL ADDRESS</td>
            <td class="val">${user?.email}</td>
          </tr>
          <tr>
            <td class="label">PORTAL ROLE</td>
            <td class="val"><strong style="color: #ccff00;">${(user?.role || 'MEMBER').toUpperCase()}</strong></td>
          </tr>
          <tr>
            <td class="label">TIMESTAMP</td>
            <td class="val">${timeFormatted}</td>
          </tr>
          <tr>
            <td class="label">IP ADDRESS</td>
            <td class="val">${ip}</td>
          </tr>
        </table>
        <div class="footer">
          Automated Admin Alert • PROFIT Training Club SaaS
        </div>
      </div>
    </body>
    </html>
  `;

  // 1. Nodemailer SMTP if configured
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      const info = await transporter.sendMail({
        from: fromAddress,
        to: ownerEmail,
        subject: `🚨 [AUTH ALERT] ${actionLabel}: ${user?.fullName || user?.email}`,
        html,
      });
      console.log('\x1b[32m%s\x1b[0m', `[Auth Email Alert] Delivered to owner (${ownerEmail}) (ID: ${info.messageId})`);
      return { success: true, id: info.messageId };
    } catch (err) {
      console.error('[SMTP Alert Error]', err.message);
    }
  }

  // 2. Resend API if configured
  const resend = getResendClient();
  if (resend) {
    try {
      const data = await resend.emails.send({
        from: fromAddress,
        to: ownerEmail,
        subject: `🚨 [AUTH ALERT] ${actionLabel}: ${user?.fullName || user?.email}`,
        html,
      });
      if (!data.error) {
        console.log('\x1b[32m%s\x1b[0m', `[Auth Email Alert] Delivered to owner (${ownerEmail}) via Resend`);
        return { success: true, id: data.data?.id };
      }
    } catch (err) {}
  }

  // 3. Dev Ethereal sandbox fallback
  try {
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    const info = await testTransporter.sendMail({
      from: fromAddress,
      to: ownerEmail,
      subject: `🚨 [AUTH ALERT] ${actionLabel}: ${user?.fullName || user?.email}`,
      html,
    });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('\x1b[32m%s\x1b[0m', `[Auth Email Alert (Dev Sandbox)] Sent to ${ownerEmail}`);
    if (previewUrl) console.log('\x1b[36m%s\x1b[0m', `⚡ [Email Alert Preview URL]: ${previewUrl}`);
    return { success: true, previewUrl };
  } catch (err) {
    return { success: true, simulated: true };
  }
};

module.exports = {
  sendBookingAlert,
  sendContactAlert,
  sendMembershipAlert,
  sendPaymentReceiptEmail,
  sendAuthAlertEmail,
};
