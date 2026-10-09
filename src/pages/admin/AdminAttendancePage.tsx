import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  MapPin, 
  RefreshCw, 
  ShieldCheck, 
  Download, 
  CheckCircle2, 
  Users, 
  Flame, 
  Scan
} from 'lucide-react';
import { useGymData } from '@/context/GymDataContext';
import { QRCodeSVG } from 'qrcode.react';

export const AdminAttendancePage: React.FC = () => {
  const { attendance, recordAttendance } = useGymData();

  const [selectedLocation, setSelectedLocation] = useState('NYC - NoHo Flagship (Sanctuary 01)');
  const [terminalToken, setTerminalToken] = useState(`FACILITY_GATE_${Date.now()}`);
  const [manualMemberId, setManualMemberId] = useState('user-member-1');
  const [manualMemberName, setManualMemberName] = useState('Alex Vance');
  const [manualResult, setManualResult] = useState<{ success: boolean; message: string } | null>(null);

  // Rotate QR Token periodically for security
  const handleRegenerateToken = () => {
    setTerminalToken(`FACILITY_GATE_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
  };

  const handleManualScan = () => {
    const res = recordAttendance(manualMemberId, manualMemberName, selectedLocation, 'qr_scan');
    setManualResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide">
            FACILITY QR CHECK-IN TERMINAL
          </h2>
          <p className="text-xs text-gym-secondary">
            Broadcast dynamic QR code to turnstile cameras or scan incoming members
          </p>
        </div>

        <button
          onClick={handleRegenerateToken}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gym-surface hover:bg-gym-surface-hover text-gym-primary border border-gym-border rounded text-xs font-heading font-bold uppercase tracking-wider transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-gym-lime" />
          <span>Regenerate Turnstile Passcode</span>
        </button>
      </div>

      {/* QR Broadcast Display & Manual Scanner Test */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Terminal Front-Desk QR Display */}
        <div className="bg-gym-surface border border-gym-border rounded-sm p-6 flex flex-col items-center justify-between text-center relative overflow-hidden">
          <div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-gym-lime rounded-full animate-ping"></span>
              <span className="text-[11px] font-heading font-black uppercase text-gym-lime tracking-widest">
                OFFICIAL NO-HO TURNSTILE GATE 01
              </span>
            </div>
            <h3 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide mb-1">
              SCAN TO ENTER SANCTUARY
            </h3>
            <p className="text-xs text-gym-secondary mb-6">
              Members can open their mobile app and point camera here to unlock turnstile
            </p>
          </div>

          {/* Calibrated QR Code */}
          <div className="p-6 bg-white rounded shadow-lime-glow-lg border-4 border-gym-black">
            <QRCodeSVG
              value={`PROFIT_GYM_SANCTUARY_CHECKIN:${selectedLocation}:${terminalToken}`}
              size={220}
              level="H"
            />
          </div>

          <div className="mt-6 w-full space-y-2">
            <div className="font-mono text-xs text-gym-lime bg-gym-black p-2 rounded border border-gym-border flex items-center justify-between">
              <span>SECURITY TOKEN:</span>
              <span className="font-bold">{terminalToken}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-gym-muted">
              <ShieldCheck className="w-4 h-4 text-gym-lime" />
              <span>Anti-Replay Protection Active &bull; Turnstile Relays Armed</span>
            </div>
          </div>
        </div>

        {/* Turnstile Gate Scanner Simulator */}
        <div className="bg-gym-surface border border-gym-border rounded-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-heading text-lg font-black uppercase tracking-wider text-gym-primary mb-2 flex items-center gap-2">
              <Scan className="w-4 h-4 text-gym-lime" />
              FRONT DESK BARCODE SCANNER CONSOLE
            </h3>
            <p className="text-xs text-gym-secondary mb-4 leading-relaxed">
              If an athlete presents a physical keytag or mobile app barcode at reception, staff can manually verify and trigger gate unlock here.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                  Active Facility Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary text-xs focus:outline-none focus:border-gym-lime"
                >
                  <option value="NYC - NoHo Flagship (Sanctuary 01)">NYC - NoHo Flagship (Sanctuary 01)</option>
                  <option value="NYC - Tribeca Lab (Sanctuary 02)">NYC - Tribeca Lab (Sanctuary 02)</option>
                  <option value="Miami - Design District (Sanctuary 03)">Miami - Design District (Sanctuary 03)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                  Select Athlete At Reception
                </label>
                <select
                  value={manualMemberId}
                  onChange={(e) => {
                    setManualMemberId(e.target.value);
                    const name = e.target.value === 'user-member-1' ? 'Alex Vance' : e.target.value === 'user-member-2' ? 'Elena Rostova' : 'Jordan Bell';
                    setManualMemberName(name);
                  }}
                  className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary text-xs focus:outline-none focus:border-gym-lime"
                >
                  <option value="user-member-1">Alex Vance (Performance Tier)</option>
                  <option value="user-member-2">Elena Rostova (Elite Tier)</option>
                  <option value="user-member-3">Jordan Bell (Starter Tier)</option>
                </select>
              </div>

              {manualResult && (
                <div className={`p-3 rounded text-xs ${
                  manualResult.success 
                    ? 'bg-gym-lime/10 border border-gym-lime/30 text-gym-lime' 
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}>
                  {manualResult.message}
                </div>
              )}

              <button
                onClick={handleManualScan}
                className="w-full py-3 bg-gym-lime text-gym-black font-heading font-black uppercase tracking-wider text-xs rounded shadow-lime-glow hover:bg-gym-lime-hover transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulate Gate Scan & Attendance Log</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gym-border text-xs text-gym-muted flex items-center justify-between">
            <span>Gate Controller IP: 192.168.1.140</span>
            <span className="text-gym-lime">Relay: UNLOCKED ON SCAN</span>
          </div>
        </div>
      </div>

      {/* Real-Time Live Feed Table */}
      <div className="bg-gym-surface border border-gym-border rounded-sm p-6">
        <h3 className="font-heading text-lg font-black uppercase tracking-wider text-gym-primary mb-4">
          REAL-TIME ATTENDANCE LOG STREAM
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gym-border text-gym-muted font-heading uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Athlete</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Turnstile Location</th>
                <th className="py-3 px-4">Auth Method</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gym-border/40">
              {attendance.map(a => (
                <tr key={a.id} className="hover:bg-gym-surface-hover/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gym-primary font-heading uppercase text-sm">
                    {a.member_name || 'Alex Vance'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gym-secondary">{a.date}</td>
                  <td className="py-3.5 px-4 font-mono text-white">
                    {new Date(a.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-3.5 px-4 text-gym-secondary">{a.gym_location}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-gym-black border border-gym-border text-[10px] font-mono text-gym-lime">
                      {a.method}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-gym-lime font-bold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Checked In
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
