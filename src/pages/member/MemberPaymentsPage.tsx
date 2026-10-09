import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  Receipt, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowUpRight,
  ShieldCheck,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGymData } from '@/context/GymDataContext';

export const MemberPaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const { payments, getMemberMembership } = useGymData();

  if (!user) return null;

  const membership = getMemberMembership(user.id);
  const userPayments = payments.filter((p) => p.member_id === user.id);

  const totalSpent = userPayments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide">
            PAYMENT HISTORY & INVOICE RECEIPTS
          </h2>
          <p className="text-xs text-gym-secondary">
            Verified billing statements, subscription renewals, and digital tax receipts
          </p>
        </div>

        <Link
          to="/member/membership"
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm font-heading uppercase font-bold text-xs bg-gym-lime text-gym-black hover:bg-gym-lime-hover shadow-lime-glow transition-all"
        >
          <CreditCard className="w-4 h-4" />
          <span>Manage / Upgrade Membership</span>
        </Link>
      </div>

      {/* 3 Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gym-surface border border-gym-border p-5 rounded-sm">
          <div className="flex items-center justify-between text-gym-muted mb-2">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider">Active Billing Plan</span>
            <ShieldCheck className="w-4 h-4 text-gym-lime" />
          </div>
          <div className="font-heading text-3xl font-black text-gym-primary">
            {membership?.plan?.name || 'Performance'} Tier
          </div>
          <span className="text-[10px] text-gym-secondary block mt-1">
            Status: <strong className="text-gym-lime uppercase">{membership?.status || 'Active'}</strong>
          </span>
        </div>

        <div className="bg-gym-surface border border-gym-border p-5 rounded-sm">
          <div className="flex items-center justify-between text-gym-muted mb-2">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider">Total Investment</span>
            <DollarSign className="w-4 h-4 text-gym-lime" />
          </div>
          <div className="font-heading text-3xl font-black text-gym-primary">
            ${totalSpent}.00 <span className="text-xs text-gym-secondary font-normal">USD</span>
          </div>
          <span className="text-[10px] text-emerald-400 block mt-1 font-semibold">
            {userPayments.length} Verified Invoices
          </span>
        </div>

        <div className="bg-gym-surface border border-gym-border p-5 rounded-sm">
          <div className="flex items-center justify-between text-gym-muted mb-2">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider">Next Scheduled Charge</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-heading text-3xl font-black text-gym-primary">
            {membership?.expiry_date || 'Oct 28, 2026'}
          </div>
          <span className="text-[10px] text-gym-secondary block mt-1 font-mono">
            Auto-renew: {membership?.auto_renew ? 'Active' : 'Disabled'}
          </span>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-gym-surface border border-gym-border rounded-sm p-6">
        <h3 className="font-heading text-lg font-black uppercase tracking-wider text-gym-primary mb-4 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-gym-lime" />
          SETTLED INVOICES & STATEMENTS
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gym-border text-gym-muted font-heading uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Statement ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Receipt / Tax Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gym-border/40">
              {userPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gym-muted">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                userPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-gym-surface-hover/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-gym-secondary">
                      {p.stripe_payment_intent_id || p.id}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gym-primary">
                      {new Date(p.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-white font-medium">
                      {p.plan_name || 'Membership'}
                    </td>
                    <td className="py-3.5 px-4 font-heading font-black text-gym-lime text-sm">
                      ${p.amount}.00 {p.currency}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-heading uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => alert(`Downloading verified receipt: ${p.id}`)}
                        className="inline-flex items-center gap-1 text-gym-lime hover:underline font-mono text-xs"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF Statement
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
