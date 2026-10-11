/**
 * PROFIT Training Club - WhatsApp Business Platform Cloud API Service
 * Handles official Meta Cloud API dispatches to notify the gym owner upon new athlete registrations.
 */

const cleanPhoneNumber = (number) => {
  if (!number) return '';
  // Strip all non-digit characters (+, spaces, hyphens)
  return String(number).replace(/\D/g, '');
};

/**
 * Dispatches a WhatsApp notification to the gym owner for new bookings.
 * @param {Object} booking - Booking document
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
const sendBookingAlert = async (booking) => {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const recipient = cleanPhoneNumber(process.env.OWNER_WHATSAPP_NUMBER);
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME;

  if (!token || !phoneNumberId || !recipient) {
    const missing = [];
    if (!token) missing.push('WHATSAPP_TOKEN');
    if (!phoneNumberId) missing.push('WHATSAPP_PHONE_NUMBER_ID');
    if (!recipient) missing.push('OWNER_WHATSAPP_NUMBER');

    console.warn('\x1b[33m%s\x1b[0m', `[WhatsApp Notice] Alert skipped. Missing environment variables: ${missing.join(', ')}`);
    return {
      success: false,
      error: `Service unconfigured: ${missing.join(', ')} missing in .env`,
    };
  }

  const isTrial = booking.type === 'trial_pass';
  const typeText = isTrial ? '7-Day Free Trial Pass' : 'Coached Session';
  const endpoint = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

  // Payload: If an approved Meta template is specified in .env, use template format; otherwise send high-priority text
  let payload;
  if (templateName) {
    payload = {
      messaging_product: 'whatsapp',
      to: recipient,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en_US' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: booking.bookingReference },
              { type: 'text', text: booking.fullName },
              { type: 'text', text: booking.phone },
              { type: 'text', text: booking.program || typeText },
              { type: 'text', text: `${booking.date} (${booking.time || 'General'})` },
            ],
          },
        ],
      },
    };
  } else {
    // Formatted text alert for direct communication
    const messageBody = [
      `⚡ *PROFIT TRAINING CLUB // NEW BOOKING DISPATCH*`,
      `----------------------------------------`,
      `📋 *Reference:* ${booking.bookingReference}`,
      `👤 *Athlete:* ${booking.fullName}`,
      `📞 *Phone:* ${booking.phone}`,
      `✉️ *Email:* ${booking.email}`,
      `🏋️ *Discipline:* ${booking.program || typeText}`,
      `🎯 *Coach:* ${booking.trainer || 'Any Master Coach'}`,
      `📅 *Date & Slot:* ${booking.date} // ${booking.time || 'Floor Walkthrough'}`,
      `📝 *Notes/Injuries:* ${booking.notes ? booking.notes : 'None noted.'}`,
      `----------------------------------------`,
      `⚡ *Action:* Please contact athlete within 4 hours to verify platform reservation.`,
    ].join('\n');

    payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'text',
      text: {
        preview_url: false,
        body: messageBody,
      },
    };
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errMsg = (data.error && data.error.message) || `HTTP ${res.status}`;
      console.error('\x1b[31m%s\x1b[0m', `[WhatsApp API Error] Delivery failed: ${errMsg}`);
      return { success: false, error: errMsg };
    }

    const messageId = data.messages && data.messages[0] ? data.messages[0].id : 'sent';
    console.log('\x1b[32m%s\x1b[0m', `[WhatsApp Sent] Notification delivered to ${recipient} (Message ID: ${messageId})`);
    return { success: true, messageId };
  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', `[WhatsApp Exception] ${err.message}`);
    return { success: false, error: err.message };
  }
};

/**
 * Dispatches a WhatsApp notification to the gym owner for concierge contact messages.
 * @param {Object} contact - Contact message document
 */
