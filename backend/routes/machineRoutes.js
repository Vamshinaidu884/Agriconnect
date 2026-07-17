const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { getMachines, createMachine, getMachine, updateMachine, deleteMachine } = require('../controllers/machineController');

router.get('/', protect, getMachines);
router.post('/', protect, upload.array('images', 5), createMachine);
router.get('/:id', protect, getMachine);
router.put('/:id', protect, updateMachine);
router.delete('/:id', protect, deleteMachine);

module.exports = router;
