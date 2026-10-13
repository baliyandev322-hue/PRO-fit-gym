const express = require('express');
const mongoose = require('mongoose');
const MembershipEnquiry = require('../models/MembershipEnquiry');
const Membership = require('../models/Membership');
const MembershipPlan = require('../models/MembershipPlan');
const { validateMembership } = require('../middleware/validate');
const { formSubmitLimiter } = require('../middleware/rateLimiter');
const { generateReference } = require('../utils/referenceGenerator');
const { sendMembershipAlert } = require('../services/emailService');

const router = express.Router();

// Default seed plans for initial database population & fallback
const DEFAULT_SEED_PLANS = [
  {
    id: 'plan-starter',
    slug: 'starter-tier',
    name: 'Starter Plan',
    price: 149,
    priceInr: 12400,
    durationDays: 30,
    description: 'Foundational strength training clearance.',
    isPopular: false,
    isActive: true,
    features: [
      'Unrestricted Off-Peak Facility Access',
      'Standard Equipment & Free Weights Zone',
      'Digital Access Pass & Attendance App',
      'Locker Room & High-Pressure Showers',
    ],
  },
  {
    id: 'plan-performance',
    slug: 'performance-tier',
    name: 'Performance Plan',
    price: 249,
    priceInr: 20700,
    durationDays: 30,
    description: 'The complete high-performance standard.',
    isPopular: true,
    isActive: true,
    features: [
      'Full 24/7 All-Access Sanctuary Access',
      'Bi-Weekly 1-on-1 Performance Check-ins',
      'Custom Periodized Hypertrophy Program',
      'Sauna, Cold Plunge & Recovery Lounge',
      'Free Guest Pass Every Month',
    ],
  },
  {
    id: 'plan-elite',
    slug: 'elite-vip-tier',
    name: 'Elite VIP Plan',
    price: 399,
    priceInr: 33200,
    durationDays: 30,
    description: 'Bespoke VIP access with coach priority.',
    isPopular: false,
    isActive: true,
    features: [
      'Unlimited Priority Access & Private Locker',
      'Weekly Private Coaching & Form Audits',
      'Comprehensive Nutrition & Macro Strategy',
      'Full Cryotherapy & Recovery Suite',
      'Complimentary Training Club Apparel Kit',
    ],
  },
];

let inMemoryMemberships = [];

/**
 * @route   GET /api/memberships/plans
 * @desc    Get all active membership tiers from MongoDB Atlas
 * @access  Public
 */
router.get('/plans', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let dbPlans = await MembershipPlan.find({ isActive: true });
      if (!dbPlans || dbPlans.length === 0) {
        // Auto-seed default tiers into MongoDB
        await MembershipPlan.insertMany(DEFAULT_SEED_PLANS.map(p => ({
          name: p.name,
          slug: p.slug,
          price: p.price,
          priceInr: p.priceInr,
          durationDays: p.durationDays,
          description: p.description,
          features: p.features,
          isPopular: p.isPopular,
          isActive: p.isActive,
        }))).catch(() => {});
        dbPlans = await MembershipPlan.find({ isActive: true });
      }

      if (dbPlans && dbPlans.length > 0) {
        return res.status(200).json({
          success: true,
          data: dbPlans.map(p => ({
            id: p.slug?.startsWith('starter')
              ? 'plan-starter'
              : p.slug?.startsWith('performance')
              ? 'plan-performance'
              : p.slug?.startsWith('elite')
              ? 'plan-elite'
              : p._id.toString(),
            _id: p._id.toString(),
            name: p.name,
            slug: p.slug,
            price: p.price,
            duration_days: p.durationDays,
            description: p.description,
            features: p.features,
            is_popular: p.isPopular,
            is_active: p.isActive,
          })),
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: DEFAULT_SEED_PLANS.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        duration_days: p.durationDays,
        description: p.description,
        features: p.features,
        is_popular: p.isPopular,
        is_active: p.isActive,
      })),
    });
  } catch (error) {
    console.error('[Plans Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve membership plans.',
      data: DEFAULT_SEED_PLANS,
    });
  }
});

/**
 * @route   POST /api/memberships/plans
 * @desc    Create a new membership plan in MongoDB Atlas
 * @access  Private (Admin)
 */
