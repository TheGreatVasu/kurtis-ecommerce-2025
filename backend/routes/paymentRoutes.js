const express = require('express');
const { createOrder, razorpayWebhook } = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();
const bodyParser = require('body-parser');
const Payment = require('../models/Payment');

// Create a Razorpay order (user must be logged in)
router.post('/create-order', protect, createOrder);

// Razorpay webhook endpoint (must use raw body)
router.post('/webhook', bodyParser.json({ verify: (req, res, buf) => { req.rawBody = buf; } }), razorpayWebhook);

// List all payments (admin only)
router.get('/', protect, admin, async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Payment summary (admin only)
router.get('/summary', protect, admin, async (req, res) => {
  try {
    const count = await Payment.countDocuments();
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router; 