/* ============================================================
   Rating Controller — Post-completion ratings between users
   ============================================================ */
const Request = require('../models/Request');
const User = require('../models/User');

/**
 * @route   POST /api/ratings/:requestId
 * @desc    Submit a rating for a user after request completion
 * @access  Private
 */
const submitRating = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { targetUserId, score, comment } = req.body;
    const raterId = req.user._id.toString();

    if (!targetUserId || !score) {
      return res.status(400).json({ success: false, message: 'Target user and score are required' });
    }

    const scoreNum = Number(score);
    if (!Number.isInteger(scoreNum) || scoreNum < 1 || scoreNum > 5) {
      return res.status(400).json({ success: false, message: 'Score must be between 1 and 5' });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Ratings can only be submitted for completed requests' });
    }

    // Verify rater is involved in this request
    const isFarmer = request.farmerId.toString() === raterId;
    const isWorker = request.acceptedUsers.some((u) => u.userId.toString() === raterId);

    if (!isFarmer && !isWorker) {
      return res.status(403).json({ success: false, message: 'You are not part of this request' });
    }

    const isValidTarget = isFarmer
      ? request.acceptedUsers.some((user) => user.userId.toString() === targetUserId)
      : request.farmerId.toString() === targetUserId;
    if (!isValidTarget || targetUserId === raterId) {
      return res.status(400).json({ success: false, message: 'You can only rate another participant in this request' });
    }

    // Check if already rated this user for this request
    const alreadyRated = request.ratings.some(
      (rating) =>
        rating.ratedBy?.toString() === raterId &&
        rating.ratedFor?.toString() === targetUserId
    );
    if (alreadyRated) {
      return res.status(400).json({ success: false, message: 'You have already rated this user for this request' });
    }

    // Add rating to request document
    request.ratings.push({
      ratedBy: req.user._id,
      ratedFor: targetUserId,
      score: scoreNum,
      comment: comment || '',
    });
    await request.save();

    // Update target user's average rating
    const targetUser = await User.findById(targetUserId);
    if (targetUser) {
      await targetUser.updateRating(scoreNum);
    }

    res.json({ success: true, message: 'Rating submitted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitRating };
