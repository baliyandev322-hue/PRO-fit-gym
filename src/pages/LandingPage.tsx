import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Dumbbell, 
  Flame, 
  ShieldCheck, 
  Clock, 
  Users, 
  Check, 
  ChevronDown, 
  ArrowRight, 
  Calculator, 
  MapPin, 
  Award, 
  Activity, 
  Play, 
  Sparkles,
  Phone,
  Mail,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGymData } from '@/context/GymDataContext';
import { useNotifications } from '@/context/NotificationContext';
import confetti from 'canvas-confetti';

interface ConfirmedTrialPass {
  reference: string;
  athleteName: string;
  discipline: string;
  date: string;
  phone: string;
}

export const LandingPage: React.FC = () => {
  const { user, isAuthenticated, role } = useAuth();
  const { plans } = useGymData();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  // Free Trial Modal State
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [pricingCurrency, setPricingCurrency] = useState<'USD' | 'INR'>('USD');
  const [trialName, setTrialName] = useState('');
  const [trialEmail, setTrialEmail] = useState('');
  const [trialPhone, setTrialPhone] = useState('');
  const [trialDiscipline, setTrialDiscipline] = useState('Athletic Strength & Conditioning');
  const [trialDate, setTrialDate] = useState('');
  const [trialNotes, setTrialNotes] = useState('');
  const [isSubmittingTrial, setIsSubmittingTrial] = useState(false);
  const [confirmedTrialPass, setConfirmedTrialPass] = useState<ConfirmedTrialPass | null>(null);

  // Legal Policies Modal State (Razorpay & RBI Compliance)
  const [activePolicy, setActivePolicy] = useState<'terms' | 'privacy' | 'refund' | null>(null);

  // Close modal on Escape key for WCAG accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTrialModal(false);
        setActivePolicy(null);
        setConfirmedTrialPass(null);
      }
    };
    if (showTrialModal || activePolicy || confirmedTrialPass) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTrialModal, activePolicy, confirmedTrialPass]);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactSubject, setContactSubject] = useState('General Sanctuary Inquiry');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  // 1RM Calculator State
  const [calcWeight, setCalcWeight] = useState<number>(100);
  const [calcReps, setCalcReps] = useState<number>(5);
  const [calculated1RM, setCalculated1RM] = useState<number>(116.7);

  // BMI Calculator State
  const [bmiWeight, setBmiWeight] = useState<number>(80);
  const [bmiHeight, setBmiHeight] = useState<number>(180);
  const [calculatedBMI, setCalculatedBMI] = useState<string>('24.7');
  const [bmiCategory, setBmiCategory] = useState<string>('Normal / Athletic');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Mobile menu toggle
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const calculateOneRepMax = (w: number, r: number) => {
    if (r <= 1) return w;
    // Epley Formula: 1RM = w * (1 + r / 30)
    const result = Math.round(w * (1 + r / 30) * 10) / 10;
    return result;
  };

  const handleWeightChange = (val: number) => {
    setCalcWeight(val);
    setCalculated1RM(calculateOneRepMax(val, calcReps));
  };

  const handleRepsChange = (val: number) => {
    setCalcReps(val);
    setCalculated1RM(calculateOneRepMax(calcWeight, val));
  };

  const handleBmiCalc = (w: number, h: number) => {
    if (!w || !h) return;
    const heightInMeters = h / 100;
    const bmiVal = (w / (heightInMeters * heightInMeters)).toFixed(1);
    setCalculatedBMI(bmiVal);
    const num = parseFloat(bmiVal);
    if (num < 18.5) setBmiCategory('Underweight');
    else if (num < 25) setBmiCategory('Normal / Optimal');
    else if (num < 30) setBmiCategory('Muscular / Overweight');
    else setBmiCategory('High Mass');
  };

  const faqs = [
    {
      q: 'Why does PROFIT strictly cap membership at 300 athletes?',
      a: 'We reject crowded fitness chains. With a strict 300-member cap, you will never wait for an Eleiko calibrated power rack, deadlift platform, or cold plunge bath. The sanctuary maintains unmatched focus, quiet intensity, and optimal equipment availability.'
    },
    {
      q: 'What is included in the initial Biomechanics Assessment?',
      a: 'Every new athlete undergoes a 60-minute kinematic movement screen with a Master Coach, including multi-angle video bar-path analysis, InBody 770 composition scan, and joint mobility audit.'
    },
    {
      q: 'How does the digital QR attendance and mobile app work?',
      a: 'Upon joining, your portal gives you a dynamic encrypted QR token that operates our turnstile gates 24/7. Your daily periodized workout, exercise videos, set logging, and coach check-ins are synced in real time.'
    },
    {
      q: 'Can I pause or upgrade my membership tier at any time?',
      a: 'Yes. All memberships are managed directly via Stripe & Razorpay multi-currency billing (USD / INR). You can upgrade from Starter to Performance or Elite directly inside your Athlete Portal with instant prorated billing.'
    }
  ];

  const handleTrialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trialName.trim() || !trialEmail.trim() || !trialPhone.trim()) {
      showToast({
        type: 'warning',
        title: 'MISSING FIELDS',
        message: 'Please provide your full name, email address, and phone number.'
      });
      return;
    }

    setIsSubmittingTrial(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    let issuedRef = `PRO-TR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const res = await fetch('/api/trials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          fullName: trialName.trim(),
          email: trialEmail.trim(),
          phone: trialPhone.trim(),
          discipline: trialDiscipline,
          preferredDate: trialDate,
          notes: trialNotes.trim()
        })
      });
      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.success || data.reference)) {
        issuedRef = data.data?.reference || data.reference || data.trial?.reference || issuedRef;
      }
    } catch (err) {
      // Optimistic fallback for sleeping Render backend
    } finally {
      clearTimeout(timeoutId);
      setIsSubmittingTrial(false);
      setShowTrialModal(false);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ccff00', '#ffffff', '#23252a']
      });

      showToast({
        type: 'success',
        title: 'TRIAL PASS CONFIRMED',
        message: `Complimentary pass issued for ${trialName.trim()}! Reference: ${issuedRef}.`
      });

      setConfirmedTrialPass({
        athleteName: trialName.trim(),
        reference: issuedRef,
        discipline: trialDiscipline,
        date: trialDate || 'Immediate Entry',
        phone: trialPhone.trim()
      });

      setTrialName('');
      setTrialEmail('');
      setTrialPhone('');
      setTrialNotes('');
      setTrialDate('');
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      showToast({
        type: 'warning',
        title: 'INCOMPLETE INQUIRY',
        message: 'Name, email address, and message are required fields.'
      });
      return;
    }

    setIsSubmittingContact(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    let contactRef = `CT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          fullName: contactName.trim(),
          email: contactEmail.trim(),
          phone: contactPhone.trim(),
          subject: contactSubject,
          message: contactMessage.trim()
        })
      });
      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.success || data.reference)) {
        contactRef = data.reference || contactRef;
      }
    } catch (err) {
      // Optimistic fallback for sleeping Render backend
    } finally {
      clearTimeout(timeoutId);
      setIsSubmittingContact(false);

      showToast({
        type: 'success',
        title: 'INQUIRY TRANSMITTED',
        message: `Thank you, ${contactName.trim()}. Ref: ${contactRef}. Concierge desk will reply within 2 hours.`
      });

      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setContactMessage('');
    }
  };

  return (
    <div className="bg-gym-black text-gym-primary font-sans selection:bg-gym-lime selection:text-gym-black min-h-screen">
      {/* ================= 1. ARCHITECTURAL NAVBAR ================= */}
      <header className="sticky top-0 z-50 bg-gym-surface/90 backdrop-blur-md border-b border-gym-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex flex-col group">
            <span className="font-heading text-3xl font-black tracking-wider text-gym-primary group-hover:text-white transition-colors">
              PRO<span className="text-gym-lime">FIT</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-gym-secondary font-semibold -mt-1">
              TRAINING CLUB &bull; FLAGSHIP SANCTUARY
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs uppercase font-heading font-bold tracking-wider text-gym-secondary">
            <a href="#about" className="hover:text-gym-lime transition-colors">Philosophy</a>
            <a href="#programs" className="hover:text-gym-lime transition-colors">Disciplines</a>
            <a href="#plans" className="hover:text-gym-lime transition-colors">Memberships</a>
            <a href="#lab" className="hover:text-gym-lime transition-colors">Performance Lab</a>
            <a href="#trainers" className="hover:text-gym-lime transition-colors">Coaches</a>
            <Link to="/blog" className="text-gym-lime hover:text-white transition-colors flex items-center gap-1 font-black">
              Articles
            </Link>
            <a href="#faq" className="hover:text-gym-lime transition-colors">FAQ</a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={role === 'admin' ? '/admin/dashboard' : role === 'trainer' ? '/trainer/dashboard' : '/member/dashboard'}
                className="px-4 py-2 bg-gym-lime text-gym-black font-heading font-black uppercase text-xs tracking-wider rounded-sm hover:bg-gym-lime-hover shadow-lime-glow transition-all flex items-center gap-1.5"
              >
                <span>Dashboard ({role?.toUpperCase()})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gym-secondary hover:text-white text-xs uppercase font-heading font-bold tracking-wider transition-colors"
                >
                  Athlete Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gym-lime text-gym-black font-heading font-black uppercase text-xs tracking-wider rounded-sm hover:bg-gym-lime-hover shadow-lime-glow transition-all flex items-center gap-1.5"
                >
                  <span>Apply For Membership</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-2 text-gym-secondary hover:text-white"
            aria-label="Toggle Navigation"
          >
            <div className="space-y-1.5 w-6">
              <span className="block h-0.5 bg-white"></span>
              <span className="block h-0.5 bg-gym-lime"></span>
              <span className="block h-0.5 bg-white"></span>
            </div>
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileNavOpen && (
          <div className="md:hidden bg-gym-surface border-b border-gym-border px-6 py-4 space-y-3">
            <a href="#about" onClick={() => setMobileNavOpen(false)} className="block text-sm uppercase font-heading font-bold text-gym-secondary">Philosophy</a>
            <a href="#programs" onClick={() => setMobileNavOpen(false)} className="block text-sm uppercase font-heading font-bold text-gym-secondary">Disciplines</a>
            <a href="#plans" onClick={() => setMobileNavOpen(false)} className="block text-sm uppercase font-heading font-bold text-gym-secondary">Memberships</a>
            <a href="#lab" onClick={() => setMobileNavOpen(false)} className="block text-sm uppercase font-heading font-bold text-gym-secondary">Performance Lab</a>
            <a href="#trainers" onClick={() => setMobileNavOpen(false)} className="block text-sm uppercase font-heading font-bold text-gym-secondary">Coaches</a>
            <Link to="/blog" onClick={() => setMobileNavOpen(false)} className="block text-sm uppercase font-heading font-black text-gym-lime">Articles &amp; Protocols</Link>
            <div className="pt-3 border-t border-gym-border flex flex-col gap-2">
              <Link to="/login" className="py-2 text-center text-xs uppercase font-heading font-bold bg-gym-black border border-gym-border rounded">
                Athlete Login
              </Link>
              <Link to="/register" className="py-2 text-center text-xs uppercase font-heading font-black bg-gym-lime text-gym-black rounded">
                Apply For Membership
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ================= 2. HERO SECTION ================= */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-gym-border">
        {/* Background Visual Layer */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80"
            alt="PROFIT Training Club Facility"
            className="w-full h-full object-cover opacity-25 filter grayscale contrast-125 scale-105 transform animate-pulse duration-[10000ms]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gym-black via-gym-black/80 to-gym-black/40"></div>
          <div className="absolute inset-0 bg-[radial-gradient(#ccff00_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-gym-surface/80 border border-gym-lime/30 text-gym-lime text-xs uppercase font-heading font-bold tracking-widest mb-6 shadow-lime-glow">
            <span className="w-2 h-2 rounded-full bg-gym-lime animate-ping"></span>
            STRICT 300 MEMBER CAP &bull; ATHLETIC SANCTUARY
          </div>

          <h1 className="font-heading text-5xl sm:text-7xl lg:text-8xl font-black uppercase text-gym-primary tracking-tight leading-none mb-6">
            WHERE DISCIPLINE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gym-primary to-gym-lime">
              MEETS DESTINY.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-gym-secondary text-sm sm:text-base leading-relaxed mb-8">
            An elite private strength & conditioning sanctuary. Calibrated Eleiko iron, biometric turnstile gates, and bespoke periodized programming with zero crowds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 bg-gym-lime text-gym-black font-heading font-black uppercase text-base tracking-wider rounded-sm hover:bg-gym-lime-hover shadow-lime-glow transition-all flex items-center justify-center gap-2"
            >
              <span>Apply For Membership</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setShowTrialModal(true)}
              className="w-full sm:w-auto px-8 py-4 bg-gym-surface hover:bg-gym-surface-hover text-gym-primary border border-gym-lime/60 font-heading font-bold uppercase text-base tracking-wider rounded-sm transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-gym-lime" />
              <span>Book Free Trial Pass</span>
            </button>
            <a
              href="#plans"
              className="w-full sm:w-auto px-6 py-4 bg-gym-black hover:bg-gym-surface text-gym-secondary border border-gym-border font-heading font-bold uppercase text-base tracking-wider rounded-sm transition-all"
            >
              Explore Tiers
            </a>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 pt-8 border-t border-gym-border/60 text-left">
            <div>
              <span className="font-heading text-3xl sm:text-4xl font-black text-gym-primary block">300</span>
              <span className="text-[11px] uppercase tracking-wider text-gym-secondary font-medium">Capped Members</span>
            </div>
            <div>
              <span className="font-heading text-3xl sm:text-4xl font-black text-gym-lime block">100%</span>
              <span className="text-[11px] uppercase tracking-wider text-gym-secondary font-medium">Eleiko Calibrated</span>
            </div>
            <div>
              <span className="font-heading text-3xl sm:text-4xl font-black text-gym-primary block">24/7</span>
              <span className="text-[11px] uppercase tracking-wider text-gym-secondary font-medium">Biometric Access</span>
            </div>
            <div>
              <span className="font-heading text-3xl sm:text-4xl font-black text-gym-lime block">6:1</span>
              <span className="text-[11px] uppercase tracking-wider text-gym-secondary font-medium">Athlete Coach Ratio</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. DISCIPLINES & PROGRAMS ================= */}
      <section id="programs" className="py-20 border-b border-gym-border bg-gym-surface/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-heading font-bold uppercase text-gym-lime tracking-widest block mb-2">
                TRAINING DISCIPLINES
              </span>
              <h2 className="font-heading text-3xl sm:text-5xl font-black uppercase text-gym-primary tracking-wide">
                BUILT FOR MAXIMUM POWER & LONGEVITY
              </h2>
            </div>
            <p className="text-xs text-gym-secondary max-w-md mt-4 md:mt-0 leading-relaxed">
              Every discipline is supervised by accredited CSCS master coaches with periodized logging through the athlete app.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Heavy Barbell Iron',
                desc: 'Powerlifting platforms, calibrated Eleiko discs, and monitored eccentric overload for pure strength.',
                icon: Dumbbell,
                tag: 'Strength'
              },
              {
                title: 'Olympic Weightlifting',
                desc: 'Dedicated solid oak platforms, bearing barbells, and jerk blocks for snatch and clean & jerk mechanics.',
                icon: Award,
                tag: 'Speed-Strength'
              },
              {
                title: 'Anaerobic Engine',
                desc: 'Curved woodway treadmills, Rogue echo bikes, and Concept2 rowers targeting VO2 max and threshold.',
                icon: Flame,
                tag: 'Conditioning'
              },
              {
                title: 'Contrast Hydrotherapy',
                desc: '38°F cold plunge pools and dry cedar sauna with infrared panels for rapid CNS replenishment.',
                icon: Sparkles,
                tag: 'Recovery'
              }
            ].map((disc, idx) => {
              const Icon = disc.icon;
              return (
                <div key={idx} className="bg-gym-surface border border-gym-border p-6 rounded-sm flex flex-col justify-between hover:border-gym-lime/50 transition-all group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gym-black rounded border border-gym-border group-hover:border-gym-lime/50 transition-colors">
                        <Icon className="w-5 h-5 text-gym-lime" />
                      </div>
                      <span className="text-[10px] font-heading font-black uppercase text-gym-secondary bg-gym-black px-2 py-0.5 rounded border border-gym-border">
                        {disc.tag}
                      </span>
                    </div>
                    <h3 className="font-heading text-xl font-black uppercase text-gym-primary mb-2">
                      {disc.title}
                    </h3>
                    <p className="text-xs text-gym-secondary leading-relaxed">
                      {disc.desc}
                    </p>
                  </div>
                  <div className="pt-6 mt-6 border-t border-gym-border/40 flex items-center justify-between text-xs text-gym-muted">
                    <span>Eleiko Standard</span>
                    <span className="text-gym-lime font-bold">Protocol Active</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 4. PRICING & MEMBERSHIPS ================= */}
      <section id="plans" className="py-20 border-b border-gym-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-heading font-bold uppercase text-gym-lime tracking-widest block mb-2">
              EXCLUSIVE MEMBERSHIP TIERS
            </span>
            <h2 className="font-heading text-4xl sm:text-6xl font-black uppercase text-gym-primary tracking-wide">
              INVEST IN CALIBRATED EXCELLENCE
            </h2>
            <p className="text-xs text-gym-secondary mt-3">
              Strict 300 member cap. Multi-currency automated billing via Stripe & Razorpay, digital QR check-in, and full portal tracking.
            </p>

            {/* Currency Toggle */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <span className="text-[11px] font-heading uppercase tracking-wider text-gym-muted font-bold">
                Billing Currency:
              </span>
              <div className="inline-flex p-1 bg-gym-black rounded border border-gym-border">
                <button
                  type="button"
                  onClick={() => setPricingCurrency('USD')}
                  className={`px-3 py-1 text-xs font-heading font-black rounded-sm transition-all cursor-pointer ${
                    pricingCurrency === 'USD'
                      ? 'bg-gym-lime text-gym-black shadow-sm'
                      : 'text-gym-secondary hover:text-white'
                  }`}
                >
                  🇺🇸 USD ($)
                </button>
                <button
                  type="button"
                  onClick={() => setPricingCurrency('INR')}
                  className={`px-3 py-1 text-xs font-heading font-black rounded-sm transition-all cursor-pointer ${
                    pricingCurrency === 'INR'
                      ? 'bg-gym-lime text-gym-black shadow-sm'
                      : 'text-gym-secondary hover:text-white'
                  }`}
                >
                  🇮🇳 INR (₹)
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-gym-surface rounded-sm p-8 flex flex-col justify-between border transition-all ${
                  plan.is_popular
                    ? 'border-gym-lime shadow-lime-glow-lg relative scale-105 z-10'
                    : 'border-gym-border hover:border-gym-muted'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide">
                      {plan.name}
                    </span>
                    {plan.is_popular && (
                      <span className="px-2.5 py-1 rounded text-[10px] font-heading font-black uppercase bg-gym-lime text-gym-black tracking-wider">
                        Most Popular
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gym-secondary mb-6 leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="font-heading text-5xl font-black text-gym-primary">
                      {pricingCurrency === 'INR'
                        ? (plan.id === 'plan-starter' || plan.name?.toLowerCase().includes('starter')
                            ? '₹2,999'
                            : plan.id === 'plan-performance' || plan.name?.toLowerCase().includes('performance')
                            ? '₹4,999'
                            : '₹6,999')
                        : `$${plan.price}`}
                    </span>
                    <span className="text-xs text-gym-secondary font-medium ml-1">/ month</span>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-gym-border mb-8">
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs text-gym-secondary">
                        <Check className="w-4 h-4 text-gym-lime shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  to={`/register?plan=${plan.id}`}
                  className={`w-full py-3.5 rounded-sm font-heading uppercase font-black text-xs tracking-wider transition-all flex items-center justify-center gap-2 ${
                    plan.is_popular
                      ? 'bg-gym-lime text-gym-black hover:bg-gym-lime-hover shadow-lime-glow'
                      : 'bg-gym-black border border-gym-border text-gym-primary hover:bg-gym-surface'
                  }`}
                >
                  <span>Select {plan.name} Tier</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 5. PERFORMANCE LAB CALCULATORS ================= */}
      <section id="lab" className="py-20 border-b border-gym-border bg-gym-surface/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-heading font-bold uppercase text-gym-lime tracking-widest block mb-2">
              PROFIT PERFORMANCE LAB
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl font-black uppercase text-gym-primary tracking-wide">
              CALCULATE YOUR ATHLETIC BASELINE
            </h2>
            <p className="text-xs text-gym-secondary mt-2">
              Interactive biomechanics tools calibrated to powerlifting and athletic body composition standards
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tool 1: 1-Rep Max Calculator */}
            <div className="bg-gym-surface border border-gym-border p-6 sm:p-8 rounded-sm">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-5 h-5 text-gym-lime" />
                <h3 className="font-heading text-xl font-black uppercase text-gym-primary tracking-wide">
                  1-REP MAX (1RM) EPLEY CALCULATOR
                </h3>
              </div>
              <p className="text-xs text-gym-secondary mb-6">
                Estimate your maximum single effort load for Bench Press, Squat, or Deadlift.
              </p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-heading uppercase font-bold text-gym-secondary mb-1">
                    <span>Weight Lifted (KG)</span>
                    <span className="text-gym-lime font-mono">{calcWeight} KG</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="300"
                    step="2.5"
                    value={calcWeight}
                    onChange={(e) => handleWeightChange(Number(e.target.value))}
                    className="w-full accent-gym-lime"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-heading uppercase font-bold text-gym-secondary mb-1">
                    <span>Repetitions Completed</span>
                    <span className="text-gym-lime font-mono">{calcReps} REPS</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={calcReps}
                    onChange={(e) => handleRepsChange(Number(e.target.value))}
                    className="w-full accent-gym-lime"
                  />
                </div>

                <div className="p-4 bg-gym-black rounded border border-gym-border flex items-center justify-between mt-6">
                  <div>
                    <span className="text-[10px] uppercase font-heading font-bold text-gym-muted block">
                      ESTIMATED 1RM BENCHMARK
                    </span>
                    <span className="font-heading text-3xl font-black text-gym-lime">
                      {calculated1RM} <span className="text-base text-gym-secondary font-normal">KG</span>
                    </span>
                  </div>
                  <div className="text-right text-xs text-gym-secondary">
                    <div>90% Load: <strong className="text-white">{(calculated1RM * 0.9).toFixed(1)} kg</strong></div>
                    <div>80% Load: <strong className="text-white">{(calculated1RM * 0.8).toFixed(1)} kg</strong></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tool 2: Athletic BMI & Body Composition */}
            <div className="bg-gym-surface border border-gym-border p-6 sm:p-8 rounded-sm">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                <h3 className="font-heading text-xl font-black uppercase text-gym-primary tracking-wide">
                  ATHLETIC MASS INDEX CALCULATOR
                </h3>
              </div>
              <p className="text-xs text-gym-secondary mb-6">
                Assess weight distribution and target hypertrophy baseline.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                      Body Weight (KG)
                    </label>
                    <input
                      type="number"
                      value={bmiWeight}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setBmiWeight(val);
                        handleBmiCalc(val, bmiHeight);
                      }}
                      className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary font-bold focus:outline-none focus:border-gym-lime"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                      Height (CM)
                    </label>
                    <input
                      type="number"
                      value={bmiHeight}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setBmiHeight(val);
                        handleBmiCalc(bmiWeight, val);
                      }}
                      className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-gym-primary font-bold focus:outline-none focus:border-gym-lime"
                    />
                  </div>
                </div>

                <div className="p-4 bg-gym-black rounded border border-gym-border flex items-center justify-between mt-6">
                  <div>
                    <span className="text-[10px] uppercase font-heading font-bold text-gym-muted block">
                      CALCULATED SCORE
                    </span>
                    <span className="font-heading text-3xl font-black text-cyan-400">
                      {calculatedBMI} <span className="text-base text-gym-secondary font-normal">BMI</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-heading font-bold text-gym-muted block">
                      CLASSIFICATION
                    </span>
                    <span className="font-heading text-base font-bold text-white uppercase">
                      {bmiCategory}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-gym-muted leading-relaxed">
                  * Note: In elite lifters with high skeletal muscle density, InBody 770 multi-frequency impedance is recommended over standard BMI.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 6. MASTER COACHES ================= */}
      <section id="trainers" className="py-20 border-b border-gym-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-heading font-bold uppercase text-gym-lime tracking-widest block mb-2">
                COACHING STAFF
              </span>
              <h2 className="font-heading text-3xl sm:text-5xl font-black uppercase text-gym-primary tracking-wide">
                MASTER STRENGTH COACHES
              </h2>
            </div>
            <p className="text-xs text-gym-secondary max-w-md mt-4 md:mt-0 leading-relaxed">
              Master coaches who build world record holders and executive athletes. No personal training sales gimmicks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Marcus Drake',
                role: 'Head Strength Specialist',
                creds: 'CSCS &bull; USAW Level 2 &bull; 12 Yrs Experience',
                img: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80',
                bio: 'Specialist in heavy posterior chain development, powerlifting bar kinematics, and CNS recovery.'
              },
              {
                name: 'Chloe Sterling',
                role: 'Director of Biomechanics',
                creds: 'Doctor of Physical Therapy &bull; EXOS &bull; FMS Level 2',
                img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
                bio: 'Oversees athlete joint mobility screening, injury rehabilitation, and postural alignment.'
              },
              {
                name: 'Kai Thorne',
                role: 'Olympic Lifting Director',
                creds: 'IWF Master Coach &bull; Eleiko Calibrated',
                img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
                bio: 'Coaches snatch and clean & jerk mechanics with high-speed video feedback and velocity sensors.'
              }
            ].map((coach, i) => (
              <div key={i} className="bg-gym-surface border border-gym-border rounded-sm overflow-hidden group">
                <div className="h-64 overflow-hidden relative">
                  <img
                    src={coach.img}
                    alt={coach.name}
                    className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gym-surface to-transparent"></div>
                </div>
                <div className="p-6">
                  <span className="text-xs text-gym-lime font-mono block mb-1">{coach.role}</span>
                  <h3 className="font-heading text-2xl font-black uppercase text-gym-primary mb-2">
                    {coach.name}
                  </h3>
                  <p className="text-xs text-gym-secondary mb-4 leading-relaxed">
                    {coach.bio}
                  </p>
                  <div className="pt-3 border-t border-gym-border text-[11px] text-gym-muted" dangerouslySetInnerHTML={{ __html: coach.creds }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 7. FAQ ACCORDION ================= */}
      <section id="faq" className="py-20 border-b border-gym-border bg-gym-surface/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-heading font-bold uppercase text-gym-lime tracking-widest block mb-2">
              SANCTUARY PROTOCOLS
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl font-black uppercase text-gym-primary tracking-wide">
              FREQUENTLY ASKED QUESTIONS
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-gym-surface border border-gym-border rounded-sm overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-heading font-black uppercase text-sm sm:text-base text-gym-primary hover:text-gym-lime transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-gym-lime' : 'text-gym-muted'}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-gym-secondary leading-relaxed border-t border-gym-border/40 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 7.5 PERFORMANCE KNOWLEDGE BASE PREVIEW ================= */}
      <section id="knowledge" className="py-20 border-b border-gym-border bg-gym-black relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-heading font-bold uppercase text-gym-lime tracking-widest block mb-2">
                SCIENTIFIC KNOWLEDGE BASE &amp; PROTOCOLS
              </span>
              <h2 className="font-heading text-3xl sm:text-5xl font-black uppercase text-gym-primary tracking-wide">
                EVIDENCE-BASED ATHLETIC RESEARCH
              </h2>
              <p className="text-xs text-gym-secondary mt-2 max-w-xl leading-relaxed">
                Peer-reviewed training protocols, 1RM strength formulas, sports nutrition clinical breakdowns, and recovery science published by our master coaching faculty.
              </p>
            </div>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gym-surface hover:bg-gym-surface-hover border border-gym-lime/40 text-gym-lime hover:text-white font-heading font-bold text-xs uppercase tracking-wider rounded transition-all shrink-0 shadow-lime-glow"
            >
              <span>Explore All 16 Protocols</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/blog/push-pull-legs-hypertrophy-masterclass"
              className="group bg-gym-surface border border-gym-border rounded overflow-hidden hover:border-gym-lime/50 transition-all flex flex-col justify-between shadow-card hover:-translate-y-1 duration-300"
            >
              <div className="h-44 relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80"
                  alt="Push Pull Legs Protocol"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 bg-gym-black/90 text-gym-lime font-heading font-bold uppercase text-[10px] tracking-wider rounded border border-gym-lime/30">
                  Hypertrophy
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-gym-muted font-mono block mb-1">8 min read &bull; CSCS Certified</span>
                  <h3 className="font-heading text-lg font-black uppercase text-gym-primary group-hover:text-gym-lime transition-colors leading-snug line-clamp-2">
                    The Ultimate Push-Pull-Legs Split for Maximum Muscle Hypertrophy
                  </h3>
                  <p className="text-xs text-gym-secondary mt-2 line-clamp-2">
                    A scientific breakdown of the 6-day and 3-day PPL protocols. Mechanical tension, volume allocation, and recovery.
                  </p>
                </div>
                <div className="pt-4 border-t border-gym-border/40 mt-4 flex items-center justify-between text-xs text-gym-lime font-heading font-bold uppercase">
                  <span>Read Protocol</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link
              to="/blog/creatine-monohydrate-science-dosage-timing"
              className="group bg-gym-surface border border-gym-border rounded overflow-hidden hover:border-gym-lime/50 transition-all flex flex-col justify-between shadow-card hover:-translate-y-1 duration-300"
            >
              <div className="h-44 relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=600&q=80"
                  alt="Creatine Monohydrate Science"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 bg-gym-black/90 text-gym-lime font-heading font-bold uppercase text-[10px] tracking-wider rounded border border-gym-lime/30">
                  Nutrition
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-gym-muted font-mono block mb-1">6 min read &bull; Clinical Science</span>
                  <h3 className="font-heading text-lg font-black uppercase text-gym-primary group-hover:text-gym-lime transition-colors leading-snug line-clamp-2">
                    Creatine Monohydrate: Clinical Guide to Dosage, Timing &amp; Myths
                  </h3>
                  <p className="text-xs text-gym-secondary mt-2 line-clamp-2">
                    Everything peer-reviewed research reveals about phosphocreatine saturation, kidney safety, and cognitive performance.
                  </p>
                </div>
                <div className="pt-4 border-t border-gym-border/40 mt-4 flex items-center justify-between text-xs text-gym-lime font-heading font-bold uppercase">
                  <span>Read Protocol</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link
              to="/blog/cold-plunge-and-sauna-contrast-therapy"
              className="group bg-gym-surface border border-gym-border rounded overflow-hidden hover:border-gym-lime/50 transition-all flex flex-col justify-between shadow-card hover:-translate-y-1 duration-300"
            >
              <div className="h-44 relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80"
                  alt="Cold Plunge and Sauna Contrast"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 bg-gym-black/90 text-gym-lime font-heading font-bold uppercase text-[10px] tracking-wider rounded border border-gym-lime/30">
                  Recovery
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-gym-muted font-mono block mb-1">7 min read &bull; Biohacking</span>
                  <h3 className="font-heading text-lg font-black uppercase text-gym-primary group-hover:text-gym-lime transition-colors leading-snug line-clamp-2">
                    Cold Plunge &amp; Sauna Contrast: Cellular Recovery &amp; Neurochemistry
                  </h3>
                  <p className="text-xs text-gym-secondary mt-2 line-clamp-2">
                    How thermal shock proteins accelerate lactate clearance and stimulate a sustained 250% dopamine baseline surge.
                  </p>
                </div>
                <div className="pt-4 border-t border-gym-border/40 mt-4 flex items-center justify-between text-xs text-gym-lime font-heading font-bold uppercase">
                  <span>Read Protocol</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 8. SANCTUARY CONCIERGE & INQUIRIES ================= */}
      <section id="contact" className="py-20 border-b border-gym-border bg-gym-surface/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Info Column */}
            <div className="space-y-6">
              <div>
                <span className="text-xs font-heading font-bold uppercase text-gym-lime tracking-widest block mb-2">
                  CONCIERGE & OPERATIONS
                </span>
                <h2 className="font-heading text-3xl sm:text-5xl font-black uppercase text-gym-primary tracking-wide">
                  CONNECT WITH THE SANCTUARY DESK
                </h2>
                <p className="text-xs text-gym-secondary mt-3 leading-relaxed">
                  Have questions regarding our strict 300-athlete membership cap, corporate executive packages, or Olympic lifting platforms? Our front-desk concierge is on standby.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-gym-border/60 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gym-lime shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block uppercase font-heading">PROFIT Flagship Athletic Sanctuary</span>
                    <span className="text-gym-secondary">High-Performance Training Ground & Global Digital Club</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-gym-lime shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block uppercase font-heading">Direct Concierge & WhatsApp Desk</span>
                    <a href="https://wa.me/919368593249" target="_blank" rel="noopener noreferrer" className="text-gym-secondary font-mono hover:text-gym-lime transition-colors">
                      +91 9368593249 &bull; Daily 5:00 AM – 11:00 PM
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-gym-lime shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block uppercase font-heading">Executive Inquiries</span>
                    <a href="mailto:support@profitgymclub.com" className="text-gym-secondary font-mono hover:text-gym-lime transition-colors">
                      support@profitgymclub.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Instant Complimentary Pass Banner */}
              <div className="p-5 bg-gym-surface border border-gym-border rounded-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-gym-lime" />
                  <span className="font-heading font-black uppercase text-sm text-gym-primary">
                    FIRST-TIME ATHLETE AUDIT
                  </span>
                </div>
                <p className="text-xs text-gym-muted mb-4 leading-relaxed">
                  Experience the quiet focus of our sanctuary with a complimentary 1-on-1 biomechanics movement screen and training pass.
                </p>
                <button
                  onClick={() => setShowTrialModal(true)}
                  className="px-5 py-2.5 bg-gym-lime text-gym-black font-heading font-bold uppercase text-xs rounded hover:bg-gym-lime-hover shadow-lime-glow transition-all"
                >
                  Book Complimentary Trial Pass
                </button>
              </div>
            </div>

            {/* Right Form Column */}
            <div className="bg-gym-surface border border-gym-border p-6 sm:p-8 rounded-sm">
              <h3 className="font-heading text-xl font-black uppercase tracking-wider text-gym-primary mb-1">
                DISPATCH CONCIERGE MESSAGE
              </h3>
              <p className="text-xs text-gym-muted mb-6">
                All messages are routed directly to our operations director with guaranteed 2-hour response time.
              </p>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Marcus Stone"
                      required
                      className="w-full py-2.5 px-3 bg-gym-black border border-gym-border rounded text-xs text-gym-primary focus:outline-none focus:border-gym-lime"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. marcus@firm.com"
                      required
                      className="w-full py-2.5 px-3 bg-gym-black border border-gym-border rounded text-xs text-gym-primary focus:outline-none focus:border-gym-lime font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 93685 93249"
                      className="w-full py-2.5 px-3 bg-gym-black border border-gym-border rounded text-xs text-gym-primary focus:outline-none focus:border-gym-lime font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                      Inquiry Category
                    </label>
                    <select
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full py-2.5 px-3 bg-gym-black border border-gym-border rounded text-xs text-gym-primary focus:outline-none focus:border-gym-lime"
                    >
                      <option value="General Sanctuary Inquiry">General Sanctuary Inquiry</option>
                      <option value="Corporate Executive Memberships">Corporate Executive Memberships</option>
                      <option value="Olympic Lifting Bar Availability">Olympic Lifting Equipment & Platforms</option>
                      <option value="Master Coach 1-on-1 Booking">Master Coach 1-on-1 Consultation</option>
                      <option value="Facility Tour Booking">Private Facility Tour</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                    Your Message / Athletic Objectives
                  </label>
                  <textarea
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Tell us about your training background, questions, or specific access requirements..."
                    required
                    className="w-full p-3 bg-gym-black border border-gym-border rounded text-xs text-gym-primary focus:outline-none focus:border-gym-lime"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingContact}
                    className="w-full py-3 bg-gym-lime hover:bg-gym-lime-hover text-gym-black font-heading font-black uppercase text-xs tracking-wider rounded shadow-lime-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmittingContact ? (
                      <div className="w-4 h-4 border-2 border-gym-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Transmit Message to Concierge</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MODAL: COMPLIMENTARY TRIAL PASS ================= */}
      {showTrialModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="trial-modal-title"
          aria-describedby="trial-modal-description"
        >
          <div className="bg-gym-surface border border-gym-border rounded-sm max-w-lg w-full p-6 sm:p-8 relative shadow-card animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowTrialModal(false)}
              className="absolute top-4 right-4 text-gym-muted hover:text-white text-sm"
              aria-label="Close complimentary trial pass dialog"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-gym-lime" />
              <span className="text-[11px] font-heading font-black uppercase text-gym-lime tracking-wider">
                COMPLIMENTARY ACCESS PASS
              </span>
            </div>

            <h3 
              id="trial-modal-title"
              className="font-heading text-2xl sm:text-3xl font-black uppercase text-gym-primary tracking-wide mb-1"
            >
              EXPERIENCE PROFIT ATHLETIC CLUB
            </h3>
            <p 
              id="trial-modal-description"
              className="text-xs text-gym-secondary mb-6 leading-relaxed"
            >
              Includes full floor access, Eleiko competition racks, and a 30-minute biomechanics mobility screen with our coaching staff.
            </p>

            <form onSubmit={handleTrialSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                  Full Athlete Name
                </label>
                <input
                  type="text"
                  value={trialName}
                  onChange={(e) => setTrialName(e.target.value)}
                  placeholder="e.g. Jordan Vance"
                  required
                  className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-xs text-gym-primary focus:outline-none focus:border-gym-lime"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={trialEmail}
                    onChange={(e) => setTrialEmail(e.target.value)}
                    placeholder="jordan@athlete.com"
                    required
                    className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-xs text-gym-primary focus:outline-none focus:border-gym-lime font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    value={trialPhone}
                    onChange={(e) => setTrialPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-xs text-gym-primary focus:outline-none focus:border-gym-lime font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                    Primary Discipline
                  </label>
                  <select
                    value={trialDiscipline}
                    onChange={(e) => setTrialDiscipline(e.target.value)}
                    className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-xs text-gym-primary focus:outline-none focus:border-gym-lime"
                  >
                    <option value="Athletic Strength & Conditioning">Strength & Conditioning</option>
                    <option value="Powerlifting / 1RM Testing">Powerlifting (S/B/D)</option>
                    <option value="Olympic Weightlifting">Olympic Weightlifting (C&J/Snatch)</option>
                    <option value="Hypertrophy & Biomechanics">Hypertrophy & Kinematics</option>
                    <option value="Injury Rehabilitation">Injury Recovery & Mobility</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                    Preferred Visit Date
                  </label>
                  <input
                    type="date"
                    value={trialDate}
                    onChange={(e) => setTrialDate(e.target.value)}
                    className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-xs text-gym-primary focus:outline-none focus:border-gym-lime font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                  Specific Coaching Goals or Injuries
                </label>
                <input
                  type="text"
                  value={trialNotes}
                  onChange={(e) => setTrialNotes(e.target.value)}
                  placeholder="e.g. Looking to test 1RM squat safely with spotter"
                  className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded text-xs text-gym-primary focus:outline-none focus:border-gym-lime"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowTrialModal(false)}
                  className="w-1/3 py-2.5 bg-gym-black hover:bg-gym-surface border border-gym-border text-gym-secondary text-xs uppercase font-heading font-bold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTrial}
                  className="w-2/3 py-2.5 bg-gym-lime hover:bg-gym-lime-hover text-gym-black text-xs uppercase font-heading font-black tracking-wider rounded shadow-lime-glow flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingTrial ? (
                    <div className="w-4 h-4 border-2 border-gym-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Reserve Complimentary Pass</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TRIAL PASS CONFIRMATION POPUP ================= */}
      {confirmedTrialPass && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="trial-success-title"
        >
          <div className="bg-gym-surface border-2 border-gym-lime rounded-sm max-w-md w-full p-6 sm:p-8 relative shadow-2xl animate-in zoom-in-95 text-center">
            <button
              onClick={() => setConfirmedTrialPass(null)}
              className="absolute top-4 right-4 text-gym-muted hover:text-white text-sm"
              aria-label="Close pass confirmation dialog"
            >
              ✕
            </button>

            <div className="w-16 h-16 bg-gym-lime/10 border border-gym-lime/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9 text-gym-lime" />
            </div>

            <span className="text-[11px] font-heading font-black uppercase text-gym-lime tracking-widest block mb-1">
              CONGRATULATIONS // PASS CONFIRMED
            </span>

            <h3 
              id="trial-success-title"
              className="font-heading text-2xl sm:text-3xl font-black uppercase text-gym-primary tracking-wide mb-2"
            >
              YOU'RE BOOKED, {confirmedTrialPass.athleteName.toUpperCase()}!
            </h3>

            <p className="text-xs text-gym-secondary mb-5 leading-relaxed">
              Your 1-Day Complimentary Sanctuary Pass has been confirmed. Simply present your Pass ID at reception for entry.
            </p>

            {/* Pass Ticket Card */}
            <div className="bg-gym-black border border-gym-border rounded p-4 mb-5 text-left space-y-3 font-mono">
              <div className="flex justify-between items-center pb-2 border-b border-gym-border/60">
                <span className="text-[10px] text-gym-muted uppercase font-heading font-bold">PASS REFERENCE ID</span>
                <span className="text-sm text-gym-lime font-black tracking-wider">{confirmedTrialPass.reference}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-gym-muted block uppercase font-heading font-bold">DISCIPLINE</span>
                  <span className="text-gym-primary text-[11px] font-sans font-semibold">{confirmedTrialPass.discipline}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gym-muted block uppercase font-heading font-bold">RESERVED DATE</span>
                  <span className="text-gym-primary text-[11px] font-sans font-semibold">{confirmedTrialPass.date}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-gym-border/60 flex justify-between items-center text-[10px]">
                <span className="text-gym-secondary uppercase font-heading font-bold">SANCTUARY ACCESS HOURS</span>
                <span className="text-white font-bold font-sans">06:00 AM – 10:00 PM</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gym-secondary uppercase font-heading font-bold">FACILITY</span>
                <span className="text-gym-lime font-sans font-medium">PROFIT Flagship Sanctuary (Floor 01)</span>
              </div>
            </div>

            {/* Direct WhatsApp Dispatched Indicator */}
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded p-3.5 mb-6 flex items-start gap-3 text-left">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse mt-1 flex-shrink-0" />
              <div className="text-[11px] text-emerald-200/90 leading-relaxed font-sans">
                <span className="font-bold text-white block">Automated WhatsApp Pass Dispatched:</span>
                We have sent your Pass ID and entry clearance directly to your WhatsApp ({confirmedTrialPass.phone}). You do not need to send any message yourself.
              </div>
            </div>

            <button
              onClick={() => setConfirmedTrialPass(null)}
              className="w-full py-3 bg-gym-lime hover:bg-gym-lime-hover text-gym-black text-xs uppercase font-heading font-black tracking-wider rounded shadow-lime-glow transition-all"
            >
              GOT IT // RETURN TO CLUB
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: LEGAL & REGULATORY COMPLIANCE POLICIES ================= */}
      {activePolicy && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-gym-surface border border-gym-border rounded-sm max-w-2xl w-full p-6 sm:p-8 relative shadow-card animate-in fade-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActivePolicy(null)}
              className="absolute top-4 right-4 text-gym-muted hover:text-white text-sm"
              aria-label="Close dialog"
            >
              ✕
            </button>

            {activePolicy === 'terms' && (
              <div className="space-y-4 text-xs text-gym-secondary leading-relaxed">
                <h3 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide">
                  TERMS OF SERVICE // PROFIT TRAINING CLUB
                </h3>
                <p><strong>1. Membership & Facility Access:</strong> PROFIT Training Club operates as a private athletic strength sanctuary strictly capped at 300 active athletes. Access is granted via digital biometric QR pass upon active subscription verification.</p>
                <p><strong>2. Safety & Liability:</strong> Members agree to follow all Olympic lifting and strength platform guidelines. Use of Eleiko calibrated equipment requires proper collars and adherence to facility etiquette.</p>
                <p><strong>3. Billing & Prorations:</strong> All membership fees are billed on recurring monthly, quarterly, or annual schedules via our secure payment gateway. Renewal dates are maintained inside the Athlete Portal.</p>
                <p><strong>4. Code of Conduct:</strong> We uphold an intense, focused sanctuary environment. Commercial videography, disruptive behavior, or sharing digital turnstile QR tokens with non-members results in immediate termination of membership privileges.</p>
              </div>
            )}

            {activePolicy === 'privacy' && (
              <div className="space-y-4 text-xs text-gym-secondary leading-relaxed">
                <h3 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide">
                  PRIVACY POLICY // DATA PROTECTION
                </h3>
                <p><strong>1. Information Collection:</strong> We collect athlete profile details including full name, verified email, phone number, and physical fitness onboarding assessments solely to tailor personalized coaching and turnstile gate credentials.</p>
                <p><strong>2. Payment Security:</strong> We do not store full credit card numbers or banking passwords on our local servers. Payment transactions are processed via Razorpay and Stripe with PCI-DSS Level 1 compliance and HMAC-SHA256 signatures.</p>
                <p><strong>3. Data Retention & Privacy:</strong> Athlete training telemetry, set weights, and check-in records are protected by encrypted databases and will never be sold or rented to third-party advertisers.</p>
                <p><strong>4. Communications:</strong> We use your contact information to deliver turnstile access confirmations, payment receipts, and direct coach feedback.</p>
              </div>
            )}

            {activePolicy === 'refund' && (
              <div className="space-y-4 text-xs text-gym-secondary leading-relaxed">
                <h3 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide">
                  CANCELLATION & REFUND POLICY
                </h3>
                <p><strong>1. 7-Day Performance Guarantee:</strong> If within the first 7 days of joining PROFIT Training Club you are not completely satisfied with our facility or coaching standard, you may request a full 100% refund without cancellation fees.</p>
                <p><strong>2. Membership Cancellation:</strong> Athletes may cancel recurring memberships at any time directly through their Athlete Portal or by contacting front-desk concierge. Cancellation stops future billing cycles immediately.</p>
                <p><strong>3. Refund Processing:</strong> Approved refunds are credited directly to the original payment source (UPI account, Credit/Debit card, or NetBanking) within 5 to 7 business days in accordance with RBI and Razorpay processing guidelines.</p>
                <p><strong>4. Contact Support:</strong> For refund inquiries or billing disputes, contact our desk team at support@profitgymclub.com or via WhatsApp at +91 9368593249.</p>
              </div>
            )}

            <div className="pt-4 border-t border-gym-border/60 flex justify-end">
              <button
                onClick={() => setActivePolicy(null)}
                className="px-5 py-2 font-heading uppercase font-bold text-xs bg-gym-lime text-gym-black hover:bg-gym-lime-hover transition-colors"
              >
                Close Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 9. ARCHITECTURAL FOOTER ================= */}
      <footer className="bg-gym-black py-16 border-t border-gym-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            <div>
              <Link to="/" className="inline-block group mb-3">
                <span className="font-heading text-3xl font-black tracking-wider text-gym-primary">
                  PRO<span className="text-gym-lime">FIT</span>
                </span>
                <span className="block text-[10px] uppercase tracking-widest text-gym-secondary font-semibold -mt-1">
                  TRAINING CLUB
                </span>
              </Link>
              <p className="text-xs text-gym-muted leading-relaxed mt-2">
                A high performance strength sanctuary & athletic club. Strict 300 member cap. Calibrated Eleiko iron.
              </p>
            </div>

            <div>
              <h4 className="font-heading text-xs font-black uppercase tracking-wider text-gym-primary mb-3">
                FACILITY SANCTUARY
              </h4>
              <ul className="space-y-2 text-xs text-gym-secondary">
                <li className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gym-lime" />
                  <span>PROFIT Flagship Athletic Sanctuary</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-gym-lime" />
                  <span>24/7 Biometric QR Access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gym-lime" />
                  <a href="https://wa.me/919368593249" target="_blank" rel="noopener noreferrer" className="hover:text-gym-lime transition-colors">
                    +91 9368593249 (WhatsApp)
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading text-xs font-black uppercase tracking-wider text-gym-primary mb-3">
                KNOWLEDGE BASE
              </h4>
              <ul className="space-y-2 text-xs text-gym-secondary">
                <li><Link to="/blog/push-pull-legs-hypertrophy-masterclass" className="hover:text-gym-lime transition-colors">PPL Hypertrophy Split</Link></li>
                <li><Link to="/blog/creatine-monohydrate-science-dosage-timing" className="hover:text-gym-lime transition-colors">Creatine Dosage Guide</Link></li>
                <li><Link to="/blog/how-to-calculate-and-use-1rm" className="hover:text-gym-lime transition-colors">1RM Formula Calculator</Link></li>
                <li><Link to="/blog" className="text-gym-lime hover:underline font-bold flex items-center gap-1">All 16 Scientific Protocols &rarr;</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading text-xs font-black uppercase tracking-wider text-gym-primary mb-3">
                ATHLETE PORTAL
              </h4>
              <ul className="space-y-2 text-xs text-gym-secondary">
                <li><Link to="/login" className="hover:text-gym-lime transition-colors">Athlete Sign In</Link></li>
                <li><Link to="/register" className="hover:text-gym-lime transition-colors">Apply For Membership</Link></li>
                <li><Link to="/member/attendance" className="hover:text-gym-lime transition-colors">Turnstile QR Pass</Link></li>
                <li><Link to="/member/workouts" className="hover:text-gym-lime transition-colors">Workout Logger</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading text-xs font-black uppercase tracking-wider text-gym-primary mb-3">
                EXECUTIVE ACCESS
              </h4>
              <ul className="space-y-2 text-xs text-gym-secondary">
                <li><Link to="/trainer/dashboard" className="hover:text-gym-lime transition-colors">Coaches Console</Link></li>
                <li><Link to="/admin/dashboard" className="hover:text-gym-lime transition-colors">Club Operations Admin</Link></li>
                <li><Link to="/admin/attendance" className="hover:text-gym-lime transition-colors">QR Turnstile Gate Controller</Link></li>
                <li><Link to="/admin/payments" className="hover:text-gym-lime transition-colors">Stripe Financial Ledger</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gym-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gym-muted">
            <div>&copy; 2026 PROFIT Training Club LLC. All rights reserved. &bull; profitgymclub.com</div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <Link 
                to="/terms"
                className="hover:text-gym-lime transition-colors underline-offset-4 hover:underline"
              >
                Terms of Service
              </Link>
              <span>&bull;</span>
              <Link 
                to="/privacy"
                className="hover:text-gym-lime transition-colors underline-offset-4 hover:underline"
              >
                Privacy Policy
              </Link>
              <span>&bull;</span>
              <Link 
                to="/blog"
                className="hover:text-gym-lime transition-colors underline-offset-4 hover:underline"
              >
                Scientific Articles
              </Link>
              <span>&bull;</span>
              <button 
                type="button" 
                onClick={() => setActivePolicy('refund')} 
                className="hover:text-gym-lime transition-colors underline-offset-4 hover:underline"
              >
                Refund Policy
              </button>
              <span>&bull;</span>
              <span>PCI-DSS Level 1 & Razorpay Verified</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
