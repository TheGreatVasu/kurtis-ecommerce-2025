const Order = require('../models/Order');
const sendMail = require('../utils/mailer');

exports.saveOrder = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, cart, email } = req.body;
    // Save the order
    const order = await Order.create({
      user: req.user.id || req.user._id || '',
      items: cart,
      payment: {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature
      },
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: 'Paid'
    });

    // Send confirmation email
    if (email) {
      const orderItemsHtml = (cart || []).map(item =>
        `<li>${item.title} x${item.quantity} - ₹${item.price * item.quantity}</li>`
      ).join('');
      const html = `
        <h2>Thank you for your order at Aniyah!</h2>
        <p>Your order has been placed and payment was successful.</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <p><strong>Total:</strong> ₹${order.total}</p>
        <h3>Order Items:</h3>
        <ul>${orderItemsHtml}</ul>
        <h3>Payment Info:</h3>
        <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
        <p><strong>Order ID:</strong> ${razorpay_order_id}</p>
        <br>
        <p>Our team will contact you soon for your address and shipping details.</p>
        <p>Thank you for shopping with Aniyah!</p>
      `;
      try {
        await sendMail({
          to: email,
          subject: 'Your Aniyah Order Confirmation',
          html
        });
      } catch (mailErr) {
        // Log but don't fail the order if email fails
        console.error('Order email failed:', mailErr);
      }
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Order save failed' });
  }
}; 