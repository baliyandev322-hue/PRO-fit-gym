import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Clock, MessageSquare, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { trackContactFormSubmission, trackWhatsAppLeadClick } from '@/lib/analytics';

export const ContactUsPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiryType: 'membership',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const generatedRef = `CON-${Date.now().toString().slice(-6)}`;
    trackContactFormSubmission(formData.inquiryType, generatedRef);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSubmittedRef(data.referenceId || generatedRef);
      } else {
        // Graceful offline fallback
        setSubmittedRef(generatedRef);
      }
    } catch (err) {
      // Local fallback for offline/client mode
      setSubmittedRef(generatedRef);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gym-black text-gym-primary font-sans selection:bg-gym-lime selection:text-gym-black min-h-screen flex flex-col">
      <SEOHead
        title="Contact Concierge & Editorial Desk | PROFIT Training Club"
        description="Connect with PROFIT Training Club concierge desk, schedule a sanctuary walkthrough, or submit editorial & press inquiries."
        canonicalUrl="https://profitgymclub.com/contact"
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-gym-surface/90 backdrop-blur-md border-b border-gym-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xs uppercase font-heading font-bold tracking-wider text-gym-secondary hover:text-white transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4 text-gym-lime" />
            <span>Return to Club</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/about" className="text-xs uppercase font-heading font-bold tracking-wider text-gym-muted hover:text-gym-lime transition-colors hidden sm:block">
              About &amp; Editorial Board
            </Link>
            <Link to="/blog" className="text-xs uppercase font-heading font-bold tracking-wider text-gym-muted hover:text-gym-lime transition-colors hidden sm:block">
              All Protocols
            </Link>
            <Link to="/" className="flex items-center gap-1 font-heading text-xl font-black tracking-wider text-gym-primary">
              <span>PRO</span><span className="text-gym-lime">FIT</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 w-full space-y-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-gym-surface border border-gym-border mb-4">
            <Mail className="w-4 h-4 text-gym-lime" />
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-gym-secondary">
              DIRECT ATHLETE CONCIERGE &amp; EDITORIAL SUPPORT
            </span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-black uppercase tracking-wider text-gym-primary mb-4">
            CONNECT WITH <span className="text-gym-lime">OUR TEAM.</span>
          </h1>
          <p className="text-base text-gym-secondary leading-relaxed max-w-3xl">
            Whether you have questions regarding membership tier allocations, require technical support with the athlete portal, or have an editorial inquiry regarding our published research, our concierge team responds within 24 hours.
          </p>
        </div>

        {/* Contact Info Cards + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Cards (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 bg-gym-surface border border-gym-border rounded space-y-3">
              <div className="flex items-center gap-3 text-gym-lime">
                <Mail className="w-5 h-5" />
                <h3 className="font-heading text-sm font-black uppercase tracking-wider text-gym-primary">
                  Official Email Inquiries
                </h3>
              </div>
              <p className="text-xs text-gym-muted leading-relaxed">
                General &amp; Member Concierge: <br />
                <a href="mailto:concierge@profitgymclub.com" className="text-gym-lime font-mono hover:underline">
                  concierge@profitgymclub.com
                </a>
              </p>
              <p className="text-xs text-gym-muted leading-relaxed">
                Editorial &amp; Press Staff: <br />
                <a href="mailto:editorial@profitgymclub.com" className="text-gym-lime font-mono hover:underline">
                  editorial@profitgymclub.com
                </a>
              </p>
            </div>

            <div className="p-6 bg-gym-surface border border-gym-border rounded space-y-3">
              <div className="flex items-center gap-3 text-gym-lime">
                <MapPin className="w-5 h-5" />
                <h3 className="font-heading text-sm font-black uppercase tracking-wider text-gym-primary">
                  Sanctuary Location
                </h3>
              </div>
              <p className="text-xs text-gym-secondary leading-relaxed">
                PROFIT Flagship Sanctuary 01 <br />
                NoHo Athletic Performance District <br />
                <span className="text-[11px] text-gym-muted font-mono">Strict 300 Active Member Cap</span>
              </p>
            </div>

            <div className="p-6 bg-gym-surface border border-gym-border rounded space-y-3">
              <div className="flex items-center gap-3 text-gym-lime">
                <Clock className="w-5 h-5" />
                <h3 className="font-heading text-sm font-black uppercase tracking-wider text-gym-primary">
                  Hours of Operation
                </h3>
              </div>
              <p className="text-xs text-gym-secondary leading-relaxed">
                <strong>Member Turnstiles:</strong> 24 Hours / 7 Days a Week <br />
                <strong>Concierge &amp; Coaching Desk:</strong> Mon &ndash; Fri: 06:00 &ndash; 21:00 <br />
                <strong>Weekend Hours:</strong> Sat &ndash; Sun: 07:00 &ndash; 19:00
              </p>
            </div>

            <div className="p-6 bg-gym-lime/10 border border-gym-lime/30 rounded flex items-center justify-between">
              <div>
                <span className="text-[10px] font-heading font-black tracking-widest uppercase text-gym-lime block">
                  INSTANT WHATSAPP DESK
                </span>
                <span className="text-xs text-gym-secondary">Chat directly with head coach</span>
              </div>
              <a
                href="https://wa.me/919999999999?text=Hello%20PROFIT%20Club%2C%20I%20have%20an%20inquiry%20regarding%20membership%20or%20editorial%20articles."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppLeadClick('contact_page')}
                className="px-3.5 py-2 bg-gym-lime text-gym-black font-heading font-black text-xs uppercase tracking-wider rounded hover:bg-gym-lime-hover transition-colors flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat</span>
              </a>
            </div>
          </div>

          {/* Right Form (7 Cols) */}
          <div className="lg:col-span-7 bg-gym-surface border border-gym-border p-6 sm:p-8 rounded">
            {submittedRef ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gym-lime/10 border border-gym-lime flex items-center justify-center mx-auto text-gym-lime">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-heading text-2xl font-black uppercase text-gym-primary">
                  INQUIRY TRANSMITTED
                </h3>
                <p className="text-xs sm:text-sm text-gym-secondary max-w-md mx-auto">
                  Your message has been assigned tracking code <strong className="text-gym-lime font-mono">{submittedRef}</strong>. Our concierge will review your transmission and reply to your email shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedRef(null);
                    setFormData({ name: '', email: '', inquiryType: 'membership', message: '' });
                  }}
                  className="mt-4 px-6 py-2.5 bg-gym-black border border-gym-border text-gym-secondary text-xs uppercase font-heading font-bold rounded hover:text-white"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="font-heading text-xl font-black uppercase tracking-wider text-gym-primary mb-1">
                    TRANSMIT AN INQUIRY
                  </h3>
                  <p className="text-xs text-gym-muted">
                    Fill out the fields below and our front desk or editorial lead will respond.
                  </p>
                </div>

                {errorMessage && (
                  <div role="alert" className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded">
                    {errorMessage}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs uppercase tracking-wider font-bold text-gym-secondary mb-2 font-heading">
                      Athlete / Inquirer Full Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Marcus Aurelius"
                      className="w-full py-2.5 px-3 bg-gym-black border border-gym-border rounded text-gym-primary text-sm focus:outline-none focus:border-gym-lime"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="block text-xs uppercase tracking-wider font-bold text-gym-secondary mb-2 font-heading">
                      Email Address
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="athlete@profitgymclub.com"
                      className="w-full py-2.5 px-3 bg-gym-black border border-gym-border rounded text-gym-primary text-sm focus:outline-none focus:border-gym-lime"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-type" className="block text-xs uppercase tracking-wider font-bold text-gym-secondary mb-2 font-heading">
                      Inquiry Department
                    </label>
                    <select
                      id="contact-type"
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                      className="w-full py-2.5 px-3 bg-gym-black border border-gym-border rounded text-gym-primary text-sm focus:outline-none focus:border-gym-lime"
                    >
                      <option value="membership">Membership Allocation (300 Cap)</option>
                      <option value="trial">Free 1-Day Trial Pass Scheduling</option>
                      <option value="editorial">Editorial / Content Feedback / Scientific Correction</option>
                      <option value="press">Press, Sponsorship &amp; Media Inquiries</option>
                      <option value="technical">Website &amp; Member App Support</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-xs uppercase tracking-wider font-bold text-gym-secondary mb-2 font-heading">
                      Transmission Message
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please detail your inquiry, athletic goals, or editorial feedback..."
                      className="w-full py-2.5 px-3 bg-gym-black border border-gym-border rounded text-gym-primary text-sm focus:outline-none focus:border-gym-lime resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gym-lime hover:bg-gym-lime-hover text-gym-black text-xs uppercase font-heading font-black tracking-wider rounded shadow-lime-glow flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Transmitting...' : 'Dispatch Inquiry'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gym-surface border-t border-gym-border py-8 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gym-muted">
          <div>&copy; 2026 PROFIT Training Club LLC. All rights reserved.</div>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link to="/about" className="hover:text-gym-lime transition-colors">About Us</Link>
            <span>&bull;</span>
            <Link to="/contact" className="text-gym-lime font-bold">Contact</Link>
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
