const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const { verifyAuth } = require('../middleware/auth');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Membership = require('../models/Membership');
const MembershipPlan = require('../models/MembershipPlan');
const { sendPaymentReceiptEmail } = require('../services/emailService');
const { sendPaymentReceiptWhatsApp } = require('../services/whatsappService');
const { saveRecord } = require('../config/localStore');

const router = express.Router();

// Razorpay credentials from environment
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_PROFIT_GYM_DEV_KEY';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'profit_gym_secret_dev_382910';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || 'profit_gym_webhook_secret_dev_382910';

// Initialize Razorpay SDK instance if keys are available
let razorpayClient = null;
try {
  if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET && !RAZORPAY_KEY_ID.includes('PROFIT_GYM_DEV_KEY')) {
    razorpayClient = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
    console.log('[Payment Gateway] Razorpay live client initialized successfully.');
  } else {
    console.log('[Payment Gateway] Razorpay initialized in development / test sandbox mode.');
  }
} catch (err) {
  console.warn('[Payment Gateway Warning] Razorpay client initialization error:', err.message);
}

// In-memory payment ledger fallback for dev mode when DB is booting
let devPaymentsLedger = [
  {
    id: 'pay-001',
    razorpay_payment_id: 'pay_Nsd9823kLsd8',
    razorpay_order_id: 'order_Nx83jLs9dK2',
    user_id: 'user-member-1',
    member_name: 'Alex Vance',
    plan_id: 'plan-performance',
    plan_name: 'Performance Tier',
    amount: 24900, // INR
    currency: 'INR',
    status: 'PAID',
    receipt: 'RCP-PROFIT-001',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString()
  },
  {
    id: 'pay-002',
    razorpay_payment_id: 'pay_Mks8237Jsd1',
    razorpay_order_id: 'order_Lm92kJs8dE1',
    user_id: 'user-member-2',
    member_name: 'Elena Rostova',
    plan_id: 'plan-elite',
    plan_name: 'Elite VIP Tier',
    amount: 39900, // INR
    currency: 'INR',
    status: 'PAID',
    receipt: 'RCP-PROFIT-002',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  }
];

// Seed membership pricing table (in INR Rupees)
const PLAN_CATALOG = {
  'plan-starter': { name: 'Starter Tier', price: 14900, durationDays: 30 },
  'plan-performance': { name: 'Performance Tier', price: 24900, durationDays: 30 },
  'plan-elite': { name: 'Elite VIP Tier', price: 39900, durationDays: 30 }
};

/**
 * @route   GET /api/payments/config
 * @desc    Get public Razorpay Key ID for client SDK initialization
 * @access  Public
 */
router.get('/config', (req, res) => {
  res.status(200).json({
    success: true,
    keyId: RAZORPAY_KEY_ID,
    currency: 'INR',
    isSandbox: RAZORPAY_KEY_ID.includes('PROFIT_GYM_DEV_KEY')
  });
});

/**
 * @route   POST /api/payments/create-order
 * @desc    Create a Razorpay Order on server (with live Razorpay API integration)
 * @access  Private (Authenticated User)
 */
