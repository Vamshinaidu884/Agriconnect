/* ============================================================
   Request Model — Farm Job Requests with FCFS slot management
   ============================================================ */
const mongoose = require('mongoose');

const acceptedUserSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userPhone: { type: String, default: '' },
    userRating: { type: Number, default: 0 },
    acceptedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ratingSchema = new mongoose.Schema(
  {
    ratedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ratedFor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: '' },
    ratedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const requestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: { type: String, trim: true, default: '' },

    // Labour or Machine request
    type: {
      type: String,
      enum: ['labour', 'machine'],
      required: [true, 'Request type is required'],
    },

    // Sub-category (e.g. harvest_worker, tractor)
    category: { type: String, required: [true, 'Category is required'], trim: true },

    // Workers/machines needed and FCFS slot tracking
    workersNeeded: { type: Number, required: true, min: 1, max: 100 },
    workersAccepted: { type: Number, default: 0 },
    acceptedUsers: [acceptedUserSchema],

    // Location
    location: {
      lat: { type: Number, required: [true, 'Latitude is required'] },
      lng: { type: Number, required: [true, 'Longitude is required'] },
      address: { type: String, default: '' },
    },
    district: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },

    // Schedule
    date: { type: Date, required: [true, 'Date is required'] },
    timeSlot: {
      type: String,
      enum: ['morning', 'afternoon', 'fullday'],
      default: 'morning',
    },

    // Payment
    priceOffered: { type: Number, required: [true, 'Price is required'], min: 0 },
    priceUnit: {
      type: String,
      enum: ['per_day', 'per_hour', 'per_acre'],
      default: 'per_day',
    },

    // Options
    foodProvided: { type: Boolean, default: false },
    driverRequired: { type: Boolean, default: false }, // for machine requests
    landArea: { type: Number, default: 0 },
    landUnit: { type: String, enum: ['acres', 'hectares'], default: 'acres' },

    // Status
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'expired'],
      default: 'pending',
    },

    // Farmer info (denormalized for performance)
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    farmerName: { type: String, required: true },
    farmerPhone: { type: String, default: '' },
    farmerRating: { type: Number, default: 0 },

    // Ratings given after completion
    ratings: [ratingSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Index for geo-queries and common filters ─────────────────
requestSchema.index({ 'location.lat': 1, 'location.lng': 1 });
requestSchema.index({ status: 1 });
requestSchema.index({ farmerId: 1 });
requestSchema.index({ type: 1 });
requestSchema.index({ date: 1 });

module.exports = mongoose.model('Request', requestSchema);
