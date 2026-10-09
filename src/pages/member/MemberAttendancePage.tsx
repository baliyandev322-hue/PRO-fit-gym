import React, { useState } from 'react';
import { 
  QrCode, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  MapPin, 
  Camera, 
  AlertTriangle, 
  Filter,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGymData } from '@/context/GymDataContext';
import { QRCodeSVG } from 'qrcode.react';

export const MemberAttendancePage: React.FC = () => {
  const { user } = useAuth();
  const { getMemberAttendance, recordAttendance } = useGymData();
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!user) return null;

  const allAttendance = getMemberAttendance(user.id);

  // Time calculations
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const oneWeekAgo = new Date(Date.now() - 7 * 86400000);
  const oneMonthAgo = new Date(Date.now() - 30 * 86400000);

  const todayVisits = allAttendance.filter(a => a.date === todayStr);
  const weekVisits = allAttendance.filter(a => new Date(a.date) >= oneWeekAgo);
  const monthVisits = allAttendance.filter(a => new Date(a.date) >= oneMonthAgo);

  const filteredList = allAttendance.filter(record => {
    if (filterPeriod === 'today') return record.date === todayStr;
    if (filterPeriod === 'week') return new Date(record.date) >= oneWeekAgo;
    if (filterPeriod === 'month') return new Date(record.date) >= oneMonthAgo;
    return true;
  });

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const res = recordAttendance(user.id, user.full_name, 'NYC - NoHo Flagship (Sanctuary 01)', 'qr_scan');
      setScanResult(res);
      setIsScanning(false);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide">
            QR ATTENDANCE TERMINAL
          </h2>
          <p className="text-xs text-gym-secondary">
            Automated biometric & QR access check-ins for PROFIT facilities
          </p>
        </div>

        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm font-heading uppercase font-bold text-xs bg-gym-lime text-gym-black hover:bg-gym-lime-hover shadow-lime-glow transition-all disabled:opacity-50"
        >
          {isScanning ? (
            <div className="w-4 h-4 border-2 border-gym-black border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              <span>Scan Facility QR / Check-In</span>
            </>
          )}
        </button>
      </div>

      {/* Result Alert if just scanned */}
      {scanResult && (
        <div
          className={`p-4 rounded-sm border flex items-start gap-3 animate-in fade-in ${
            scanResult.success
              ? 'bg-gym-lime/10 border-gym-lime/40 text-gym-lime'
              : 'bg-gym-danger/10 border-gym-danger/40 text-red-400'
          }`}
        >
          {scanResult.success ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <div className="flex-1 text-xs">
            <span className="font-heading font-black uppercase tracking-wider block text-sm mb-0.5">
              {scanResult.success ? 'CHECK-IN VERIFIED' : 'CHECK-IN BLOCKED'}
            </span>
            <p className="font-sans leading-relaxed">{scanResult.message}</p>
          </div>
          <button
            onClick={() => setScanResult(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gym-surface border border-gym-border p-4 rounded-sm">
          <span className="text-[11px] font-heading font-bold uppercase text-gym-muted tracking-wider block">
            Today
          </span>
          <span className="font-heading text-3xl font-black text-gym-primary mt-1 block">
            {todayVisits.length}
          </span>
          <span className="text-[10px] text-gym-secondary">Sessions completed</span>
        </div>

        <div className="bg-gym-surface border border-gym-border p-4 rounded-sm">
          <span className="text-[11px] font-heading font-bold uppercase text-gym-muted tracking-wider block">
            This Week
          </span>
          <span className="font-heading text-3xl font-black text-gym-lime mt-1 block">
            {weekVisits.length}
          </span>
          <span className="text-[10px] text-gym-secondary">Visits (Target: 4+)</span>
        </div>

        <div className="bg-gym-surface border border-gym-border p-4 rounded-sm">
          <span className="text-[11px] font-heading font-bold uppercase text-gym-muted tracking-wider block">
            This Month
          </span>
          <span className="font-heading text-3xl font-black text-gym-primary mt-1 block">
            {monthVisits.length}
          </span>
          <span className="text-[10px] text-gym-secondary">Visits logged</span>
        </div>

        <div className="bg-gym-surface border border-gym-border p-4 rounded-sm">
          <span className="text-[11px] font-heading font-bold uppercase text-gym-muted tracking-wider block">
            All-Time Total
          </span>
          <span className="font-heading text-3xl font-black text-gym-primary mt-1 block">
            {allAttendance.length}
          </span>
          <span className="text-[10px] text-gym-secondary">Sanctuary entries</span>
        </div>
      </div>

      {/* Pass QR + Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pass code display */}
        <div className="bg-gym-surface border border-gym-border p-6 rounded-sm text-center flex flex-col items-center justify-center">
          <span className="text-xs uppercase font-heading font-black tracking-wider text-gym-primary">
            YOUR DIGITAL ACCESS TOKEN
          </span>
          <p className="text-[11px] text-gym-secondary mb-4">
            Show this QR barcode at the front entry camera
          </p>

          <div className="p-3 bg-white rounded shadow-lime-glow">
            <QRCodeSVG
              value={`PROFIT_GYM_MEMBER:${user.id}:${user.email}`}
              size={150}
              level="H"
            />
          </div>

          <div className="mt-4 font-mono text-xs text-gym-lime bg-gym-black px-3 py-1.5 rounded border border-gym-border">
            TOKEN: {user.id.toUpperCase()}
          </div>
        </div>

        {/* Turnstile System Details */}
        <div className="md:col-span-2 bg-gym-surface border border-gym-border p-6 rounded-sm flex flex-col justify-between">
          <div>
            <h3 className="font-heading text-lg font-black uppercase tracking-wider text-gym-primary mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gym-lime" />
              INTELLIGENT ENTRY SAFEGUARDS
            </h3>
            <p className="text-xs text-gym-secondary leading-relaxed mb-4">
              Our automated gate check-in registers your session instantly, assigns locker clearance, and alerts your coach that you are on the lifting floor.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gym-black rounded border border-gym-border">
                <span className="font-bold text-gym-primary block uppercase font-heading">
                  Duplicate Prevention
                </span>
                <span className="text-gym-secondary text-[11px]">
                  Requires minimum 2 hours between successive check-ins to prevent multiple accidental logs.
                </span>
              </div>
              <div className="p-3 bg-gym-black rounded border border-gym-border">
                <span className="font-bold text-gym-primary block uppercase font-heading">
                  Facility Location
                </span>
                <span className="text-gym-secondary text-[11px]">
                  Defaulted to NoHo NYC Flagship. Multi-location access enabled for Performance & Elite.
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gym-border flex items-center justify-between text-xs text-gym-muted">
            <span>Turnstile Protocol v2.4</span>
            <span className="text-gym-lime">Hardware Status: ONLINE &bull; 99.98% Uptime</span>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-gym-surface border border-gym-border rounded-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h3 className="font-heading text-lg font-black uppercase tracking-wider text-gym-primary flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gym-lime" />
            ATTENDANCE LOG REGISTER
          </h3>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-gym-black p-1 rounded border border-gym-border text-xs">
            {(['all', 'today', 'week', 'month'] as const).map(period => (
              <button
                key={period}
                onClick={() => setFilterPeriod(period)}
                className={`px-3 py-1 font-heading uppercase font-bold text-xs rounded transition-colors ${
                  filterPeriod === period
                    ? 'bg-gym-lime text-gym-black'
                    : 'text-gym-secondary hover:text-white'
                }`}
              >
                {period === 'all' ? 'All History' : period === 'today' ? 'Today' : period === 'week' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gym-border text-gym-muted font-heading uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Check-In Time</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gym-border/40">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gym-muted">
                    No check-ins found for the selected period.
                  </td>
                </tr>
              ) : (
                filteredList.map((record) => (
                  <tr key={record.id} className="hover:bg-gym-surface-hover/60 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-gym-primary font-mono">
                      {record.date}
                    </td>
                    <td className="py-3.5 px-4 text-gym-secondary font-mono">
                      {new Date(record.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 text-gym-secondary flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gym-lime" />
                      <span>{record.gym_location}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-gym-black border border-gym-border text-[10px] uppercase font-mono text-gym-secondary">
                        {record.method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-gym-lime font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
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
