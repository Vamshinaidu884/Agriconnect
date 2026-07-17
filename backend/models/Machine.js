/* ============================================================
   Machine Model — Machinery listings by Machine Owners
   ============================================================ */
const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Machine name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    type: {
      type: String,
      required: [true, 'Machine type is required'],
      trim: true,
    },
    description: { type: String, trim: true, default: '' },

    // Pricing
    pricePerDay: {
      type: Number,
      required: [true, 'Price per day is required'],
      min: 0,
    },
    priceUnit: {
      type: String,
      enum: ['per_day', 'per_hour', 'per_acre'],
      default: 'per_day',
    },

    // Images (Cloudinary URLs)
    images: [{ type: String }],

    // Owner info (denormalized)
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ownerName: { type: String, required: true },
    ownerPhone: { type: String, default: '' },

    // Location
    district: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    location: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },

    // Availability
    available: { type: Boolean, default: true },

    // Specifications (flexible key-value)
    specifications: {
      type: Map,
      of: String,
      default: {},
    },

    // Stats
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

machineSchema.index({ ownerId: 1 });
machineSchema.index({ type: 1 });
machineSchema.index({ available: 1 });

module.exports = mongoose.model('Machine', machineSchema);
