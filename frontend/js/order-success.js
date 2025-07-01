document.addEventListener('DOMContentLoaded', function() {
  const orderSummary = document.getElementById('orderSummary');
  const order = JSON.parse(localStorage.getItem('lastOrder') || 'null');
  if (!order) {
    orderSummary.innerHTML = "<div class='alert alert-danger'>No recent order found.</div>";
    return;
  }
  orderSummary.innerHTML = `
    <div class="order-success-card">
      <h3>
        <span>Order ID:</span> 
        <a class="order-id-link" href="#" title="Copy Order ID">
          ${(order._id || order.id || 'N/A')}
          <i class="bi bi-clipboard"></i>
        </a>
      </h3>
      <div class="mb-2">Total: <strong>₹${order.total || order.amount || 'N/A'}</strong></div>
      <div class="mb-2">Status: <span class="badge"><i class="bi bi-check-circle-fill me-1"></i>${order.status || 'Paid'}</span></div>
      <div class="mb-2 fw-bold"><i class="bi bi-bag-check-fill me-1"></i>Order Items:</div>
      <ul>
        ${(order.items || []).map(item => `
          <li>${item.title} <span class="text-muted">x${item.quantity}</span> - ₹${item.price * item.quantity}</li>
        `).join('')}
      </ul>
      <div class="mb-2 fw-bold"><i class="bi bi-credit-card-2-front-fill me-1"></i>Payment Info:</div>
      <div class="mb-1"><strong>Payment ID:</strong> ${order.payment?.razorpay_payment_id || ''}</div>
      <div class="mb-1"><strong>Order ID:</strong> ${order.payment?.razorpay_order_id || ''}</div>
    </div>
  `;
  // Optional: Copy order ID to clipboard on click
  const orderIdLink = document.querySelector('.order-id-link');
  if (orderIdLink) {
    orderIdLink.addEventListener('click', function(e) {
      e.preventDefault();
      navigator.clipboard.writeText(order._id || order.id || '');
      orderIdLink.innerHTML = 'Copied! <i class="bi bi-clipboard-check"></i>';
      setTimeout(() => {
        orderIdLink.innerHTML = `${order._id || order.id || 'N/A'} <i class="bi bi-clipboard"></i>`;
      }, 1200);
    });
  }
}); 