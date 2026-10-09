import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Dumbbell, 
  Calendar, 
  CreditCard, 
  QrCode, 
  TrendingUp, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Flame,
  Award,
  UserCheck,
  Bell,
  Mail,
  ShieldCheck,
  Receipt
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { useGymData } from '@/context/GymDataContext';
import { useNotifications } from '@/context/NotificationContext';
import { QRCodeSVG } from 'qrcode.react';

export const MemberDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    getMemberMembership, 
    getMemberAttendance, 
    getMemberWorkouts, 
    getMemberProgress,
    recordAttendance,
    payments 
  } = useGymData();
  const { notifications, unreadCount } = useNotifications();

  const [showQRModal, setShowQRModal] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState<{ success: boolean; message: string } | null>(null);

  if (!user) return null;

  const membership = getMemberMembership(user.id);
  const attendanceHistory = getMemberAttendance(user.id);
  const workoutPlans = getMemberWorkouts(user.id);
  const activeWorkout = workoutPlans.find((w) => w.is_active) || workoutPlans[0];
  const progressHistory = getMemberProgress(user.id);
  const userPayments = payments.filter((p) => p.member_id === user.id);

  // Quick stats
  const thisMonthVisits = attendanceHistory.length;
  const daysRemaining = membership?.days_remaining ?? 18;
  const attendanceRate = Math.min(100, Math.round((thisMonthVisits / 24) * 100)); // Target: 24 sessions

  // Time of day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Chart data for attendance & volume
  const chartData = [
    { name: 'Week 1', visits: 4, volume: 12400 },
    { name: 'Week 2', visits: 6, volume: 14800 },
    { name: 'Week 3', visits: 5, volume: 15200 },
    { name: 'Week 4', visits: 6, volume: 16900 },
    { name: 'Current', visits: thisMonthVisits > 20 ? 7 : 5, volume: 17850 },
  ];

  const handleQuickCheckIn = () => {
    const res = recordAttendance(user.id, user.full_name, 'NYC - NoHo Flagship (Sanctuary 01)', 'qr_scan');
    setCheckInStatus(res);
  };

  return (
    <div className="space-y-6">
      {/* ================= 1. PERSONALIZED WELCOME BANNER ================= */}
      <div className="bg-gradient-to-r from-gym-surface via-gym-surface to-gym-black border border-gym-border rounded-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 z-10">
          <div className="relative">
            <img
              src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
              alt={user.full_name}
              className="w-16 h-16 rounded-full object-cover border-2 border-gym-lime shadow-lime-glow"
            />
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-gym-lime border-2 border-gym-surface rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-heading font-black text-gym-lime tracking-widest">
                {greeting},
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-black uppercase text-gym-primary tracking-wide">
                {user.full_name}
              </h2>
            </div>
            <p className="text-xs text-gym-secondary mt-1 flex flex-wrap items-center gap-2">
              <span>Member ID: <strong className="text-gym-primary font-mono">{user.id.substring(0, 10)}</strong></span>
              <span>&bull;</span>
              <span className="text-gym-lime font-bold">{membership?.plan?.name || 'Performance'} Tier</span>
              <span>&bull;</span>
              <span>Sanctuary: <strong>NoHo Flagship 01</strong></span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 z-10 w-full md:w-auto">
          <button
            onClick={() => {
              setCheckInStatus(null);
              setShowQRModal(true);
            }}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-sm font-heading uppercase font-bold text-xs sm:text-sm bg-gym-lime text-gym-black hover:bg-gym-lime-hover shadow-lime-glow transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Digital Gate Pass / Scan</span>
          </button>
          <Link
            to="/member/workouts"
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-sm font-heading uppercase font-bold text-xs sm:text-sm bg-gym-surface hover:bg-gym-surface-hover text-gym-primary border border-gym-border transition-all"
          >
            <Dumbbell className="w-4 h-4 text-gym-lime" />
            <span>Today's Split</span>
          </Link>
        </div>

        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-gym-lime/5 to-transparent pointer-events-none"></div>
      </div>

      {/* ================= 2. 4 ESSENTIAL METRIC CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Summary */}
        <div className="bg-gym-surface border border-gym-border p-5 rounded-sm">
          <div className="flex items-center justify-between text-gym-muted mb-2">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider">Attendance (Month)</span>
            <Calendar className="w-4 h-4 text-gym-lime" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-4xl font-black text-gym-primary">
              {thisMonthVisits}
            </span>
            <span className="text-xs text-gym-secondary font-medium">Visits Logged</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-gym-lime font-semibold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> {attendanceRate}% of target
            </span>
            <Link to="/member/attendance" className="text-gym-muted hover:text-white">
              View Log →
            </Link>
          </div>
        </div>

        {/* Membership Status & Expiry */}
        <div className="bg-gym-surface border border-gym-border p-5 rounded-sm">
          <div className="flex items-center justify-between text-gym-muted mb-2">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider">Membership Status</span>
            <CreditCard className="w-4 h-4 text-gym-lime" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-4xl font-black text-gym-primary">
              {daysRemaining}
            </span>
            <span className="text-xs text-gym-secondary font-medium">Days Remaining</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-gym-secondary">Valid until: {membership?.expiry_date || 'Oct 28, 2026'}</span>
            <Link to="/member/membership" className="text-gym-lime hover:underline font-bold">
              Renew →
            </Link>
          </div>
        </div>

        {/* Current Workout Split */}
        <div className="bg-gym-surface border border-gym-border p-5 rounded-sm">
          <div className="flex items-center justify-between text-gym-muted mb-2">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider">Current Split</span>
            <Dumbbell className="w-4 h-4 text-gym-lime" />
          </div>
          <div className="truncate">
            <span className="font-heading text-2xl font-black text-gym-primary block truncate">
              {activeWorkout?.title || 'Push Day (CNS)'}
            </span>
            <span className="text-xs text-gym-secondary font-medium">
              Category: {activeWorkout?.category || 'Push'}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-gym-muted">{activeWorkout?.exercises?.length || 5} movements</span>
            <Link to="/member/workouts" className="text-gym-lime hover:underline font-bold">
              Log Sets →
            </Link>
          </div>
        </div>

        {/* Personal Record Benchmark */}
        <div className="bg-gym-surface border border-gym-border p-5 rounded-sm">
          <div className="flex items-center justify-between text-gym-muted mb-2">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider">Personal Record</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-4xl font-black text-gym-primary">
              180<span className="text-lg text-gym-secondary">kg</span>
            </span>
            <span className="text-xs text-gym-secondary font-medium">Deadlift 1RM</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +15kg vs baseline
            </span>
            <Link to="/member/progress" className="text-gym-muted hover:text-white">
              1RM Lab →
            </Link>
          </div>
        </div>
      </div>

      {/* ================= 3. CHARTS & CURRENT WORKOUT PLAN ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance & Volume Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-gym-surface border border-gym-border rounded-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-heading text-lg font-black uppercase tracking-wider text-gym-primary">
                TRAINING FREQUENCY & ACCUMULATED VOLUME
              </h3>
              <p className="text-xs text-gym-secondary">Weekly sessions and mechanical tonnage in kilograms</p>
            </div>
            <span className="text-xs bg-gym-black border border-gym-border px-3 py-1 rounded text-gym-lime font-mono">
              30-Day Periodization
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="limeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ccff00" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ccff00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#23252a" />
                <XAxis dataKey="name" stroke="#676c78" fontSize={11} tickLine={false} />
                <YAxis stroke="#676c78" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#141518',
                    border: '1px solid #23252a',
                    borderRadius: '2px',
                    color: '#f5f6f8',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="visits"
                  name="Gym Visits"
                  stroke="#ccff00"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#limeGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Current Workout Program Quick-List (1 Col) */}
        <div className="bg-gym-surface border border-gym-border rounded-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-lg font-black uppercase tracking-wider text-gym-primary">
                ASSIGNED SPLIT
              </h3>
              <span className="text-xs text-gym-lime font-bold uppercase font-heading bg-gym-black px-2 py-0.5 rounded border border-gym-border">
                {activeWorkout?.category}
              </span>
            </div>

            <p className="text-xs text-gym-secondary mb-4 leading-relaxed">
              {activeWorkout?.notes || 'Focus on clean eccentric control. Maintain 2s pause at bottom.'}
            </p>

            <div className="space-y-2.5">
              {activeWorkout?.exercises?.slice(0, 4).map((ex, idx) => (
                <div
                  key={ex.id || idx}
                  className="p-3 bg-gym-black rounded-sm border border-gym-border flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-bold text-gym-primary uppercase tracking-wide">
                      {ex.exercise_name}
                    </h5>
                    <span className="text-[11px] text-gym-secondary">
                      {ex.sets} sets &times; {ex.reps} reps
                    </span>
                  </div>
                  <span className="text-xs font-heading font-black text-gym-lime bg-gym-surface px-2 py-1 rounded border border-gym-border">
                    {ex.target_weight_kg > 0 ? `${ex.target_weight_kg} kg` : 'Bodyweight'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/member/workouts"
            className="mt-6 w-full py-2.5 bg-gym-black hover:bg-gym-surface border border-gym-border text-center rounded-sm text-xs font-heading font-bold uppercase tracking-wider text-gym-primary flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Launch Complete Session Logger</span>
            <ChevronRight className="w-3.5 h-3.5 text-gym-lime" />
          </Link>
        </div>
      </div>

      {/* ================= 4. MASTER COACH & PAYMENT STATEMENTS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assigned Master Coach Card */}
        <div className="bg-gym-surface border border-gym-border rounded-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-black uppercase tracking-wider text-gym-primary flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-gym-lime" />
                ASSIGNED MASTER COACH
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                ON DUTY
              </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <img
                src="https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=400&q=80"
                alt="Marcus Drake"
                className="w-16 h-16 rounded-full object-cover border-2 border-gym-lime shadow-lime-glow"
              />
              <div>
                <h4 className="font-heading text-xl font-black uppercase text-gym-primary">
                  {user.assigned_trainer_name || 'Marcus Drake'}
                </h4>
                <span className="text-xs text-gym-lime font-mono block">
                  CSCS Head Strength Specialist
                </span>
                <span className="text-[11px] text-gym-muted block mt-0.5">
                  USAW Level 2 &bull; EXOS Performance
                </span>
              </div>
            </div>

            <div className="p-3 bg-gym-black rounded border border-gym-border text-xs text-gym-secondary leading-relaxed">
              <span className="text-gym-lime font-heading font-bold uppercase text-[10px] block mb-1">
                COACH'S DIRECTIVE THIS CYCLE:
              </span>
              "Solid acceleration on heavy pulls. Maintain 3-second tempo on squat eccentric to reinforce hip drive."
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gym-border flex items-center justify-between text-xs text-gym-muted">
            <span>Next Assessment: Nov 04, 2026</span>
            <span className="text-gym-lime font-semibold">1-on-1 Session Included</span>
          </div>
        </div>

        {/* Recent Invoices & Billing Summary */}
        <div className="bg-gym-surface border border-gym-border rounded-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-black uppercase tracking-wider text-gym-primary flex items-center gap-2">
                <Receipt className="w-4 h-4 text-gym-lime" />
                BILLING STATEMENTS & INVOICES
              </h3>
              <Link to="/member/payments" className="text-xs text-gym-lime hover:underline font-bold uppercase font-heading">
                All Statements →
              </Link>
            </div>

            <div className="space-y-3">
              {userPayments.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-gym-black rounded border border-gym-border flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white block uppercase">
                      {p.plan_name || 'Membership'}
                    </span>
                    <span className="text-[10px] text-gym-muted font-mono">
                      {new Date(p.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-heading font-black text-sm text-gym-lime block">
                      ${p.amount}.00 USD
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold uppercase">
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gym-border flex items-center justify-between text-xs text-gym-muted">
            <span className="flex items-center gap-1.5 text-gym-secondary">
              <ShieldCheck className="w-3.5 h-3.5 text-gym-lime" /> Stripe Encrypted Billing
            </span>
            <Link to="/member/membership" className="text-gym-lime font-bold hover:underline">
              Manage Tier →
            </Link>
          </div>
        </div>
      </div>

      {/* ================= 5. DIGITAL GYM PASS / QR MODAL ================= */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-gym-surface border border-gym-border rounded-sm max-w-sm w-full p-6 relative shadow-card animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 text-gym-muted hover:text-white text-sm"
            >
              ✕
            </button>

            <div className="text-center">
              <span className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wider">
                PRO<span className="text-gym-lime">FIT</span> PASS
              </span>
              <p className="text-xs text-gym-secondary mt-1">
                Scan at the NoHo facility turnstile reader
              </p>

              {/* QR Code Graphic */}
              <div className="my-6 p-4 bg-white rounded flex justify-center items-center shadow-lime-glow mx-auto max-w-[220px]">
                <QRCodeSVG
                  value={`PROFIT_GYM_MEMBER:${user.id}:${user.email}`}
                  size={180}
                  level="H"
                />
              </div>

              <div className="text-xs text-gym-secondary space-y-1 mb-6">
                <div>Athlete: <strong className="text-white">{user.full_name}</strong></div>
                <div>Plan: <strong className="text-gym-lime">{membership?.plan?.name || 'Performance'}</strong></div>
                <div>Expires: <strong className="text-white">{membership?.expiry_date || '2026-10-28'}</strong></div>
              </div>

              {/* Instant Check-In Action */}
              {checkInStatus ? (
                <div
                  className={`p-3 rounded text-xs mb-3 ${
                    checkInStatus.success
                      ? 'bg-gym-lime/10 border border-gym-lime/30 text-gym-lime'
                      : 'bg-red-500/10 border border-red-500/30 text-red-400'
                  }`}
                >
                  {checkInStatus.message}
                </div>
              ) : (
                <button
                  onClick={handleQuickCheckIn}
                  className="w-full py-3 bg-gym-lime text-gym-black font-heading font-black uppercase tracking-wider text-xs rounded-sm hover:bg-gym-lime-hover shadow-lime-glow transition-all"
                >
                  Simulate Turnstile Gate Scan
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
