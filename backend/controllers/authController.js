/* ============================================================
   Auth Controller — Register, Login, Forgot/Reset Password
   ============================================================ */
const { validationResult } = require('express-validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { generateOTP, getOTPExpiry, hashOTP, verifyOTP } = require('../utils/generateOTP');
const {
  DEMO_PASSWORD_RESET_OTP,
  isDemoPasswordResetEnabled,
} = require('../utils/demoPasswordReset');
const { sendPasswordResetOTP } = require('../services/emailService');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const {
      name, password, roles, state, district, village, pincode, location,
    } = req.body;
    const email = String(req.body.email || '').trim().toLowerCase();
    const phone = String(req.body.phone || '').trim();
    if (
      location &&
      (!Number.isFinite(Number(location.lat)) ||
        !Number.isFinite(Number(location.lng)) ||
        Math.abs(Number(location.lat)) > 90 ||
        Math.abs(Number(location.lng)) > 180)
    ) {
      return res.status(400).json({ success: false, message: 'Valid location coordinates are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(409).json({ success: false, message: 'Phone number is already registered' });
    }

    if (String(password || '').length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      roles: roles || [],
      state: state || '',
      district: district || '',
      village: village || '',
      pincode: pincode || '',
      ...(location && {
        location: {
          lat: Number(location.lat),
          lng: Number(location.lng),
        },
      }),
    });

    const token = generateToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login and get JWT token
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { password } = req.body;
    const identifier = String(req.body.identifier || req.body.email || '').trim();

    // Find user with password field
    const query = identifier.includes('@')
      ? { email: identifier.toLowerCase() }
      : { phone: identifier };
    const user = await User.findOne(query).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send OTP to email for password reset
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const email = String(req.body.email || '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Enter a valid email address' });
    }

    const demoPasswordReset = isDemoPasswordResetEnabled(email);
    if (!demoPasswordReset && (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)) {
      return res.status(503).json({
        success: false,
        message: 'Password recovery email is not configured. Please contact support.',
      });
    }

    const user = await User.findOne({ email }).select('+resetOTPRequestedAt +resetOTPAttempts');
    if (!user) {
      return res.json({
        success: true,
        message: 'If that email is registered, you will receive an OTP shortly.',
      });
    }

    const now = new Date();
    if (
      user.resetOTPAttempts < 5 &&
      user.resetOTPRequestedAt &&
      now - user.resetOTPRequestedAt < 60 * 1000
    ) {
      return res.json({
        success: true,
        message: 'If that email is registered, you will receive an OTP shortly.',
      });
    }

    const otp = demoPasswordReset ? DEMO_PASSWORD_RESET_OTP : generateOTP();
    const otpHash = hashOTP(email, otp);
    user.resetOTP = undefined;
    user.resetOTPHash = otpHash;
    user.resetOTPExpiry = getOTPExpiry();
    user.resetOTPAttempts = 0;
    user.resetOTPRequestedAt = now;
    await user.save({ validateBeforeSave: false });

    if (!demoPasswordReset) {
      try {
        await sendPasswordResetOTP(user.email, user.name, otp);
      } catch (emailError) {
        await User.updateOne(
          { _id: user._id, resetOTPHash: otpHash },
          {
            $unset: { resetOTPHash: 1, resetOTPExpiry: 1, resetOTPRequestedAt: 1 },
            $set: { resetOTPAttempts: 0 },
          }
        );
        console.error(`Password recovery email failed (${emailError.name || 'Error'})`);
        return res.status(503).json({
          success: false,
          message: 'Could not send the recovery email. Please try again later.',
        });
      }
    }

    res.json({
      success: true,
      message: 'If that email is registered, you will receive an OTP shortly.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with OTP verification
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const email = String(req.body.email || '').trim().toLowerCase();
    const otp = String(req.body.otp || '').trim();
    const newPassword = String(req.body.newPassword || '');

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Enter a valid email address' });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ success: false, message: 'Enter the six-digit code from your email' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const user = await User.findOne({ email }).select(
      '+resetOTPHash +resetOTPExpiry +resetOTPAttempts'
    );
    if (!user || !user.resetOTPHash || !user.resetOTPExpiry) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    if (user.resetOTPExpiry <= new Date()) {
      await User.updateOne(
        { _id: user._id, resetOTPHash: user.resetOTPHash },
        {
          $unset: { resetOTPHash: 1, resetOTPExpiry: 1, resetOTPRequestedAt: 1 },
          $set: { resetOTPAttempts: 0 },
        }
      );
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (user.resetOTPAttempts >= 5) {
      return res.status(429).json({ success: false, message: 'Too many incorrect codes. Request a new one.' });
    }

    if (!verifyOTP(email, otp, user.resetOTPHash)) {
      const attempt = await User.findOneAndUpdate(
        {
          _id: user._id,
          resetOTPHash: user.resetOTPHash,
          resetOTPExpiry: { $gt: new Date() },
          resetOTPAttempts: { $lt: 5 },
        },
        { $inc: { resetOTPAttempts: 1 } },
        { new: true }
      );
      if (!attempt) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      }
      if (attempt.resetOTPAttempts >= 5) {
        return res.status(429).json({ success: false, message: 'Too many incorrect codes. Request a new one.' });
      }
      return res.status(400).json({ success: false, message: 'Incorrect code. Please check and try again.' });
    }

    const resetUser = await User.findOneAndUpdate(
      {
        _id: user._id,
        resetOTPHash: user.resetOTPHash,
        resetOTPExpiry: { $gt: new Date() },
        resetOTPAttempts: { $lt: 5 },
      },
      {
        $unset: { resetOTPHash: 1, resetOTPExpiry: 1, resetOTPRequestedAt: 1 },
        $set: { resetOTPAttempts: 0 },
      },
      { new: true }
    );
    if (!resetUser) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    resetUser.password = newPassword;
    await resetUser.save();

    res.json({ success: true, message: 'Password reset successfully. Please log in.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, forgotPassword, resetPassword };
