const assert = require('assert');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'server/.env' });

const BASE_URL = 'http://localhost:5000';
const JWT_SECRET = process.env.JWT_SECRET || 'profit_gym_super_secure_jwt_secret_key_2026_x92';

async function runApiTests() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING BACKEND & API TEST SUITE (PHASES 3, 4, 5)');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;
  const results = [];

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
      results.push({ name, status: 'PASSED' });
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Reason: ${err.message}`);
      failed++;
      results.push({ name, status: 'FAILED', error: err.message });
    }
  }

  // Generate valid test JWTs to avoid test-runner coupling to login limiter
  const adminToken = jwt.sign(
    { id: 'usr_admin_01', email: 'admin@profitgym.com', role: 'ADMIN', fullName: 'Dev Baliyan' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const memberToken = jwt.sign(
    { id: 'usr_member_01', email: 'alex.vance@athlete.com', role: 'MEMBER', fullName: 'Alex Vance' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // --- HEALTH & ROUTE TESTS ---
  await test('GET /api/health returns 200 with online status', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert.strictEqual(data.status, 'online');
    assert.ok(data.service.includes('PROFIT'));
    assert.ok(data.database);
  });

  await test('GET /api root info returns 200 with endpoints list', async () => {
    const res = await fetch(`${BASE_URL}/api`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.endpoints);
  });

  await test('GET /api/nonexistent-route returns 404', async () => {
    const res = await fetch(`${BASE_URL}/api/nonexistent-route`);
    assert.strictEqual(res.status, 404);
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  // --- MEMBERSHIPS & WORKOUTS ---
  await test('GET /api/memberships/plans returns active plans catalog', async () => {
    const res = await fetch(`${BASE_URL}/api/memberships/plans`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.data));
    assert.ok(data.data.length >= 3, 'Expected at least 3 tiers');
    const starter = data.data.find(p => p.id === 'plan-starter' || p.slug === 'starter-tier');
    assert.ok(starter, 'Starter tier exists');
  });

  await test('GET /api/workouts/plans returns workout plans catalog', async () => {
    const res = await fetch(`${BASE_URL}/api/workouts/plans`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.data));
    assert.ok(data.data.length > 0);
  });

  // --- CONTACT & TRIAL FORMS VALIDATION ---
  await test('POST /api/contact rejects empty submission with 400', async () => {
    const res = await fetch(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  await test('POST /api/contact accepts valid inquiry and returns reference', async () => {
    const res = await fetch(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Auditor Athlete',
        email: 'auditor@gymtest.com',
        phone: '+1 (212) 555-9090',
        subject: 'Facility Equipment Inspection',
        message: 'Checking facility hours and Olympic platform availability.'
      }),
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.reference.includes('-CT-'));
  });

  await test('POST /api/trials rejects missing required fields with 400', async () => {
    const res = await fetch(`${BASE_URL}/api/trials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Only Name' }),
    });
    assert.strictEqual(res.status, 400);
  });

  await test('POST /api/trials accepts valid trial request and generates TR reference', async () => {
    const res = await fetch(`${BASE_URL}/api/trials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Automated QA Lead',
        email: 'qa.lead@gymtest.com',
        phone: '+1 (212) 555-8123',
        discipline: 'Hypertrophy & Power',
        notes: 'Testing trial creation pipeline.'
      }),
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.reference.includes('-TR-'));
  });

  await test('POST /api/bookings creates coaching session and GET /lookup retrieves it', async () => {
    const res = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'coached_session',
        fullName: 'Test Athlete Coached',
        email: `coached_${Date.now()}@testgym.com`,
        phone: '+1 (212) 555-8888',
        program: 'Olympic Barbell Technique',
        trainer: 'Marcus Drake',
        date: '2026-10-25',
        time: '02:00 PM',
      }),
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.bookingReference);

    // Test public lookup endpoint
    const lookupRes = await fetch(`${BASE_URL}/api/bookings/lookup/${data.data.bookingReference}`);
    assert.strictEqual(lookupRes.status, 200);
    const lookupData = await lookupRes.json();
    assert.strictEqual(lookupData.success, true);
    assert.strictEqual(lookupData.data.bookingReference, data.data.bookingReference);
  });

  // --- AUTHENTICATION & RATE LIMITING ---
  await test('POST /api/auth/login behaves securely (200 on valid credentials or 429 when rate-limited)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@profitgym.com',
        password: 'password123'
      }),
    });
    assert.ok(
      res.status === 200 || res.status === 429,
      `Expected 200 or 429, got ${res.status}`
    );
    const data = await res.json();
    if (res.status === 200) {
      assert.strictEqual(data.success, true);
      assert.ok(data.token);
    } else {
      assert.strictEqual(data.success, false);
      assert.ok(data.message.includes('Too many login attempts'));
    }
  });

  await test('POST /api/auth/login rejects wrong password with 401 or 429 rate limit', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@profitgym.com',
        password: 'incorrect_password_attempt'
      }),
    });
    assert.ok(
      res.status === 401 || res.status === 429,
      `Expected 401 or 429, got ${res.status}`
    );
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  await test('POST /api/auth/register rejects missing required fields with 400', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Tester' }),
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  await test('POST /api/auth/register registers new user and returns JWT token', async () => {
    const testEmail = `athlete_${Date.now()}@testgym.com`;
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'New Athlete Test',
        email: testEmail,
        password: 'strongPassword123',
        phone: '+1 (212) 555-4321',
      }),
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.token);
    assert.strictEqual(data.user.email, testEmail);
  });

  // --- ROLE-BASED ACCESS CONTROL (RBAC) ---
  await test('GET /api/admin/metrics blocks unauthenticated requests with 401', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/metrics`);
    assert.strictEqual(res.status, 401);
  });

  await test('GET /api/admin/metrics blocks MEMBER role with 403 Forbidden', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/metrics`, {
      headers: { Authorization: `Bearer ${memberToken}` }
    });
    assert.strictEqual(res.status, 403);
  });

  await test('GET /api/admin/telemetry succeeds for ADMIN role with 200', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/telemetry`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.totalMembers > 0);
  });

  await test('GET /api/admin/members supports search and tier query filtering', async () => {
    const resAll = await fetch(`${BASE_URL}/api/admin/members`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(resAll.status, 200);
    const dataAll = await resAll.json();
    assert.strictEqual(dataAll.success, true);
    assert.ok(dataAll.data.length >= 2);

    const resSearch = await fetch(`${BASE_URL}/api/admin/members?search=Alex`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(resSearch.status, 200);
    const dataSearch = await resSearch.json();
    assert.strictEqual(dataSearch.success, true);
    assert.ok(dataSearch.data.length >= 1);
    assert.ok(dataSearch.data.every(m => m.full_name.toLowerCase().includes('alex') || m.email.toLowerCase().includes('alex')));

    const resTier = await fetch(`${BASE_URL}/api/admin/members?tier=Elite`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(resTier.status, 200);
    const dataTier = await resTier.json();
    assert.strictEqual(dataTier.success, true);
    assert.ok(dataTier.data.every(m => m.tier.toLowerCase().includes('elite')));
  });

  await test('POST /api/admin/members creates new athlete in roster without database failure', async () => {
    const uniqueEmail = `test_athlete_${Date.now()}@profitgym.com`;
    const res = await fetch(`${BASE_URL}/api/admin/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        fullName: 'Test Athlete Enrolled',
        email: uniqueEmail,
        phone: '+1 (212) 555-9911',
        planId: 'plan-performance',
        trainer: 'Marcus Drake'
      })
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.email, uniqueEmail);
  });

  // --- ATTENDANCE SYSTEM ---
  await test('POST /api/attendance/check-in records valid check-in and prevents duplicates', async () => {
    const testMemberId = `qa_member_${Date.now()}`;
    const res = await fetch(`${BASE_URL}/api/attendance/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memberId: testMemberId,
        memberName: 'Alex Vance',
        method: 'qr_scan'
      }),
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.attendance);

    // Immediate duplicate check-in within cooldown window should be blocked
    const dupRes = await fetch(`${BASE_URL}/api/attendance/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memberId: testMemberId,
        memberName: 'Alex Vance',
        method: 'qr_scan'
      }),
    });
    assert.strictEqual(dupRes.status, 400);
    const dupData = await dupRes.json();
    assert.strictEqual(dupData.isDuplicate, true);
  });

  // --- PAYMENTS & WEBHOOKS ---
  await test('GET /api/payments/config returns payment configuration', async () => {
    const res = await fetch(`${BASE_URL}/api/payments/config`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.currency, 'INR');
    assert.ok(data.keyId);
  });

  await test('POST /api/payments/create-order creates order for authenticated user', async () => {
    const res = await fetch(`${BASE_URL}/api/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${memberToken}`
      },
      body: JSON.stringify({ planId: 'plan-performance' }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.order.id);
    assert.strictEqual(data.order.currency, 'INR');
  });

  await test('POST /api/payments/verify rejects missing payload with 400', async () => {
    const res = await fetch(`${BASE_URL}/api/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${memberToken}`
      },
      body: JSON.stringify({}),
    });
    assert.strictEqual(res.status, 400);
  });

  await test('POST /api/payments/verify validates correct HMAC SHA256 signature', async () => {
    const orderId = 'order_test_998877';
    const paymentId = 'pay_test_112233';
    const secret = process.env.RAZORPAY_KEY_SECRET || 'profit_gym_secret_dev_382910';
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const res = await fetch(`${BASE_URL}/api/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${memberToken}`
      },
      body: JSON.stringify({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature,
        planId: 'plan-performance'
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.verified, true);
  });

  console.log('\n======================================================');
  console.log(`API TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runApiTests().catch(err => {
  console.error('Test Runner Exception:', err);
  process.exit(1);
});
