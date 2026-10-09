import React, { useState } from 'react';
import { Settings, Save, ShieldCheck, Database, CreditCard, QrCode } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useNotifications();

  const [clubName, setClubName] = useState('PROFIT Training Club');
  const [memberCap, setMemberCap] = useState(300);
  const [address, setAddress] = useState('428 Lafayette Street, NoHo, New York, NY 10003');
  const [gateTimeout, setGateTimeout] = useState(120); // Minutes

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast({
      type: 'success',
      title: 'SETTINGS DEPLOYED',
      message: 'Facility operational parameters and database rules updated.'
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide">
          FACILITY OPERATIONS & SYSTEM INTEGRATIONS
        </h2>
        <p className="text-xs text-gym-secondary">
          Configure physical sanctuary parameters, turnstile hardware protocols, and payment engines
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Parameters */}
        <div className="bg-gym-surface border border-gym-border rounded-sm p-6 space-y-4">
          <h3 className="font-heading text-lg font-black uppercase tracking-wider text-gym-primary border-b border-gym-border pb-3">
            SANCTUARY GENERAL PARAMETERS
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-heading font-bold text-gym-secondary mb-1">
                Club Legal Name
              </label>
              <input
                type="text"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-xs text-gym-primary focus:outline-none focus:border-gym-lime"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-heading font-bold text-gym-secondary mb-1">
                Strict Member Cap Limit
              </label>
              <input
                type="number"
                value={memberCap}
                onChange={(e) => setMemberCap(Number(e.target.value))}
                className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-xs text-gym-lime font-bold focus:outline-none focus:border-gym-lime"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-heading font-bold text-gym-secondary mb-1">
              Sanctuary Flagship Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-xs text-gym-primary focus:outline-none focus:border-gym-lime"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-heading font-bold text-gym-secondary mb-1">
              Turnstile Anti-Duplicate Check-in Window (Minutes)
            </label>
            <input
              type="number"
              value={gateTimeout}
              onChange={(e) => setGateTimeout(Number(e.target.value))}
              className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-xs text-gym-primary focus:outline-none focus:border-gym-lime"
            />
            <span className="text-[11px] text-gym-muted mt-1 block">
              Athletes cannot check in twice within this window without front-desk manual override.
            </span>
          </div>
        </div>

        {/* Integration Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gym-surface border border-gym-border rounded-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-heading font-bold uppercase text-xs text-gym-primary flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" /> SUPABASE DATABASE
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                CONNECTED
              </span>
            </div>
            <p className="text-xs text-gym-secondary">
              PostgreSQL schema active with 10 tables and Row Level Security (RLS) enforcement.
            </p>
          </div>

          <div className="bg-gym-surface border border-gym-border rounded-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-heading font-bold uppercase text-xs text-gym-primary flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cyan-400" /> STRIPE CHECKOUT API
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-gym-secondary">
              Instant PCI DSS level 1 checkout and automatic subscription status activation.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-gym-lime text-gym-black font-heading uppercase font-bold text-xs rounded hover:bg-gym-lime-hover shadow-lime-glow transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Deploy System Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