router.post('/create-order', verifyAuth, async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;
    const userName = req.user.fullName || req.user.name || 'Valued Athlete';

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID is required to initiate checkout.'
      });
    }

    let planPrice = 24900;
    let planTitle = 'Performance Tier';

    // Fetch plan from MongoDB Atlas or catalog
    if (mongoose.connection.readyState === 1) {
      try {
        const dbPlan = await MembershipPlan.findOne({ slug: planId });
        if (dbPlan) {
          planPrice = dbPlan.priceInr || dbPlan.price;
          planTitle = dbPlan.name;
        }
      } catch (err) {
        console.warn('MongoDB plan lookup error, using catalog:', err.message);
      }
    }

    if (!planPrice && PLAN_CATALOG[planId]) {
      planPrice = PLAN_CATALOG[planId].price;
      planTitle = PLAN_CATALOG[planId].name;
    }

    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(planPrice * 100);
    const receiptId = `rcp_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    let orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // 1. Live Razorpay SDK order creation
    if (razorpayClient) {
      try {
        const rzpOrder = await razorpayClient.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: receiptId,
          notes: {
            userId: userId.toString(),
            planId,
            planTitle,
            userName,
            email: req.user.email
          }
        });
        orderId = rzpOrder.id;
      } catch (rzpErr) {
        console.error('[Razorpay API Error] Order creation failed:', rzpErr.error?.description || rzpErr.message);
        if (process.env.NODE_ENV !== 'production' || rzpErr.statusCode === 401) {
          console.warn('[Payment Gateway Notice] Live Razorpay credentials returned authentication error. Falling back to sandbox order simulation so athlete checkout continues.');
        } else {
          return res.status(500).json({
            success: false,
            message: `Razorpay Order creation failed: ${rzpErr.error?.description || rzpErr.message}`
          });
        }
      }
    }

    // 2. Record pending transaction in MongoDB Atlas if available
    if (mongoose.connection.readyState === 1) {
      try {
        await Payment.create({
          memberId: userId,
          memberName: userName,
          planId,
          planName: planTitle,
          amount: planPrice,
          currency: 'INR',
          status: 'PENDING',
          gateway: 'RAZORPAY',
          razorpayOrderId: orderId,
          receiptNumber: receiptId
        });
      } catch (err) {
        console.warn('Failed to insert pending payment in MongoDB:', err.message);
      }
    }

    return res.status(200).json({
      success: true,
      order: {
        id: orderId,
        amount: amountInPaise,
        amountInRupees: planPrice,
        currency: 'INR',
        receipt: receiptId,
        keyId: RAZORPAY_KEY_ID,
        planId,
        planTitle
      }
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment order. Please try again.'
    });
  }
});

/**
 * @route   POST /api/payments/verify
 * @desc    Verify Razorpay payment signature & activate membership in MongoDB Atlas
 * @access  Private (Authenticated User)
 */
router.post('/verify', verifyAuth, async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      planId 
    } = req.body;

    const userId = req.user.id;
    const userName = req.user.fullName || req.user.name || 'Valued Athlete';

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and Payment ID are required for verification.'
      });
    }

    // Server-side HMAC SHA256 Signature Verification
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Strict validation for live production mode; fallback for dev simulation
    const isSandbox = RAZORPAY_KEY_ID.includes('PROFIT_GYM_DEV_KEY') || process.env.NODE_ENV !== 'production';
    const isSignatureValid = 
      razorpay_signature === generatedSignature || 
      (isSandbox && (razorpay_signature?.startsWith('sig_dev_') || !razorpay_signature));

    if (!isSignatureValid) {
      console.warn(`[SECURITY] Signature mismatch: expected ${generatedSignature}, received ${razorpay_signature}`);
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Signature mismatch. Potential tampering detected.'
      });
    }

    const planMeta = PLAN_CATALOG[planId] || { name: 'Performance Tier', price: 24900, durationDays: 30 };
    const receiptNumber = `INV-PROFIT-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const expiryDate = new Date(now.getTime() + (planMeta.durationDays || 30) * 86400000);

    // Update / Activate Membership in MongoDB Database
    let updatedMembership = null;
    if (mongoose.connection.readyState === 1) {
      try {
        updatedMembership = await Membership.findOneAndUpdate(
          { userId },
          {
            memberEmail: req.user?.email,
            memberName: userName,
            planId: planId || 'plan-performance',
            planName: planMeta.name,
            status: 'ACTIVE',
            startDate: now,
            expiryDate,
            daysRemaining: planMeta.durationDays || 30,
            price: planMeta.price,
            autoRenew: true
          },
          { upsert: true, new: true }
        );

        // Record completed Payment in MongoDB
        await Payment.create({
          memberId: userId,
          memberName: userName,
          planId: planId || 'plan-performance',
          planName: planMeta.name,
          amount: planMeta.price,
          currency: 'INR',
          status: 'COMPLETED',
          gateway: 'RAZORPAY',
          razorpayPaymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          receiptNumber
        });
      } catch (err) {
        console.warn('MongoDB membership activation error:', err.message);
      }
    }

    // Record in in-memory dev ledger
    const paidRecord = {
      id: `pay-${Date.now()}`,
      razorpay_payment_id,
      razorpay_order_id,
      user_id: userId,
      member_name: userName,
      plan_id: planId,
      plan_name: planMeta.name,
      amount: planMeta.price,
      currency: 'INR',
      status: 'PAID',
      receipt: receiptNumber,
      created_at: now.toISOString()
    };
    devPaymentsLedger.unshift(paidRecord);
    saveRecord('payments', paidRecord);

    // Asynchronously dispatch Email and WhatsApp official receipts
    const recipientUser = {
      id: userId,
      fullName: userName,
      email: req.user?.email,
      phone: req.user?.phone || req.body?.phone,
    };

    // If email or phone is missing from session, populate from User model in MongoDB Atlas
    if ((!recipientUser.email || !recipientUser.phone) && mongoose.connection.readyState === 1) {
      User.findById(userId)
        .then((dbUser) => {
          if (dbUser) {
            recipientUser.email = recipientUser.email || dbUser.email;
            recipientUser.phone = recipientUser.phone || dbUser.phone;
          }
          sendPaymentReceiptEmail({ user: recipientUser, payment: paidRecord, membership: updatedMembership })
            .catch((e) => console.error('[Receipt Email Error]', e.message));
          sendPaymentReceiptWhatsApp({ user: recipientUser, payment: paidRecord, membership: updatedMembership })
            .catch((w) => console.error('[Receipt WhatsApp Error]', w.message));
        })
        .catch(() => {
          sendPaymentReceiptEmail({ user: recipientUser, payment: paidRecord, membership: updatedMembership }).catch(() => {});
          sendPaymentReceiptWhatsApp({ user: recipientUser, payment: paidRecord, membership: updatedMembership }).catch(() => {});
        });
    } else {
      sendPaymentReceiptEmail({ user: recipientUser, payment: paidRecord, membership: updatedMembership })
        .catch((e) => console.error('[Receipt Email Error]', e.message));
      sendPaymentReceiptWhatsApp({ user: recipientUser, payment: paidRecord, membership: updatedMembership })
        .catch((w) => console.error('[Receipt WhatsApp Error]', w.message));
    }

    return res.status(200).json({
      success: true,
      verified: true,
      message: 'Razorpay payment verified successfully! Membership has been activated.',
      payment: paidRecord,
      membership: {
        status: 'ACTIVE',
        tier: planMeta.name,
        startDate: now.toISOString(),
        endDate: expiryDate.toISOString(),
        daysRemaining: planMeta.durationDays || 30
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while verifying payment.'
    });
  }
});

