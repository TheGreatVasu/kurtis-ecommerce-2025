class Cart {
    constructor() {
        this.items = this.getCartFromStorage();
        this.cartItemsContainer = document.getElementById('cartItems');
        this.emptyCartMessage = document.getElementById('emptyCartMessage');
        this.cartContent = document.getElementById('cartContent');
        this.subtotalElement = document.getElementById('subtotal');
        this.shippingElement = document.getElementById('shipping');
        this.taxElement = document.getElementById('tax');
        this.totalElement = document.getElementById('total');
        this.checkoutBtn = document.getElementById('checkoutBtn');
        this.applyCouponBtn = document.getElementById('applyCoupon');
        this.couponCodeInput = document.getElementById('couponCode');
        
        this.init();
    }

    init() {
        this.renderCart();
        this.updateCartCount();
        this.bindEvents();
    }

    bindEvents() {
        // Bind checkout button
        this.checkoutBtn.addEventListener('click', () => this.handleCheckout());

        // Bind coupon button
        this.applyCouponBtn.addEventListener('click', () => this.applyCoupon());

        // Update cart count when storage changes
        window.addEventListener('storage', () => {
            this.items = this.getCartFromStorage();
            this.renderCart();
            this.updateCartCount();
        });
    }

    getCartFromStorage() {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    }

    saveCartToStorage() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    updateCartCount() {
        const cartCount = this.items.reduce((total, item) => total + item.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = cartCount;
        });
    }

    renderCart() {
        if (this.items.length === 0) {
            this.emptyCartMessage.style.display = 'block';
            this.cartContent.style.display = 'none';
            return;
        }

        this.emptyCartMessage.style.display = 'none';
        this.cartContent.style.display = 'block';
        
        this.cartItemsContainer.innerHTML = this.items.map(item => this.createCartItemHTML(item)).join('');
        
        // Bind quantity controls and remove buttons after rendering
        this.bindCartItemEvents();
        
        // Update totals
        this.updateTotals();
    }

    createCartItemHTML(item) {
        return `
            <div class="cart-item" data-id="${item._id}" data-size="${item.size || ''}">
                <div class="row align-items-center">
                    <div class="col-md-2">
                        <img src="${item.imageUrl}" alt="${item.title}" class="cart-item-image">
                    </div>
                    <div class="col-md-4">
                        <div class="cart-item-details">
                            <h5 class="cart-item-title">${item.title}</h5>
                            <p class="cart-item-price">₹${item.price.toFixed(2)}</p>
                            <p class="cart-item-size">Size: ${item.size}</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="cart-quantity-controls">
                            <button class="btn btn-outline-secondary decrease-quantity" data-id="${item._id}" data-size="${item.size || ''}">-</button>
                            <input type="number" class="form-control quantity-input" value="${item.quantity}" min="1" max="10" data-id="${item._id}" data-size="${item.size || ''}">
                            <button class="btn btn-outline-secondary increase-quantity" data-id="${item._id}" data-size="${item.size || ''}">+</button>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <p class="fw-bold">₹${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div class="col-md-1">
                        <a href="#" class="remove-item" data-id="${item._id}" data-size="${item.size || ''}">Remove</a>
                    </div>
                </div>
            </div>
        `;
    }

    bindCartItemEvents() {
        // Bind quantity decrease buttons
        this.cartItemsContainer.querySelectorAll('.decrease-quantity').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const size = e.target.dataset.size;
                this.updateItemQuantity(id, size, 'decrease');
            });
        });

        // Bind quantity increase buttons
        this.cartItemsContainer.querySelectorAll('.increase-quantity').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const size = e.target.dataset.size;
                this.updateItemQuantity(id, size, 'increase');
            });
        });

        // Bind quantity input changes
        this.cartItemsContainer.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const id = e.target.dataset.id;
                const size = e.target.dataset.size;
                const newQuantity = parseInt(e.target.value);
                if (newQuantity > 0 && newQuantity <= 10) {
                    this.updateItemQuantity(id, size, 'set', newQuantity);
                }
            });
        });

        // Bind remove buttons
        this.cartItemsContainer.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const id = e.target.dataset.id;
                const size = e.target.dataset.size;
                this.removeItem(id, size);
            });
        });
    }

    updateItemQuantity(id, size, action, value = null) {
        const itemIndex = this.items.findIndex(item => item._id === id && (item.size || '') === (size || ''));
        if (itemIndex === -1) return;

        switch (action) {
            case 'increase':
                if (this.items[itemIndex].quantity < 10) {
                    this.items[itemIndex].quantity++;
                }
                break;
            case 'decrease':
                if (this.items[itemIndex].quantity > 1) {
                    this.items[itemIndex].quantity--;
                }
                break;
            case 'set':
                this.items[itemIndex].quantity = value;
                break;
        }

        this.saveCartToStorage();
        this.renderCart();
        this.updateCartCount();
    }

    removeItem(id, size) {
        this.items = this.items.filter(item => !(item._id === id && (item.size || '') === (size || '')));
        this.saveCartToStorage();
        this.renderCart();
        this.updateCartCount();
    }

    updateTotals() {
        const subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        const shipping = subtotal >= 999 ? 0 : 99;
        const tax = subtotal * 0.18; // 18% GST
        const total = subtotal + shipping + tax;

        this.subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
        this.shippingElement.textContent = `₹${shipping.toFixed(2)}`;
        this.taxElement.textContent = `₹${tax.toFixed(2)}`;
        this.totalElement.textContent = `₹${total.toFixed(2)}`;
    }

    applyCoupon() {
        const couponCode = this.couponCodeInput.value.trim().toUpperCase();
        
        // Example coupon codes
        const validCoupons = {
            'WELCOME10': 10,
            'SUMMER20': 20,
            'FESTIVE30': 30
        };

        if (validCoupons[couponCode]) {
            const discount = validCoupons[couponCode];
            alert(`Coupon applied successfully! ${discount}% discount will be applied at checkout.`);
            this.couponCodeInput.value = '';
        } else {
            alert('Invalid coupon code. Please try again.');
        }
    }

    handleCheckout() {
        if (this.items.length === 0) {
            alert('Your cart is empty. Please add items before checking out.');
            return;
        }

        // Here you would typically redirect to a checkout page or open a checkout modal
        alert('Proceeding to checkout...');
        // window.location.href = '/checkout.html';
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Cart();
}); 