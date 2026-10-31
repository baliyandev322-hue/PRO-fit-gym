import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';

export const TermsPage: React.FC = () => {
  return (
    <div className="bg-gym-black text-gym-primary font-sans selection:bg-gym-lime selection:text-gym-black min-h-screen flex flex-col">
      <SEOHead
        title="Terms of Service"
        description="Official Terms of Service, membership privileges, and facility regulations for PROFIT Training Club."
        canonicalUrl="https://profitgymclub.com/terms"
      />
      <header className="sticky top-0 z-50 bg-gym-surface/90 backdrop-blur-md border-b border-gym-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xs uppercase font-heading font-bold tracking-wider text-gym-secondary hover:text-white transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4 text-gym-lime" />
            <span>Return to Club</span>
          </Link>
          <Link to="/" className="flex items-center gap-1 font-heading text-xl font-black tracking-wider text-gym-primary">
            <span>PRO</span><span className="text-gym-lime">FIT</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-gym-surface border border-gym-border mb-4">
          <FileText className="w-4 h-4 text-gym-lime" />
          <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-gym-secondary">
            TERMS &amp; CONDITIONS OF SERVICE
          </span>
        </div>

        <h1 className="font-heading text-3xl sm:text-5xl font-black uppercase tracking-wider text-gym-primary mb-3">
          TERMS OF SERVICE
        </h1>
        <p className="text-xs text-gym-muted font-mono mb-8">
          Last Updated: October 29, 2026 &bull; Domain: profitgymclub.com
        </p>

        <div className="space-y-8 text-sm sm:text-base text-gym-secondary leading-relaxed">
          <section className="bg-gym-surface/40 border border-gym-border p-6 rounded">
            <h2 className="font-heading text-xl font-black uppercase text-gym-primary mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or utilizing the services provided on <strong>profitgymclub.com</strong>, you explicitly acknowledge that you have read, understood, and agreed to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any portion of these terms, you are prohibited from using this site and accessing facility premises.
            </p>
          </section>

          <section className="bg-gym-surface/40 border border-gym-border p-6 rounded">
            <h2 className="font-heading text-xl font-black uppercase text-gym-primary mb-3">
              2. Facility Access &amp; Biometric QR Turnstiles
            </h2>
            <p className="mb-3">
              PROFIT Training Club operates as a private athletic strength facility strictly capped at 300 active athletes. Entry is granted exclusively through our digital encrypted QR turnstile system:
            </p>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-gym-lime shrink-0 mt-0.5" />
                <span>QR pass credentials are non-transferable and may not be shared, duplicated, or distributed.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-gym-lime shrink-0 mt-0.5" />
                <span>Sharing turnstile passes with non-members constitutes theft of services and results in immediate membership termination without refund.</span>
              </li>
            </ul>
          </section>

          <section className="bg-gym-surface/40 border border-gym-border p-6 rounded">
            <h2 className="font-heading text-xl font-black uppercase text-gym-primary mb-3">
              3. Educational Content &amp; Exercise Disclaimer
            </h2>
            <p>
              The protocols, workout routines, 1RM calculators, nutritional analyses, and articles published on profitgymclub.com are for educational, informational, and athletic training guidance purposes only. They do not constitute formal medical diagnosis or physical therapy prescriptions. Always consult a qualified medical physician prior to engaging in strenuous Olympic weightlifting, maximum powerlifting tests, or intense thermal contrast therapy.
            </p>
          </section>

          <section className="bg-gym-surface/40 border border-gym-border p-6 rounded">
            <h2 className="font-heading text-xl font-black uppercase text-gym-primary mb-3">
              4. Recurring Subscriptions &amp; Cancellation Policy
            </h2>
            <p className="mb-3">
              Memberships are billed on automated recurring monthly, quarterly, or annual schedules. Athletes maintain complete autonomy to cancel their subscription at any time directly through their online Athlete Portal or by submitting written notice to our desk concierge. Cancellations stop future billing cycles immediately upon completion of the current billing period.
            </p>
          </section>

          <section className="bg-gym-surface/40 border border-gym-border p-6 rounded">
            <h2 className="font-heading text-xl font-black uppercase text-gym-primary mb-3">
              5. Governing Law &amp; Contact
            </h2>
            <p>
              These terms are governed by and construed in accordance with applicable laws. Inquiries concerning these terms may be submitted via email to <strong className="text-gym-primary font-mono">support@profitgymclub.com</strong>.
            </p>
          </section>
        </div>
      </main>

      <footer className="bg-gym-surface border-t border-gym-border py-8 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gym-muted">
          <div>&copy; 2026 PROFIT Training Club LLC.</div>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link to="/about" className="hover:text-gym-lime transition-colors">About Us</Link>
            <span>&bull;</span>
            <Link to="/contact" className="hover:text-gym-lime transition-colors">Contact</Link>
            <span>&bull;</span>
            <Link to="/privacy" className="hover:text-gym-lime transition-colors">Privacy Policy</Link>
            <span>&bull;</span>
            <Link to="/blog" className="hover:text-gym-lime transition-colors">Articles Archive</Link>
            <span>&bull;</span>
            <Link to="/" className="hover:text-gym-lime transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
