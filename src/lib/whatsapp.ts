/**
 * PROFIT Training Club - WhatsApp Direct Dispatch & Receipt Generator
 * Generates verified WhatsApp messages and links for athlete payment receipts,
 * turnstile QR passes, and trial bookings.
 */

export interface WhatsAppReceiptOptions {
  athleteName: string;
  planName: string;
  amount: number;
  currency?: 'INR' | 'USD' | string;
  paymentId?: string;
  receiptNumber?: string;
  expiryDate?: string;
  phone?: string;
}

export interface WhatsAppTrialOptions {
  athleteName: string;
  reference: string;
  discipline: string;
  date?: string;
  phone?: string;
}

/**
 * Standardize Indian and International phone numbers for WhatsApp API
 */
export function formatWhatsAppPhoneNumber(phone?: string): string {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`; // Default to India (+91)
  }
  return digits;
}

/**
 * Generate a pre-filled, formatted WhatsApp link for official gym pass & payment receipt
 */
export function generateWhatsAppReceiptUrl(options: WhatsAppReceiptOptions): string {
  const phone = formatWhatsAppPhoneNumber(options.phone);
  const isUSD = options.currency === 'USD' || (options.amount > 0 && options.amount < 1000);
  const formattedPrice = isUSD ? `$${options.amount} USD` : `₹${options.amount.toLocaleString('en-IN')} INR`;
  const receiptNo = options.receiptNumber || `INV-PROFIT-${Date.now().toString().slice(-6)}`;
  const validDate = options.expiryDate || new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const message = [
    `⚡ *PROFIT TRAINING CLUB // OFFICIAL GYM PASS & RECEIPT* ⚡`,
    `----------------------------------------------------`,
    `🎉 *Welcome to the Team, ${options.athleteName}!*`,
    `Your sanctuary membership has been verified & activated.`,
    ``,
    `🧾 *Invoice No:* ${receiptNo}`,
    `💳 *Payment ID:* ${options.paymentId || 'pay_verified'}`,
    `🏋️ *Membership Tier:* ${options.planName}`,
    `💰 *Amount Paid:* ${formattedPrice}`,
    `📅 *Valid Until:* ${validDate}`,
    ``,
    `🎟️ *Digital Turnstile Pass:* ACTIVE`,
    `Pull up your live QR pass and workout programming anytime:`,
    `🔗 https://profitgymclub.com/member/dashboard`,
    `----------------------------------------------------`,
    `Show this pass at the front desk turnstiles for entry.`,
    `Train Hard. Stay Consistent. 💪`,
  ].join('\n');

  const encodedMessage = encodeURIComponent(message);
  return phone 
    ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`
    : `https://api.whatsapp.com/send?text=${encodedMessage}`;
}

/**
 * Generate a pre-filled, formatted WhatsApp link for a complimentary 7-Day trial pass
 */
export function generateWhatsAppTrialUrl(options: WhatsAppTrialOptions): string {
  const phone = formatWhatsAppPhoneNumber(options.phone);
  const message = [
    `⚡ *PROFIT TRAINING CLUB // 7-DAY VIP TRIAL PASS* ⚡`,
    `----------------------------------------------------`,
    `👋 *Hello ${options.athleteName}!*`,
    `Your 7-Day Complimentary Sanctuary Trial Pass is confirmed.`,
    ``,
    `🎟️ *Pass Reference:* ${options.reference}`,
    `🏋️ *Discipline:* ${options.discipline}`,
    `📅 *Start Date:* ${options.date || 'Immediate Walkthrough'}`,
    `📍 *Location:* PROFIT Flagship Sanctuary`,
    `----------------------------------------------------`,
    `Show this reference at our reception desk to claim your athlete pass.`,
    `We look forward to seeing you on the training floor!`
  ].join('\n');

  const encodedMessage = encodeURIComponent(message);
  return phone 
    ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`
    : `https://api.whatsapp.com/send?text=${encodedMessage}`;
}

/**
 * Directly open the generated WhatsApp message in a new window/app
 */
export function openWhatsAppReceipt(options: WhatsAppReceiptOptions): void {
  const url = generateWhatsAppReceiptUrl(options);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Directly open the generated WhatsApp trial pass in a new window/app
 */
export function openWhatsAppTrial(options: WhatsAppTrialOptions): void {
  const url = generateWhatsAppTrialUrl(options);
  window.open(url, '_blank', 'noopener,noreferrer');
}
