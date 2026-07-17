/* ============================================================
   Machine Controller — CRUD for machine listings
   ============================================================ */
const Machine = require('../models/Machine');
const { uploadToCloudinary } = require('../middleware/upload');

/**
 * @route   GET /api/machines
 * @desc    Get all machines (with optional filters)
 * @access  Private
 */
const getMachines = async (req, res, next) => {
  try {
    const { type, available, ownerId, state, district, page = 1, limit = 20 } = req.query;

    const query = {};
    if (type) query.type = type;
    if (available !== undefined) query.available = available === 'true';
    if (ownerId) query.ownerId = ownerId;
    if (state) query.state = state;
    if (district) query.district = district;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const machines = await Machine.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Machine.countDocuments(query);

    res.json({
      success: true,
      machines,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/machines
 * @desc    Create a new machine listing (Machine Owner)
 * @access  Private
 */
const createMachine = async (req, res, next) => {
  try {
    const user = req.user;
    const { name, type, description, pricePerDay, priceUnit, specifications } = req.body;

    if (!name || !type || !pricePerDay) {
      return res.status(400).json({ success: false, message: 'Name, type, and price are required' });
    }

    // Handle image uploads
    let images = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer, 'agrimatch/machines')
      );
      const results = await Promise.all(uploadPromises);
      images = results.map((r) => r.secure_url);
    }

    const machine = await Machine.create({
      name,
      type,
      description: description || '',
      pricePerDay: parseFloat(pricePerDay),
      priceUnit: priceUnit || 'per_day',
      images,
      ownerId: user._id,
      ownerName: user.name,
      ownerPhone: user.phone || '',
      district: user.district || '',
      state: user.state || '',
      location: user.location || { lat: 0, lng: 0 },
      specifications: specifications ? new Map(Object.entries(specifications)) : {},
    });

    res.status(201).json({ success: true, message: 'Machine listed successfully', machine });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/machines/:id
 * @desc    Get a single machine by ID
 * @access  Private
 */
const getMachine = async (req, res, next) => {
  try {
    const machine = await Machine.findById(req.params.id).lean();
    if (!machine) {
      return res.status(404).json({ success: false, message: 'Machine not found' });
    }
    res.json({ success: true, machine });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/machines/:id
 * @desc    Update a machine (Owner only)
 * @access  Private
 */
const updateMachine = async (req, res, next) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) {
      return res.status(404).json({ success: false, message: 'Machine not found' });
    }
    if (machine.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this machine' });
    }

    const allowedUpdates = ['name', 'description', 'pricePerDay', 'priceUnit', 'available', 'specifications'];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) machine[field] = req.body[field];
    });

    await machine.save();
    res.json({ success: true, message: 'Machine updated', machine });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/machines/:id
 * @desc    Delete a machine (Owner only)
 * @access  Private
 */
const deleteMachine = async (req, res, next) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) {
      return res.status(404).json({ success: false, message: 'Machine not found' });
    }
    if (machine.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this machine' });
    }

    await machine.deleteOne();
    res.json({ success: true, message: 'Machine deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMachines, createMachine, getMachine, updateMachine, deleteMachine };
