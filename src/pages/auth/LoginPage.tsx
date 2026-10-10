import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/member/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setErrorMessage(null);
    setIsSubmitting(true);
    const success = await login(email, password);
    setIsSubmitting(false);

    if (success) {
      try {
        const saved = JSON.parse(localStorage.getItem('profit_gym_current_user') || '{}');
        if (saved.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (saved.role === 'trainer') {
          navigate('/trainer/dashboard', { replace: true });
        } else {
          navigate(from === '/login' ? '/member/dashboard' : from, { replace: true });
        }
      } catch {
        navigate('/member/dashboard', { replace: true });
      }
    } else {
      setErrorMessage('Invalid credentials. Please verify your email and password.');
    }
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

        {/* Login Card */}
        <div className="mt-8 bg-gym-surface border border-gym-border py-8 px-6 shadow-card rounded sm:px-10">
          {errorMessage && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-sm">
              {errorMessage}
            </div>
          )}
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
