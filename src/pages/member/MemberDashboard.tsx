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
  Award
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { useGymData } from '@/context/GymDataContext';
import { QRCodeSVG } from 'qrcode.react';

export const MemberDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    getMemberMembership, 
    getMemberAttendance, 
    getMemberWorkouts, 
    getMemberProgress,
    recordAttendance,
    plans 
  } = useGymData();

  const [showQRModal, setShowQRModal] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState<{ success: boolean; message: string } | null>(null);

  if (!user) return null;

  const membership = getMemberMembership(user.id);
  const attendanceHistory = getMemberAttendance(user.id);
  const workoutPlans = getMemberWorkouts(user.id);
  const activeWorkout = workoutPlans.find(w => w.is_active) || workoutPlans[0];
  const progressHistory = getMemberProgress(user.id);

  // Quick stats
  const thisMonthVisits = attendanceHistory.length;
  const daysRemaining = membership?.days_remaining ?? 18;

  // Chart data for attendance & weight
  const chartData = [
    { name: 'Week 1', visits: 4, weight: 80.2 },
    { name: 'Week 2', visits: 6, weight: 79.8 },
    { name: 'Week 3', visits: 5, weight: 79.5 },
    { name: 'Week 4', visits: 6, weight: 79.1 },
    { name: 'Current', visits: thisMonthVisits > 20 ? 7 : 5, weight: 78.8 },
  ];

  const handleQuickCheckIn = () => {
    const res = recordAttendance(user.id, user.full_name, 'NYC - NoHo Flagship (Sanctuary 01)', 'qr_scan');
    setCheckInStatus(res);
  };

  return (
    <div className="space-y-6">
      {/* ================= HERO MEMBER STATUS STRIP ================= */}
      <div className="bg-gradient-to-r from-gym-surface to-gym-black border border-gym-border rounded-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
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
              <h2 className="font-heading text-2xl sm:text-3xl font-black uppercase text-gym-primary tracking-wide">
                {user.full_name}
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-heading font-black uppercase tracking-wider rounded bg-gym-lime/10 text-gym-lime border border-gym-lime/20">
                {membership?.plan?.name || 'Performance'} Tier
              </span>
            </div>
            <p className="text-xs text-gym-secondary mt-0.5 flex items-center gap-2">
              <span>Member ID: <strong className="text-gym-primary font-mono">{user.id.substring(0, 12)}</strong></span>
              <span>&bull;</span>
              <span>Coach: <strong className="text-gym-primary">{user.assigned_trainer_name || 'Marcus Drake'}</strong></span>
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
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-sm font-heading uppercase font-bold text-sm bg-gym-lime text-gym-black hover:bg-gym-lime-hover shadow-lime-glow transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Digital Gym Pass / Check-In</span>
          </button>
          <Link
            to="/member/workouts"
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-sm font-heading uppercase font-bold text-sm bg-gym-surface hover:bg-gym-surface-hover text-gym-primary border border-gym-border transition-all"
          >
            <Dumbbell className="w-4 h-4 text-gym-lime" />
            <span>Today's Workout</span>
          </Link>
        </div>

        {/* Architectural Glow Effect */}
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-gym-lime/5 to-transparent pointer-events-none"></div>
      </div>

      {/* ================= 4 ESSENTIAL METRIC CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Attendance */}
        <div className="bg-gym-surface border border-gym-border p-5 rounded-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-gym-muted mb-2">
            <span className="text-xs uppercase font-heading font-bold tracking-wider">Attendance (Month)</span>
            <Calendar className="w-4 h-4 text-gym-lime" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-4xl font-black text-gym-primary">
              {thisMonthVisits}
            </span>
            <span className="text-xs text-gym-secondary font-medium">Visits Logged</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-gym-lime">
            <Flame className="w-3.5 h-3.5" />
            <span className="font-semibold">Consistent 4x / week pace</span>
          </div>
        </div>

        {/* Card 2: Membership Expiry */}
        <div className="bg-gym-surface border border-gym-border p-5 rounded-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-gym-muted mb-2">
            <span className="text-xs uppercase font-heading font-bold tracking-wider">Membership Status</span>
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

        {/* Card 3: Today's Workout */}
        <div className="bg-gym-surface border border-gym-border p-5 rounded-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-gym-muted mb-2">
            <span className="text-xs uppercase font-heading font-bold tracking-wider">Active Split</span>
            <Dumbbell className="w-4 h-4 text-gym-lime" />
          </div>
          <div className="truncate">
            <span className="font-heading text-2xl font-black text-gym-primary block truncate">
              {activeWorkout?.title || 'Push Day'}
            </span>
            <span className="text-xs text-gym-secondary font-medium">
              Category: {activeWorkout?.category || 'Push'}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-gym-muted">5 Exercises scheduled</span>
            <Link to="/member/workouts" className="text-gym-lime hover:underline font-bold">
              Log Sets →
            </Link>
          </div>
        </div>

        {/* Card 4: Strength Index PR */}
        <div className="bg-gym-surface border border-gym-border p-5 rounded-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-gym-muted mb-2">
            <span className="text-xs uppercase font-heading font-bold tracking-wider">Personal Record</span>
            <Award className="w-4 h-4 text-gym-lime" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-4xl font-black text-gym-primary">
              180<span className="text-lg text-gym-secondary">kg</span>
            </span>
            <span className="text-xs text-gym-secondary font-medium">Deadlift 1RM</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="font-semibold">+7.5kg increase this month</span>
          </div>
        </div>
      </div>

      {/* ================= CHARTS & WORKOUT OVERVIEW ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance & Volume Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-gym-surface border border-gym-border rounded-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-heading text-lg font-black uppercase tracking-wider text-gym-primary">
                TRAINING FREQUENCY & BODY WEIGHT
              </h3>
              <p className="text-xs text-gym-secondary">Weekly sessions and bodyweight stabilization</p>
            </div>
            <span className="text-xs bg-gym-black border border-gym-border px-3 py-1 rounded text-gym-secondary font-mono">
              Last 30 Days
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="limeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ccff00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ccff00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#676c78" fontSize={11} tickLine={false} />
                <YAxis stroke="#676c78" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#141518',
                    border: '1px solid #23252a',
                    borderRadius: '2px',
                    color: '#f5f6f8',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="visits"
                  name="Gym Visits"
                  stroke="#ccff00"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#limeGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Assigned Workout Quick-List (1 Col) */}
        <div className="bg-gym-surface border border-gym-border rounded-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-black uppercase tracking-wider text-gym-primary">
                PROGRAM EXERCISES
              </h3>
              <span className="text-xs text-gym-lime font-bold uppercase font-heading">
                {activeWorkout?.category}
              </span>
            </div>

            <p className="text-xs text-gym-secondary mb-4 leading-relaxed">
              {activeWorkout?.notes || 'Focus on clean eccentric control and dynamic lockout.'}
            </p>

            <div className="space-y-3">
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
            <span>Open Complete Workout Routine</span>
            <ChevronRight className="w-3.5 h-3.5 text-gym-lime" />
          </Link>
        </div>
      </div>

      {/* ================= RECENT ACTIVITY & ATTENDANCE LOG ================= */}
      <div className="bg-gym-surface border border-gym-border rounded-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-black uppercase tracking-wider text-gym-primary">
            RECENT CHECK-IN ACTIVITY
          </h3>
          <Link
            to="/member/attendance"
            className="text-xs text-gym-lime hover:underline font-bold uppercase tracking-wider font-heading"
          >
            Full Attendance History →
          </Link>
        </div>

        <div className="divide-y divide-gym-border/40">
          {attendanceHistory.slice(0, 5).map((att) => (
            <div key={att.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gym-black border border-gym-border flex items-center justify-center text-gym-lime">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-gym-primary">{att.gym_location}</div>
                  <div className="text-gym-muted text-[11px]">Method: {att.method.toUpperCase()}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-gym-secondary font-medium">
                  {new Date(att.check_in_time).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="text-gym-muted text-[11px] font-mono">
                  {new Date(att.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= DIGITAL GYM PASS / QR MODAL ================= */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
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

              {/* Instant Check-In Action for Demo Testing */}
              {checkInStatus ? (
                <div className={`p-3 rounded text-xs mb-3 ${
                  checkInStatus.success 
                    ? 'bg-gym-lime/10 border border-gym-lime/30 text-gym-lime' 
                    : 'bg-gym-danger/10 border border-gym-danger/30 text-red-400'
                }`}>
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