/**
 * @route   POST /api/payments/webhook
 * @desc    Razorpay Server-to-Server Webhook handler (Captures payment even if user closes browser)
 * @access  Public (Protected via x-razorpay-signature HMAC-SHA256)
 */
router.post('/webhook', async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];

    if (!webhookSignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing x-razorpay-signature webhook header.'
      });
    }

    // Verify webhook signature with secret using rawBody or stringified body
    const payload = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    const isValid = webhookSignature === expectedSignature || RAZORPAY_KEY_ID.includes('PROFIT_GYM_DEV_KEY');

    if (!isValid) {
      console.warn('[SECURITY] Razorpay webhook signature verification failed.');
      return res.status(400).json({
        success: false,
        message: 'Webhook signature verification failed.'
      });
    }

    const event = req.body.event;
    console.log(`[Razorpay Webhook] Received validated event: ${event}`);

    // Handle Payment Captured or Order Paid events
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body.payload?.payment?.entity;
      const notes = paymentEntity?.notes || {};
      const userId = notes.userId;
      const planId = notes.planId || 'plan-performance';
      const planTitle = notes.planTitle || 'Performance Tier';
      const amount = (paymentEntity?.amount || 2490000) / 100; // convert paise to INR

      if (userId && mongoose.connection.readyState === 1) {
        const now = new Date();
        const expiryDate = new Date(now.getTime() + 30 * 86400000);

        // 1. Activate Membership in MongoDB Atlas
        await Membership.findOneAndUpdate(
          { userId },
          {
            planId,
            planName: planTitle,
            status: 'ACTIVE',
            startDate: now,
            expiryDate,
            daysRemaining: 30,
            price: amount,
            autoRenew: true
          },
          { upsert: true, new: true }
        );

        // 2. Persist Payment Record
        const webhookReceiptNo = `INV-WH-${Date.now().toString().slice(-6)}`;
        await Payment.create({
          memberId: userId,
          memberName: notes.userName || 'Verified Athlete',
          planId,
          planName: planTitle,
          amount,
          currency: 'INR',
          status: 'COMPLETED',
          gateway: 'RAZORPAY',
          razorpayPaymentId: paymentEntity?.id,
          razorpayOrderId: paymentEntity?.order_id,
          receiptNumber: webhookReceiptNo,
        });

        console.log(`[Razorpay Webhook] Membership successfully activated for user: ${userId}`);

        // Dispatch Email and WhatsApp receipts via Webhook
        const webhookUser = {
          id: userId,
          fullName: notes.userName || 'Verified Athlete',
          email: paymentEntity?.email || notes.email,
          phone: paymentEntity?.contact || notes.phone,
        };

        const dispatchWebhookReceipts = (userObj) => {
          const paymentData = {
            receiptNumber: webhookReceiptNo,
            amount,
            currency: 'INR',
            planName: planTitle,
            razorpayPaymentId: paymentEntity?.id,
            razorpayOrderId: paymentEntity?.order_id,
          };
          const membershipData = { planName: planTitle, expiryDate };

          sendPaymentReceiptEmail({ user: userObj, payment: paymentData, membership: membershipData })
            .catch((e) => console.error('[Webhook Email Receipt Error]', e.message));
          sendPaymentReceiptWhatsApp({ user: userObj, payment: paymentData, membership: membershipData })
            .catch((w) => console.error('[Webhook WhatsApp Receipt Error]', w.message));
        };

        if ((!webhookUser.email || !webhookUser.phone) && mongoose.connection.readyState === 1) {
          User.findById(userId)
            .then((dbUser) => {
              if (dbUser) {
                webhookUser.email = webhookUser.email || dbUser.email;
                webhookUser.phone = webhookUser.phone || dbUser.phone;
              }
              dispatchWebhookReceipts(webhookUser);
            })
            .catch(() => dispatchWebhookReceipts(webhookUser));
        } else {
          dispatchWebhookReceipts(webhookUser);
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = req.body.payload?.payment?.entity;
      const notes = paymentEntity?.notes || {};
      const userId = notes.userId;

      if (userId && mongoose.connection.readyState === 1) {
        await Payment.create({
          memberId: userId,
          memberName: notes.userName || 'Athlete',
          planId: notes.planId || 'plan-performance',
          planName: notes.planTitle || 'Performance Tier',
          amount: (paymentEntity?.amount || 0) / 100,
          currency: 'INR',
          status: 'FAILED',
          gateway: 'RAZORPAY',
          razorpayPaymentId: paymentEntity?.id,
          razorpayOrderId: paymentEntity?.order_id,
          receiptNumber: `FAIL-${Date.now().toString().slice(-6)}`
        });
      }
    }

    // Always respond with 200 OK to acknowledge receipt to Razorpay
    return res.status(200).json({ status: 'ok', eventReceived: event });
  } catch (error) {
    console.error('[Razorpay Webhook Error]', error);
    return res.status(500).json({ success: false, message: 'Server webhook processing error.' });
  }
});

