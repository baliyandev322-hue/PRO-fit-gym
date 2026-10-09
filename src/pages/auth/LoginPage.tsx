import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, Dumbbell, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/member/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    const success = await login(email, password);
    setIsSubmitting(false);

    if (success) {
      if (email.includes('admin')) {
        navigate('/admin/dashboard');
      } else if (email.includes('trainer')) {
        navigate('/trainer/dashboard');
      } else {
        navigate(from === '/login' ? '/member/dashboard' : from);
      }
    }
  };

  const handleQuickDemo = (role: 'member' | 'trainer' | 'admin') => {
    switchRole(role);
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'trainer') navigate('/trainer/dashboard');
    else navigate('/member/dashboard');
  };

  return (
    <div className="min-h-screen bg-gym-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Graphic Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gym-lime/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gym-lime/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand */}
        <div className="text-center">
          <Link to="/" className="inline-block group mb-3">
            <span className="font-heading text-4xl font-black tracking-wider text-gym-primary group-hover:text-white transition-colors">
              PRO<span className="text-gym-lime">FIT</span>
            </span>
            <span className="block text-xs uppercase tracking-widest text-gym-secondary font-bold -mt-1">
              TRAINING CLUB &bull; ATHLETE LOGIN
            </span>
          </Link>
          <p className="text-xs text-gym-muted uppercase tracking-wider">
            Private High-Performance Member Sanctuary
          </p>
        </div>

        {/* Quick Demo Access Box */}
        <div className="mt-8 bg-gym-surface/80 border border-gym-lime/30 rounded p-4 backdrop-blur shadow-lime-glow">
          <div className="text-xs font-heading font-black uppercase text-gym-lime tracking-wider flex items-center gap-1.5 mb-2.5">
            <ShieldCheck className="w-4 h-4" /> ONE-CLICK INSTANT DEMO ROLES
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemo('member')}
              className="px-2 py-2 bg-gym-black hover:bg-gym-lime hover:text-gym-black text-gym-primary rounded border border-gym-border text-xs font-heading uppercase font-bold tracking-wider transition-all flex flex-col items-center gap-1"
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span>MEMBER</span>
            </button>
            <button
              onClick={() => handleQuickDemo('trainer')}
              className="px-2 py-2 bg-gym-black hover:bg-gym-lime hover:text-gym-black text-gym-primary rounded border border-gym-border text-xs font-heading uppercase font-bold tracking-wider transition-all flex flex-col items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>TRAINER</span>
            </button>
            <button
              onClick={() => handleQuickDemo('admin')}
              className="px-2 py-2 bg-gym-black hover:bg-gym-lime hover:text-gym-black text-gym-primary rounded border border-gym-border text-xs font-heading uppercase font-bold tracking-wider transition-all flex flex-col items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ADMIN</span>
            </button>
          </div>
        </div>

        {/* Login Card */}
        <div className="mt-6 bg-gym-surface border border-gym-border py-8 px-6 shadow-card rounded sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-gym-secondary mb-2 font-heading">
                Athlete Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gym-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.vance@athlete.com"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 bg-gym-black border border-gym-border rounded-sm text-gym-primary placeholder-gym-muted text-sm focus:outline-none focus:border-gym-lime transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs uppercase tracking-wider font-bold text-gym-secondary font-heading">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-gym-lime hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gym-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 bg-gym-black border border-gym-border rounded-sm text-gym-primary placeholder-gym-muted text-sm focus:outline-none focus:border-gym-lime transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded bg-gym-black border-gym-border text-gym-lime focus:ring-gym-lime"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-gym-secondary">
                  Remember credentials on this terminal
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-sm font-heading uppercase font-bold tracking-wider text-sm bg-gym-lime text-gym-black hover:bg-gym-lime-hover shadow-lime-glow transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-gym-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In To Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-gym-border pt-6 text-center text-xs text-gym-secondary">
            Don't have an athlete membership?{' '}
            <Link to="/register" className="text-gym-lime font-bold hover:underline">
              Apply For Membership →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
