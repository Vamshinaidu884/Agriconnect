const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, forgotPassword, resetPassword } = require('../controllers/authController');

// Validation rules
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit Indian mobile number required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
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

router.post('/register', registerRules, register);
router.post('/login', loginRules, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
