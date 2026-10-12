import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Dumbbell,
  Calendar,
  Phone,
  MapPin,
  Check,
  CheckCircle2,
  Sparkles,
  Upload,
  Activity,
  Flame,
  Clock,
  Target,
  Award,
  AlertCircle,
  RefreshCw,
  QrCode,
  Shield,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGymData } from '@/context/GymDataContext';
import { useNotifications } from '@/context/NotificationContext';
import confetti from 'canvas-confetti';
import type { RegisterPayload } from '@/types';

type OnboardingStep = 1 | 2 | 3 | 4;

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialPlan = searchParams.get('plan') || 'plan-performance';

  const { register, sendOtp, verifyOtp } = useAuth();
  const { purchaseMembership } = useGymData();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  // Wizard Navigation
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);

  // ──────────────────────────────────────────
  // STEP 1: Personal Information
  // ──────────────────────────────────────────
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<string>('MALE');
  const [avatarUrl, setAvatarUrl] = useState<string>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  );
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // ──────────────────────────────────────────
  // STEP 2: Account Security & Email OTP
  // ──────────────────────────────────────────
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // Terms and Conditions
  const [termsAccepted, setTermsAccepted] = useState(false);

  // ──────────────────────────────────────────
  // STEP 3: Membership Plan Selection
  // ──────────────────────────────────────────
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlan);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'QUARTERLY' | 'ANNUAL'>('MONTHLY');
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // ──────────────────────────────────────────
  // STEP 4: Fitness Preferences (Optional)
  // ──────────────────────────────────────────
  const [primaryGoal, setPrimaryGoal] = useState<string>('MUSCLE_GAIN');
  const [experienceLevel, setExperienceLevel] = useState<string>('INTERMEDIATE');
  const [preferredTime, setPreferredTime] = useState<string>('MORNING');
  const [requiresTrainer, setRequiresTrainer] = useState<boolean>(true);
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('Parent');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ──────────────────────────────────────────
  // Resend OTP Cooldown Timer
  // ──────────────────────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ──────────────────────────────────────────
  // Password Strength Calculation
  // ──────────────────────────────────────────
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: 'Empty', color: 'bg-zinc-700' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-red-500' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score: 3, label: 'Strong', color: 'bg-blue-400' };
      case 4:
        return { score: 4, label: 'Elite', color: 'bg-gym-lime' };
      default:
        return { score: 1, label: 'Weak', color: 'bg-red-500' };
    }
  }, [password]);

  // ──────────────────────────────────────────
  // Plan Configurations & Auto-calculated Expiry
  // ──────────────────────────────────────────
  const planDetails = useMemo(() => {
    const plans: Record<
      string,
      {
        name: string;
        monthlyPrice: number;
        features: string[];
        badge?: string;
      }
    > = {
      'plan-starter': {
        name: 'Starter Plan',
        monthlyPrice: 149,
        features: [
          'Unrestricted Off-Peak Facility Access',
          'Standard Equipment & Free Weights Zone',
          'Digital Access Pass & Attendance App',
          'Locker Room & High-Pressure Showers',
        ],
      },
      'plan-performance': {
        name: 'Performance Plan',
        monthlyPrice: 249,
        features: [
          'Full 24/7 All-Access Sanctuary Access',
          'Bi-Weekly 1-on-1 Performance Check-ins',
          'Custom Periodized Hypertrophy Program',
          'Sauna, Cold Plunge & Recovery Lounge',
          'Free Guest Pass Every Month',
        ],
        badge: 'MOST POPULAR',
      },
      'plan-elite': {
        name: 'Elite VIP Plan',
        monthlyPrice: 399,
        features: [
          'Unlimited Priority Access & Private Locker',
          'Weekly Private Coaching & Form Audits',
          'Comprehensive Nutrition & Macro Strategy',
          'Full Cryotherapy & Recovery Suite',
          'Complimentary Training Club Apparel Kit',
        ],
        badge: 'BESPOKE VIP',
      },
    };

    const current = plans[selectedPlanId] || plans['plan-performance'];
    let multiplier = 1;
    let days = 30;
    let discount = 0;

    if (billingCycle === 'QUARTERLY') {
      multiplier = 3 * 0.9; // 10% discount
      days = 90;
      discount = 10;
    } else if (billingCycle === 'ANNUAL') {
      multiplier = 12 * 0.8; // 20% discount
      days = 365;
      discount = 20;
    }

    const price = Math.round(current.monthlyPrice * multiplier);

    // Auto-calculate expiry date
    const start = new Date(startDate || Date.now());
    const expiry = new Date(start.getTime() + days * 86400000);
    const expiryString = expiry.toISOString().split('T')[0];

    return {
      name: current.name,
      price,
      discount,
      days,
      features: current.features,
      badge: current.badge,
      expiryDate: expiryString,
    };
  }, [selectedPlanId, billingCycle, startDate]);

  // ──────────────────────────────────────────
  // Handlers for OTP
  // ──────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      showToast({
        type: 'error',
        title: 'EMAIL REQUIRED',
        message: 'Please provide a valid email address in Step 1.',
      });
      return;
    }

    setIsSendingOtp(true);
    const res = await sendOtp(email, fullName);
    setIsSendingOtp(false);

    if (res.success) {
      setOtpSent(true);
      setResendCooldown(60);
      if (res.devOtp) {
        setDevOtpHint(res.devOtp);
      }
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 6) {
      showToast({
        type: 'error',
        title: 'INVALID CODE',
        message: 'Please enter the 6-digit code sent to your email.',
      });
      return;
    }

    setIsVerifyingOtp(true);
    const ok = await verifyOtp(email, otpCode);
    setIsVerifyingOtp(false);

    if (ok) {
      setIsEmailVerified(true);
    }
  };

  // ──────────────────────────────────────────
  // Photo Upload Handler (Auto-compress to 400x400 JPEG)
  // ──────────────────────────────────────────
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast({
        type: 'error',
        title: 'FILE TOO LARGE',
        message: 'Please select an image smaller than 10MB.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatarUrl(compressedDataUrl);
          showToast({
            type: 'success',
            title: 'PHOTO OPTIMIZED',
            message: 'Athlete profile picture compressed & updated.',
          });
        }
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  // ──────────────────────────────────────────
  // Navigation Validation Checks
  // ──────────────────────────────────────────
  const validateStep1 = () => {
    if (!fullName.trim()) {
      showToast({
        type: 'error',
        title: 'NAME REQUIRED',
        message: 'Please enter your full legal or athlete name.',
      });
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      showToast({
        type: 'error',
        title: 'VALID EMAIL REQUIRED',
        message: 'Please provide a valid email address.',
      });
      return false;
    }
    if (!phone.trim()) {
      showToast({
        type: 'error',
        title: 'PHONE NUMBER REQUIRED',
        message: 'Please provide a contact phone number.',
      });
      return false;
    }
    if (!dateOfBirth) {
      showToast({
        type: 'error',
        title: 'DATE OF BIRTH REQUIRED',
        message: 'Please specify your date of birth.',
      });
      return false;
    }

    // Minimum age check (16 years)
    const birthDate = new Date(dateOfBirth);
    const ageDiffMs = Date.now() - birthDate.getTime();
    const ageYears = ageDiffMs / (1000 * 60 * 60 * 24 * 365.25);
    if (ageYears < 16) {
      showToast({
        type: 'error',
        title: 'AGE RESTRICTION',
        message: 'Members must be at least 16 years of age to register.',
      });
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!password || password.length < 6) {
      showToast({
        type: 'error',
        title: 'PASSWORD TOO SHORT',
        message: 'Password must be at least 6 characters in length.',
      });
      return false;
    }
    if (password !== confirmPassword) {
      showToast({
        type: 'error',
        title: 'PASSWORDS DO NOT MATCH',
        message: 'Please ensure both password fields match exactly.',
      });
      return false;
    }
    if (!isEmailVerified) {
      showToast({
        type: 'error',
        title: 'EMAIL VERIFICATION REQUIRED',
        message: 'Please verify your email address using the 6-digit OTP code before proceeding.',
      });
      return false;
    }
    if (!termsAccepted) {
      showToast({
        type: 'error',
        title: 'TERMS NOT ACCEPTED',
        message: 'You must accept the Facility Rules & Terms of Service.',
      });
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;

    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as OnboardingStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as OnboardingStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ──────────────────────────────────────────
  // Final Registration Submission
  // ──────────────────────────────────────────
  const handleFinalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateStep1() || !validateStep2()) return;

    setIsSubmitting(true);

    const payload: RegisterPayload = {
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      phone: phone.trim(),
      dateOfBirth,
      gender,
      avatarUrl,
      address: {
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
      },
      membershipDetails: {
        planId: selectedPlanId,
        planName: planDetails.name,
        billingCycle,
        startDate,
        expiryDate: planDetails.expiryDate,
        price: planDetails.price,
      },
      fitnessProfile: {
        primaryGoal,
        experienceLevel,
        preferredTime,
        requiresTrainer,
        emergencyContact: {
          name: emergencyName.trim(),
          relationship: emergencyRelation,
          phone: emergencyPhone.trim(),
        },
      },
    };

    const success = await register(payload);

    if (success) {
      await purchaseMembership(selectedPlanId);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ccff00', '#ffffff', '#22c55e', '#38bdf8'],
      });

      setTimeout(() => {
        navigate('/member/dashboard', { replace: true });
      }, 1200);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gym-black text-gym-primary flex flex-col justify-between relative overflow-x-hidden">
      {/* Background Neon Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gym-lime/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-gym-lime/3 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top Navbar */}
      <header className="border-b border-gym-border/60 bg-gym-black/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-heading text-2xl font-black tracking-wider text-gym-primary group-hover:text-white transition-colors">
              PRO<span className="text-gym-lime">FIT</span>
            </span>
            <span className="text-[10px] tracking-widest font-heading uppercase text-gym-secondary border-l border-gym-border pl-2 hidden sm:inline">
              ATHLETE ONBOARDING
            </span>
          </Link>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-gym-muted hidden sm:inline">Already registered?</span>
            <Link
              to="/login"
              className="px-3.5 py-1.5 border border-gym-border hover:border-gym-lime text-gym-primary hover:text-gym-lime font-bold uppercase tracking-wider text-xs rounded transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 4-Step Stepper & Form Form (8 Cols) */}
        <div className="lg:col-span-8 bg-gym-surface border border-gym-border rounded-lg p-6 sm:p-8 shadow-2xl relative">
          {/* Step Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3 text-xs uppercase tracking-wider font-bold">
              <span className="text-gym-lime flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> STEP {currentStep} OF 4
              </span>
              <span className="text-gym-secondary">
                {currentStep === 1 && 'Personal Details'}
                {currentStep === 2 && 'Credentials & Email Verification'}
                {currentStep === 3 && 'Membership Plan & Billing'}
                {currentStep === 4 && 'Fitness Diagnostics (Optional)'}
              </span>
            </div>

            {/* Stepper Indicators */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { step: 1, label: 'Identity' },
                { step: 2, label: 'Security' },
                { step: 3, label: 'Membership' },
                { step: 4, label: 'Fitness' },
              ].map((item) => (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => {
                    if (item.step < currentStep) setCurrentStep(item.step as OnboardingStep);
                  }}
                  disabled={item.step > currentStep}
                  className={`text-left p-2 rounded border transition-all ${
                    currentStep === item.step
                      ? 'border-gym-lime bg-gym-lime/10 text-white shadow-[0_0_15px_rgba(204,255,0,0.1)]'
                      : item.step < currentStep
                      ? 'border-gym-border bg-gym-black/40 text-gym-lime hover:border-gym-lime/60'
                      : 'border-gym-border/40 bg-gym-black/20 text-gym-muted cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        item.step < currentStep
                          ? 'bg-gym-lime text-black'
                          : currentStep === item.step
                          ? 'bg-gym-lime/20 text-gym-lime border border-gym-lime'
                          : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {item.step < currentStep ? <Check className="w-3 h-3 stroke-[3]" /> : item.step}
                    </span>
                    <span className="text-[11px] font-heading font-bold uppercase tracking-wider truncate">
                      {item.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────── */}
          {/* STEP 1: Personal Information                             */}
          {/* ──────────────────────────────────────────────────────── */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-gym-border pb-4">
                <h2 className="font-heading text-2xl font-black uppercase tracking-wider text-white">
                  Athlete Identity
                </h2>
                <p className="text-xs text-gym-muted mt-1">
                  Enter your official details to establish your facility clearance pass.
                </p>
              </div>

              {/* Profile Avatar Upload */}
              <div className="flex items-center gap-5 p-4 bg-gym-black rounded border border-gym-border">
                <div className="relative group w-20 h-20 rounded-full overflow-hidden border-2 border-gym-lime/50 bg-zinc-900 flex-shrink-0">
                  <img
                    src={avatarUrl}
                    alt="Athlete Avatar"
                    className="w-full h-full object-cover"
                  />
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] uppercase font-bold text-gym-lime cursor-pointer transition-opacity">
                    <Upload className="w-4 h-4 mb-1" /> Change
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    Profile Picture <span className="text-gym-muted font-normal">(Optional)</span>
                  </span>
                  <p className="text-[11px] text-gym-muted mt-0.5">
                    Your photo is embedded into your digital QR pass for turnstile verification.
                  </p>
                  <label className="inline-flex items-center gap-1.5 mt-2 text-xs text-gym-lime hover:underline cursor-pointer font-bold">
                    <Upload className="w-3.5 h-3.5" /> Upload Photo from Device
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gym-secondary mb-1.5 font-heading">
                    Full Legal Name <span className="text-gym-lime">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gym-muted">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Marcus Vance"
                      required
                      className="block w-full pl-10 pr-3 py-2.5 bg-gym-black border border-gym-border rounded text-sm text-white placeholder-gym-muted focus:outline-none focus:border-gym-lime transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gym-secondary mb-1.5 font-heading">
                    Mobile Phone Number <span className="text-gym-lime">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gym-muted">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      required
                      className="block w-full pl-10 pr-3 py-2.5 bg-gym-black border border-gym-border rounded text-sm text-white placeholder-gym-muted focus:outline-none focus:border-gym-lime transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gym-secondary mb-1.5 font-heading">
                  Primary Email Address <span className="text-gym-lime">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gym-muted">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="marcus.vance@athletes.com"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 bg-gym-black border border-gym-border rounded text-sm text-white placeholder-gym-muted focus:outline-none focus:border-gym-lime transition-colors"
                  />
                </div>
                <p className="text-[11px] text-gym-muted mt-1">
                  We'll dispatch your 6-digit access OTP code to this email in Step 2.
                </p>
              </div>

              {/* Date of Birth & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gym-secondary mb-1.5 font-heading">
                    Date of Birth <span className="text-gym-lime">* (Must be 16+)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gym-muted">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      required
                      className="block w-full pl-10 pr-3 py-2.5 bg-gym-black border border-gym-border rounded text-sm text-white placeholder-gym-muted focus:outline-none focus:border-gym-lime transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gym-secondary mb-1.5 font-heading">
                    Gender Identity <span className="text-gym-muted font-normal">(Optional)</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { key: 'MALE', label: 'Male' },
                      { key: 'FEMALE', label: 'Female' },
                      { key: 'OTHER', label: 'Other' },
                      { key: 'PREFER_NOT_TO_SAY', label: 'Skip' },
                    ].map((g) => (
                      <button
                        key={g.key}
                        type="button"
                        onClick={() => setGender(g.key)}
                        className={`py-2.5 text-xs font-bold rounded border transition-colors ${
                          gender === g.key
                            ? 'border-gym-lime bg-gym-lime text-black'
                            : 'border-gym-border bg-gym-black text-gym-secondary hover:border-zinc-500'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Physical Address (Optional) */}
              <div className="pt-2 border-t border-gym-border/60">
                <span className="text-xs uppercase tracking-wider font-bold text-gym-secondary mb-2 block font-heading">
                  Residential Address <span className="text-gym-muted font-normal">(Optional)</span>
                </span>
                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gym-muted">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Street address (e.g. 452 Lafayette St)"
                      className="block w-full pl-10 pr-3 py-2 bg-gym-black border border-gym-border rounded text-xs text-white placeholder-gym-muted focus:outline-none focus:border-gym-lime transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City (e.g. New York)"
                      className="block w-full px-3 py-2 bg-gym-black border border-gym-border rounded text-xs text-white placeholder-gym-muted focus:outline-none focus:border-gym-lime transition-colors"
                    />
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="State (e.g. NY)"
                      className="block w-full px-3 py-2 bg-gym-black border border-gym-border rounded text-xs text-white placeholder-gym-muted focus:outline-none focus:border-gym-lime transition-colors"
                    />
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="Postal Code"
                      className="block w-full px-3 py-2 bg-gym-black border border-gym-border rounded text-xs text-white placeholder-gym-muted focus:outline-none focus:border-gym-lime transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Step 1 Actions */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full sm:w-auto px-6 py-3 bg-gym-lime text-black font-heading font-black uppercase tracking-wider text-xs rounded hover:bg-white transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(204,255,0,0.2)]"
                >
                  Next: Credentials & Security
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────── */}
          {/* STEP 2: Account Security & Email OTP Verification        */}
          {/* ──────────────────────────────────────────────────────── */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-gym-border pb-4">
                <h2 className="font-heading text-2xl font-black uppercase tracking-wider text-white">
                  Security & Verification
                </h2>
                <p className="text-xs text-gym-muted mt-1">
                  Create a secure passphrase and verify your athlete email address via 6-digit OTP.
                </p>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Create Password */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gym-secondary mb-1.5 font-heading">
                    Create Password <span className="text-gym-lime">*</span>
                  </label>
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
                      className="block w-full pl-10 pr-10 py-2.5 bg-gym-black border border-gym-border rounded text-sm text-white placeholder-gym-muted focus:outline-none focus:border-gym-lime transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gym-muted hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gym-secondary mb-1.5 font-heading">
                    Confirm Password <span className="text-gym-lime">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gym-muted">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={`block w-full pl-10 pr-10 py-2.5 bg-gym-black border rounded text-sm text-white placeholder-gym-muted focus:outline-none transition-colors ${
                        confirmPassword && confirmPassword === password
                          ? 'border-gym-lime'
                          : confirmPassword && confirmPassword !== password
                          ? 'border-red-500'
                          : 'border-gym-border focus:border-gym-lime'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gym-muted hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Strength Indicator */}
              <div className="p-3 bg-gym-black rounded border border-gym-border/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-gym-secondary">
                    Password Security Level
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-1.5">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-full rounded-full transition-all duration-300 ${
                        passwordStrength.score >= level ? passwordStrength.color : 'bg-zinc-800'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-gym-muted">
                  <span className={password.length >= 6 ? 'text-gym-lime flex items-center gap-1' : ''}>
                    {password.length >= 6 ? '✓' : '•'} 6+ characters
                  </span>
                  <span className={/[A-Z]/.test(password) ? 'text-gym-lime flex items-center gap-1' : ''}>
                    {/[A-Z]/.test(password) ? '✓' : '•'} Uppercase
                  </span>
                  <span className={/[0-9]/.test(password) ? 'text-gym-lime flex items-center gap-1' : ''}>
                    {/[0-9]/.test(password) ? '✓' : '•'} Number
                  </span>
                  <span className={confirmPassword && confirmPassword === password ? 'text-gym-lime flex items-center gap-1' : ''}>
                    {confirmPassword && confirmPassword === password ? '✓ Passwords match' : '• Passwords match'}
                  </span>
                </div>
              </div>

              {/* Email OTP Verification Section */}
              <div className="p-4 bg-gym-black rounded-lg border border-gym-border relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-gym-lime" />
                    <span className="text-xs uppercase font-heading font-black tracking-wider text-white">
                      Email Ownership Verification (OTP)
                    </span>
                  </div>
                  {isEmailVerified ? (
                    <span className="px-2 py-0.5 bg-gym-lime/10 text-gym-lime border border-gym-lime/30 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" /> Verified
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                      Pending Verification
                    </span>
                  )}
                </div>

                <p className="text-xs text-gym-secondary mb-4">
                  Target Email:{' '}
                  <strong className="text-white font-mono">{email || 'Not provided'}</strong>
                </p>

                {!isEmailVerified ? (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 6-Digit OTP"
                        disabled={!otpSent}
                        className="flex-1 px-4 py-2.5 bg-zinc-900 border border-gym-border rounded text-center font-mono text-lg tracking-[8px] text-gym-lime placeholder-zinc-600 focus:outline-none focus:border-gym-lime disabled:opacity-50"
                      />

                      {!otpSent ? (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isSendingOtp}
                          className="px-5 py-2.5 bg-gym-lime text-black font-heading font-black uppercase tracking-wider text-xs rounded hover:bg-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isSendingOtp ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Mail className="w-4 h-4" />
                          )}
                          Send Code
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={isVerifyingOtp || otpCode.length < 6}
                          className="px-5 py-2.5 bg-gym-lime text-black font-heading font-black uppercase tracking-wider text-xs rounded hover:bg-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isVerifyingOtp ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4 stroke-[3]" />
                          )}
                          Verify Code
                        </button>
                      )}
                    </div>

                    {otpSent && (
                      <div className="flex items-center justify-between text-[11px] text-gym-muted pt-1">
                        <span>Check your inbox & spam folder for the authorization code.</span>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={resendCooldown > 0 || isSendingOtp}
                          className="text-gym-lime hover:underline disabled:text-zinc-600 disabled:no-underline font-bold"
                        >
                          {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                        </button>
                      </div>
                    )}

                    {/* Developer Sandbox Notice & Instant Autofill */}
                    {devOtpHint && (
                      <div className="p-2.5 bg-gym-lime/5 border border-gym-lime/30 rounded flex items-center justify-between text-xs">
                        <span className="text-gym-lime font-mono">
                          ⚡ <strong>Dev Sandbox Code:</strong> {devOtpHint}
                        </span>
                        <button
                          type="button"
                          onClick={() => setOtpCode(devOtpHint)}
                          className="px-2 py-0.5 bg-gym-lime text-black rounded text-[10px] font-bold uppercase tracking-wider hover:bg-white"
                        >
                          Autofill
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-gym-lime/10 border border-gym-lime/30 rounded flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-gym-lime flex-shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider block">
                        Identity Authorized
                      </span>
                      <span className="text-[11px] text-gym-muted">
                        Your email address has been confirmed and locked for this athlete profile.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="pt-2">
                <label className="flex items-start gap-3 p-3 bg-gym-black rounded border border-gym-border/80 cursor-pointer hover:border-zinc-500 transition-colors">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-gym-lime rounded bg-zinc-900 border-zinc-700"
                  />
                  <span className="text-xs text-gym-secondary leading-relaxed">
                    I agree to the{' '}
                    <span className="text-white font-bold underline">
                      PROFIT Facility Code of Conduct
                    </span>
                    , Safety Liability Release, and Terms of Membership.
                  </span>
                </label>
              </div>

              {/* Step 2 Actions */}
              <div className="pt-4 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-5 py-3 border border-gym-border hover:border-zinc-500 text-gym-secondary hover:text-white font-heading font-black uppercase tracking-wider text-xs rounded transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back: Identity
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-gym-lime text-black font-heading font-black uppercase tracking-wider text-xs rounded hover:bg-white transition-all flex items-center gap-2 group shadow-[0_0_20px_rgba(204,255,0,0.2)]"
                >
                  Next: Choose Plan
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────── */}
          {/* STEP 3: Membership Plan Selection                        */}
          {/* ──────────────────────────────────────────────────────── */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-gym-border pb-4">
                <h2 className="font-heading text-2xl font-black uppercase tracking-wider text-white">
                  Membership Tier & Activation
                </h2>
                <p className="text-xs text-gym-muted mt-1">
                  Select your clearance tier, commitment cadence, and desired facility start date.
                </p>
              </div>

              {/* Billing Cycle Switcher */}
              <div className="flex items-center justify-center">
                <div className="bg-gym-black p-1 rounded border border-gym-border flex items-center gap-1">
                  {[
                    { key: 'MONTHLY', label: 'Monthly' },
                    { key: 'QUARTERLY', label: 'Quarterly', discount: 'Save 10%' },
                    { key: 'ANNUAL', label: 'Yearly', discount: 'Save 20%' },
                  ].map((cycle) => (
                    <button
                      key={cycle.key}
                      type="button"
                      onClick={() => setBillingCycle(cycle.key as any)}
                      className={`px-4 py-2 rounded text-xs font-heading font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                        billingCycle === cycle.key
                          ? 'bg-gym-lime text-black shadow'
                          : 'text-gym-secondary hover:text-white'
                      }`}
                    >
                      {cycle.label}
                      {cycle.discount && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            billingCycle === cycle.key
                              ? 'bg-black text-gym-lime'
                              : 'bg-gym-lime/10 text-gym-lime border border-gym-lime/30'
                          }`}
                        >
                          {cycle.discount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tier Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: 'plan-starter',
                    name: 'Starter Tier',
                    price: billingCycle === 'MONTHLY' ? 149 : billingCycle === 'QUARTERLY' ? 402 : 1430,
                    period: billingCycle === 'MONTHLY' ? '/mo' : billingCycle === 'QUARTERLY' ? '/3mo' : '/yr',
                    desc: 'Foundational strength training clearance.',
                    features: ['Off-Peak Gym Access', 'Strength Equipment Area', 'Digital Turnstile QR Pass'],
                  },
                  {
                    id: 'plan-performance',
                    name: 'Performance Tier',
                    price: billingCycle === 'MONTHLY' ? 249 : billingCycle === 'QUARTERLY' ? 672 : 2390,
                    period: billingCycle === 'MONTHLY' ? '/mo' : billingCycle === 'QUARTERLY' ? '/3mo' : '/yr',
                    popular: true,
                    desc: 'The complete high-performance standard.',
                    features: ['24/7 Full Facility Clearance', 'Recovery Lounge & Plunge', 'Periodized Training Plan', 'Free Monthly Guest Pass'],
                  },
                  {
                    id: 'plan-elite',
                    name: 'Elite VIP Tier',
                    price: billingCycle === 'MONTHLY' ? 399 : billingCycle === 'QUARTERLY' ? 1077 : 3830,
                    period: billingCycle === 'MONTHLY' ? '/mo' : billingCycle === 'QUARTERLY' ? '/3mo' : '/yr',
                    desc: 'Bespoke VIP access with coach priority.',
                    features: ['Unlimited Priority Access', 'Weekly 1-on-1 Coaching', 'Full Recovery & Cryotherapy', 'Dedicated Locker & Kit'],
                  },
                ].map((tier) => (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedPlanId(tier.id)}
                    className={`cursor-pointer rounded-lg p-5 border relative flex flex-col justify-between transition-all ${
                      selectedPlanId === tier.id
                        ? 'border-gym-lime bg-gym-lime/5 shadow-[0_0_20px_rgba(204,255,0,0.15)] ring-1 ring-gym-lime'
                        : 'border-gym-border bg-gym-black/70 hover:border-zinc-500'
                    }`}
                  >
                    {tier.popular && (
                      <span className="absolute -top-2.5 right-4 px-2 py-0.5 bg-gym-lime text-black text-[9px] font-heading font-black tracking-widest uppercase rounded">
                        MOST POPULAR
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-heading text-sm font-bold uppercase tracking-wider text-white">
                          {tier.name}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            selectedPlanId === tier.id
                              ? 'border-gym-lime bg-gym-lime text-black'
                              : 'border-zinc-700'
                          }`}
                        >
                          {selectedPlanId === tier.id && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="mb-2">
                        <span className="text-3xl font-heading font-black text-white">${tier.price}</span>
                        <span className="text-xs text-gym-muted ml-1">{tier.period}</span>
                      </div>

                      <p className="text-[11px] text-gym-secondary mb-4">{tier.desc}</p>

                      <ul className="space-y-1.5 border-t border-gym-border/60 pt-3">
                        {tier.features.map((feat, idx) => (
                          <li key={idx} className="text-[11px] text-gym-muted flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-gym-lime flex-shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* Start Date & Live Expiry Calculation */}
              <div className="p-4 bg-gym-black rounded border border-gym-border grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gym-secondary mb-1.5 font-heading">
                    Membership Activation Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="block w-full px-3 py-2 bg-zinc-900 border border-gym-border rounded text-xs text-white placeholder-gym-muted focus:outline-none focus:border-gym-lime [color-scheme:dark]"
                  />
                  <span className="text-[10px] text-gym-muted mt-1 block">
                    Pass begins functioning at turnstiles on this date.
                  </span>
                </div>

                <div className="p-3 bg-zinc-900/80 rounded border border-zinc-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gym-secondary uppercase font-bold text-[10px]">
                      Calculated Expiry Date:
                    </span>
                    <span className="text-gym-lime font-mono font-bold text-sm">
                      {planDetails.expiryDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-gym-muted text-[10px]">Duration:</span>
                    <span className="text-white text-[11px] font-bold">
                      {planDetails.days} Days Active Access
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 3 Actions */}
              <div className="pt-4 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-5 py-3 border border-gym-border hover:border-zinc-500 text-gym-secondary hover:text-white font-heading font-black uppercase tracking-wider text-xs rounded transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back: Security
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-gym-lime text-black font-heading font-black uppercase tracking-wider text-xs rounded hover:bg-white transition-all flex items-center gap-2 group shadow-[0_0_20px_rgba(204,255,0,0.2)]"
                >
                  Next: Training Goals
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────── */}
          {/* STEP 4: Fitness Preferences & Emergency Contact (Optional)*/}
          {/* ──────────────────────────────────────────────────────── */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-gym-border pb-4">
                <h2 className="font-heading text-2xl font-black uppercase tracking-wider text-white">
                  Training Diagnostics & Safety
                </h2>
                <p className="text-xs text-gym-muted mt-1">
                  Help our coaching staff tailor your program. You may also skip and configure later.
                </p>
              </div>

              {/* Primary Fitness Goal */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gym-secondary mb-2 font-heading">
                  Primary Fitness Objective
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { key: 'MUSCLE_GAIN', label: 'Muscle Hypertrophy', icon: Dumbbell },
                    { key: 'WEIGHT_LOSS', label: 'Fat Loss & Conditioning', icon: Flame },
                    { key: 'STRENGTH', label: 'Absolute Strength', icon: Target },
                    { key: 'ENDURANCE', label: 'Cardio & Stamina', icon: Activity },
                    { key: 'GENERAL_FITNESS', label: 'General Longevity', icon: Award },
                  ].map((goal) => {
                    const Icon = goal.icon;
                    return (
                      <button
                        key={goal.key}
                        type="button"
                        onClick={() => setPrimaryGoal(goal.key)}
                        className={`p-3 rounded border text-left flex items-center gap-2.5 transition-all ${
                          primaryGoal === goal.key
                            ? 'border-gym-lime bg-gym-lime/10 text-white'
                            : 'border-gym-border bg-gym-black text-gym-secondary hover:border-zinc-500'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${primaryGoal === goal.key ? 'text-gym-lime' : 'text-gym-muted'}`} />
                        <span className="text-xs font-bold font-heading uppercase tracking-wider truncate">
                          {goal.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Experience Level & Workout Window */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gym-secondary mb-1.5 font-heading">
                    Experience Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'BEGINNER', label: 'Novice' },
                      { key: 'INTERMEDIATE', label: 'Intermediate' },
                      { key: 'ADVANCED', label: 'Advanced' },
                    ].map((lvl) => (
                      <button
                        key={lvl.key}
                        type="button"
                        onClick={() => setExperienceLevel(lvl.key)}
                        className={`py-2 text-xs font-bold rounded border transition-colors ${
                          experienceLevel === lvl.key
                            ? 'border-gym-lime bg-gym-lime text-black'
                            : 'border-gym-border bg-gym-black text-gym-secondary hover:border-zinc-500'
                        }`}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gym-secondary mb-1.5 font-heading">
                    Preferred Training Window
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'MORNING', label: '06:00 - 10:00' },
                      { key: 'MIDDAY', label: '11:00 - 15:00' },
                      { key: 'EVENING', label: '17:00 - 22:00' },
                    ].map((time) => (
                      <button
                        key={time.key}
                        type="button"
                        onClick={() => setPreferredTime(time.key)}
                        className={`py-2 text-xs font-bold rounded border transition-colors ${
                          preferredTime === time.key
                            ? 'border-gym-lime bg-gym-lime text-black'
                            : 'border-gym-border bg-gym-black text-gym-secondary hover:border-zinc-500'
                        }`}
                      >
                        {time.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Coach Assignment Request */}
              <div className="p-3 bg-gym-black rounded border border-gym-border flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-heading font-black tracking-wider text-white block">
                    Assign 1-on-1 Dedicated Coach
                  </span>
                  <span className="text-[11px] text-gym-muted">
                    Request an initial complimentary movement screen with Marcus Drake.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setRequiresTrainer(!requiresTrainer)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    requiresTrainer ? 'bg-gym-lime' : 'bg-zinc-800'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-black transition-transform ${
                      requiresTrainer ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Emergency Contact */}
              <div className="pt-2 border-t border-gym-border/60">
                <span className="text-xs uppercase tracking-wider font-bold text-gym-secondary mb-2 block font-heading">
                  Emergency Medical Contact <span className="text-gym-muted font-normal">(Optional)</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Contact Full Name"
                    className="block w-full px-3 py-2 bg-gym-black border border-gym-border rounded text-xs text-white placeholder-gym-muted focus:outline-none focus:border-gym-lime"
                  />
                  <select
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    className="block w-full px-3 py-2 bg-gym-black border border-gym-border rounded text-xs text-white focus:outline-none focus:border-gym-lime"
                  >
                    <option value="Parent">Parent</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Friend">Friend</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="Emergency Phone"
                    className="block w-full px-3 py-2 bg-gym-black border border-gym-border rounded text-xs text-white placeholder-gym-muted focus:outline-none focus:border-gym-lime"
                  />
                </div>
              </div>

              {/* Step 4 Actions */}
              <div className="pt-4 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-5 py-3 border border-gym-border hover:border-zinc-500 text-gym-secondary hover:text-white font-heading font-black uppercase tracking-wider text-xs rounded transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back: Plan
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleFinalSubmit()}
                    disabled={isSubmitting}
                    className="text-xs text-gym-muted hover:text-white uppercase font-bold"
                  >
                    Complete Later
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFinalSubmit()}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gym-lime text-black font-heading font-black uppercase tracking-wider text-xs rounded hover:bg-white transition-all flex items-center gap-2 shadow-[0_0_25px_rgba(204,255,0,0.3)] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Provisioning Access...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Activate Athlete Access
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ──────────────────────────────────────────────────────── */}
        {/* Right Column: Live Athlete Pass Preview (4 Cols)         */}
        {/* ──────────────────────────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
          <div className="bg-gym-surface border border-gym-border rounded-lg p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gym-border/80">
              <span className="text-[11px] uppercase tracking-wider font-heading font-black text-white flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-gym-lime" /> DIGITAL ATHLETE PASS
              </span>
              <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-gym-lime/10 text-gym-lime border border-gym-lime/30 rounded">
                LIVE PREVIEW
              </span>
            </div>

            {/* Simulated Athletic Pass Card */}
            <div className="p-4 bg-gym-black rounded-lg border border-gym-border relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-gym-lime/10 rounded-full blur-xl pointer-events-none"></div>

              <div className="flex items-center gap-3.5 mb-4">
                <img
                  src={avatarUrl}
                  alt="Athlete Pass Avatar"
                  className="w-14 h-14 rounded-full object-cover border-2 border-gym-lime flex-shrink-0"
                />
                <div className="overflow-hidden">
                  <span className="font-heading font-black text-sm text-white uppercase tracking-wider block truncate">
                    {fullName || 'ATHLETE NAME'}
                  </span>
                  <span className="text-[10px] text-gym-muted font-mono block truncate">
                    {email || 'athlete@profitgym.com'}
                  </span>
                  <span className="inline-block mt-1 text-[9px] font-heading font-bold uppercase tracking-wider px-1.5 py-0.2 bg-zinc-800 text-gym-lime rounded">
                    {planDetails.name}
                  </span>
                </div>
              </div>

              {/* Validity Matrix */}
              <div className="grid grid-cols-2 gap-2 text-[10px] p-2 bg-zinc-950 rounded border border-zinc-900 mb-3">
                <div>
                  <span className="text-zinc-500 uppercase block">START DATE</span>
                  <span className="font-mono text-zinc-300 font-bold">{startDate}</span>
                </div>
                <div>
                  <span className="text-zinc-500 uppercase block">EXPIRY DATE</span>
                  <span className="font-mono text-gym-lime font-bold">{planDetails.expiryDate}</span>
                </div>
              </div>

              {/* Turnstile QR Code Simulator */}
              <div className="flex items-center justify-between p-2.5 bg-zinc-900/60 rounded border border-zinc-800">
                <div className="flex items-center gap-2">
                  <QrCode className="w-8 h-8 text-gym-lime" />
                  <div>
                    <span className="text-[10px] font-bold text-white block uppercase">
                      TURNSTILE NFC PASS
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono">
                      TOKEN: PRO-QR-{Date.now().toString().slice(-4)}
                    </span>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-gym-lime animate-pulse"></div>
              </div>
            </div>

            {/* Price & Billing Summary */}
            <div className="mt-4 pt-4 border-t border-gym-border/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gym-secondary">Clearance Tier:</span>
                <span className="text-white font-bold">{planDetails.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gym-secondary">Billing Schedule:</span>
                <span className="text-white font-bold">{billingCycle}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gym-secondary">Duration:</span>
                <span className="text-white font-bold">{planDetails.days} Days Active</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-gym-border/60 font-heading font-black">
                <span className="text-white uppercase tracking-wider">Total Activation:</span>
                <span className="text-gym-lime text-lg font-mono">${planDetails.price}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gym-border/60 py-6 text-center text-[11px] text-gym-muted">
        PROFIT TRAINING CLUB • 452 LAFAYETTE ST, NOHO NYC • ATHLETE CLEARANCE PRIVACY GUARANTEED
      </footer>
    </div>
  );
};
