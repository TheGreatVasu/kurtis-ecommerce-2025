const razorpay = require('../utils/razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  try {
    // Debug logging for Razorpay credentials
    console.log('Loaded Razorpay Key:', process.env.RAZORPAY_KEY_ID);
    console.log('Loaded Razorpay Secret:', process.env.RAZORPAY_KEY_SECRET ? '***' : 'MISSING');
    const { amount, currency = 'INR', receipt } = req.body;
    if (!amount || isNaN(amount)) {
      console.error('Invalid amount:', amount);
      return res.status(400).json({ success: false, error: 'Amount is required and must be a number.' });
    }
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay keys missing:', process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_KEY_SECRET);
      return res.status(500).json({ success: false, error: 'Razorpay keys not configured.' });
    }
    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1,
    };
    console.log('Creating Razorpay order with options:', options);
    const order = await razorpay.orders.create(options);
    res.json({ success: true, order: { ...order, key_id: process.env.RAZORPAY_KEY_ID } });
  } catch (err) {
    console.error('Error creating Razorpay order:', err.stack || err);
    res.status(500).json({ success: false, error: 'Failed to create payment order.' });
  }
};

// Razorpay webhook for payment verification and order saving
exports.razorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  const signature = req.headers['x-razorpay-signature'];
  const body = JSON.stringify(req.body);
  const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');
  if (signature !== expectedSignature) {
    return res.status(400).json({ success: false, error: 'Invalid signature' });
  }
  // Only handle payment authorized/captured events
  const event = req.body.event;
  if (event === 'payment.captured' || event === 'payment.authorized') {
    const payment = req.body.payload.payment.entity;
    const orderId = payment.order_id;
    // Save order to DB (customize as needed)
    await Order.create({
      user: payment.email || '',
      items: [], // You can link cart items by receipt/orderId if you store them
      shipping: {}, // You can link shipping by receipt/orderId if you store them
      total: payment.amount / 100,
      status: 'Paid',
      createdAt: new Date(payment.created_at * 1000)
    });
  }
  res.json({ success: true });
}; 