/* ============================================================
   OTP Generator for Password Reset
   ============================================================ */

/**
 * Generate a 6-digit OTP.
 * @returns {string} 6-digit OTP string
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Get OTP expiry time (10 minutes from now).
 * @returns {Date}
 */
const getOTPExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};

module.exports = { generateOTP, getOTPExpiry };
