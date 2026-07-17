const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { getProfile, updateProfile, uploadAvatar, getUserById } = require('../controllers/userController');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.get('/:id', protect, getUserById);

module.exports = router;
