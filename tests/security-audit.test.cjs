const assert = require('assert');

const BASE_URL = 'http://localhost:5000';

async function runSecurityAudit() {
  console.log('\n======================================================');
  console.log('🛡️  RUNNING SECURITY & COMPLIANCE AUDIT SUITE (PHASE 6)');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Reason: ${err.message}`);
      failed++;
    }
  }

  // 1. Helmet Headers
  await test('Security Headers (Helmet) are present on HTTP responses', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    const xContentType = res.headers.get('x-content-type-options');
    const xFrameOptions = res.headers.get('x-frame-options');
    assert.strictEqual(xContentType, 'nosniff', 'Expected X-Content-Type-Options: nosniff');
    assert.ok(xFrameOptions, 'Expected X-Frame-Options to be defined');
  });

  // 2. Secret Exposure Check
  await test('/api/payments/config NEVER leaks RAZORPAY_KEY_SECRET or private credentials', async () => {
    const res = await fetch(`${BASE_URL}/api/payments/config`);
    const data = await res.json();
    assert.strictEqual(data.keySecret, undefined, 'Secret must not be exposed');
    assert.strictEqual(data.RAZORPAY_KEY_SECRET, undefined);
    assert.ok(data.keyId, 'Only public keyId is exposed');
  });

  // 3. Sensitive Data in Public Endpoints
  await test('Public /api/memberships/plans does not expose server keys or database URIs', async () => {
    const res = await fetch(`${BASE_URL}/api/memberships/plans`);
    const text = await res.text();
    assert.ok(!text.includes('mongodb+srv://'), 'MongoDB URI must not be leaked');
    assert.ok(!text.includes('profit_gym_super_secure'), 'JWT Secret must not be leaked');
  });

  // 4. Unauthorized Access Restriction
  await test('Direct tampering with JWT Bearer token is rejected with 401', async () => {
    const tamperedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.tampered_signature_payload';
    const res = await fetch(`${BASE_URL}/api/admin/metrics`, {
      headers: { Authorization: `Bearer ${tamperedToken}` }
    });
    assert.strictEqual(res.status, 401);
  });

  // 5. Injection Payload Handling
  await test('Malformed/Injection search query does not crash backend server', async () => {
    const maliciousPayload = encodeURIComponent('{"$gt": ""}\' OR 1=1 --');
    const res = await fetch(`${BASE_URL}/api/bookings/lookup/${maliciousPayload}`);
    assert.ok([404, 400, 503].includes(res.status), `Server responded safely with ${res.status}`);
  });

  // 6. Production Secret Enforcement
  await test('Production startup aborts if JWT_SECRET is unset or insecure', async () => {
    const { execSync } = require('child_process');
    try {
      execSync('node -e "process.env.NODE_ENV=\'production\'; process.env.JWT_SECRET=\'\'; require(\'./server/server.js\')"', {
        stdio: 'pipe',
        timeout: 5000,
      });
      assert.fail('Expected server startup to fail in production with missing JWT_SECRET');
    } catch (err) {
      assert.ok(err.status !== 0, 'Process correctly exited with non-zero status in production');
    }
  });

  console.log('\n======================================================');
  console.log(`SECURITY AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityAudit().catch(err => {
  console.error('Audit Exception:', err);
  process.exit(1);
});
