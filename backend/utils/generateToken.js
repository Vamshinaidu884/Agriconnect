/* ============================================================
   JWT Token Generator
   ============================================================ */
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'agri_connect_local_dev_secret_2026';

/**
 * Generate a signed JWT token for the given user ID.
 * @param {string} id - MongoDB user _id
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;
