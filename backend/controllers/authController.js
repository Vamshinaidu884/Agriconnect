/* ============================================================
   Auth Controller — Register, Login, Forgot/Reset Password
   ============================================================ */
const { validationResult } = require('express-validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { generateOTP, getOTPExpiry } = require('../utils/generateOTP');
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

    const { name, email, phone, password, roles, state, district, village, pincode, location } = req.body;
    if (
      location &&
      (!Number.isFinite(Number(location.lat)) ||
        !Number.isFinite(Number(location.lng)) ||
        Math.abs(Number(location.lat)) > 90 ||
        Math.abs(Number(location.lng)) > 180)
    ) {
      return res.status(400).json({ success: false, message: 'Valid location coordinates are required' });
    }

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
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
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Security: don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If that email is registered, you will receive an OTP shortly.',
      });
    }

    const otp = generateOTP();
    const expiry = getOTPExpiry();

    // Save OTP (hashed not needed for short-lived OTP)
    user.resetOTP = otp;
    user.resetOTPExpiry = expiry;
    await user.save({ validateBeforeSave: false });

    // Send email
    try {
      await sendPasswordResetOTP(user.email, user.name, otp);
    } catch (emailError) {
      console.error('Email send error:', emailError.message);
      // In dev, log the OTP for testing
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔑 OTP for ${email}: ${otp}`);
      }
    }

    res.json({
      success: true,
      message: 'If that email is registered, you will receive an OTP shortly.',
      ...(process.env.NODE_ENV === 'development' && { devOTP: otp }),
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
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email }).select('+resetOTP +resetOTPExpiry');
    if (!user || !user.resetOTP) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    if (user.resetOTP !== otp) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP' });
    }

    if (user.resetOTPExpiry < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Update password and clear OTP
    user.password = newPassword;
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully. Please log in.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, forgotPassword, resetPassword };
