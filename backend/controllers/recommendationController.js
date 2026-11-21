const Machine = require('../models/Machine');
const Request = require('../models/Request');
const { rankWithKnn } = require('../services/knnRecommendationService');

const getRecommendations = async (req, res, next) => {
  try {
    const recentRequests = await Request.find({
      farmerId: req.user._id,
      type: 'machine',
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('category priceOffered')
      .lean();

    const preferredType = typeof req.query.type === 'string'
      ? req.query.type
      : recentRequests[0]?.category;
    const prices = recentRequests
      .map((request) => Number(request.priceOffered))
      .filter(Number.isFinite);
    const targetPrice = prices.length > 0
      ? prices.reduce((sum, price) => sum + price, 0) / prices.length
      : undefined;
    const machines = await Machine.find().sort({ createdAt: -1 }).lean();
    const recommendations = rankWithKnn(machines, {
      location: req.user.location,
      preferredType,
      targetPrice,
      limit: 8,
    });

    res.json({
      success: true,
      recommendations,
      preferences: {
        serviceType: preferredType || null,
        locationUsed: Boolean(req.user.location?.lat || req.user.location?.lng),
        pastRequestsConsidered: recentRequests.length,
      },
      explanation: 'Ranked with K-Nearest Neighbors using distance, rating, price, availability, and service type.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRecommendations };
