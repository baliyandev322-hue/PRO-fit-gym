import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useNotifications();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setIsLoading(false);
    setIsSent(true);

    showToast({
      type: 'info',
      title: 'SECURITY DISPATCH',
      message: `Password reset instructions have been routed to ${email}.`
    });
  };

  return (
    <div className="min-h-screen bg-gym-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="text-center">
          <Link to="/" className="inline-block group mb-3">
            <span className="font-heading text-4xl font-black tracking-wider text-gym-primary group-hover:text-white transition-colors">
              PRO<span className="text-gym-lime">FIT</span>
            </span>
            <span className="block text-xs uppercase tracking-widest text-gym-secondary font-bold -mt-1">
              ATHLETE SECURITY RECOVERY
            </span>
          </Link>
          <p className="text-xs text-gym-muted uppercase tracking-wider">
            Password Verification Protocol
          </p>
        </div>

        <div className="mt-6 bg-gym-surface border border-gym-border py-8 px-6 shadow-card rounded sm:px-10">
          {!isSent ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <p className="text-xs text-gym-secondary leading-relaxed">
                Enter your registered athlete email address. We will transmit an encrypted recovery link valid for 15 minutes.
              </p>

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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-sm font-heading uppercase font-bold tracking-wider text-sm bg-gym-lime text-gym-black hover:bg-gym-lime-hover shadow-lime-glow transition-all disabled:opacity-50"
              >
                {isLoading ? 'Transmitting Token...' : 'Transmit Recovery Link'}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-gym-secondary hover:text-gym-lime transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to portal login
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center py-4 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-gym-lime mx-auto" />
              <h3 className="font-heading text-lg font-black uppercase text-gym-primary tracking-wider">
                Recovery Link Transmitted
              </h3>
              <p className="text-xs text-gym-secondary leading-relaxed">
                Check inbox for <strong className="text-white">{email}</strong>. Follow the instructions to reset your member credentials.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gym-black hover:bg-gym-surface border border-gym-border text-xs uppercase font-heading font-bold text-gym-primary rounded transition-colors"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
