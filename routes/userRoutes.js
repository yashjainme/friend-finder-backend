const express = require('express');
const { searchUsers, getProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/search', protect, searchUsers);
router.get('/profile', protect, getProfile);

module.exports = router;