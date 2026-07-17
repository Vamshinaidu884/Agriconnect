/* ============================================================
   Market Controller — Mandi prices (mock) + Weather (real API)
   ============================================================ */
const { getCurrentWeather } = require('../services/weatherService');

// Mock market price data (replace with real API in production)
const MARKET_PRICES = [
  { crop: 'Rice (Paddy)', emoji: '🌾', currentPrice: 2200, previousPrice: 2100, unit: 'per quintal', mandi: 'Guntur', trend: 'up', change: 4.8 },
  { crop: 'Cotton', emoji: '🏳️', currentPrice: 6800, previousPrice: 7100, unit: 'per quintal', mandi: 'Warangal', trend: 'down', change: -4.2 },
  { crop: 'Groundnut', emoji: '🥜', currentPrice: 5500, previousPrice: 5200, unit: 'per quintal', mandi: 'Anantapur', trend: 'up', change: 5.8 },
  { crop: 'Red Gram', emoji: '🫘', currentPrice: 8200, previousPrice: 7800, unit: 'per quintal', mandi: 'Kurnool', trend: 'up', change: 5.1 },
  { crop: 'Maize', emoji: '🌽', currentPrice: 2000, previousPrice: 2050, unit: 'per quintal', mandi: 'Karimnagar', trend: 'down', change: -2.4 },
  { crop: 'Chillies', emoji: '🌶️', currentPrice: 15000, previousPrice: 13500, unit: 'per quintal', mandi: 'Guntur', trend: 'up', change: 11.1 },
  { crop: 'Sugarcane', emoji: '🎋', currentPrice: 3100, previousPrice: 2900, unit: 'per tonne', mandi: 'Thanjavur', trend: 'up', change: 6.9 },
  { crop: 'Ragi', emoji: '🌾', currentPrice: 3800, previousPrice: 3600, unit: 'per quintal', mandi: 'Mysuru', trend: 'up', change: 5.6 },
  { crop: 'Coconut', emoji: '🥥', currentPrice: 12500, previousPrice: 13000, unit: 'per 1000 nuts', mandi: 'Thrissur', trend: 'down', change: -3.8 },
  { crop: 'Black Gram', emoji: '🫘', currentPrice: 7000, previousPrice: 6600, unit: 'per quintal', mandi: 'Madurai', trend: 'up', change: 6.1 },
  { crop: 'Wheat', emoji: '🌾', currentPrice: 2200, previousPrice: 2150, unit: 'per quintal', mandi: 'Amritsar', trend: 'up', change: 2.3 },
  { crop: 'Soybean', emoji: '🫘', currentPrice: 4500, previousPrice: 4300, unit: 'per quintal', mandi: 'Indore', trend: 'up', change: 4.7 },
];

/**
 * @route   GET /api/market/prices
 * @desc    Get current mandi crop prices
 * @access  Private
 */
const getMarketPrices = async (req, res, next) => {
  try {
    // Simulate slight price fluctuation for realism
    const prices = MARKET_PRICES.map((item) => ({
      ...item,
      lastUpdated: new Date().toISOString(),
    }));

    res.json({ success: true, prices, updatedAt: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/market/weather
 * @desc    Get current weather for given coordinates
 * @access  Private
 */
const getWeather = async (req, res, next) => {
  try {
    const { lat = 17.385, lng = 78.4867 } = req.query; // Default: Hyderabad
    const weather = await getCurrentWeather(parseFloat(lat), parseFloat(lng));
    res.json({ success: true, weather });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMarketPrices, getWeather };
