import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Award, BookOpen, ShieldAlert, CheckCircle2, Dumbbell, Sparkles } from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';

export const AboutUsPage: React.FC = () => {
  return (
    <div className="bg-gym-black text-gym-primary font-sans selection:bg-gym-lime selection:text-gym-black min-h-screen flex flex-col">
      <SEOHead
        title="About Us & Editorial Standards | PROFIT Training Club"
        description="Discover PROFIT Training Club: an elite strength sanctuary and evidence-based fitness publication led by CSCS coaches and sports scientists."
        canonicalUrl="https://profitgymclub.com/about"
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-gym-surface/90 backdrop-blur-md border-b border-gym-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xs uppercase font-heading font-bold tracking-wider text-gym-secondary hover:text-white transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4 text-gym-lime" />
            <span>Return to Club</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/blog" className="text-xs uppercase font-heading font-bold tracking-wider text-gym-muted hover:text-gym-lime transition-colors hidden sm:block">
              Protocols &amp; Articles
            </Link>
            <Link to="/contact" className="text-xs uppercase font-heading font-bold tracking-wider text-gym-muted hover:text-gym-lime transition-colors hidden sm:block">
              Contact Concierge
            </Link>
            <Link to="/" className="flex items-center gap-1 font-heading text-xl font-black tracking-wider text-gym-primary">
              <span>PRO</span><span className="text-gym-lime">FIT</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full space-y-12">
        {/* Hero Section */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-gym-surface border border-gym-border mb-4">
            <Award className="w-4 h-4 text-gym-lime" />
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-gym-secondary">
              ABOUT OUR SANCTUARY &amp; EDITORIAL BOARD
            </span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-black uppercase tracking-wider text-gym-primary mb-4">
            WHERE SCIENCE MEETS <span className="text-gym-lime">HUMAN PERFORMANCE.</span>
          </h1>
          <p className="text-base text-gym-secondary leading-relaxed max-w-3xl">
            PROFIT Training Club is an elite private strength &amp; conditioning sanctuary and an authoritative digital publication dedicated to exercise physiology, biomechanical optimization, and evidence-based athletic nutrition.
          </p>
        </div>

        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gym-surface/40 border border-gym-border rounded">
            <div className="w-10 h-10 rounded bg-gym-lime/10 border border-gym-lime/30 flex items-center justify-center mb-4 text-gym-lime">
              <Dumbbell className="w-5 h-5" />
            </div>
            <h3 className="font-heading text-lg font-black uppercase tracking-wide text-gym-primary mb-2">
              The Physical Sanctuary
            </h3>
            <p className="text-xs sm:text-sm text-gym-muted leading-relaxed">
              Strict 300-member capacity limit, calibrated Eleiko IPF competition iron, Olympic oak platforms, and biometric 24/7 turnstiles designed for zero wait times.
            </p>
          </div>

          <div className="p-6 bg-gym-surface/40 border border-gym-border rounded">
            <div className="w-10 h-10 rounded bg-gym-lime/10 border border-gym-lime/30 flex items-center justify-center mb-4 text-gym-lime">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-heading text-lg font-black uppercase tracking-wide text-gym-primary mb-2">
              Evidence-Based Media
            </h3>
            <p className="text-xs sm:text-sm text-gym-muted leading-relaxed">
              Every workout protocol, hypertrophy breakdown, and nutritional guide is vetted against peer-reviewed sports science literature (NSCA, ACSM, ISSN).
            </p>
          </div>

          <div className="p-6 bg-gym-surface/40 border border-gym-border rounded">
            <div className="w-10 h-10 rounded bg-gym-lime/10 border border-gym-lime/30 flex items-center justify-center mb-4 text-gym-lime">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-heading text-lg font-black uppercase tracking-wide text-gym-primary mb-2">
              Zero Commercial Bias
            </h3>
            <p className="text-xs sm:text-sm text-gym-muted leading-relaxed">
              We never promote unverified proprietary blends or pseudo-scientific trends. We evaluate ingredients strictly by clinically validated milligram dosages.
            </p>
          </div>
        </div>

        {/* Editorial Standards Section (Key for Google AdSense & E-E-A-T) */}
        <section className="p-8 bg-gym-surface/60 border border-gym-lime/40 rounded shadow-lime-glow space-y-6">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-gym-lime" />
            <h2 className="font-heading text-2xl font-black uppercase tracking-wide text-gym-primary">
              OUR EDITORIAL GUIDELINES &amp; FACT-CHECKING POLICY
            </h2>
          </div>
          <p className="text-sm text-gym-secondary leading-relaxed">
            At PROFIT Training Club (<strong>profitgymclub.com</strong>), our digital publication adheres to rigorous journalistic and scientific publishing standards. We believe that health and athletic performance content must be accurate, reproducible, and transparent.
          </p>

          <ul className="space-y-4 text-sm text-gym-secondary">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-gym-lime shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Accredited Subject Matter Experts:</strong> All training programs and articles are authored or reviewed by certified professionals holding credentials from the National Strength &amp; Conditioning Association (CSCS), USA Weightlifting (USAW), or Commission on Dietetic Registration (RD/CSSD).
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-gym-lime shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Primary Source Citations:</strong> When referencing anatomical biomechanics, muscle protein synthesis (MPS), or ergogenic aids, our writers prioritize double-blind randomized clinical trials and systematic meta-analyses.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-gym-lime shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Continuous Article Corrections:</strong> If new exercise science updates established guidelines (e.g. eccentric tempo modulation or creatine loading protocols), our editorial staff revises and updates legacy articles with clear changelog timestamps.
              </span>
            </li>
          </ul>
        </section>

        {/* Meet the Editorial & Coaching Staff */}
        <section className="space-y-6">
          <h2 className="font-heading text-2xl font-black uppercase tracking-wide text-gym-primary">
            EDITORIAL BOARD &amp; MASTER COACHES
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 bg-gym-surface border border-gym-border rounded flex gap-4 items-start">
              <img
                src="https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=160&h=160&q=80"
                alt="Marcus Drake, CSCS"
                width="80"
                height="80"
                className="w-20 h-20 rounded object-cover border border-gym-lime/50 shrink-0"
              />
              <div>
                <h3 className="font-heading text-base font-black uppercase text-gym-primary">
                  Marcus Drake, CSCS
                </h3>
                <span className="text-xs text-gym-lime font-mono block mb-2">
                  Head of Strength &amp; Conditioning
                </span>
                <p className="text-xs text-gym-muted leading-relaxed">
                  Specializes in mechanical tension principles, barbell biomechanics, and periodized volume loading for powerlifters and collegiate athletes.
                </p>
              </div>
            </div>

            <div className="p-6 bg-gym-surface border border-gym-border rounded flex gap-4 items-start">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&h=160&q=80"
                alt="Dr. Elena Vance, MS, RD"
                width="80"
                height="80"
                className="w-20 h-20 rounded object-cover border border-gym-lime/50 shrink-0"
              />
              <div>
                <h3 className="font-heading text-base font-black uppercase text-gym-primary">
                  Dr. Elena Vance, MS, RD
                </h3>
                <span className="text-xs text-gym-lime font-mono block mb-2">
                  Sports Nutrition &amp; Ergogenic Science
                </span>
                <p className="text-xs text-gym-muted leading-relaxed">
                  Focuses on nitrogen balance, intra-workout carbohydrate oxidation, and evidence-based pre-workout pharmacology.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Medical & Training Disclaimer (Mandatory YMYL Box) */}
        <section className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-200 space-y-3">
          <div className="flex items-center gap-2 text-yellow-400 font-heading font-black uppercase text-sm">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>MANDATORY HEALTH, FITNESS &amp; MEDICAL DISCLAIMER</span>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-yellow-200/90">
            The training programs, exercise demonstrations, biomechanical critiques, and nutritional protocols published on <strong>profitgymclub.com</strong> are provided strictly for educational and informational purposes. This content does not constitute medical advice, physical therapy diagnosis, or personalized dietary prescriptions. Before beginning any high-intensity resistance training, powerlifting overload, or nutritional supplementation protocol, consult with a licensed physician or healthcare professional.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gym-surface border-t border-gym-border py-8 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gym-muted">
          <div>&copy; 2026 PROFIT Training Club LLC. All rights reserved.</div>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link to="/about" className="text-gym-lime font-bold">About Us</Link>
            <span>&bull;</span>
            <Link to="/contact" className="hover:text-gym-lime transition-colors">Contact</Link>
            <span>&bull;</span>
            <Link to="/privacy" className="hover:text-gym-lime transition-colors">Privacy Policy</Link>
            <span>&bull;</span>
            <Link to="/terms" className="hover:text-gym-lime transition-colors">Terms of Service</Link>
            <span>&bull;</span>
            <Link to="/blog" className="hover:text-gym-lime transition-colors">All Protocols</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
