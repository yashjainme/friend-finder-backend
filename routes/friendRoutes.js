const express = require('express');
const { 
  getFriends, 
  sendFriendRequest, 
  respondToFriendRequest, 
  removeFriend,
  getRecommendations 
} = require('../controllers/friendController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getFriends);
router.post('/request', protect, sendFriendRequest);
router.post('/respond', protect, respondToFriendRequest);
router.delete('/:friendId', protect, removeFriend);
router.get('/recommendations', protect, getRecommendations);

module.exports = router;