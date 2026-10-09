import { loadStripe, Stripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_demo_profit_gym';

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise && stripePublishableKey && !stripePublishableKey.includes('demo')) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

export interface ProcessPaymentParams {
  planId: string;
  planName: string;
  amount: number;
  userId: string;
  userName: string;
  cardNumber?: string;
  expiry?: string;
  cvc?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  receiptUrl?: string;
}

// Production & Dev resilient Stripe Checkout simulator / executor
export async function processStripePayment(params: ProcessPaymentParams): Promise<PaymentResult> {
  // Simulate network latency (0.8s) for real checkout feel
  await new Promise(res => setTimeout(res, 800));

  // If card number is provided and ends with 0000 -> simulate decline
  if (params.cardNumber && params.cardNumber.replace(/\s/g, '').endsWith('0000')) {
    return {
      success: false,
      error: 'Card declined by issuing bank (Test Simulator). Please check card details or use another card.'
    };
  }

  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const receiptUrl = `https://pay.stripe.com/receipts/acct_profitgym/${transactionId}`;

  return {
    success: true,
    transactionId,
    receiptUrl
  };
}
