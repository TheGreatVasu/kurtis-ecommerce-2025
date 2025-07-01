const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { protect, admin } = require('../middleware/auth');

// POST /api/contact - Save a contact message
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const contact = await Contact.create({ name, email, subject, message });
    res.status(201).json({ success: true, contact });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/contact - List all contact messages (admin only)
router.get('/', protect, admin, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, contacts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/contact/summary - Contact/message summary (admin only)
router.get('/summary', protect, admin, async (req, res) => {
  try {
    const count = await Contact.countDocuments();
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router; 