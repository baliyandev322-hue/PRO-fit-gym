import React, { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { executeRazorpayCheckout, RazorpayVerificationResult } from '@/lib/razorpay';
import { useNotifications } from '@/context/NotificationContext';

export interface RazorpayCheckoutButtonProps {
  amountInRupees: number;
  planId?: string;
  planName?: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  buttonText?: string;
  className?: string;
  onSuccess?: (result: RazorpayVerificationResult) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export const RazorpayCheckoutButton: React.FC<RazorpayCheckoutButtonProps> = ({
  amountInRupees,
  planId = 'plan-performance',
  planName = 'Performance Tier',
  user = {
    id: 'athlete_guest',
    fullName: 'Valued Athlete',
    email: 'athlete@profitgym.com',
    phone: '+919876543210'
  },
  buttonText,
  className,
  onSuccess,
  onError,
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useNotifications();

  const handleCheckout = async () => {
    if (loading || disabled) return;

    setLoading(true);

    try {
      const result = await executeRazorpayCheckout({
        planId,
        planName,
        amountInRupees,
        user
      });

      setLoading(false);

      if (result.success && result.verified) {
        showToast({
          type: 'success',
          title: 'PAYMENT VERIFIED (HMAC-SHA256)',
          message: `Payment ${result.paymentId || 'completed'} settled successfully.`
        });
        if (onSuccess) onSuccess(result);
      } else {
        const errorMsg = result.error || 'Payment failed or was cancelled.';
        showToast({
          type: 'error',
          title: 'PAYMENT UNSUCCESSFUL',
          message: errorMsg
        });
        if (onError) onError(errorMsg);
      }
    } catch (err: any) {
      setLoading(false);
      const errMsg = err.message || 'Payment processing error.';
      showToast({
        type: 'error',
        title: 'PAYMENT ERROR',
        message: errMsg
      });
      if (onError) onError(errMsg);
    }
  };

  const defaultClasses = "flex items-center justify-center gap-2 py-3 px-5 rounded font-heading font-black uppercase text-xs bg-gym-lime text-gym-black hover:bg-gym-lime-hover transition-all shadow-lime-glow disabled:opacity-50 cursor-pointer";

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={disabled || loading}
      className={className || defaultClasses}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Processing Checkout...</span>
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4" />
          <span>{buttonText || `Pay ₹${amountInRupees.toLocaleString('en-IN')} via Razorpay`}</span>
        </>
      )}
    </button>
  );
};
