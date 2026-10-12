const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Prevents password from leaking in normal queries
    },
    role: {
      type: String,
      enum: ['ADMIN', 'TRAINER', 'MEMBER'],
      default: 'MEMBER',
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    qrPassToken: {
      type: String,
      unique: true,
      sparse: true,
      default: () => `QR_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    assignedTrainerName: {
      type: String,
      default: 'Marcus Drake',
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    // Extended Onboarding & Profile Information
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY', ''],
      default: '',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
    },
    membershipDetails: {
      planId: { type: String, default: 'plan-performance' },
      planName: { type: String, default: 'Performance Tier' },
      billingCycle: { type: String, enum: ['MONTHLY', 'QUARTERLY', 'ANNUAL'], default: 'MONTHLY' },
      startDate: { type: Date, default: Date.now },
      expiryDate: { type: Date, default: null },
      price: { type: Number, default: 249 },
    },
    fitnessProfile: {
      primaryGoal: {
        type: String,
        enum: ['WEIGHT_LOSS', 'MUSCLE_GAIN', 'GENERAL_FITNESS', 'ENDURANCE', 'STRENGTH', ''],
        default: '',
      },
      experienceLevel: {
        type: String,
        enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', ''],
        default: '',
      },
      preferredTime: {
        type: String,
        enum: ['MORNING', 'MIDDAY', 'EVENING', ''],
        default: '',
      },
      requiresTrainer: {
        type: Boolean,
        default: false,
      },
      emergencyContact: {
        name: { type: String, default: '' },
        relationship: { type: String, default: '' },
        phone: { type: String, default: '' },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password candidate
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password || !candidatePassword) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
