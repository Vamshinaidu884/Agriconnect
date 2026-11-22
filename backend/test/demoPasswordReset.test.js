const test = require('node:test');
const assert = require('node:assert/strict');
const { DEMO_PASSWORD_RESET_OTP, isDemoPasswordResetEnabled } = require('../utils/demoPasswordReset');

const enabledLocalConfig = {
  NODE_ENV: 'development',
  DEMO_PASSWORD_RESET_ENABLED: 'true',
  MONGODB_URI: 'mongodb://127.0.0.1:27017/agrimatch',
};

test('allows the fixed demo OTP only for synthetic accounts on local development databases', () => {
  assert.equal(DEMO_PASSWORD_RESET_OTP, '126128');
  assert.equal(
    isDemoPasswordResetEnabled('agriconnect.test.farmer@example.com', enabledLocalConfig),
    true
  );
  assert.equal(
    isDemoPasswordResetEnabled('agriconnect.test.farmer@gmail.com', enabledLocalConfig),
    false
  );
  assert.equal(
    isDemoPasswordResetEnabled('person@example.com', enabledLocalConfig),
    false
  );
});

test('disables the demo OTP in production and with remote MongoDB', () => {
  assert.equal(
    isDemoPasswordResetEnabled('agriconnect.test.farmer@example.com', {
      ...enabledLocalConfig,
      NODE_ENV: 'production',
    }),
    false
  );
  assert.equal(
    isDemoPasswordResetEnabled('agriconnect.test.farmer@example.com', {
      ...enabledLocalConfig,
      MONGODB_URI: 'mongodb+srv://cluster.example.net/agrimatch',
    }),
    false
  );
  assert.equal(
    isDemoPasswordResetEnabled('agriconnect.test.farmer@example.com', {
      ...enabledLocalConfig,
      DEMO_PASSWORD_RESET_ENABLED: 'false',
    }),
    false
  );
});
