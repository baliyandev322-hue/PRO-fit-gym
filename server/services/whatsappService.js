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

module.exports = {
  cleanPhoneNumber,
  sendBookingAlert,
  sendContactAlert,
};
