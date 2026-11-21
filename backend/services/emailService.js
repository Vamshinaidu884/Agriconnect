/* ============================================================
   Email Service — Nodemailer for OTP-based password reset
   ============================================================ */
const nodemailer = require('nodemailer');

/**
 * Create a Nodemailer transporter using Gmail SMTP.
 * Set EMAIL_USER and EMAIL_PASS in your .env file.
 * Use a Gmail App Password (not your regular password).
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send a password reset OTP email.
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} otp - 6-digit OTP
 */
const sendPasswordResetOTP = async (email, name, otp) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Agri Connect 🌾" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Agri Connect — Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2E7D32;">🌾 Agri Connect</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>You requested a password reset. Use the OTP below to reset your password.</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #2E7D32; letter-spacing: 8px; margin: 0;">${otp}</h1>
        </div>
        <p style="color: #666; font-size: 14px;">This OTP expires in <strong>10 minutes</strong>.</p>
        <p style="color: #666; font-size: 14px;">If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">Agri Connect — Connecting Farmers, Labour & Machine Owners</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetOTP };
