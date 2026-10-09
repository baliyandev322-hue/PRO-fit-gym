import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, ShieldCheck, Dumbbell, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGymData } from '@/context/GymDataContext';
import type { UserRole } from '@/types';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialPlan = searchParams.get('plan') || 'plan-performance';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('member');
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlan);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const { plans, purchaseMembership } = useGymData();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    setIsSubmitting(true);
    const success = await register(email, fullName, role, password);
    
    if (success) {
      if (role === 'member') {
        // Automatically activate chosen membership
        await purchaseMembership(selectedPlanId);
        navigate('/member/dashboard');
      } else if (role === 'trainer') {
        navigate('/trainer/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gym-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gym-lime/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        <div className="text-center">
          <Link to="/" className="inline-block group mb-3">
            <span className="font-heading text-4xl font-black tracking-wider text-gym-primary group-hover:text-white transition-colors">
              PRO<span className="text-gym-lime">FIT</span>
            </span>
            <span className="block text-xs uppercase tracking-widest text-gym-secondary font-bold -mt-1">
              ATHLETE & STAFF ONBOARDING
            </span>
          </Link>
          <p className="text-xs text-gym-muted uppercase tracking-wider">
            Join NoHo NYC's Capped 300-Member Strength Facility
          </p>
        </div>

        <div className="mt-8 bg-gym-surface border border-gym-border py-8 px-6 shadow-card rounded sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Role Selector */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-gym-secondary mb-2 font-heading">
                Account Type / Designation
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { r: 'member' as UserRole, label: 'Athlete Member', icon: Dumbbell },
                  { r: 'trainer' as UserRole, label: 'Coach / Trainer', icon: UserCheck },
                  { r: 'admin' as UserRole, label: 'Facility Admin', icon: ShieldCheck }
                ].map(({ r, label, icon: Icon }) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`p-3 rounded border text-left transition-all flex flex-col items-center gap-1.5 text-center ${
                      role === r
                        ? 'bg-gym-lime/10 border-gym-lime text-gym-lime shadow-lime-glow'
                        : 'bg-gym-black border-gym-border text-gym-secondary hover:border-gym-border-subtle'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-heading uppercase font-bold">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-gym-secondary mb-1.5 font-heading">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gym-muted">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 bg-gym-black border border-gym-border rounded-sm text-gym-primary placeholder-gym-muted text-sm focus:outline-none focus:border-gym-lime transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-gym-secondary mb-1.5 font-heading">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gym-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="elena@strength.com"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 bg-gym-black border border-gym-border rounded-sm text-gym-primary placeholder-gym-muted text-sm focus:outline-none focus:border-gym-lime transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-gym-secondary mb-1.5 font-heading">
                Password
              </label>
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

            {/* Plan selection if member */}
            {role === 'member' && (
              <div className="pt-2">
                <label className="block text-xs uppercase tracking-wider font-bold text-gym-secondary mb-2 font-heading">
                  Select Initial Membership Tier
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {plans.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPlanId(p.id)}
                      className={`cursor-pointer p-3 rounded border transition-all ${
                        selectedPlanId === p.id
                          ? 'border-gym-lime bg-gym-lime/5 ring-1 ring-gym-lime'
                          : 'border-gym-border bg-gym-black hover:border-gym-muted'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-heading font-black uppercase text-sm text-gym-primary">
                          {p.name}
                        </span>
                        {p.is_popular && (
                          <span className="text-[9px] bg-gym-lime text-gym-black font-black px-1.5 py-0.5 rounded uppercase">
                            Popular
                          </span>
                        )}
                      </div>
                      <div className="text-lg font-heading font-black text-gym-lime mt-1">
                        ${p.price}<span className="text-[10px] text-gym-secondary font-normal">/mo</span>
                      </div>
                      <p className="text-[11px] text-gym-muted line-clamp-2 mt-1">
                        {p.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-sm font-heading uppercase font-bold tracking-wider text-sm bg-gym-lime text-gym-black hover:bg-gym-lime-hover shadow-lime-glow transition-all disabled:opacity-50 mt-4"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-gym-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Create Account & Activate Access</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-gym-border pt-6 text-center text-xs text-gym-secondary">
            Already an active member?{' '}
            <Link to="/login" className="text-gym-lime font-bold hover:underline">
              Sign In To Portal →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