router.post('/plans', async (req, res) => {
  try {
    const { name, slug, price, priceInr, duration_days, durationDays, description, features, is_popular, isPopular } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Name and price are required' });
    }

    const planSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) + '-' + Date.now().toString(36);
    const planDuration = Number(duration_days || durationDays || 30);
    const popularFlag = Boolean(is_popular ?? isPopular ?? false);

    if (mongoose.connection.readyState === 1) {
      const created = await MembershipPlan.create({
        name,
        slug: planSlug,
        price: Number(price),
        priceInr: Number(priceInr || price * 83),
        durationDays: planDuration,
        description: description || '',
        features: Array.isArray(features) ? features : [],
        isPopular: popularFlag,
        isActive: true,
      });

      return res.status(201).json({
        success: true,
        data: {
          id: created._id.toString(),
          _id: created._id.toString(),
          name: created.name,
          slug: created.slug,
          price: created.price,
          duration_days: created.durationDays,
          description: created.description,
          features: created.features,
          is_popular: created.isPopular,
          is_active: created.isActive,
        },
      });
    }

    const fallback = {
      id: `plan-${Date.now()}`,
      name,
      slug: planSlug,
      price: Number(price),
      duration_days: planDuration,
      description: description || '',
      features: Array.isArray(features) ? features : [],
      is_popular: popularFlag,
      is_active: true,
    };
    return res.status(201).json({ success: true, data: fallback });
  } catch (error) {
    console.error('[Create Plan Error]', error);
    return res.status(500).json({ success: false, message: 'Failed to create plan' });
  }
});

/**
 * @route   PATCH /api/memberships/plans/:id
 * @desc    Update a membership plan in MongoDB Atlas
 * @access  Private (Admin)
 */
router.patch('/plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.duration_days) {
      updates.durationDays = updates.duration_days;
      delete updates.duration_days;
    }
    if (updates.is_popular !== undefined) {
      updates.isPopular = updates.is_popular;
      delete updates.is_popular;
    }

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const updated = await MembershipPlan.findByIdAndUpdate(id, updates, { new: true });
      if (updated) {
        return res.status(200).json({ success: true, data: updated });
      }
    }

    return res.status(200).json({ success: true, message: 'Plan updated.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update plan' });
  }
});

/**
 * @route   DELETE /api/memberships/plans/:id
 * @desc    Delete or deactivate a membership plan in MongoDB Atlas
 * @access  Private (Admin)
 */
router.delete('/plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      await MembershipPlan.findByIdAndUpdate(id, { isActive: false });
    }
    return res.status(200).json({ success: true, message: 'Plan deactivated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to remove plan' });
  }
});

/**
 * @route   GET /api/memberships
 * @desc    Get all active athlete memberships or filter by userId/memberEmail
 * @access  Public / Authenticated
 */
router.get('/', async (req, res) => {
  try {
    const { userId, email } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (email) filter.memberEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      const records = await Membership.find(filter).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: records.length,
        data: records.map(m => ({
          id: m._id.toString(),
          user_id: m.userId,
          member_name: m.memberName,
          member_email: m.memberEmail,
          plan_id: m.planId,
          plan_name: m.planName,
          status: m.status ? m.status.toLowerCase() : 'active',
          start_date: m.startDate ? m.startDate.toISOString() : new Date().toISOString(),
          expiry_date: m.expiryDate ? m.expiryDate.toISOString() : new Date().toISOString(),
          days_remaining: m.daysRemaining || 30,
          auto_renew: m.autoRenew ?? true,
          created_at: m.createdAt ? m.createdAt.toISOString() : new Date().toISOString(),
        })),
      });
    }

    // In-memory fallback
    const filtered = inMemoryMemberships.filter(m => {
      if (userId && m.user_id !== userId) return false;
      if (email && m.member_email !== email.toLowerCase().trim()) return false;
      return true;
    });

    return res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    console.error('[Memberships GET Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch membership records.',
    });
  }
});

/**
 * @route   POST /api/memberships/purchase
 * @desc    Activate or upgrade an athlete's membership in MongoDB Atlas
 * @access  Public / Authenticated
 */
