import { loadStripe, Stripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise && stripePublishableKey && !stripePublishableKey.includes('Mock')) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

export interface StripeCheckoutParams {
  planId: string;
  planName: string;
  amount: number;
  userId: string;
  userName: string;
}

export interface PaymentResult {
  success: boolean;
  sessionId?: string;
  error?: string;
  redirectUrl?: string;
}

/**
 * Initiates secure Stripe Hosted Checkout.
 * Raw cardholder data (PAN, CVV, Expiry) is NEVER collected or processed
 * in client state or custom application memory.
 */
export async function redirectToStripeCheckout(sessionId: string): Promise<PaymentResult> {
  const stripe = await getStripe();
  if (!stripe) {
    return {
      success: false,
      error: 'Stripe gateway is not configured with an active production publishable key.'
    };
  }

  const { error } = await (stripe as any).redirectToCheckout({ sessionId });
  if (error) {
    return {
      success: false,
      error: error.message
    };
  }

  return { success: true, sessionId };
}
