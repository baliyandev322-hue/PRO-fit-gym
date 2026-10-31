import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, Dumbbell, User, Zap, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { WeightlifterIcon } from '@/components/common/WeightlifterIcon';

// Simple, friendly English fitness facts that inspire & engage the athlete while waiting
const GYM_FACTS = [
  {
    tag: 'QUICK TIP',
    fact: 'Drinking water between your sets keeps your energy high and prevents muscle cramps.',
  },
  {
    tag: 'DID YOU KNOW?',
    fact: 'Lifting weights burns calories even while you rest, because muscles need energy to recover.',
  },
  {
    tag: 'PRO TIP',
    fact: 'Resting 2 to 3 minutes between heavy sets helps you lift more weight on your next set.',
  },
  {
    tag: 'SANCTUARY RULE',
    fact: 'PROFIT has a strict 300-member limit so you never have to wait for any gym equipment.',
  },
  {
    tag: 'MUSCLE FACT',
    fact: 'Lowering the weights slowly (controlled reps) builds stronger muscles than lifting fast.',
  },
  {
    tag: 'MOTIVATION',
    fact: 'Consistency is everything. Showing up today is already a win for your health.',
  },
  {
    tag: 'RECOVERY TIP',
    fact: '7 to 8 hours of good sleep is when your muscles actually heal and grow bigger.',
  },
];

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('profit_gym_remembered_email') || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('profit_gym_remember_me') !== 'false';
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [factIndex, setFactIndex] = useState(0);

  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/member/dashboard';

  // Rotate gym tips every 2.8 seconds while waiting for login
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSubmitting) {
      interval = setInterval(() => {
        setFactIndex((prev) => (prev + 1) % GYM_FACTS.length);
      }, 2800);
    } else {
      setFactIndex(0);
    }
    return () => clearInterval(interval);
  }, [isSubmitting]);

  const handleQuickDemo = (role: 'admin' | 'trainer' | 'member') => {
    loginAsDemo(role);
    if (role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else if (role === 'trainer') {
      navigate('/trainer/dashboard', { replace: true });
    } else {
      navigate('/member/dashboard', { replace: true });
    }
  };

  const handleAutofill = (demoEmail: string, demoPass: string = 'password123') => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (rememberMe) {
      localStorage.setItem('profit_gym_remembered_email', email.trim());
      localStorage.setItem('profit_gym_remember_me', 'true');
    } else {
      localStorage.removeItem('profit_gym_remembered_email');
      localStorage.setItem('profit_gym_remember_me', 'false');
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      try {
        const saved = JSON.parse(localStorage.getItem('profit_gym_current_user') || '{}');
        const role = (saved.role || '').toLowerCase();
        if (role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (role === 'trainer') {
          navigate('/trainer/dashboard', { replace: true });
        } else {
          navigate(from === '/login' ? '/member/dashboard' : from, { replace: true });
        }
      } catch {
        navigate('/member/dashboard', { replace: true });
      }
    } else {
      setErrorMessage(result.message || 'Invalid credentials. Please verify your email and password.');
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
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-sm flex items-start gap-2">
              <span className="font-bold">Error:</span>
              <span className="flex-1">{errorMessage}</span>
            </div>
          )}

          {/* Animated Weightlifter & Simple Fitness Tip while Loading */}
          {isSubmitting && (
            <div className="mb-6 p-4 bg-gym-black/90 border border-gym-lime/50 rounded-sm shadow-lime-glow animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-heading font-black tracking-widest uppercase text-gym-lime flex items-center gap-2">
                  <WeightlifterIcon className="w-5 h-5 text-gym-lime" isLifting={true} />
                  {GYM_FACTS[factIndex].tag}
                </span>
                <span className="text-[9px] text-gym-muted uppercase tracking-wider font-mono">
                  TIP {(factIndex % GYM_FACTS.length) + 1} OF {GYM_FACTS.length}
                </span>
              </div>
              <p className="text-xs text-gym-primary leading-relaxed font-sans transition-all duration-300">
                "{GYM_FACTS[factIndex].fact}"
              </p>
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
                  placeholder="member@profitgym.com"
                  required
                  autoComplete="email"
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
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="block w-full pl-10 pr-10 py-2.5 bg-gym-black border border-gym-border rounded-sm text-gym-primary placeholder-gym-muted text-sm focus:outline-none focus:border-gym-lime transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gym-muted hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="remember-me" className="flex items-center cursor-pointer select-none">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded bg-gym-black border-gym-border text-gym-lime focus:ring-gym-lime cursor-pointer accent-[#ccff00]"
                />
                <span className="ml-2 block text-xs text-gym-secondary hover:text-gym-primary transition-colors">
                  Remember credentials on this terminal
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-sm font-heading uppercase font-bold tracking-wider text-sm bg-gym-lime text-gym-black hover:bg-gym-lime-hover shadow-lime-glow transition-all disabled:opacity-75 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2.5">
                  <WeightlifterIcon className="w-5 h-5 text-gym-black" isLifting={true} />
                  <span>Lifting Your Profile...</span>
                </div>
              ) : (
                <>
                  <WeightlifterIcon className="w-4 h-4 text-gym-black" />
                  <span>Sign In To Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-6 border-t border-gym-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-heading font-black tracking-wider uppercase text-gym-lime flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-gym-lime" />
                1-Click Instant Demo Portals
              </span>
              <span className="text-[9px] text-gym-muted uppercase tracking-wider font-mono bg-gym-black px-2 py-0.5 rounded border border-gym-border">
                Instant Access
              </span>
            </div>
            <p className="text-[11px] text-gym-secondary mb-3 leading-relaxed">
              Click a role for instant access, or click the small autofill tag to populate the form:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gym-black border border-gym-border hover:border-gym-lime rounded-sm p-2 text-center transition-all flex flex-col justify-between">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin')}
                  className="w-full flex flex-col items-center gap-1 cursor-pointer group"
                  title="Direct 1-Click Access as Club Owner"
                >
                  <ShieldCheck className="w-4 h-4 text-gym-lime group-hover:scale-110 transition-transform" />
                  <span className="font-heading font-bold text-[10px] uppercase text-gym-primary tracking-wider">
                    Admin
                  </span>
                  <span className="text-[9px] text-gym-muted">Owner Deck</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAutofill('admin@profitgym.com', 'password123')}
                  className="mt-2 text-[9px] text-gym-muted hover:text-gym-lime underline block"
                  title="Autofill email & password into the form above"
                >
                  Autofill
                </button>
              </div>

              <div className="bg-gym-black border border-gym-border hover:border-gym-lime rounded-sm p-2 text-center transition-all flex flex-col justify-between">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('trainer')}
                  className="w-full flex flex-col items-center gap-1 cursor-pointer group"
                  title="Direct 1-Click Access as Master Coach Marcus Drake"
                >
                  <Dumbbell className="w-4 h-4 text-gym-lime group-hover:scale-110 transition-transform" />
                  <span className="font-heading font-bold text-[10px] uppercase text-gym-primary tracking-wider">
                    Trainer
                  </span>
                  <span className="text-[9px] text-gym-muted">Coach Hub</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAutofill('trainer@profitgym.com', 'password123')}
                  className="mt-2 text-[9px] text-gym-muted hover:text-gym-lime underline block"
                  title="Autofill email & password into the form above"
                >
                  Autofill
                </button>
              </div>

              <div className="bg-gym-black border border-gym-border hover:border-gym-lime rounded-sm p-2 text-center transition-all flex flex-col justify-between">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('member')}
                  className="w-full flex flex-col items-center gap-1 cursor-pointer group"
                  title="Direct 1-Click Access as Black Card Athlete Alex Vance"
                >
                  <User className="w-4 h-4 text-gym-lime group-hover:scale-110 transition-transform" />
                  <span className="font-heading font-bold text-[10px] uppercase text-gym-primary tracking-wider">
                    Member
                  </span>
                  <span className="text-[9px] text-gym-muted">Athlete App</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAutofill('member@profitgym.com', 'password123')}
                  className="mt-2 text-[9px] text-gym-muted hover:text-gym-lime underline block"
                  title="Autofill email & password into the form above"
                >
                  Autofill
                </button>
              </div>
            </div>

            {/* Hint Box with exact credentials */}
            <div className="mt-3 p-2 bg-gym-black/60 border border-gym-border/70 rounded text-[10px] text-gym-muted flex items-center justify-between font-mono">
              <span>Default password: <strong className="text-gym-lime font-bold">password123</strong></span>
              <span className="text-gym-secondary text-[9px]">All 3 roles</span>
            </div>
          </div>

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
