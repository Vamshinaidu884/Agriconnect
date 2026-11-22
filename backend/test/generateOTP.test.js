const test = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = 'test-only-secret-for-otp-tests';

const { generateOTP, getOTPExpiry, hashOTP, verifyOTP } = require('../utils/generateOTP');

test('generates six-digit numeric OTPs', () => {
  assert.match(generateOTP(), /^\d{6}$/);
});

test('expires OTPs after ten minutes', () => {
  const before = Date.now();
  const expiry = getOTPExpiry().getTime();
  assert.ok(expiry >= before + 10 * 60 * 1000);
  assert.ok(expiry <= Date.now() + 10 * 60 * 1000);
});

test('verifies only the correct OTP for its email', () => {
  const email = 'user@example.com';
  const otp = '012345';
  const hash = hashOTP(email, otp);

  assert.notEqual(hash, otp);
  assert.equal(verifyOTP(email, otp, hash), true);
  assert.equal(verifyOTP(email, '543210', hash), false);
  assert.equal(verifyOTP('other@example.com', otp, hash), false);
  assert.equal(verifyOTP(email, '12345', hash), false);
});
