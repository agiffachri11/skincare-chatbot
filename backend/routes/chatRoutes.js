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

router.get('/products', async (req, res) => {
    try {
      const products = await Product.find();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

module.exports = router;