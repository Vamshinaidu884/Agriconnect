const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  register, login, changePassword, forgotPassword, resetPassword,
} = require('../controllers/authController');

// Validation rules
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').trim().matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit Indian mobile number required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const loginRules = [
  body('identifier').optional().custom((value) => {
    const identifier = String(value || '').trim();
    if (/^\S+@\S+\.\S+$/.test(identifier) || /^[6-9]\d{9}$/.test(identifier)) return true;
    throw new Error('Enter a valid email or 10-digit Indian mobile number');
  }),
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body().custom((_, { req }) => {
    if (req.body.identifier || req.body.email) return true;
    throw new Error('Email or phone number is required');
  }),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordRules = [
  body('email').trim().isEmail().withMessage('Enter a valid email address').normalizeEmail(),
];

const resetPasswordRules = [
  body('email').trim().isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('otp').trim().matches(/^\d{6}$/).withMessage('Enter the six-digit code from your email'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Please confirm your new password')
    .bail()
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('New passwords do not match'),
];

router.post('/register', registerRules, register);
router.post('/login', loginRules, login);
router.post('/change-password', protect, changePasswordRules, changePassword);
router.post('/forgot-password', forgotPasswordRules, forgotPassword);
router.post('/reset-password', resetPasswordRules, resetPassword);

module.exports = router;
