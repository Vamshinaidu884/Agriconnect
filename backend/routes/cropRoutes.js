const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getCropRecommendations } = require('../controllers/cropController');

router.get('/recommend', protect, getCropRecommendations);

module.exports = router;
