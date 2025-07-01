// checkout.js - Modern Razorpay integration for Aniyah

// Razorpay script loader
(function loadRazorpayScript() {
  if (!document.getElementById('razorpay-sdk')) {
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.head.appendChild(script);
  }
})();

const payBtn = document.getElementById('rzpPayBtn');
const paymentStatus = document.getElementById('paymentStatus');

// Get cart total from localStorage (customize if your cart logic is different)
function getCartTotal() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Main payment flow
async function createOrderAndPay() {
  const statusDiv = document.getElementById('checkout-status');
  statusDiv.textContent = 'Creating order...';

  const amount = getCartTotal();
  if (!amount) {
    statusDiv.textContent = 'Your cart is empty!';
    return;
  }

  // Get email from form
  const emailInput = document.getElementById('email');
  const email = emailInput ? emailInput.value.trim() : '';

  try {
    // 1. Create order on backend
    const res = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ amount })
    });
    const data = await res.json();
    if (!data.success) {
      statusDiv.textContent = 'Order creation failed: ' + (data.error || 'Unknown error');
      return;
    }

    // 2. Open Razorpay payment popup
    const options = {
      key: data.order.key_id,
      amount: data.order.amount,
      currency: data.order.currency,
      name: "Aniyah Store",
      description: "Order Payment",
      order_id: data.order.id,
      handler: async function (response) {
        statusDiv.textContent = 'Payment successful! Payment ID: ' + response.razorpay_payment_id;
        // 3. Save order to backend
        try {
          const cart = JSON.parse(localStorage.getItem('cart') || '[]');
          const saveRes = await fetch('/api/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              cart,
              email // send email to backend
            })
          });
          const saveData = await saveRes.json();
          if (saveData.success) {
            localStorage.removeItem('cart');
            localStorage.setItem('lastOrder', JSON.stringify(saveData.order));
            window.location.href = 'order-success.html';
          } else {
            statusDiv.textContent += ' (Order save failed: ' + (saveData.error || 'Unknown error') + ')';
          }
        } catch (err) {
          statusDiv.textContent += ' (Order save error)';
        }
      },
      prefill: {
        email: data.order.email || email || ""
      },
      theme: {
        color: "#e44d6c"
      },
      modal: {
        ondismiss: function() {
          statusDiv.textContent = 'Payment cancelled.';
        }
      }
    };
    const rzp = new Razorpay(options);
    rzp.open();
    statusDiv.textContent = '';
  } catch (err) {
    statusDiv.textContent = 'Error: ' + err.message;
  }
}

// Attach event listener to the payment button
if (payBtn) {
  payBtn.addEventListener('click', createOrderAndPay);
}

// Render cart items and totals on checkout page
function renderCheckoutCart() {
  const items = JSON.parse(localStorage.getItem('cart') || '[]');
  const orderItemsDiv = document.getElementById('orderItems');
  const subtotalEl = document.getElementById('orderSubtotal');
  const shippingEl = document.getElementById('orderShipping');
  const taxEl = document.getElementById('orderTax');
  const totalEl = document.getElementById('orderTotal');
  if (!orderItemsDiv) return;
  if (items.length === 0) {
    orderItemsDiv.innerHTML = '<em>Your cart is empty.</em>';
    subtotalEl.textContent = '₹0';
    shippingEl.textContent = '₹0';
    taxEl.textContent = '₹0';
    totalEl.textContent = '₹0';
    payBtn.disabled = true;
    return;
  }
  let html = '<ul class="list-unstyled mb-3">';
  let subtotal = 0;
  items.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    html += `<li class="mb-2 d-flex justify-content-between align-items-center">
      <span>${item.title} <span class="text-muted">x${item.quantity}</span></span>
      <span>₹${itemTotal.toFixed(2)}</span>
    </li>`;
  });
  html += '</ul>';
  orderItemsDiv.innerHTML = html;
  const shipping = subtotal >= 999 ? 0 : 99;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;
  subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
  shippingEl.textContent = `₹${shipping.toFixed(2)}`;
  taxEl.textContent = `₹${tax.toFixed(2)}`;
  totalEl.textContent = `₹${total.toFixed(2)}`;
  payBtn.disabled = false;
}
document.addEventListener('DOMContentLoaded', renderCheckoutCart); 