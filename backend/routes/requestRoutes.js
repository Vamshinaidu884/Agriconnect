const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getRequests, createRequest, getRequest, updateRequest, deleteRequest,
  acceptRequest, withdrawRequest, completeRequest, getMyRequests,
} = require('../controllers/requestController');

router.get('/', protect, getRequests);
router.post('/', protect, createRequest);
router.get('/my', protect, getMyRequests);
router.get('/:id', protect, getRequest);
router.put('/:id', protect, updateRequest);
router.delete('/:id', protect, deleteRequest);
router.post('/:id/accept', protect, acceptRequest);
router.post('/:id/withdraw', protect, withdrawRequest);
router.post('/:id/complete', protect, completeRequest);

module.exports = router;
