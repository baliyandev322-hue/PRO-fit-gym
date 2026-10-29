import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, FileText, CheckCircle } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-gym-black text-gym-primary font-sans selection:bg-gym-lime selection:text-gym-black min-h-screen flex flex-col">
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
          <ShieldCheck className="w-4 h-4 text-gym-lime" />
          <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-gym-secondary">
            OFFICIAL PRIVACY POLICY &amp; DATA DISCLOSURE
          </span>
        </div>

        <h1 className="font-heading text-3xl sm:text-5xl font-black uppercase tracking-wider text-gym-primary mb-3">
          PRIVACY POLICY
        </h1>
        <p className="text-xs text-gym-muted font-mono mb-8">
          Last Updated &amp; Effective: October 29, 2026 &bull; Domain: profitgymclub.com
        </p>

        <div className="space-y-8 text-sm sm:text-base text-gym-secondary leading-relaxed">
          <section className="bg-gym-surface/40 border border-gym-border p-6 rounded">
            <h2 className="font-heading text-xl font-black uppercase text-gym-primary mb-3">
              1. Overview and Scope
            </h2>
            <p>
              PROFIT Training Club ("we", "our", or "us"), operating the website <strong>profitgymclub.com</strong>, is dedicated to protecting the personal privacy and data security of our athletes, digital subscribers, and website visitors. This document outlines how we collect, process, store, and safeguard your data, including our compliance with Google AdSense, third-party advertising cookies, and international data protection laws.
            </p>
          </section>

          {/* ================= CRITICAL FOR GOOGLE ADSENSE APPROVAL ================= */}
          <section className="bg-gym-surface/60 border border-gym-lime/40 p-6 rounded shadow-lime-glow">
            <div className="flex items-center gap-2 text-gym-lime font-heading font-black uppercase text-sm mb-2">
              <Lock className="w-4 h-4" />
              <span>2. Google AdSense &amp; Third-Party Advertising Cookies</span>
            </div>
            <p className="mb-4">
              We may partner with Google AdSense and third-party advertising networks to display relevant advertisements when you visit our website. Please review the following disclosures regarding how Google and third-party advertising vendors utilize data:
            </p>
            <ul className="space-y-3 text-xs sm:text-sm text-gym-primary">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-gym-lime shrink-0 mt-0.5" />
                <span>
                  <strong>Third-Party Vendor Cookies:</strong> Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to our website (profitgymclub.com) or other websites across the Internet.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-gym-lime shrink-0 mt-0.5" />
                <span>
                  <strong>DoubleClick DART Cookie:</strong> Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our site and/or other sites on the Internet.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-gym-lime shrink-0 mt-0.5" />
                <span>
                  <strong>User Opt-Out:</strong> Users may opt out of personalized advertising at any time by visiting{' '}
                  <a 
                    href="https://www.google.com/settings/ads" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gym-lime underline hover:text-white"
                  >
                    Google Ads Settings
                  </a>. Alternatively, users can opt out of third-party vendor cookies for personalized advertising by visiting{' '}
                  <a 
                    href="https://www.aboutads.info/choices/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gym-lime underline hover:text-white"
                  >
                    www.aboutads.info
                  </a>.
                </span>
              </li>
            </ul>
          </section>

          <section className="bg-gym-surface/40 border border-gym-border p-6 rounded">
            <h2 className="font-heading text-xl font-black uppercase text-gym-primary mb-3">
              3. Information We Collect
            </h2>
            <p className="mb-3">When you interact with our website, we may collect the following categories of information:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li><strong>Personal Identifiers:</strong> Name, email address, mobile phone number, and physical fitness goals submitted when requesting a complimentary trial pass or contacting our concierge.</li>
              <li><strong>Member Authentication Data:</strong> Encrypted passwords, biometric turnstile tokens, and account identifiers used to access the Athlete Portal.</li>
              <li><strong>Automated Telemetry &amp; Log Files:</strong> IP addresses, browser user-agent strings, referring/exit pages, timestamps, and clickstream data collected automatically to diagnose technical anomalies.</li>
            </ul>
          </section>

          <section className="bg-gym-surface/40 border border-gym-border p-6 rounded">
            <h2 className="font-heading text-xl font-black uppercase text-gym-primary mb-3">
              4. Payment &amp; Financial Security
            </h2>
            <p>
              We do not store full credit card numbers, CVVs, or bank net-banking passwords on our servers. All financial transactions are processed securely through Level 1 PCI-DSS certified payment processors (including Stripe and Razorpay) using end-to-end TLS encryption and SHA-256 HMAC digital signatures.
            </p>
          </section>

          <section className="bg-gym-surface/40 border border-gym-border p-6 rounded">
            <h2 className="font-heading text-xl font-black uppercase text-gym-primary mb-3">
              5. Your Rights &amp; Contacting the Data Protection Officer
            </h2>
            <p className="mb-3">
              Under applicable data protection frameworks, you have the right to inspect, correct, export, or request the deletion of your personal data at any time.
            </p>
            <p className="text-xs text-gym-muted">
              For privacy inquiries, cookie preferences, or data deletion requests, contact our compliance team at:<br />
              <strong className="text-gym-primary font-mono">support@profitgymclub.com</strong> or WhatsApp concierge at <strong className="text-gym-primary font-mono">+91 9368593249</strong>.
            </p>
          </section>
        </div>
      </main>

      <footer className="bg-gym-surface border-t border-gym-border py-8 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gym-muted">
          <div>&copy; 2026 PROFIT Training Club LLC. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-gym-lime transition-colors">Terms of Service</Link>
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
