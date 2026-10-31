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
  X,
  CreditCard,
  Sun,
  Sunset,
  Moon,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGymData } from '@/context/GymDataContext';
import { useNotifications } from '@/context/NotificationContext';
import confetti from 'canvas-confetti';
import type { RegisterPayload } from '@/types';
import { WeightlifterIcon } from '@/components/common/WeightlifterIcon';

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
  const [showPassModal, setShowPassModal] = useState(false);

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

  const handleInstantDemoVerify = () => {
    setOtpSent(true);
    setOtpCode('123456');
    setIsEmailVerified(true);
    showToast({
      type: 'success',
      title: 'DEMO AUTHORIZATION GRANTED',
      message: 'Email verified instantly for test onboarding.',
    });
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

  // Step Meta Configuration
  const stepsMeta = [
    { step: 1, label: 'Identity', title: 'Athlete Identity', estimate: '~2 min' },
    { step: 2, label: 'Security', title: 'Security & Access', estimate: '~1 min' },
    { step: 3, label: 'Membership', title: 'Clearance Tier', estimate: '~1 min' },
    { step: 4, label: 'Diagnostics', title: 'Training & Safety', estimate: 'Optional' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-gym-primary flex flex-col justify-between relative overflow-x-hidden">
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gym-lime/5 rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-gym-lime/3 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Top Navbar */}
      <header className="border-b border-zinc-800/80 bg-[#0a0b0d]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="font-heading text-2xl font-black tracking-wider text-white group-hover:text-gym-lime transition-colors">
              PRO<span className="text-gym-lime">FIT</span>
            </span>
            <span className="text-[10px] tracking-widest font-heading uppercase text-zinc-400 border-l border-zinc-800 pl-2.5 hidden sm:inline">
              ATHLETE ONBOARDING
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Live Pass Preview Toggle Button */}
            <button
              type="button"
              onClick={() => setShowPassModal(true)}
              className="px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-gym-lime/60 bg-zinc-900/60 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all"
            >
              <QrCode className="w-3.5 h-3.5 text-gym-lime" />
              <span className="hidden sm:inline">Live Pass</span>
            </button>

            <span className="text-zinc-500 text-xs hidden md:inline">Already registered?</span>
            <Link
              to="/login"
              className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-gym-lime text-white hover:text-gym-lime font-bold uppercase tracking-wider text-xs rounded-lg transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Centered Studio Flow Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full flex flex-col justify-center">
        {/* Modern Studio Card */}
        <div className="bg-gradient-to-b from-[#14151a] to-[#0f1013] border border-zinc-800/90 rounded-2xl shadow-2xl p-6 sm:p-10 relative overflow-hidden backdrop-blur-xl">
          {/* Subtle Card Accent Top Border */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gym-lime/50 to-transparent"></div>

          {/* Stepper Progress Pill Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gym-lime text-black font-black text-xs flex items-center justify-center font-heading">
                  {currentStep}
                </span>
                <span className="font-heading font-black text-sm uppercase tracking-wider text-white">
                  {stepsMeta[currentStep - 1].title}
                </span>
              </div>
              <span className="text-zinc-400 text-xs font-medium">
                Step {currentStep} of 4 <span className="text-zinc-600">·</span> {stepsMeta[currentStep - 1].estimate}
              </span>
            </div>

            {/* Segmented Slim Progress Lines */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[1, 2, 3, 4].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    stepNum <= currentStep
                      ? 'bg-gym-lime shadow-[0_0_10px_rgba(204,255,0,0.3)]'
                      : 'bg-zinc-800'
                  }`}
                />
              ))}
            </div>

            {/* Step Quick Jump Chips */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {stepsMeta.map((item) => (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => {
                    if (item.step < currentStep) setCurrentStep(item.step as OnboardingStep);
                  }}
                  disabled={item.step > currentStep}
                  className={`py-1.5 px-2 rounded-lg text-left transition-all flex items-center gap-1.5 ${
                    currentStep === item.step
                      ? 'bg-gym-lime/10 border border-gym-lime/40 text-white'
                      : item.step < currentStep
                      ? 'bg-zinc-900/60 border border-zinc-800 text-gym-lime hover:border-zinc-700 cursor-pointer'
                      : 'bg-transparent border border-transparent text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                      item.step < currentStep
                        ? 'bg-gym-lime text-black'
                        : currentStep === item.step
                        ? 'bg-gym-lime/20 text-gym-lime'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {item.step < currentStep ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : item.step}
                  </span>
                  <span className="text-[11px] font-semibold truncate hidden sm:inline">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────── */}
          {/* STEP 1: Personal Information                             */}
          {/* ──────────────────────────────────────────────────────── */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-zinc-800/80 pb-4">
                <h2 className="font-heading text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
                  Athlete Identity
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Establish your official club clearance credentials and membership profile.
                </p>
              </div>

              {/* Profile Avatar Upload - Modern Studio Frame */}
              <div className="flex items-center gap-5 p-4 bg-zinc-900/50 border border-zinc-800/90 rounded-xl hover:border-zinc-700 transition-all">
                <div className="relative group w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-gym-lime/60 bg-zinc-950 flex-shrink-0 shadow-lg shadow-gym-lime/10">
                  <img
                    src={avatarUrl}
                    alt="Athlete Avatar"
                    className="w-full h-full object-cover"
                  />
                  <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] uppercase font-bold text-gym-lime cursor-pointer transition-opacity">
                    <Upload className="w-4 h-4 mb-0.5" /> Change
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Turnstile Photo
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium">(Optional)</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Embedded into your NFC digital pass for contactless entry at facility gates.
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
                  <label className="block text-xs uppercase tracking-wider font-bold text-zinc-300 mb-1.5 font-heading">
                    Full Legal Name <span className="text-gym-lime">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Marcus Vance"
                      required
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-gym-lime focus:ring-1 focus:ring-gym-lime transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-zinc-300 mb-1.5 font-heading">
                    Mobile Phone Number <span className="text-gym-lime">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      required
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-gym-lime focus:ring-1 focus:ring-gym-lime transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-zinc-300 mb-1.5 font-heading">
                  Primary Email Address <span className="text-gym-lime">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="marcus.vance@athletes.com"
                    required
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-gym-lime focus:ring-1 focus:ring-gym-lime transition-all"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  We will send your 6-digit access authorization code to this email in Step 2.
                </p>
              </div>

              {/* Date of Birth & Gender Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-zinc-300 mb-1.5 font-heading">
                    Date of Birth <span className="text-gym-lime">* (Must be 16+)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      required
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-gym-lime focus:ring-1 focus:ring-gym-lime transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-zinc-300 mb-1.5 font-heading">
                    Gender Identity <span className="text-zinc-500 font-normal">(Optional)</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
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
                        className={`py-2.5 text-xs font-bold rounded-lg border transition-all ${
                          gender === g.key
                            ? 'border-gym-lime bg-gym-lime text-black shadow-md shadow-gym-lime/20'
                            : 'border-zinc-800 bg-zinc-900/70 text-zinc-400 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Physical Address Section */}
              <div className="pt-3 border-t border-zinc-800/80">
                <span className="text-xs uppercase tracking-wider font-bold text-zinc-300 mb-2.5 block font-heading">
                  Residential Address <span className="text-zinc-500 font-normal">(Optional)</span>
                </span>
                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Street address (e.g. 452 Lafayette St)"
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gym-lime focus:ring-1 focus:ring-gym-lime transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City (e.g. NYC)"
                      className="block w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gym-lime focus:ring-1 focus:ring-gym-lime transition-all"
                    />
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="State (e.g. NY)"
                      className="block w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gym-lime focus:ring-1 focus:ring-gym-lime transition-all"
                    />
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="Postal Code"
                      className="block w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gym-lime focus:ring-1 focus:ring-gym-lime transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Step 1 Actions */}
              <div className="pt-6 border-t border-zinc-800/80 flex justify-end">
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full sm:w-auto px-8 py-3 bg-gym-lime text-black font-heading font-black uppercase tracking-wider text-xs rounded-xl hover:bg-[#b8e600] transition-all flex items-center justify-center gap-2 group shadow-lg shadow-gym-lime/20"
                >
                  Continue: Credentials & Security
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
              <div className="border-b border-zinc-800/80 pb-4">
                <h2 className="font-heading text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
                  Security & Access
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Create a secure passphrase and confirm email ownership via instant 6-digit OTP.
                </p>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Create Password */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-zinc-300 mb-1.5 font-heading">
                    Create Password <span className="text-gym-lime">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="block w-full pl-10 pr-10 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-gym-lime focus:ring-1 focus:ring-gym-lime transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-zinc-300 mb-1.5 font-heading">
                    Confirm Password <span className="text-gym-lime">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={`block w-full pl-10 pr-10 py-2.5 bg-zinc-900/80 border rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-all ${
                        confirmPassword && confirmPassword === password
                          ? 'border-gym-lime ring-1 ring-gym-lime'
                          : confirmPassword && confirmPassword !== password
                          ? 'border-red-500'
                          : 'border-zinc-800 focus:border-gym-lime focus:ring-1 focus:ring-gym-lime'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Strength Indicator */}
              <div className="p-3.5 bg-zinc-900/50 rounded-xl border border-zinc-800/90">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                    Password Security
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
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
                <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px] text-zinc-500">
                  <span className={password.length >= 6 ? 'text-gym-lime flex items-center gap-1 font-medium' : ''}>
                    {password.length >= 6 ? '✓' : '•'} 6+ characters
                  </span>
                  <span className={/[A-Z]/.test(password) ? 'text-gym-lime flex items-center gap-1 font-medium' : ''}>
                    {/[A-Z]/.test(password) ? '✓' : '•'} Uppercase
                  </span>
                  <span className={/[0-9]/.test(password) ? 'text-gym-lime flex items-center gap-1 font-medium' : ''}>
                    {/[0-9]/.test(password) ? '✓' : '•'} Number
                  </span>
                  <span className={confirmPassword && confirmPassword === password ? 'text-gym-lime flex items-center gap-1 font-medium' : ''}>
                    {confirmPassword && confirmPassword === password ? '✓ Matches' : '• Matches'}
                  </span>
                </div>
              </div>

              {/* Email OTP Verification Section */}
              <div className="p-5 bg-zinc-900/60 rounded-xl border border-zinc-800/90 relative overflow-hidden space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-gym-lime" />
                    <span className="text-xs uppercase font-heading font-black tracking-wider text-white">
                      Email Authorization (OTP)
                    </span>
                  </div>
                  {isEmailVerified ? (
                    <span className="px-2.5 py-1 bg-gym-lime/10 text-gym-lime border border-gym-lime/30 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" /> Verified
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                      Pending Verification
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400">
                  Target Email:{' '}
                  <strong className="text-white font-mono">{email || 'Not provided in Step 1'}</strong>
                </p>

                {!isEmailVerified ? (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 6-Digit OTP"
                        disabled={!otpSent}
                        className="flex-1 px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-center font-mono text-lg tracking-[8px] text-gym-lime placeholder-zinc-600 focus:outline-none focus:border-gym-lime focus:ring-1 focus:ring-gym-lime disabled:opacity-50"
                      />

                      {!otpSent ? (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isSendingOtp}
                          className="px-6 py-2.5 bg-gym-lime text-black font-heading font-black uppercase tracking-wider text-xs rounded-xl hover:bg-[#b8e600] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-gym-lime/20"
                        >
                          {isSendingOtp ? (
                            <WeightlifterIcon className="w-4 h-4 text-black" isLifting={true} />
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
                          className="px-6 py-2.5 bg-gym-lime text-black font-heading font-black uppercase tracking-wider text-xs rounded-xl hover:bg-[#b8e600] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-gym-lime/20"
                        >
                          {isVerifyingOtp ? (
                            <WeightlifterIcon className="w-4 h-4 text-black" isLifting={true} />
                          ) : (
                            <Check className="w-4 h-4 stroke-[3]" />
                          )}
                          Verify Code
                        </button>
                      )}
                    </div>

                    {otpSent && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-zinc-500 pt-1 gap-1">
                        <span>Check your inbox & spam folder for the access code.</span>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={resendCooldown > 0 || isSendingOtp}
                          className="text-gym-lime hover:underline disabled:text-zinc-600 disabled:no-underline font-bold self-start sm:self-auto"
                        >
                          {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                        </button>
                      </div>
                    )}

                    {/* Instant Demo Skip/Verify Option */}
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                      <span className="text-[11px] text-zinc-400">Testing onboarding flow?</span>
                      <button
                        type="button"
                        onClick={handleInstantDemoVerify}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-gym-lime border border-gym-lime/40 rounded-lg text-xs font-heading font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 text-gym-lime" />
                        Instant Demo Verify (Skip OTP)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-gym-lime/10 border border-gym-lime/30 rounded-xl flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-gym-lime flex-shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider block">
                        Identity Authorized
                      </span>
                      <span className="text-xs text-zinc-400">
                        Your email address has been confirmed and locked for this athlete profile.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="pt-2">
                <label className="flex items-start gap-3 p-3.5 bg-zinc-900/50 rounded-xl border border-zinc-800/80 cursor-pointer hover:border-zinc-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-gym-lime rounded bg-zinc-950 border-zinc-700 cursor-pointer"
                  />
                  <span className="text-xs text-zinc-300 leading-relaxed">
                    I agree to the{' '}
                    <span className="text-white font-bold underline hover:text-gym-lime">
                      PROFIT Facility Code of Conduct
                    </span>
                    , Safety Liability Release, and Terms of Membership.
                  </span>
                </label>
              </div>

              {/* Step 2 Actions */}
              <div className="pt-6 border-t border-zinc-800/80 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-5 py-2.5 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white font-heading font-black uppercase tracking-wider text-xs rounded-xl transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back: Identity
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 bg-gym-lime text-black font-heading font-black uppercase tracking-wider text-xs rounded-xl hover:bg-[#b8e600] transition-all flex items-center gap-2 group shadow-lg shadow-gym-lime/20"
                >
                  Continue: Choose Tier
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
              <div className="border-b border-zinc-800/80 pb-4">
                <h2 className="font-heading text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
                  Membership Tier & Activation
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Select your clearance level, payment frequency, and facility start date.
                </p>
              </div>

              {/* Billing Cycle Switcher - Modern Luxury Pill */}
              <div className="flex items-center justify-center">
                <div className="bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 flex items-center gap-1 shadow-inner">
                  {[
                    { key: 'MONTHLY', label: 'Monthly' },
                    { key: 'QUARTERLY', label: 'Quarterly', discount: 'Save 10%' },
                    { key: 'ANNUAL', label: 'Yearly', discount: 'Save 20%' },
                  ].map((cycle) => (
                    <button
                      key={cycle.key}
                      type="button"
                      onClick={() => setBillingCycle(cycle.key as any)}
                      className={`px-4 py-2 rounded-lg text-xs font-heading font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                        billingCycle === cycle.key
                          ? 'bg-gym-lime text-black shadow-md shadow-gym-lime/20'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {cycle.label}
                      {cycle.discount && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
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
                    className={`cursor-pointer rounded-xl p-5 border relative flex flex-col justify-between transition-all ${
                      selectedPlanId === tier.id
                        ? 'border-gym-lime bg-gym-lime/5 shadow-lg shadow-gym-lime/15 ring-1 ring-gym-lime'
                        : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/80'
                    }`}
                  >
                    {tier.popular && (
                      <span className="absolute -top-2.5 right-4 px-2 py-0.5 bg-gym-lime text-black text-[9px] font-heading font-black tracking-widest uppercase rounded-full shadow-sm">
                        MOST POPULAR
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-heading text-sm font-bold uppercase tracking-wider text-white">
                          {tier.name}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            selectedPlanId === tier.id
                              ? 'border-gym-lime bg-gym-lime text-black'
                              : 'border-zinc-700 bg-zinc-900'
                          }`}
                        >
                          {selectedPlanId === tier.id && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="mb-2">
                        <span className="text-3xl font-heading font-black text-white">${tier.price}</span>
                        <span className="text-xs text-zinc-400 ml-1">{tier.period}</span>
                      </div>

                      <p className="text-xs text-zinc-400 mb-4">{tier.desc}</p>

                      <ul className="space-y-2 border-t border-zinc-800/80 pt-3">
                        {tier.features.map((feat, idx) => (
                          <li key={idx} className="text-xs text-zinc-300 flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-gym-lime flex-shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* Start Date & Live Expiry Calculation */}
              <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/90 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-zinc-300 mb-1.5 font-heading">
                    Membership Activation Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gym-lime focus:ring-1 focus:ring-gym-lime [color-scheme:dark]"
                  />
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Pass activates at turnstiles on this date.
                  </span>
                </div>

                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 uppercase font-bold text-[10px]">
                      Calculated Expiry Date:
                    </span>
                    <span className="text-gym-lime font-mono font-bold text-sm">
                      {planDetails.expiryDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1.5">
                    <span className="text-zinc-500 text-[10px]">Duration:</span>
                    <span className="text-white text-xs font-bold">
                      {planDetails.days} Days Active Access
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 3 Actions */}
              <div className="pt-6 border-t border-zinc-800/80 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-5 py-2.5 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white font-heading font-black uppercase tracking-wider text-xs rounded-xl transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back: Security
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 bg-gym-lime text-black font-heading font-black uppercase tracking-wider text-xs rounded-xl hover:bg-[#b8e600] transition-all flex items-center gap-2 group shadow-lg shadow-gym-lime/20"
                >
                  Continue: Training Profile
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
              <div className="border-b border-zinc-800/80 pb-4">
                <h2 className="font-heading text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
                  Training Diagnostics & Safety
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Optional preferences to help our coaches customize your onboarding workouts.
                </p>
              </div>

              {/* Primary Fitness Goal - Sleek Interactive Tiles */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-zinc-300 mb-2 font-heading">
                  Primary Fitness Objective
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { key: 'MUSCLE_GAIN', label: 'Hypertrophy & Muscle', icon: Dumbbell },
                    { key: 'WEIGHT_LOSS', label: 'Fat Loss & Tone', icon: Flame },
                    { key: 'STRENGTH', label: 'Absolute Strength', icon: Target },
                    { key: 'ENDURANCE', label: 'Cardio & Stamina', icon: Activity },
                    { key: 'GENERAL_FITNESS', label: 'Longevity & Health', icon: Award },
                  ].map((goal) => {
                    const Icon = goal.icon;
                    return (
                      <button
                        key={goal.key}
                        type="button"
                        onClick={() => setPrimaryGoal(goal.key)}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                          primaryGoal === goal.key
                            ? 'border-gym-lime bg-gym-lime/10 text-white shadow-sm shadow-gym-lime/10 ring-1 ring-gym-lime'
                            : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        <Icon className={`w-4 h-4 flex-shrink-0 ${primaryGoal === goal.key ? 'text-gym-lime' : 'text-zinc-500'}`} />
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
                  <label className="block text-xs uppercase tracking-wider font-bold text-zinc-300 mb-1.5 font-heading">
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
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                          experienceLevel === lvl.key
                            ? 'border-gym-lime bg-gym-lime text-black shadow-md shadow-gym-lime/20'
                            : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-zinc-300 mb-1.5 font-heading">
                    Preferred Training Window
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'MORNING', label: 'Morning', sub: '06:00 - 10:00' },
                      { key: 'MIDDAY', label: 'Midday', sub: '11:00 - 15:00' },
                      { key: 'EVENING', label: 'Evening', sub: '17:00 - 22:00' },
                    ].map((time) => (
                      <button
                        key={time.key}
                        type="button"
                        onClick={() => setPreferredTime(time.key)}
                        className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all flex flex-col items-center ${
                          preferredTime === time.key
                            ? 'border-gym-lime bg-gym-lime text-black shadow-md shadow-gym-lime/20'
                            : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        <span>{time.label}</span>
                        <span className="text-[9px] font-normal opacity-80">{time.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Coach Assignment Request */}
              <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800/90 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-heading font-black tracking-wider text-white block">
                    Complimentary Coach Consultation
                  </span>
                  <span className="text-xs text-zinc-400">
                    Pair with Master Coach Marcus Drake for an initial movement screen.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setRequiresTrainer(!requiresTrainer)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 flex-shrink-0 ${
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
              <div className="pt-3 border-t border-zinc-800/80">
                <span className="text-xs uppercase tracking-wider font-bold text-zinc-300 mb-2.5 block font-heading">
                  Emergency Medical Contact <span className="text-zinc-500 font-normal">(Optional)</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Contact Full Name"
                    className="block w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gym-lime focus:ring-1 focus:ring-gym-lime transition-all"
                  />
                  <select
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-gym-lime focus:ring-1 focus:ring-gym-lime transition-all"
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
                    className="block w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-gym-lime focus:ring-1 focus:ring-gym-lime transition-all"
                  />
                </div>
              </div>

              {/* Step 4 Actions */}
              <div className="pt-6 border-t border-zinc-800/80 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-5 py-2.5 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white font-heading font-black uppercase tracking-wider text-xs rounded-xl transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back: Plan
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleFinalSubmit()}
                    disabled={isSubmitting}
                    className="text-xs text-zinc-400 hover:text-white uppercase font-bold transition-colors hidden sm:inline"
                  >
                    Complete Later
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFinalSubmit()}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gym-lime text-black font-heading font-black uppercase tracking-wider text-xs rounded-xl hover:bg-[#b8e600] transition-all flex items-center gap-2 shadow-lg shadow-gym-lime/25 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <WeightlifterIcon className="w-5 h-5 text-black" isLifting={true} /> Provisioning Access...
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
      </main>

      {/* Live Athlete Pass Preview Modal */}
      {showPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#14151a] border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden">
            {/* Background Neon Accent */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-gym-lime/15 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gym-lime" />
                <span className="font-heading font-black text-sm uppercase text-white tracking-wider">
                  Digital Athlete Pass
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPassModal(false)}
                className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pass Body */}
            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-900 space-y-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={avatarUrl}
                  alt="Athlete Avatar"
                  className="w-14 h-14 rounded-full object-cover border-2 border-gym-lime flex-shrink-0"
                />
                <div className="overflow-hidden">
                  <span className="font-heading font-black text-sm text-white uppercase tracking-wider block truncate">
                    {fullName || 'Marcus Vance'}
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono block truncate">
                    {email || 'marcus@athletes.com'}
                  </span>
                  <span className="inline-block mt-1 text-[9px] font-heading font-bold uppercase tracking-wider px-2 py-0.5 bg-gym-lime/10 text-gym-lime border border-gym-lime/30 rounded-full">
                    {planDetails.name}
                  </span>
                </div>
              </div>

              {/* Turnstile Access Code */}
              <div className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <QrCode className="w-8 h-8 text-gym-lime" />
                  <div>
                    <span className="text-[10px] font-bold text-white block uppercase font-heading tracking-wider">
                      Turnstile NFC Gate Pass
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      TOKEN: PRO-PASS-{Date.now().toString().slice(-4)}
                    </span>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-gym-lime animate-pulse"></span>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-2 text-[10px] p-2.5 bg-zinc-900/60 rounded-lg border border-zinc-800/80">
                <div>
                  <span className="text-zinc-500 uppercase block">Start Date</span>
                  <span className="font-mono text-zinc-300 font-bold">{startDate}</span>
                </div>
                <div>
                  <span className="text-zinc-500 uppercase block">Expiry Date</span>
                  <span className="font-mono text-gym-lime font-bold">{planDetails.expiryDate}</span>
                </div>
              </div>
            </div>

            {/* Price & Summary */}
            <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
              <span className="text-zinc-400">Total Commitment:</span>
              <span className="text-gym-lime font-mono font-bold text-base">${planDetails.price}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowPassModal(false)}
              className="w-full mt-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 py-6 text-center text-xs text-zinc-500">
        PROFIT TRAINING CLUB • 452 LAFAYETTE ST, NOHO NYC • ATHLETE CLEARANCE PRIVACY GUARANTEED
      </footer>
    </div>
  );
};