/**
 * @route   GET /api/payments/history
 * @desc    Get user or admin payment history from MongoDB Atlas
 * @access  Private
 */
router.get('/history', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (mongoose.connection.readyState === 1) {
      try {
        const query = userRole === 'ADMIN' ? {} : { memberId: userId };
        const payments = await Payment.find(query).sort({ createdAt: -1 });

        if (payments && payments.length > 0) {
          return res.status(200).json({
            success: true,
            payments: payments.map(p => ({
              id: p._id.toString(),
              razorpay_payment_id: p.razorpayPaymentId || p._id.toString(),
              razorpay_order_id: p.razorpayOrderId,
              user_id: p.memberId,
              member_name: p.memberName,
              plan_id: p.planId,
              plan_name: p.planName,
              amount: p.amount,
              currency: p.currency,
              status: p.status,
              receipt: p.receiptNumber,
              created_at: p.createdAt
            }))
          });
        }
      } catch (err) {
        console.warn('MongoDB payment history lookup error, using memory ledger:', err.message);
      }
    }

    const filtered = userRole === 'ADMIN' 
      ? devPaymentsLedger 
      : devPaymentsLedger.filter(p => p.user_id === userId);

    return res.status(200).json({
      success: true,
      payments: filtered
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment history.'
    });
  }
});

/**
 * @route   GET /api/payments/invoice/:id
 * @desc    Generate tax receipt / invoice breakdown
 * @access  Private
 */
router.get('/invoice/:id', verifyAuth, async (req, res) => {
  try {
    let payment = null;

    if (mongoose.connection.readyState === 1) {
      payment = await Payment.findOne({
        $or: [
          { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null },
          { razorpayPaymentId: req.params.id },
          { receiptNumber: req.params.id }
        ]
      });
    }

    if (!payment) {
      payment = devPaymentsLedger.find(p => p.id === req.params.id || p.razorpay_payment_id === req.params.id);
    }

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found.'
      });
    }

    const amount = payment.amount || 24900;
    const basePrice = Math.round(amount / 1.18);
    const gstAmount = amount - basePrice;

    return res.status(200).json({
      success: true,
      invoice: {
        invoiceNumber: payment.receiptNumber || payment.receipt || `INV-${Date.now()}`,
        date: payment.createdAt || payment.created_at || new Date().toISOString(),
        facility: {
          name: 'PROFIT Training Club',
          address: '428 Lafayette Street, NoHo, New York / Bandra Kurla Complex, Mumbai',
          gstin: '27AABCP1337Q1Z5'
        },
        athlete: {
          name: payment.memberName || payment.member_name || 'Valued Athlete',
          id: payment.memberId || payment.user_id
        },
        item: {
          description: `${payment.planName || payment.plan_name || 'Membership'} (30 Days Unlimited Sanctuary Access)`,
          basePrice,
          gstRate: '18% GST',
          gstAmount,
          totalAmount: amount,
          currency: payment.currency || 'INR'
        },
        paymentGateway: {
          gateway: 'Razorpay Payments India',
          paymentId: payment.razorpayPaymentId || payment.razorpay_payment_id || 'pay_live_01',
          orderId: payment.razorpayOrderId || payment.razorpay_order_id || 'order_live_01',
          status: payment.status || 'PAID'
        }
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate invoice' });
  }
});

module.exports = router;
