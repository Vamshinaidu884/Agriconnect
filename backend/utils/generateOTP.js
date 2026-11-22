const crypto = require('crypto');

/**
 * Generate a 6-digit OTP.
 * @returns {string} 6-digit OTP string
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const getOTPExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000);
};

const hashOTP = (email, otp) => (
  crypto.createHmac('sha256', process.env.JWT_SECRET)
    .update(`${email}:${otp}`)
    .digest('hex')
);

const verifyOTP = (email, otp, expectedHash) => {
  if (!/^\d{6}$/.test(String(otp)) || !/^[a-f\d]{64}$/i.test(expectedHash || '')) {
    return false;
  }

  const submittedHash = Buffer.from(hashOTP(email, String(otp)), 'hex');
  const storedHash = Buffer.from(expectedHash, 'hex');
  return crypto.timingSafeEqual(submittedHash, storedHash);
};

module.exports = { generateOTP, getOTPExpiry, hashOTP, verifyOTP };
