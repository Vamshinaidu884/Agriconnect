const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getMarketPrices, getWeather } = require('../controllers/marketController');

router.get('/prices', protect, getMarketPrices);
router.get('/weather', protect, getWeather);

module.exports = router;
