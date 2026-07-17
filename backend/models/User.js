/* ============================================================
   User Model — supports multi-role accounts
   ============================================================ */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned by default
    },
    profileImage: {
      type: String,
      default: '',
    },
    village: { type: String, trim: true, default: '' },
    district: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    pincode: { type: String, trim: true, default: '' },
    experience: { type: Number, default: 0, min: 0 }, // years
    languages: [{ type: String }],
    serviceRadius: { type: Number, default: 20, min: 1, max: 200 }, // km

    // Multiple roles allowed: farmer, labour, machine_owner
    roles: {
      type: [{ type: String, enum: ['farmer', 'labour', 'machine_owner'] }],
      default: [],
    },

    // Location for nearby search
    location: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },

    // Stats
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },

    // Password reset OTP
    resetOTP: { type: String, select: false },
    resetOTPExpiry: { type: Date, select: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Pre-save: hash password ──────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Method: compare password ─────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Method: update average rating ───────────────────────────
userSchema.methods.updateRating = async function (newScore) {
  const total = this.totalRatings + 1;
  this.rating = (this.rating * this.totalRatings + newScore) / total;
  this.totalRatings = total;
  await this.save();
};

module.exports = mongoose.model('User', userSchema);
