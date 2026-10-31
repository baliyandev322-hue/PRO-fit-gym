import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft, BookOpen, Shield, Home } from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gym-black text-gym-primary flex flex-col justify-between selection:bg-gym-lime selection:text-gym-black">
      <SEOHead
        title="404 — Route Not Found"
        description="The requested athletic sanctuary route does not exist."
        noindex={true}
      />

      {/* Top Navbar */}
      <header className="border-b border-gym-border bg-gym-surface/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex flex-col group">
            <span className="font-heading text-3xl font-black tracking-wider text-gym-primary group-hover:text-white transition-colors">
              PRO<span className="text-gym-lime">FIT</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-gym-secondary font-semibold -mt-1">
              TRAINING CLUB &bull; PRIVATE FACILITY
            </span>
          </Link>

          <Link
            to="/"
            className="text-xs uppercase font-heading font-bold tracking-wider text-gym-secondary hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Home className="w-4 h-4 text-gym-lime" />
            <span>Return to Sanctuary</span>
          </Link>
        </div>
      </header>

      {/* Main 404 Hero */}
      <main className="flex-1 flex items-center justify-center p-6 my-12">
        <div className="max-w-lg w-full bg-gym-surface border border-gym-border p-8 sm:p-12 rounded-sm text-center shadow-card space-y-6 relative overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gym-lime/5 rounded-full blur-2xl pointer-events-none"></div>

          <div className="w-20 h-20 rounded-full bg-gym-lime/10 border border-gym-lime/30 flex items-center justify-center mx-auto text-gym-lime shadow-lime-glow">
            <Compass className="w-10 h-10 animate-spin duration-[12000ms]" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-gym-lime tracking-widest uppercase block">
              STATUS 404 &bull; ROUTE NOT FOUND
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl font-black uppercase text-gym-primary tracking-tight">
              OFF THE TRAINING FLOOR
            </h1>
            <p className="text-xs text-gym-secondary leading-relaxed max-w-md mx-auto">
              The coordinate or protocol URL you requested does not exist on this facility cluster. Check your navigation path or return to our public zones.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Link
              to="/"
              className="flex-1 py-3 px-5 bg-gym-lime hover:bg-gym-lime-hover text-gym-black font-heading font-black uppercase text-xs tracking-wider rounded shadow-lime-glow transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <Link
              to="/blog"
              className="flex-1 py-3 px-5 bg-gym-black hover:bg-gym-surface border border-gym-border text-gym-secondary hover:text-white font-heading font-bold uppercase text-xs tracking-wider rounded transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-gym-lime" />
              <span>Read Protocols</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer minimal notice */}
      <footer className="border-t border-gym-border/60 py-6 text-center text-[11px] text-gym-muted font-mono">
        PROFIT TRAINING CLUB &bull; HIGH PERFORMANCE SANCTUARY
      </footer>
    </div>
  );
};
export default NotFoundPage;
