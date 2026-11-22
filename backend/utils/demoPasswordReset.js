const DEMO_PASSWORD_RESET_OTP = '126128';
const DEMO_EMAIL_PATTERN = /^agriconnect\.test\.[a-z0-9._+-]+@example\.com$/i;
const LOCAL_MONGO_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

const isDemoPasswordResetEnabled = (email, env = process.env) => {
  if (
    !['development', 'test'].includes(env.NODE_ENV) ||
    env.DEMO_PASSWORD_RESET_ENABLED !== 'true' ||
    !DEMO_EMAIL_PATTERN.test(String(email || ''))
  ) {
    return false;
  }

  try {
    const mongoHost = new URL(env.MONGODB_URI).hostname.replace(/^\[|\]$/g, '');
    return LOCAL_MONGO_HOSTS.has(mongoHost);
  } catch {
    return false;
  }
};

module.exports = { DEMO_PASSWORD_RESET_OTP, isDemoPasswordResetEnabled };
