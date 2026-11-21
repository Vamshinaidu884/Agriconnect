/* ============================================================
   Request Controller — CRUD + FCFS Accept/Withdraw/Complete
   ============================================================ */
const Request = require('../models/Request');
const User = require('../models/User');
const { processAcceptance, processWithdrawal } = require('../services/fcfsService');
const { filterByRadius } = require('../services/haversineService');

/**
 * @route   GET /api/requests
 * @desc    Get requests with optional filters (nearby, type, status, mine)
 * @access  Private
 */
const getRequests = async (req, res, next) => {
  try {
    const {
      lat, lng, radius = 20,
      type, status, farmerId,
      page = 1, limit = 20,
    } = req.query;

    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (farmerId) query.farmerId = farmerId;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNumber - 1) * pageSize;
    let requests;
    let total;

    // Apply Haversine distance filter if coordinates provided
    if (lat !== undefined && lng !== undefined) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const radiusKm = parseFloat(radius);
      const nearbyRequests = filterByRadius(
        await Request.find(query).sort({ createdAt: -1 }).lean(),
        userLat,
        userLng,
        radiusKm
      );
      total = nearbyRequests.length;
      requests = nearbyRequests.slice(skip, skip + pageSize);
    } else {
      [requests, total] = await Promise.all([
        Request.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(pageSize)
          .lean(),
        Request.countDocuments(query),
      ]);
    }

    res.json({
      success: true,
      requests,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/requests
 * @desc    Create a new farm job request (Farmer only)
 * @access  Private
 */
const createRequest = async (req, res, next) => {
  try {
    const user = req.user;
    const {
      title, description, type, category, subType,
      workersNeeded, location, district, state,
      date, timeSlot, priceOffered, priceUnit,
      foodProvided, driverRequired, landArea, landUnit,
    } = req.body;

    const finalCategory = category || subType;
    const safeLocation = location && typeof location === 'object'
      ? {
          lat: Number(location.lat ?? 0),
          lng: Number(location.lng ?? 0),
          address: location.address || '',
        }
      : { lat: 0, lng: 0, address: '' };

    if (!title || !type || !finalCategory || !workersNeeded || !date || !priceOffered) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const request = await Request.create({
      title,
      description: description || '',
      type,
      category: finalCategory,
      workersNeeded: parseInt(workersNeeded),
      location: safeLocation,
      district: district || user.district,
      state: state || user.state,
      date: new Date(date),
      timeSlot: timeSlot || 'morning',
      priceOffered: parseFloat(priceOffered),
      priceUnit: priceUnit || 'per_day',
      foodProvided: !!foodProvided,
      driverRequired: !!driverRequired,
      landArea: landArea ? parseFloat(landArea) : 0,
      landUnit: landUnit || 'acres',
      farmerId: user._id,
      farmerName: user.name,
      farmerPhone: user.phone || '',
      farmerRating: user.rating || 0,
    });

    res.status(201).json({ success: true, message: 'Request posted successfully', request });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/requests/:id
 * @desc    Get a single request by ID
 * @access  Private
 */
const getRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id).lean();
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    res.json({ success: true, request });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/requests/:id
 * @desc    Update a request (Farmer who owns it)
 * @access  Private
 */
const updateRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this request' });
    }

    if (['completed', 'expired'].includes(request.status)) {
      return res.status(400).json({ success: false, message: 'Cannot update a completed or expired request' });
    }

    const allowedUpdates = ['title', 'description', 'workersNeeded', 'date', 'timeSlot',
      'priceOffered', 'priceUnit', 'foodProvided', 'driverRequired', 'landArea', 'landUnit'];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) request[field] = req.body[field];
    });

    await request.save();
    res.json({ success: true, message: 'Request updated successfully', request });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/requests/:id
 * @desc    Delete a request (Farmer who owns it)
 * @access  Private
 */
const deleteRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    if (request.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this request' });
    }

    await request.deleteOne();
    res.json({ success: true, message: 'Request deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/requests/:id/accept
 * @desc    Accept a job request (FCFS — first come first served)
 * @access  Private
 */
const acceptRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const result = processAcceptance(request, req.user);
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    // FCFS: add to accepted list
    request.acceptedUsers.push({
      userId: req.user._id,
      userName: req.user.name,
      userPhone: req.user.phone || '',
      userRating: req.user.rating || 0,
    });
    request.workersAccepted = request.acceptedUsers.length;

    // Auto-activate when all slots filled
    if (request.workersAccepted >= request.workersNeeded) {
      request.status = 'active';
    }

    await request.save();
    res.json({ success: true, message: 'Request accepted successfully!', request });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/requests/:id/withdraw
 * @desc    Withdraw from an accepted request
 * @access  Private
 */
const withdrawRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const result = processWithdrawal(request, req.user);
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    request.acceptedUsers = request.acceptedUsers.filter(
      (u) => u.userId.toString() !== req.user._id.toString()
    );
    request.workersAccepted = request.acceptedUsers.length;

    // Revert to pending if slots open up
    if (request.status === 'active' && request.workersAccepted < request.workersNeeded) {
      request.status = 'pending';
    }

    await request.save();
    res.json({ success: true, message: 'Withdrawn successfully', request });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/requests/:id/complete
 * @desc    Mark a request as completed (Farmer only)
 * @access  Private
 */
const completeRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    if (request.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the farmer can mark this as completed' });
    }
    if (request.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Request is already completed' });
    }

    request.status = 'completed';
    await request.save();

    // Increment completedJobs for accepted workers
    const workerIds = request.acceptedUsers.map((u) => u.userId);
    await User.updateMany(
      { _id: { $in: workerIds } },
      { $inc: { completedJobs: 1 } }
    );
    // Increment for farmer too
    await User.findByIdAndUpdate(request.farmerId, { $inc: { completedJobs: 1 } });

    res.json({ success: true, message: 'Request marked as completed', request });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/requests/my
 * @desc    Get requests for the logged-in user (posted or accepted)
 * @access  Private
 */
const getMyRequests = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Requests posted by this farmer
    const posted = await Request.find({ farmerId: userId }).sort({ createdAt: -1 }).lean();

    // Requests accepted by this user (as labour/machine owner)
    const accepted = await Request.find({
      'acceptedUsers.userId': userId,
    }).sort({ createdAt: -1 }).lean();

    res.json({ success: true, posted, accepted });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRequests, createRequest, getRequest, updateRequest, deleteRequest,
  acceptRequest, withdrawRequest, completeRequest, getMyRequests,
};