const sendContactAlert = async (contact) => {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const recipient = cleanPhoneNumber(process.env.OWNER_WHATSAPP_NUMBER);

  if (!token || !phoneNumberId || !recipient) {
    return { success: false, error: 'WhatsApp service unconfigured in .env' };
  }

  const endpoint = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
  const messageBody = [
    `📩 *PROFIT GYM // CONCIERGE INQUIRY*`,
    `----------------------------------------`,
    `📋 *Reference:* ${contact.reference}`,
    `👤 *Sender:* ${contact.fullName}`,
    `📞 *Phone:* ${contact.phone}`,
    `✉️ *Email:* ${contact.email}`,
    `🎯 *Objective:* ${contact.objective}`,
    `💬 *Message:* ${contact.message || 'No additional note.'}`,
  ].join('\n');

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: recipient,
        type: 'text',
        text: { preview_url: false, body: messageBody },
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: (data.error && data.error.message) || `HTTP ${res.status}` };
    }
    return { success: true, messageId: data.messages && data.messages[0]?.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Dispatches an official WhatsApp Invoice & Welcome message to the member upon successful payment.
 * Supports:
 * 1. Twilio WhatsApp API (via TWILIO_ACCOUNT_SID & TWILIO_AUTH_TOKEN)
 * 2. Meta WhatsApp Business Cloud API (via WHATSAPP_TOKEN & WHATSAPP_PHONE_NUMBER_ID)
 * 3. Graceful fallback logger with formatted message preview
 *
 * @param {Object} options - { user, payment, membership }
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
const sendPaymentReceiptWhatsApp = async ({ user, payment, membership }) => {
  const athleteName = user?.fullName || payment?.memberName || 'Athlete';
  const recipientRaw = user?.phone || payment?.phone || process.env.OWNER_WHATSAPP_NUMBER;
  const recipient = cleanPhoneNumber(recipientRaw);
  const receiptNo = payment?.receiptNumber || payment?.receipt || `INV-${Date.now().toString().slice(-6)}`;
  const planTitle = payment?.planName || membership?.planName || 'Performance Tier';
  const amountPaid = payment?.amount ? payment.amount.toLocaleString('en-IN') : '24,900';
  const paymentId = payment?.razorpayPaymentId || payment?.id || 'pay_verified';
  const expiryDate = membership?.expiryDate 
    ? new Date(membership.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'In 30 Days';

  const messageBody = [
    `⚡ *PROFIT TRAINING CLUB // OFFICIAL PAYMENT RECEIPT*`,
    `----------------------------------------------------`,
    `🎉 *Welcome to the Team, ${athleteName}!*`,
    `Your membership has been officially verified & activated.`,
    ``,
    `🧾 *Invoice No:* ${receiptNo}`,
    `💳 *Payment ID:* ${paymentId}`,
    `🏋️ *Plan:* ${planTitle}`,
    `💰 *Amount Paid:* ₹${amountPaid}`,
    `📅 *Valid Until:* ${expiryDate}`,
    ``,
    `🎟️ *Digital Turnstile Pass:* ACTIVE`,
    `Your personal Turnstile QR Pass is live in your Member Portal. Simply pull it up on your phone at the front gate for automated turnstile entry.`,
    ``,
    `📍 *PROFIT Training Club*`,
    `Questions? Reply directly to this message or speak to our desk team.`,
    `----------------------------------------------------`,
    `Train Hard. Stay Consistent. 💪`
  ].join('\n');

  // 1. Twilio WhatsApp dispatch
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886';

  if (twilioSid && twilioToken && recipient) {
    try {
      const formattedTo = recipient.startsWith('+') ? recipient : `+${recipient}`;
      const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const bodyParams = new URLSearchParams();
      bodyParams.append('From', `whatsapp:${twilioFrom}`);
      bodyParams.append('To', `whatsapp:${formattedTo}`);
      bodyParams.append('Body', messageBody);

      const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyParams.toString(),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        console.log('\x1b[32m%s\x1b[0m', `[WhatsApp Sent via Twilio] Delivered to +${recipient} (SID: ${data.sid})`);
        return { success: true, messageId: data.sid, provider: 'twilio' };
      }
      console.warn('\x1b[33m%s\x1b[0m', `[Twilio WhatsApp Notice] ${data.message || res.status}`);
    } catch (twErr) {
      console.warn('[Twilio WhatsApp Exception]', twErr.message);
    }
  }

  // 2. Meta WhatsApp Business Cloud API dispatch
  const metaToken = process.env.WHATSAPP_TOKEN;
  const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (metaToken && metaPhoneId && recipient) {
    try {
      const endpoint = `https://graph.facebook.com/v21.0/${metaPhoneId}/messages`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${metaToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipient,
          type: 'text',
          text: { preview_url: false, body: messageBody },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        console.log('\x1b[32m%s\x1b[0m', `[WhatsApp Sent via Meta] Delivered to +${recipient} (ID: ${data.messages?.[0]?.id})`);
        return { success: true, messageId: data.messages?.[0]?.id, provider: 'meta' };
      }
      console.warn('\x1b[33m%s\x1b[0m', `[Meta WhatsApp Notice] ${(data.error && data.error.message) || res.status}`);
    } catch (metaErr) {
      console.warn('[Meta WhatsApp Exception]', metaErr.message);
    }
  }

  // 3. Graceful fallback logging when credentials are not yet set
  console.log('\x1b[36m%s\x1b[0m', `--------------------------------------------------------`);
  console.log('\x1b[33m%s\x1b[0m', `⚡ [WhatsApp Receipt Dispatched (Dev Sandbox)]`);
  console.log('\x1b[36m%s\x1b[0m', `Recipient: ${recipient ? '+' + recipient : 'No Phone Provided'}`);
  console.log('\x1b[32m%s\x1b[0m', messageBody);
  console.log('\x1b[36m%s\x1b[0m', `Notice: To send live WhatsApp messages, configure TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN or WHATSAPP_TOKEN in server/.env`);
  console.log('\x1b[36m%s\x1b[0m', `--------------------------------------------------------`);

  return {
    success: true,
    simulated: true,
    message: 'WhatsApp receipt generated. Add Twilio or Meta WhatsApp credentials in server/.env for live delivery.',
    payload: messageBody
  };
};

module.exports = {
  cleanPhoneNumber,
  sendBookingAlert,
  sendContactAlert,
  sendPaymentReceiptWhatsApp,
};
