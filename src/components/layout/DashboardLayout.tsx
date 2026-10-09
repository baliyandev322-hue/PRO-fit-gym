import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  QrCode, 
  Dumbbell, 
  TrendingUp, 
  CreditCard, 
  Users, 
  UserCheck, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  User, 
  Layers, 
  CalendarCheck,
  Receipt,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { NotificationDropdown } from '@/components/common/NotificationDropdown';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const memberLinks = [
    { to: '/member/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/member/attendance', icon: QrCode, label: 'QR Attendance' },
    { to: '/member/workouts', icon: Dumbbell, label: 'Workouts' },
    { to: '/member/progress', icon: TrendingUp, label: 'Progress & 1RM' },
    { to: '/member/membership', icon: CreditCard, label: 'Membership Tier' },
    { to: '/member/payments', icon: Receipt, label: 'Billing Statements' },
    { to: '/member/profile', icon: User, label: 'Athlete Profile' },
  ];

  const trainerLinks = [
    { to: '/trainer/dashboard', icon: LayoutDashboard, label: 'Trainer Hub' },
    { to: '/trainer/members', icon: Users, label: 'Assigned Athletes' },
    { to: '/trainer/workouts', icon: Dumbbell, label: 'Workout Programs' },
    { to: '/trainer/attendance', icon: CalendarCheck, label: 'Athlete Attendance' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Executive Hub' },
    { to: '/admin/members', icon: Users, label: 'Members Directory' },
    { to: '/admin/trainers', icon: UserCheck, label: 'Master Coaches' },
    { to: '/admin/memberships', icon: Layers, label: 'Membership Plans' },
    { to: '/admin/attendance', icon: QrCode, label: 'QR Check-In Terminal' },
    { to: '/admin/workouts', icon: Dumbbell, label: 'Workout Catalog' },
    { to: '/admin/payments', icon: CreditCard, label: 'Payment Ledger' },
    { to: '/admin/trials', icon: Sparkles, label: 'Trial Leads' },
    { to: '/admin/messages', icon: MessageSquare, label: 'Inquiries' },
    { to: '/admin/settings', icon: Settings, label: 'Facility Settings' },
  ];

  const currentLinks = role === 'admin' ? adminLinks : role === 'trainer' ? trainerLinks : memberLinks;

  return (
    <div className="min-h-screen bg-gym-black text-gym-primary flex flex-col md:flex-row">
      {/* ================= SIDEBAR (DESKTOP) ================= */}
      <aside className="hidden md:flex flex-col w-64 bg-gym-surface border-r border-gym-border shrink-0 select-none">
        {/* Brand */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-gym-border">
          <Link to="/" className="flex flex-col group">
            <span className="font-heading text-2xl font-black tracking-wider text-gym-primary group-hover:text-white transition-colors">
              PRO<span className="text-gym-lime">FIT</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-gym-secondary font-semibold -mt-1">
              TRAINING CLUB
            </span>
          </Link>
          <div className="px-2 py-0.5 rounded text-[10px] font-heading uppercase tracking-wider font-bold bg-gym-black border border-gym-border text-gym-lime">
            {role}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-gym-muted font-heading">
            {role === 'admin' ? 'ADMINISTRATION' : role === 'trainer' ? 'COACHING CONSOLE' : 'ATHLETE PORTAL'}
          </div>
          {currentLinks.map(link => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-sm text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gym-lime text-gym-black font-semibold shadow-lime-glow'
                      : 'text-gym-secondary hover:text-gym-primary hover:bg-gym-surface-hover'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-gym-border bg-gym-black/30 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-9 h-9 rounded-full object-cover border border-gym-border shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gym-surface flex items-center justify-center text-xs font-bold text-gym-lime border border-gym-border shrink-0">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="min-w-0">
              <div className="text-xs font-bold text-gym-primary truncate">{user?.full_name}</div>
              <div className="text-[11px] text-gym-muted truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            title="Sign out"
            className="p-1.5 text-gym-muted hover:text-gym-danger hover:bg-gym-surface rounded transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ================= MOBILE HEADER ================= */}
      <div className="md:hidden flex items-center justify-between h-16 px-4 bg-gym-surface border-b border-gym-border">
        <Link to="/" className="flex flex-col">
          <span className="font-heading text-xl font-black text-gym-primary">
            PRO<span className="text-gym-lime">FIT</span>
          </span>
          <span className="text-[9px] uppercase tracking-wider text-gym-secondary -mt-1 font-semibold">
            CLUB SAAS
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <NotificationDropdown />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gym-secondary hover:text-white"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gym-surface border-b border-gym-border p-4 space-y-3 z-40">
          <div className="flex items-center justify-between pb-3 border-b border-gym-border">
            <div className="text-xs">
              <span className="font-bold text-white block">{user?.full_name}</span>
              <span className="text-gym-muted text-[11px] font-mono">{user?.email}</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-heading font-black uppercase tracking-wider bg-gym-lime/10 text-gym-lime border border-gym-lime/20">
              {role?.toUpperCase()}
            </span>
          </div>
          <nav className="space-y-1">
            {currentLinks.map(link => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded text-sm ${
                      isActive ? 'bg-gym-lime text-gym-black font-bold' : 'text-gym-secondary hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
          <button
            onClick={() => {
              logout();
              setMobileMenuOpen(false);
              navigate('/login');
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-gym-danger hover:bg-gym-black rounded"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      )}

      {/* ================= MAIN CONTENT VIEWPORT ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between h-20 px-8 bg-gym-surface/80 backdrop-blur-md border-b border-gym-border sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="font-heading text-xl uppercase font-black tracking-wider text-gym-primary flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-gym-lime rounded-full inline-block animate-pulse"></span>
              {role === 'admin'
                ? 'CLUB OPERATIONS COMMAND CENTER'
                : role === 'trainer'
                ? 'COACHING PERFORMANCE CONSOLE'
                : 'ATHLETE PERFORMANCE SANCTUARY'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Landing Page Link */}
            <Link
              to="/"
              className="text-xs uppercase font-heading font-bold tracking-wider text-gym-secondary hover:text-gym-lime transition-colors"
            >
              Public Website ↗
            </Link>

            <div className="h-5 w-[1px] bg-gym-border"></div>

            {/* Notification Dropdown */}
            <NotificationDropdown />

            {/* User status */}
            <div className="flex items-center gap-3 pl-2">
              <span className="text-xs text-right hidden lg:block">
                <span className="font-bold text-gym-primary block">{user?.full_name}</span>
                <span className="text-[10px] uppercase font-semibold text-gym-lime tracking-wider">
                  {role?.toUpperCase()} ACCESS
                </span>
              </span>
              <img
                src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                alt={user?.full_name}
                className="w-9 h-9 rounded-full object-cover border border-gym-border"
              />
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
