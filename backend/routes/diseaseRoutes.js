const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { detectDisease } = require('../controllers/diseaseController');

router.post('/detect', protect, upload.single('image'), detectDisease);

module.exports = router;
