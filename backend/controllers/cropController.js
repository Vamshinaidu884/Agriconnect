/* ============================================================
   Crop Recommendation Controller — Rule-based engine
   ============================================================ */

// Crop data by state and season
const CROP_DATA = {
  ap: {
    kharif: [
      { name: 'Rice (Paddy)', emoji: '🌾', yield: '5–6 t/ha', risk: 'low', water: 'High', soil: 'Clay loam' },
      { name: 'Cotton', emoji: '🏳️', yield: '2–3 t/ha', risk: 'medium', water: 'Medium', soil: 'Black soil' },
      { name: 'Groundnut', emoji: '🥜', yield: '1.5–2 t/ha', risk: 'low', water: 'Low', soil: 'Sandy loam' },
      { name: 'Red Gram (Tur)', emoji: '🫘', yield: '1–1.5 t/ha', risk: 'low', water: 'Low', soil: 'All soils' },
    ],
    rabi: [
      { name: 'Bengal Gram', emoji: '🫘', yield: '1.5–2 t/ha', risk: 'low', water: 'Low', soil: 'Sandy loam' },
      { name: 'Sunflower', emoji: '🌻', yield: '1–1.5 t/ha', risk: 'medium', water: 'Medium', soil: 'All soils' },
      { name: 'Chillies', emoji: '🌶️', yield: '2–3 t/ha', risk: 'medium', water: 'Medium', soil: 'Loam' },
    ],
  },
  ts: {
    kharif: [
      { name: 'Rice (Paddy)', emoji: '🌾', yield: '5–6 t/ha', risk: 'low', water: 'High', soil: 'Clay loam' },
      { name: 'Cotton', emoji: '🏳️', yield: '2–2.5 t/ha', risk: 'medium', water: 'Medium', soil: 'Black soil' },
      { name: 'Maize', emoji: '🌽', yield: '6–8 t/ha', risk: 'low', water: 'Medium', soil: 'All soils' },
      { name: 'Soybean', emoji: '🫘', yield: '2–3 t/ha', risk: 'medium', water: 'Medium', soil: 'Loam' },
    ],
    rabi: [
      { name: 'Bengal Gram', emoji: '🫘', yield: '1.5–2 t/ha', risk: 'low', water: 'Low', soil: 'Sandy loam' },
      { name: 'Jowar', emoji: '🌾', yield: '2–3 t/ha', risk: 'low', water: 'Low', soil: 'Black soil' },
    ],
  },
  tn: {
    kharif: [
      { name: 'Rice (Paddy)', emoji: '🌾', yield: '5–7 t/ha', risk: 'low', water: 'High', soil: 'Clay loam' },
      { name: 'Sugarcane', emoji: '🎋', yield: '80–100 t/ha', risk: 'medium', water: 'High', soil: 'Loam' },
      { name: 'Banana', emoji: '🍌', yield: '30–40 t/ha', risk: 'medium', water: 'High', soil: 'Rich loam' },
    ],
    rabi: [
      { name: 'Black Gram', emoji: '🫘', yield: '1–1.5 t/ha', risk: 'low', water: 'Low', soil: 'Sandy loam' },
      { name: 'Groundnut', emoji: '🥜', yield: '1.5–2 t/ha', risk: 'low', water: 'Low', soil: 'Sandy loam' },
    ],
  },
  ka: {
    kharif: [
      { name: 'Ragi (Finger Millet)', emoji: '🌾', yield: '3–4 t/ha', risk: 'low', water: 'Low', soil: 'Red soil' },
      { name: 'Maize', emoji: '🌽', yield: '6–8 t/ha', risk: 'low', water: 'Medium', soil: 'All soils' },
      { name: 'Rice (Paddy)', emoji: '🌾', yield: '4–5 t/ha', risk: 'low', water: 'High', soil: 'Clay loam' },
      { name: 'Arecanut', emoji: '🌴', yield: '2–3 t/ha', risk: 'medium', water: 'High', soil: 'Laterite' },
    ],
    rabi: [
      { name: 'Jowar', emoji: '🌾', yield: '2–3 t/ha', risk: 'low', water: 'Low', soil: 'Black soil' },
      { name: 'Sunflower', emoji: '🌻', yield: '1–1.5 t/ha', risk: 'medium', water: 'Medium', soil: 'Loam' },
    ],
  },
  kl: {
    kharif: [
      { name: 'Rice (Paddy)', emoji: '🌾', yield: '4–5 t/ha', risk: 'low', water: 'High', soil: 'Clay loam' },
      { name: 'Coconut', emoji: '🥥', yield: '10,000 nuts/ha', risk: 'low', water: 'Medium', soil: 'Sandy loam' },
      { name: 'Rubber', emoji: '🌳', yield: '1.5–2 t/ha', risk: 'low', water: 'High', soil: 'Laterite' },
      { name: 'Pepper', emoji: '🫑', yield: '0.5–1 t/ha', risk: 'medium', water: 'High', soil: 'Rich loam' },
    ],
    rabi: [
      { name: 'Tapioca', emoji: '🥔', yield: '25–35 t/ha', risk: 'low', water: 'Low', soil: 'Sandy loam' },
    ],
  },
  mh: {
    kharif: [
      { name: 'Soybean', emoji: '🫘', yield: '2–3 t/ha', risk: 'medium', water: 'Medium', soil: 'Black soil' },
      { name: 'Cotton', emoji: '🏳️', yield: '2–3 t/ha', risk: 'medium', water: 'Medium', soil: 'Black soil' },
      { name: 'Groundnut', emoji: '🥜', yield: '1.5–2 t/ha', risk: 'low', water: 'Low', soil: 'Sandy loam' },
    ],
    rabi: [
      { name: 'Wheat', emoji: '🌾', yield: '3–4 t/ha', risk: 'low', water: 'Medium', soil: 'Black soil' },
      { name: 'Chickpea', emoji: '🫘', yield: '1.5–2 t/ha', risk: 'low', water: 'Low', soil: 'Sandy loam' },
    ],
  },
};

