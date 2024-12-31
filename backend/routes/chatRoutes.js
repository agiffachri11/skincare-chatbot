const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// Protected route (perlu login)
router.post('/chat', protect, chatController.handleChat);

// Public route (tidak perlu login)
router.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

module.exports = router;