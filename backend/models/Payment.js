const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  user: String,
  amount: Number,
  status: String,
  razorpay_payment_id: String,
  razorpay_order_id: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', PaymentSchema); 