router.post('/purchase', async (req, res) => {
  try {
    const { planId, userId, memberEmail, memberName, billingCycle = 'MONTHLY', paymentMethod = 'card' } = req.body;

    if (!planId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID and User ID are required.',
      });
    }

    const planLookup = {
      'plan-starter': { name: 'Starter Plan', price: 149, days: 30 },
      'plan-performance': { name: 'Performance Plan', price: 249, days: 30 },
      'plan-elite': { name: 'Elite VIP Plan', price: 399, days: 30 },
    };

    let planInfo = planLookup[planId];
    if (!planInfo && mongoose.connection.readyState === 1) {
      try {
        let dbPlan = null;
        if (mongoose.Types.ObjectId.isValid(planId)) {
          dbPlan = await MembershipPlan.findById(planId);
        }
        if (!dbPlan) {
          dbPlan = await MembershipPlan.findOne({ slug: planId });
        }
        if (dbPlan) {
          planInfo = { name: dbPlan.name, price: dbPlan.price, days: dbPlan.durationDays || 30 };
        }
      } catch (err) {
        console.error('[Plan Lookup Error]', err);
      }
    }
    if (!planInfo) {
      planInfo = { name: 'Performance Plan', price: 249, days: 30 };
    }
    let daysToAdd = planInfo.days;
    let multiplier = 1;

    if (billingCycle === 'QUARTERLY') {
      daysToAdd = 90;
      multiplier = 3 * 0.9;
    } else if (billingCycle === 'ANNUAL') {
      daysToAdd = 365;
      multiplier = 12 * 0.8;
    }

    const price = Math.round(planInfo.price * multiplier);
    const startDate = new Date();
    const expiryDate = new Date(startDate.getTime() + daysToAdd * 86400000);

    if (mongoose.connection.readyState === 1) {
      // Deactivate any currently active memberships for this user
      await Membership.updateMany(
        { userId, status: 'ACTIVE' },
        { status: 'EXPIRED' }
      );

      const newMembership = await Membership.create({
        userId,
        memberEmail: (memberEmail || '').toLowerCase().trim(),
        memberName: memberName || 'Athlete',
        planId,
        planName: planInfo.name,
        status: 'ACTIVE',
        startDate,
        expiryDate,
        daysRemaining: daysToAdd,
        price,
        autoRenew: true,
      });

      return res.status(201).json({
        success: true,
        message: `Successfully activated ${planInfo.name}!`,
        data: {
          id: newMembership._id.toString(),
          user_id: newMembership.userId,
          plan_id: newMembership.planId,
          plan_name: newMembership.planName,
          status: 'active',
          start_date: newMembership.startDate.toISOString(),
          expiry_date: newMembership.expiryDate.toISOString(),
          days_remaining: daysToAdd,
          auto_renew: true,
          created_at: newMembership.createdAt.toISOString(),
        },
      });
    }

    // Fallback store
    const fallbackMembership = {
      id: `mem_${Date.now()}`,
      user_id: userId,
      member_email: memberEmail,
      member_name: memberName || 'Athlete',
      plan_id: planId,
      plan_name: planInfo.name,
      status: 'active',
      start_date: startDate.toISOString(),
      expiry_date: expiryDate.toISOString(),
      days_remaining: daysToAdd,
      auto_renew: true,
      created_at: new Date().toISOString(),
    };

    inMemoryMemberships = inMemoryMemberships.filter(m => m.user_id !== userId);
    inMemoryMemberships.unshift(fallbackMembership);

    return res.status(201).json({
      success: true,
      message: `Successfully activated ${planInfo.name}!`,
      data: fallbackMembership,
    });
  } catch (error) {
    console.error('[Purchase Membership Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Could not complete membership purchase.',
    });
  }
});

/**
 * @route   PATCH /api/memberships/:id/cancel
 * @desc    Cancel an athlete's membership
 * @access  Public / Authenticated
 */
router.patch('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const updated = await Membership.findByIdAndUpdate(
        id,
        { status: 'CANCELLED', autoRenew: false },
        { new: true }
      );

      if (updated) {
        return res.status(200).json({
          success: true,
          message: 'Membership has been cancelled.',
          data: updated,
        });
      }
    }

    // In-memory update
    const target = inMemoryMemberships.find(m => m.id === id);
    if (target) {
      target.status = 'canceled';
      target.auto_renew = false;
    }

    return res.status(200).json({
      success: true,
      message: 'Membership cancelled successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to cancel membership.' });
  }
});

/**
 * @route   POST /api/memberships
 * @desc    Submit membership tier admission reservation (Contact Enquiry)
 * @access  Public
 */
router.post('/', formSubmitLimiter, validateMembership, async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database is currently offline. Please ensure MONGODB_URI is configured.',
    });
  }

  try {
    const { tier, fullName, email, phone, contactPreference, notes } = req.body;

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existingRecent = await MembershipEnquiry.findOne({
      email,
      tier,
      createdAt: { $gte: fiveMinutesAgo },
    });

    if (existingRecent) {
      return res.status(409).json({
        success: false,
        message: 'A membership reservation with this email was already logged recently.',
        reference: existingRecent.reference,
      });
    }

    const reference = generateReference('MB');

    const enquiry = await MembershipEnquiry.create({
      reference,
      tier,
      fullName,
      email,
      phone,
      contactPreference,
      notes,
      status: 'Pending',
    });

    sendMembershipAlert(enquiry)
      .then(async (result) => {
        await MembershipEnquiry.findByIdAndUpdate(enquiry._id, {
          'notificationStatus.emailSent': Boolean(result && result.success),
          'notificationStatus.emailError': result && result.error ? result.error : null,
        });
      })
      .catch(async (err) => {
        await MembershipEnquiry.findByIdAndUpdate(enquiry._id, {
          'notificationStatus.emailSent': false,
          'notificationStatus.emailError': err.message,
        });
      });

    return res.status(201).json({
      success: true,
      message: 'Membership admission reservation successfully submitted.',
      data: {
        reference: enquiry.reference,
        tier: enquiry.tier,
        fullName: enquiry.fullName,
        email: enquiry.email,
        phone: enquiry.phone,
        contactPreference: enquiry.contactPreference,
        status: enquiry.status,
        createdAt: enquiry.createdAt,
      },
    });
  } catch (error) {
    console.error('[Membership Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Server error saving membership reservation.',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
});

module.exports = router;
