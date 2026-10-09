import React, { useState } from 'react';
import { 
  CreditCard, 
  Check, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Receipt, 
  ArrowUpRight, 
  Lock,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGymData } from '@/context/GymDataContext';
import { processStripePayment } from '@/lib/stripe';
import { executeRazorpayCheckout } from '@/lib/razorpay';
import { useNotifications } from '@/context/NotificationContext';
import confetti from 'canvas-confetti';
import type { MembershipPlan } from '@/types';

export const MemberMembershipPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    plans, 
    getMemberMembership, 
    payments, 
    purchaseMembership, 
    cancelMembership 
  } = useGymData();
  const { showToast } = useNotifications();

  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<MembershipPlan | null>(null);
  const [paymentGateway, setPaymentGateway] = useState<'razorpay' | 'card'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('981');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!user) return null;

  const currentMembership = getMemberMembership(user.id);
  const userPayments = payments.filter(p => p.member_id === user.id);

  const getPlanPriceINR = (plan: MembershipPlan) => {
    if (plan.id.includes('starter')) return 14900;
    if (plan.id.includes('elite')) return 39900;
    return 24900;
  };

  const handleOpenCheckout = (plan: MembershipPlan) => {
    setSelectedPlanForCheckout(plan);
    setPaymentError(null);
  };

  const handleExecuteRazorpay = async () => {
    if (!selectedPlanForCheckout) return;

    setIsProcessing(true);
    setPaymentError(null);

    const priceINR = getPlanPriceINR(selectedPlanForCheckout);

    try {
      const result = await executeRazorpayCheckout({
        planId: selectedPlanForCheckout.id,
        planName: selectedPlanForCheckout.name,
        amountInRupees: priceINR,
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          phone: (user as any).phone || '+91 98765 43210'
        }
      });

      setIsProcessing(false);

      if (result.success) {
        await purchaseMembership(selectedPlanForCheckout.id, 'RAZORPAY_UPI');
        setSelectedPlanForCheckout(null);

        // Confetti celebration
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ccff00', '#ffffff', '#00e5ff']
        });

        showToast({
          type: 'success',
          title: 'RAZORPAY VERIFIED (HMAC-SHA256)',
          message: `Payment ${result.paymentId || 'completed'} settled. ${selectedPlanForCheckout.name} pass activated!`
        });
      } else {
        setPaymentError(result.error || 'Payment failed or was cancelled.');
      }
    } catch (err: any) {
      setIsProcessing(false);
      setPaymentError(err.message || 'Payment processing error');
    }
  };

  const handleExecutePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForCheckout) return;

    if (paymentGateway === 'razorpay') {
      return handleExecuteRazorpay();
    }

    setIsProcessing(true);
    setPaymentError(null);

    const result = await processStripePayment({
      planId: selectedPlanForCheckout.id,
      planName: selectedPlanForCheckout.name,
      amount: selectedPlanForCheckout.price,
      userId: user.id,
      userName: user.full_name,
      cardNumber,
      expiry: cardExpiry,
      cvc: cardCvc
    });

    setIsProcessing(false);

    if (result.success) {
      await purchaseMembership(selectedPlanForCheckout.id, 'STRIPE_CARD');
      setSelectedPlanForCheckout(null);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ccff00', '#ffffff', '#23252a']
      });

      showToast({
        type: 'success',
        title: 'PAYMENT VERIFIED (CARD)',
        message: `Transaction ${result.transactionId} settled. Plan activated!`
      });
    } else {
      setPaymentError(result.error || 'Payment failed. Please verify your card details.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide">
          MEMBERSHIP SUBSCRIPTIONS & STRIPE BILLING
        </h2>
        <p className="text-xs text-gym-secondary">
          Exclusive 300-member access, executive amenities, and high-performance tiers
        </p>
      </div>

      {/* Current Active Membership Card */}
      <div className="bg-gradient-to-br from-gym-surface via-gym-surface to-gym-black border border-gym-border rounded-sm p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-heading text-2xl sm:text-3xl font-black uppercase text-gym-primary tracking-wide">
                CURRENT TIER: {currentMembership?.plan?.name || 'Performance'}
              </span>
              <span className={`px-2.5 py-0.5 text-xs font-heading font-black uppercase rounded tracking-wider ${
                currentMembership?.status === 'active'
                  ? 'bg-gym-lime/10 text-gym-lime border border-gym-lime/30'
                  : currentMembership?.status === 'expiring_soon'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
              }`}>
                {currentMembership?.status?.replace('_', ' ') || 'ACTIVE'}
              </span>
            </div>

            <p className="text-xs text-gym-secondary max-w-xl leading-relaxed">
              {currentMembership?.plan?.description || 'The standard high-performance membership with unlimited 24/7 keycard access and recovery suite privileges.'}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gym-secondary">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gym-lime" />
                <span>Activated: <strong className="text-white">{currentMembership?.start_date || '2026-09-28'}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gym-lime" />
                <span>Expires: <strong className="text-white">{currentMembership?.expiry_date || '2026-10-28'}</strong> ({currentMembership?.days_remaining ?? 18} days left)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-gym-lime" />
                <span>Auto-Renewal: <strong className="text-white">Active via Stripe</strong></span>
              </div>
            </div>
          </div>

          <div className="text-right flex flex-col md:items-end justify-between gap-3 shrink-0">
            <div>
              <span className="text-xs text-gym-muted uppercase font-heading font-bold block">Monthly Dues</span>
              <span className="font-heading text-4xl font-black text-gym-lime">
                ${currentMembership?.plan?.price || 249}<span className="text-sm font-normal text-gym-secondary">/mo</span>
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleOpenCheckout(currentMembership?.plan || plans[1])}
                className="px-4 py-2 bg-gym-lime text-gym-black font-heading font-bold uppercase text-xs rounded-sm hover:bg-gym-lime-hover shadow-lime-glow transition-all"
              >
                Renew Membership Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans for Upgrade/Change */}
      <div>
        <h3 className="font-heading text-lg font-black uppercase tracking-wider text-gym-primary mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gym-lime" />
          AVAILABLE MEMBERSHIP TIERS
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = currentMembership?.plan_id === plan.id;
            return (
              <div
                key={plan.id}
                className={`bg-gym-surface rounded-sm p-6 flex flex-col justify-between border transition-all ${
                  isCurrent
                    ? 'border-gym-lime ring-1 ring-gym-lime/50'
                    : plan.is_popular
                    ? 'border-gym-lime/50 shadow-lime-glow'
                    : 'border-gym-border hover:border-gym-muted'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide">
                      {plan.name}
                    </span>
                    {plan.is_popular && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-heading font-black uppercase bg-gym-lime text-gym-black">
                        Most Popular
                      </span>
                    )}
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-heading font-black uppercase bg-gym-black border border-gym-lime text-gym-lime">
                        Current Tier
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gym-secondary mb-4 leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="mb-6">
                    <span className="font-heading text-4xl font-black text-gym-primary">
                      ${plan.price}
                    </span>
                    <span className="text-xs text-gym-secondary font-medium ml-1">/ month</span>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-gym-border mb-6">
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-gym-secondary">
                        <Check className="w-3.5 h-3.5 text-gym-lime shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenCheckout(plan)}
                  className={`w-full py-2.5 rounded-sm font-heading uppercase font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? 'bg-gym-black border border-gym-border text-gym-lime hover:bg-gym-surface'
                      : 'bg-gym-lime text-gym-black hover:bg-gym-lime-hover shadow-lime-glow'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{isCurrent ? 'Renew Current Plan' : `Upgrade to ${plan.name}`}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stripe Payment History Table */}
      <div className="bg-gym-surface border border-gym-border rounded-sm p-6">
        <h3 className="font-heading text-lg font-black uppercase tracking-wider text-gym-primary mb-4 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-gym-lime" />
          STRIPE INVOICES & PAYMENT RECEIPTS
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gym-border text-gym-muted font-heading uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Invoice ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gym-border/40">
              {userPayments.map(p => (
                <tr key={p.id} className="hover:bg-gym-surface-hover/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-gym-secondary">{p.stripe_payment_intent_id || p.id}</td>
                  <td className="py-3.5 px-4 font-mono text-gym-primary">
                    {new Date(p.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-3.5 px-4 text-white font-medium">{p.plan_name || 'Membership'}</td>
                  <td className="py-3.5 px-4 font-heading font-bold text-gym-lime text-sm">
                    ${p.amount}.00 USD
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-heading uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-gym-lime font-mono text-xs flex items-center justify-end gap-1">
                      <span>Stripe PDF</span> <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= PAYMENT CHECKOUT MODAL (RAZORPAY & CARDS) ================= */}
      {selectedPlanForCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-gym-surface border border-gym-border rounded-sm max-w-lg w-full p-6 relative shadow-card animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedPlanForCheckout(null)}
              className="absolute top-4 right-4 text-gym-muted hover:text-white text-sm"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-gym-lime" />
              <span className="text-[11px] font-heading font-black uppercase text-gym-lime tracking-wider">
                PROFIT SECURE PAYMENT GATEWAY &bull; 256-BIT ENCRYPTED
              </span>
            </div>

            <h3 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide">
              {selectedPlanForCheckout.name} Membership
            </h3>

            {/* Price display in INR & USD */}
            <div className="flex items-baseline justify-between mb-4 pb-3 border-b border-gym-border">
              <div>
                <span className="font-heading text-3xl font-black text-gym-lime">
                  ₹{getPlanPriceINR(selectedPlanForCheckout).toLocaleString()}
                </span>
                <span className="text-xs text-gym-secondary ml-1 font-mono">INR</span>
              </div>
              <span className="text-xs text-gym-muted">
                (${selectedPlanForCheckout.price}.00 USD equivalent)
              </span>
            </div>

            {/* Gateway Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setPaymentGateway('razorpay')}
                className={`py-2 px-3 text-xs font-heading font-bold uppercase rounded border transition-all flex items-center justify-center gap-1.5 ${
                  paymentGateway === 'razorpay'
                    ? 'bg-gym-lime text-gym-black border-gym-lime shadow-lime-glow'
                    : 'bg-gym-black text-gym-secondary border-gym-border hover:text-white'
                }`}
              >
                <span>⚡ Razorpay (UPI & INR)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentGateway('card')}
                className={`py-2 px-3 text-xs font-heading font-bold uppercase rounded border transition-all flex items-center justify-center gap-1.5 ${
                  paymentGateway === 'card'
                    ? 'bg-gym-lime text-gym-black border-gym-lime shadow-lime-glow'
                    : 'bg-gym-black text-gym-secondary border-gym-border hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Credit / Debit Card</span>
              </button>
            </div>

            {paymentError && (
              <div className="p-3 mb-4 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            {paymentGateway === 'razorpay' ? (
              /* RAZORPAY UPI & INDIAN RAILS TAB */
              <div className="space-y-4">
                <div className="p-3.5 bg-gym-black rounded border border-gym-border space-y-2">
                  <span className="text-[11px] font-heading font-bold uppercase text-gym-lime block">
                    Supported Payment Rails (India):
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-gym-secondary">
                    <span className="px-2 py-0.5 bg-gym-surface rounded border border-gym-border">UPI (GPay / PhonePe / Paytm)</span>
                    <span className="px-2 py-0.5 bg-gym-surface rounded border border-gym-border">Scan & Pay QR</span>
                    <span className="px-2 py-0.5 bg-gym-surface rounded border border-gym-border">RuPay / Visa / MC</span>
                    <span className="px-2 py-0.5 bg-gym-surface rounded border border-gym-border">50+ NetBanking Banks</span>
                  </div>
                </div>

                <div className="p-3 bg-gym-black rounded border border-gym-border text-[11px] text-gym-muted leading-relaxed">
                  Razorpay server order will be signed with <strong className="text-white">HMAC-SHA256</strong>. Upon instant completion, your sanctuary membership will be extended by 30 days and synced to the front desk turnstiles.
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPlanForCheckout(null)}
                    className="w-1/3 py-2.5 bg-gym-black hover:bg-gym-surface border border-gym-border text-gym-secondary text-xs uppercase font-heading font-bold rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteRazorpay}
                    disabled={isProcessing}
                    className="w-2/3 py-2.5 bg-gym-lime hover:bg-gym-lime-hover text-gym-black text-xs uppercase font-heading font-black tracking-wider rounded shadow-lime-glow flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <div className="w-4 h-4 border-2 border-gym-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span>Pay ₹{getPlanPriceINR(selectedPlanForCheckout).toLocaleString()} via Razorpay</span>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* CARD CHECKOUT TAB */
              <form onSubmit={handleExecutePayment} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    defaultValue={user.full_name}
                    required
                    className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary text-xs focus:outline-none focus:border-gym-lime"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                    Card Number (Visa / Mastercard / Amex)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      required
                      className="w-full py-2 pl-3 pr-10 bg-gym-black border border-gym-border rounded text-gym-primary font-mono text-xs focus:outline-none focus:border-gym-lime"
                    />
                    <CreditCard className="w-4 h-4 text-gym-muted absolute right-3 top-2.5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                      Expiration
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      required
                      className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary font-mono text-xs focus:outline-none focus:border-gym-lime"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                      CVC / CVV
                    </label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="CVC"
                      required
                      className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary font-mono text-xs focus:outline-none focus:border-gym-lime"
                    />
                  </div>
                </div>

                <div className="p-3 bg-gym-black rounded border border-gym-border text-[11px] text-gym-muted leading-relaxed">
                  By clicking pay, you authorize PROFIT Training Club to charge your card <strong className="text-white">${selectedPlanForCheckout.price}.00 USD</strong>.
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPlanForCheckout(null)}
                    className="w-1/3 py-2.5 bg-gym-black hover:bg-gym-surface border border-gym-border text-gym-secondary text-xs uppercase font-heading font-bold rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-2/3 py-2.5 bg-gym-lime hover:bg-gym-lime-hover text-gym-black text-xs uppercase font-heading font-black tracking-wider rounded shadow-lime-glow flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <div className="w-4 h-4 border-2 border-gym-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span>Pay ${selectedPlanForCheckout.price}.00 via Card</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
