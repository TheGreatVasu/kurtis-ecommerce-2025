const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: String, required: false }, // or ObjectId if you have users
  items: [
    {
      _id: String,
      title: String,
      price: Number,
      quantity: Number,
      size: String,
      color: String,
      imageUrl: String
    }
  ],
  shipping: {
    name: String,
    email: String,
    address: String,
    city: String,
    state: String,
    zip: String
  },
  total: Number,
  status: { type: String, default: 'Pending' },
  payment: {
    razorpay_payment_id: String,
    razorpay_order_id: String,
    razorpay_signature: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema); 