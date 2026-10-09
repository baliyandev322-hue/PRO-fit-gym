import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  DollarSign, 
  QrCode, 
  TrendingUp, 
  UserCheck, 
  Layers, 
  Award, 
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Mail,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend 
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { useGymData } from '@/context/GymDataContext';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { memberships, attendance, payments, workoutPlans, plans } = useGymData();

  // Primary Metrics
  const totalMembers = 284;
  const memberCap = 300;
  const activeMembers = 268;
  const expiringMembers = 11;
  const expiredMembers = 5;
  const monthlyRevenue = 64850; // USD
  const pendingPayments = 0;
  const newMembersThisMonth = 28;
  const trialLeads = 5;
  const unreadMessages = 2;
  const todaysAttendance = attendance.length + 42;
  const activeTrainers = 6;

  // 6-Month Revenue & Attendance Growth Data
  const telemetryData = [
    { month: 'May', revenue: 52400, visits: 820, newMembers: 19 },
    { month: 'Jun', revenue: 56100, visits: 890, newMembers: 22 },
    { month: 'Jul', revenue: 59300, visits: 940, newMembers: 24 },
    { month: 'Aug', revenue: 62200, visits: 1010, newMembers: 26 },
    { month: 'Sep', revenue: 63800, visits: 1080, newMembers: 25 },
    { month: 'Oct (Current)', revenue: monthlyRevenue, visits: 1140, newMembers: newMembersThisMonth },
  ];

  const planBreakdownData = [
    { name: 'Starter ($149)', count: 68 },
    { name: 'Performance ($249)', count: 164 },
    { name: 'Elite ($399)', count: 52 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gym-surface via-gym-surface to-gym-black border border-gym-border rounded-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-2xl sm:text-3xl font-black uppercase text-gym-primary tracking-wide">
              EXECUTIVE OPERATIONS & TELEMETRY
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-heading font-black uppercase tracking-wider rounded bg-gym-lime/10 text-gym-lime border border-gym-lime/20">
              Admin Terminal
            </span>
          </div>
          <p className="text-xs text-gym-secondary mt-1">
            Real-time facility telemetry, Stripe recurring revenue, member cap enforcement, and leads
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/admin/attendance"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-sm font-heading uppercase font-bold text-xs bg-gym-lime text-gym-black hover:bg-gym-lime-hover shadow-lime-glow transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Turnstile Terminal</span>
          </Link>
          <Link
            to="/admin/trials"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-sm font-heading uppercase font-bold text-xs bg-gym-surface hover:bg-gym-surface-hover text-cyan-400 border border-gym-border transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Trial Leads ({trialLeads})</span>
          </Link>
          <Link
            to="/admin/members"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-sm font-heading uppercase font-bold text-xs bg-gym-surface hover:bg-gym-surface-hover text-gym-primary border border-gym-border transition-all"
          >
            <Users className="w-4 h-4 text-gym-lime" />
            <span>Members Roster</span>
          </Link>
        </div>
      </div>

      {/* 4 Primary Top Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Revenue */}
        <div className="bg-gym-surface border border-gym-border p-5 rounded-sm">
          <div className="flex items-center justify-between text-gym-muted mb-2">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider">Monthly Recurring Revenue</span>
            <DollarSign className="w-4 h-4 text-gym-lime" />
          </div>
          <div className="font-heading text-3xl sm:text-4xl font-black text-gym-primary">
            ${monthlyRevenue.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-400 mt-1 block font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +8.4% vs previous cycle
          </span>
        </div>

        {/* Member Cap Capacity */}
        <div className="bg-gym-surface border border-gym-border p-5 rounded-sm">
          <div className="flex items-center justify-between text-gym-muted mb-2">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider">Member Cap Capacity</span>
            <Users className="w-4 h-4 text-gym-lime" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-3xl sm:text-4xl font-black text-gym-lime">
              {totalMembers}
            </span>
            <span className="text-xs text-gym-secondary font-mono">/ {memberCap} max</span>
          </div>
          <div className="w-full bg-gym-black h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-gym-lime h-full" style={{ width: `${(totalMembers / memberCap) * 100}%` }}></div>
          </div>
          <span className="text-[10px] text-gym-secondary mt-1 block">16 slots remaining before waitlist</span>
        </div>

        {/* Today's Turnstile Gate Scans */}
        <div className="bg-gym-surface border border-gym-border p-5 rounded-sm">
          <div className="flex items-center justify-between text-gym-muted mb-2">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider">Today's Gate Entries</span>
            <QrCode className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-heading text-3xl sm:text-4xl font-black text-gym-primary">
            {todaysAttendance}
          </div>
          <span className="text-[10px] text-gym-secondary mt-1 block font-mono">Peak time: 6:00 PM - 8:30 PM</span>
        </div>

        {/* Active Coaches */}
        <div className="bg-gym-surface border border-gym-border p-5 rounded-sm">
          <div className="flex items-center justify-between text-gym-muted mb-2">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider">Master Coaches Active</span>
            <UserCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-heading text-3xl sm:text-4xl font-black text-gym-primary">
            {activeTrainers}
          </div>
          <span className="text-[10px] text-gym-lime mt-1 block font-semibold">100% floor coverage</span>
        </div>
      </div>

      {/* Secondary Quick Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gym-surface border border-gym-border p-4 rounded-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-heading font-bold text-gym-muted block">New Members (MTD)</span>
            <span className="font-heading text-2xl font-black text-white">{newMembersThisMonth}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">+12% YoY</span>
        </div>

        <div className="bg-gym-surface border border-gym-border p-4 rounded-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-heading font-bold text-gym-muted block">Pending Renewals</span>
            <span className="font-heading text-2xl font-black text-amber-400">{expiringMembers}</span>
          </div>
          <Link to="/admin/members" className="text-[10px] text-gym-lime hover:underline font-bold">Review</Link>
        </div>

        <div className="bg-gym-surface border border-gym-border p-4 rounded-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-heading font-bold text-gym-muted block">Trial Leads</span>
            <span className="font-heading text-2xl font-black text-cyan-400">{trialLeads}</span>
          </div>
          <Link to="/admin/trials" className="text-[10px] text-cyan-400 hover:underline font-bold">Manage</Link>
        </div>

        <div className="bg-gym-surface border border-gym-border p-4 rounded-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-heading font-bold text-gym-muted block">Inbound Inquiries</span>
            <span className="font-heading text-2xl font-black text-white">{unreadMessages}</span>
          </div>
          <Link to="/admin/messages" className="text-[10px] text-gym-lime hover:underline font-bold">Inbox</Link>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Growth Trend (2 Cols) */}
        <div className="lg:col-span-2 bg-gym-surface border border-gym-border rounded-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-heading text-lg font-black uppercase tracking-wider text-gym-primary">
                REVENUE ACCELERATION & TURNOVER (STRIPE)
              </h3>
              <p className="text-xs text-gym-secondary">Monthly subscription run-rate in USD</p>
            </div>
            <span className="text-xs bg-gym-black border border-gym-border px-3 py-1 rounded text-gym-lime font-mono">
              6-Month Audit
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminLime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ccff00" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ccff00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#23252a" />
                <XAxis dataKey="month" stroke="#676c78" fontSize={11} />
                <YAxis stroke="#676c78" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#141518',
                    border: '1px solid #23252a',
                    borderRadius: '2px',
                    color: '#f5f6f8',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`$${val.toLocaleString()} USD`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#ccff00" strokeWidth={2.5} fill="url(#adminLime)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan Breakdown (1 Col) */}
        <div className="bg-gym-surface border border-gym-border rounded-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-heading text-lg font-black uppercase tracking-wider text-gym-primary mb-2">
              SUBSCRIPTION TIER MIX
            </h3>
            <p className="text-xs text-gym-secondary mb-4">Distribution across member population</p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={planBreakdownData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#676c78" fontSize={10} tick={false} />
                  <YAxis stroke="#676c78" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#141518',
                      border: '1px solid #23252a',
                      borderRadius: '2px',
                      color: '#f5f6f8',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#ccff00" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gym-secondary">Starter Tier:</span>
                <span className="text-white font-mono font-bold">68 Athletes (24%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gym-secondary">Performance Tier:</span>
                <span className="text-gym-lime font-mono font-bold">164 Athletes (58%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gym-secondary">Elite VIP Tier:</span>
                <span className="text-white font-mono font-bold">52 Athletes (18%)</span>
              </div>
            </div>
          </div>

          <Link
            to="/admin/memberships"
            className="mt-4 w-full py-2 bg-gym-black hover:bg-gym-surface border border-gym-border text-center rounded text-xs font-heading font-bold uppercase tracking-wider text-gym-primary block"
          >
            Adjust Tier Pricing & Privileges →
          </Link>
        </div>
      </div>

      {/* Bottom Quick Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Members Status Box */}
        <div className="bg-gym-surface border border-gym-border rounded-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-heading text-base font-black uppercase text-gym-primary tracking-wide">
                MEMBER COMPLIANCE
              </span>
              <Users className="w-4 h-4 text-gym-lime" />
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gym-border/40">
                <span className="text-gym-secondary">Active & In Good Standing:</span>
                <span className="text-emerald-400 font-bold">{activeMembers}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gym-border/40">
                <span className="text-gym-secondary">Expiring in &lt; 5 Days:</span>
                <span className="text-amber-400 font-bold">{expiringMembers}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gym-secondary">Expired & Action Required:</span>
                <span className="text-red-400 font-bold">{expiredMembers}</span>
              </div>
            </div>
          </div>
          <Link
            to="/admin/members"
            className="mt-4 w-full py-2 bg-gym-black hover:bg-gym-surface border border-gym-border text-center rounded text-xs font-heading font-bold uppercase tracking-wider text-gym-primary block"
          >
            Review Member Roster →
          </Link>
        </div>

        {/* Turnstile Access Status */}
        <div className="bg-gym-surface border border-gym-border rounded-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-heading text-base font-black uppercase text-gym-primary tracking-wide">
                FACILITY GATE ENGINE
              </span>
              <QrCode className="w-4 h-4 text-gym-lime" />
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gym-border/40">
                <span className="text-gym-secondary">Turnstile Gate 01:</span>
                <span className="text-gym-lime font-bold">ONLINE &bull; 0ms latency</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gym-border/40">
                <span className="text-gym-secondary">Turnstile Gate 02:</span>
                <span className="text-gym-lime font-bold">ONLINE &bull; 0ms latency</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gym-secondary">Biometric QR Terminal:</span>
                <span className="text-gym-lime font-bold">ACTIVE &bull; 2.4 GHz</span>
              </div>
            </div>
          </div>
          <Link
            to="/admin/attendance"
            className="mt-4 w-full py-2 bg-gym-black hover:bg-gym-surface border border-gym-border text-center rounded text-xs font-heading font-bold uppercase tracking-wider text-gym-primary block"
          >
            Launch QR Check-In Scanner →
          </Link>
        </div>

        {/* Payments Summary */}
        <div className="bg-gym-surface border border-gym-border rounded-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-heading text-base font-black uppercase text-gym-primary tracking-wide">
                STRIPE INTEGRATION
              </span>
              <DollarSign className="w-4 h-4 text-gym-lime" />
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gym-border/40">
                <span className="text-gym-secondary">Webhook Ingestion:</span>
                <span className="text-emerald-400 font-bold">Healthy (100%)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gym-border/40">
                <span className="text-gym-secondary">Failed Invoices:</span>
                <span className="text-gym-secondary font-bold">0 this cycle</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gym-secondary">Payment Payouts:</span>
                <span className="text-white font-bold">Automatic Daily ACH</span>
              </div>
            </div>
          </div>
          <Link
            to="/admin/payments"
            className="mt-4 w-full py-2 bg-gym-black hover:bg-gym-surface border border-gym-border text-center rounded text-xs font-heading font-bold uppercase tracking-wider text-gym-primary block"
          >
            Audit Stripe Ledger →
          </Link>
        </div>
      </div>
    </div>
  );
};