// Default recommendations for states not in database
const DEFAULT_CROPS = {
  kharif: [
    { name: 'Rice (Paddy)', emoji: '🌾', yield: '4–6 t/ha', risk: 'low', water: 'High', soil: 'Clay loam' },
    { name: 'Maize', emoji: '🌽', yield: '5–7 t/ha', risk: 'low', water: 'Medium', soil: 'All soils' },
    { name: 'Groundnut', emoji: '🥜', yield: '1.5–2 t/ha', risk: 'low', water: 'Low', soil: 'Sandy loam' },
  ],
  rabi: [
    { name: 'Wheat', emoji: '🌾', yield: '3–5 t/ha', risk: 'low', water: 'Medium', soil: 'Loam' },
    { name: 'Chickpea', emoji: '🫘', yield: '1.5–2 t/ha', risk: 'low', water: 'Low', soil: 'Sandy loam' },
  ],
};

/**
 * Determine crop season based on month (1-12).
 * Kharif: June–November (months 6–11)
 * Rabi: December–May (months 12, 1–5)
 */
const getSeasonForMonth = (month) => {
  return month >= 6 && month <= 11 ? 'kharif' : 'rabi';
};

/**
 * @route   GET /api/crops/recommend
 * @desc    Get crop recommendations by state and season
 * @access  Private
 */
const getCropRecommendations = async (req, res, next) => {
  try {
    const { state, season } = req.query;

    const stateKey = (state || '').toLowerCase();
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const resolvedSeason = season || getSeasonForMonth(currentMonth);

    const stateData = CROP_DATA[stateKey] || DEFAULT_CROPS;
    const crops = stateKey && CROP_DATA[stateKey]
      ? CROP_DATA[stateKey][resolvedSeason] || []
      : DEFAULT_CROPS[resolvedSeason] || [];

    res.json({
      success: true,
      state: stateKey,
      season: resolvedSeason,
      currentMonth,
      crops,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCropRecommendations };
