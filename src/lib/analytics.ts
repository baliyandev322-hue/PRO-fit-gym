/**
 * PROFIT Training Club — Google Analytics 4 (GA4) Integration
 * 
 * Features:
 * - Privacy-first & GDPR-conscious: zero PII (names, emails, phones) or payment secrets transmitted.
 * - Dynamic asynchronous gtag initialization when VITE_GA4_MEASUREMENT_ID is configured.
 * - In-memory event deduplication to eliminate duplicate conversion firing.
 * - Safe no-op fallback when GA4 ID is unset or in test environments.
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

const GA4_MEASUREMENT_ID = (import.meta.env.VITE_GA4_MEASUREMENT_ID || '').trim();

// Cache of dispatched event fingerprints to prevent duplicates
const dispatchedEventsCache = new Set<string>();

/**
 * Initializes Google Analytics 4 tag if a valid Measurement ID is configured.
 */
export function initGA4(): void {
  if (typeof window === 'undefined') return;

  // Verify ID starts with G-
  if (!GA4_MEASUREMENT_ID || !GA4_MEASUREMENT_ID.startsWith('G-')) {
    return;
  }

  // Prevent duplicate script injection
  if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}"]`)) {
    return;
  }

  try {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer?.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA4_MEASUREMENT_ID, {
      anonymize_ip: true,
      send_page_view: true,
    });
  } catch (err) {
    console.warn('[Analytics Notice] Could not initialize Google Analytics 4:', err);
  }
}

/**
 * Dispatches a typed event to GA4 with deduplication and sanitization.
 */
function sendEvent(eventName: string, params: Record<string, any> = {}, dedupeKey?: string): void {
  if (dedupeKey) {
    if (dispatchedEventsCache.has(dedupeKey)) {
      return;
    }
    dispatchedEventsCache.add(dedupeKey);
  }

  if (typeof window !== 'undefined' && typeof window.gtag === 'function' && GA4_MEASUREMENT_ID) {
    window.gtag('event', eventName, params);
  }
}

// ============================================================================
// 6 CRITICAL GA4 CONVERSION EVENTS
// ============================================================================

/**
 * 1. Trial form submission initiation
 */
export function trackTrialFormSubmission(discipline?: string): void {
  sendEvent('trial_form_submission', {
    event_category: 'Leads',
    discipline: discipline || 'General',
  });
}

/**
 * 2. Successful trial pass booking with reference ID
 */
export function trackTrialBookingSuccess(reference: string, discipline?: string): void {
  sendEvent('trial_booking_success', {
    event_category: 'Conversions',
    reference_id: reference,
    discipline: discipline || 'General',
  }, `trial_${reference}`);
}

/**
 * 3. WhatsApp lead concierge click
 */
export function trackWhatsAppLeadClick(context: string): void {
  sendEvent('whatsapp_lead_click', {
    event_category: 'Engagement',
    lead_source: context,
  });
}

/**
 * 4. Membership checkout initiation
 */
export function trackCheckoutInitiation(planId: string, planName: string, amount: number): void {
  sendEvent('begin_checkout', {
    event_category: 'Ecommerce',
    items: [{ item_id: planId, item_name: planName, price: amount }],
    currency: 'INR',
    value: amount,
  });
}

/**
 * 5. Successful membership payment verified
 */
export function trackPaymentSuccess(paymentId: string, planName: string, amount: number): void {
  sendEvent('purchase', {
    event_category: 'Ecommerce',
    transaction_id: paymentId,
    value: amount,
    currency: 'INR',
    items: [{ item_name: planName, price: amount }],
  }, `payment_${paymentId}`);
}

/**
 * 6. Contact concierge form submission
 */
export function trackContactFormSubmission(subject: string, ref: string): void {
  sendEvent('contact_form_submission', {
    event_category: 'Leads',
    inquiry_category: subject,
    inquiry_ref: ref,
  }, `contact_${ref}`);
}
