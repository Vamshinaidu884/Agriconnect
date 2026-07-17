/* ============================================================
   User Controller — Profile management
   ============================================================ */
const User = require('../models/User');
const { uploadToCloudinary } = require('../middleware/upload');

/**
 * @route   GET /api/users/profile
 * @desc    Get current user's profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password -resetOTP -resetOTPExpiry');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user's profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name', 'phone', 'village', 'district', 'state', 'pincode',
      'experience', 'languages', 'serviceRadius', 'roles', 'location',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -resetOTP -resetOTPExpiry');

    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/users/avatar
 * @desc    Upload profile image to Cloudinary
 * @access  Private
 */
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'agrimatch/avatars');

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: result.secure_url },
      { new: true }
    ).select('-password -resetOTP -resetOTPExpiry');

    res.json({
      success: true,
      message: 'Profile image updated',
      profileImage: result.secure_url,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/:id
 * @desc    Get a user's public profile by ID
 * @access  Private
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name profileImage district state roles rating totalRatings completedJobs experience languages createdAt'
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, uploadAvatar, getUserById };
