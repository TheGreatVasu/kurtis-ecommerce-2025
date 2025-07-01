const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/auth');
const { saveOrder } = require('../controllers/orderController');

// POST /api/orders - Create a new order
router.post('/', protect, saveOrder);

// GET /api/orders - List all orders (admin only)
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/orders/:id - Update order status (admin only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/orders/summary - Order summary (admin only)
router.get('/summary', protect, admin, async (req, res) => {
  try {
    const count = await Order.countDocuments();
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get recent orders for admin dashboard
router.get('/recent', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name')
      .sort('-createdAt')
      .limit(5);
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router; 