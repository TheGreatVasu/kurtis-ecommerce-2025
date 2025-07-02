// Removed import { fetchProduct, fetchSimilarProducts } from '../../data/mockData';
// Ensure all product data is fetched from the backend API only.

import config from './config.js';

// Utility to update cart count badge in navbar
function updateCartCountBadge() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count > 0 ? count : '';
        el.style.display = count > 0 ? 'inline-block' : 'none';
    });
}

// Function to load product details
async function loadProductDetails(id) {
    const spinner = document.getElementById("spinner");
    const productContainer = document.getElementById("productContainer");
    const errorContainer = document.getElementById("errorContainer");

    try {
        if (!id) {
            throw new Error('Invalid product ID');
        }

        if (spinner) spinner.style.display = "block";
        if (productContainer) productContainer.style.display = "none";
        if (errorContainer) errorContainer.style.display = "none";

        const response = await fetch(`${config.API_URL}/products/${id}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch product details');
        }

        if (!data.data) {
            throw new Error('Product not found');
        }

        const product = data.data;

        // Handle images
        let images = [];
        if (product.images && product.images.length > 0) {
            images = product.images.map(img => config.getProductImageUrl(img));
        } else if (product.imageUrl) {
            images.push(config.getProductImageUrl(product.imageUrl));
        }

        // Default values
        const colors = product.colors || ["#22223b", "#e44d6c", "#b8004c"];
        const tags = product.tags || ["fashion", "kurtis", "women"];
        const rating = product.rating || 4;
        const oldPrice = product.oldPrice || Math.floor(product.price * 1.2);

        // Update product container HTML
        if (productContainer) {
            productContainer.innerHTML = `
                <div class="product-card-modern">
                    <div class="product-image-col">
                        <img src="${images[0]}" class="main-image" id="mainProductImage" alt="${product.title}">
                    </div>
                    <div class="product-info">
                        <h1 class="product-title">${product.title}</h1>
                        <div class="d-flex align-items-center mb-3">
                            <div class="product-price">₹${product.price.toLocaleString('en-IN')}</div>
                            ${oldPrice ? `<span class="product-old-price">₹${oldPrice.toLocaleString('en-IN')}</span>` : ''}
                        </div>
                        <div class="star-rating">
                            ${'<i class="bi bi-star-fill"></i>'.repeat(Math.floor(rating))}
                            ${rating % 1 ? '<i class="bi bi-star-half"></i>' : ''}
                            ${'<i class="bi bi-star"></i>'.repeat(5 - Math.ceil(rating))}
                            <span class="ms-2 text-muted">(${rating}.0)</span>
                        </div>
                        <div class="product-desc">${product.description}</div>
                        <div class="product-meta">
                            <span class="selector-label">Category:</span>
                            <span class="category-pill">${product.category}</span>
                        </div>
                        <div class="product-tags">
                            <span class="selector-label">Tags:</span>
                            ${tags.map(tag => `<span class="tag-pill">${tag}</span>`).join('')}
                        </div>
                        <div class="mb-4">
                            <span class="selector-label">Color:</span>
                            ${colors.map((color, idx) => `
                                <span class="color-dot${idx === 0 ? ' selected' : ''}" 
                                      style="background:${color}" 
                                      data-color="${color}">
                                </span>
                            `).join('')}
                        </div>
                        ${product.sizes && product.sizes.length > 0 ? `
                            <div class="mb-4">
                                <span class="selector-label">Size:</span>
                                <div class="d-flex flex-wrap gap-2 mt-2">
                                    ${product.sizes.map((size, idx) => `
                                        <button type="button" 
                                                class="size-btn${idx === 0 ? ' btn-secondary' : ''}" 
                                                data-size="${size}">
                                            ${size}
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        <div class="qty-controls">
                            <span class="selector-label">Quantity:</span>
                            <button class="btn" id="decreaseQty">
                                <i class="bi bi-dash"></i>
                            </button>
                            <input type="number" id="qtyInput" value="1" min="1" max="10">
                            <button class="btn" id="increaseQty">
                                <i class="bi bi-plus"></i>
                            </button>
                        </div>
                        <button id="addToCartBtn" class="add-to-cart-btn">
                            <i class="bi bi-cart-plus"></i>
                            Add to Cart
                        </button>
                        <div class="social-icons">
                            <a href="#" title="Share on Facebook">
                                <i class="bi bi-facebook"></i>
                            </a>
                            <a href="#" title="Share on Instagram">
                                <i class="bi bi-instagram"></i>
                            </a>
                            <a href="#" title="Share on Twitter">
                                <i class="bi bi-twitter"></i>
                            </a>
                            <a href="#" title="Share on Pinterest">
                                <i class="bi bi-pinterest"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `;

            // Initialize event handlers
            initializeEventHandlers(product, images);
        }

        // Show product container and hide spinner
        if (spinner) spinner.style.display = "none";
        if (productContainer) productContainer.style.display = "block";

    } catch (error) {
        console.error('Error loading product:', error);
        if (spinner) spinner.style.display = "none";
        if (productContainer) productContainer.style.display = "none";
        if (errorContainer) {
            errorContainer.style.display = "block";
            errorContainer.innerHTML = `
                <div class="alert alert-danger">
                    ${error.message || 'Failed to load product details. Please try again later.'}
                </div>
            `;
        }
    }
}

// Function to initialize event handlers
function initializeEventHandlers(product, images) {
    // Color selection logic
    let selectedColor = product.colors ? product.colors[0] : "#22223b";
    document.querySelectorAll('.color-dot').forEach(dot => {
        dot.addEventListener('click', function() {
            document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'));
            this.classList.add('selected');
            selectedColor = this.getAttribute('data-color');
        });
    });

    // Size selection logic
    let selectedSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : null;
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('btn-secondary'));
            this.classList.add('btn-secondary');
            selectedSize = this.getAttribute('data-size');
        });
    });

    // Quantity logic
    const qtyInput = document.getElementById('qtyInput');
    const decreaseBtn = document.getElementById('decreaseQty');
    const increaseBtn = document.getElementById('increaseQty');

    if (qtyInput && decreaseBtn && increaseBtn) {
        decreaseBtn.addEventListener('click', () => {
            let val = parseInt(qtyInput.value);
            if (val > 1) {
                qtyInput.value = val - 1;
            }
        });

        increaseBtn.addEventListener('click', () => {
            let val = parseInt(qtyInput.value);
            if (val < 10) {
                qtyInput.value = val + 1;
            }
        });

        qtyInput.addEventListener('change', () => {
            let val = parseInt(qtyInput.value);
            if (val < 1) qtyInput.value = 1;
            if (val > 10) qtyInput.value = 10;
        });
    }

    // Add to Cart functionality
    const addToCartBtn = document.getElementById("addToCartBtn");
    if (addToCartBtn) {
        addToCartBtn.addEventListener("click", function() {
            const cart = JSON.parse(localStorage.getItem("cart") || "[]");
            const quantity = parseInt(qtyInput.value) || 1;
            
            const cartItem = {
                _id: product._id,
                title: product.title,
                price: product.price,
                imageUrl: images[0],
                quantity: quantity,
                size: selectedSize,
                color: selectedColor
            };

            const existing = cart.find(item => 
                item._id === product._id && 
                item.size === selectedSize && 
                item.color === selectedColor
            );

            if (existing) {
                existing.quantity = Math.min(existing.quantity + quantity, 10);
            } else {
                cart.push(cartItem);
            }

            localStorage.setItem("cart", JSON.stringify(cart));
            
            // Show success feedback
            const originalText = addToCartBtn.innerHTML;
            addToCartBtn.innerHTML = `<i class="bi bi-check2"></i> Added to Cart!`;
            addToCartBtn.style.background = 'var(--primary-dark)';
            
            setTimeout(() => {
                addToCartBtn.innerHTML = originalText;
                addToCartBtn.style.background = '';
            }, 2000);

            updateCartCountBadge();
        });
    }

    // Social share functionality
    document.querySelectorAll('.social-icons a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(product.title);
            
            let shareUrl = '';
            switch(link.title) {
                case 'Share on Facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                    break;
                case 'Share on Twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                    break;
                case 'Share on Pinterest':
                    shareUrl = `https://pinterest.com/pin/create/button/?url=${url}&description=${title}`;
                    break;
                case 'Share on Instagram':
                    // Instagram doesn't have a direct share URL, but we'll open Instagram
                    shareUrl = 'https://www.instagram.com/';
                    break;
            }
            
            window.open(shareUrl, '_blank', 'width=600,height=400');
        });
    });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    updateCartCountBadge();
    loadProductDetails(id);
});

document.addEventListener('DOMContentLoaded', () => {
    // Load top selling products
    loadTopSellingProducts();
});

async function loadTopSellingProducts() {
    const topSellingSection = document.querySelector('.top-selling-section');
    if (!topSellingSection) return;

    try {
        const response = await fetch(`${config.API_URL}/products?limit=4&sort=-rating`);
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            const productsHTML = data.data.map(product => `
                <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                    <div class="product-card card h-100">
                        <div class="product-image-wrapper">
                            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                            <img src="${config.getProductImageUrl(product.imageUrl)}" 
                                 class="card-img-top" 
                                 alt="${product.title}"
                                 onerror="this.src='img/placeholder.jpg'">
                        </div>
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${product.title}</h5>
                            <p class="card-text text-primary">₹${product.price.toFixed(2)}</p>
                            <p class="card-text"><small>${product.category}</small></p>
                            <a href="product.html?id=${product._id}" class="btn btn-primary mt-auto">View Details</a>
                        </div>
                    </div>
                </div>
            `).join('');

            topSellingSection.innerHTML = `
                <h2 class="section-title">Top Selling Kurtis</h2>
                <div class="row">${productsHTML}</div>
                <div class="text-center mt-4">
                    <a href="shop.html" class="btn btn-primary">View More</a>
                </div>
            `;
        } else {
            throw new Error('No products found');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        topSellingSection.innerHTML = `
            <h2 class="section-title">Top Selling Kurtis</h2>
            <div class="alert alert-danger">Error loading products.</div>
            <div class="text-center mt-4">
                <a href="shop.html" class="btn btn-primary">View More</a>
            </div>
        `;
    }
}

// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

// DOM Elements
const loadingOverlay = document.getElementById('loadingOverlay');
const productContainer = document.getElementById('productContainer');
const productImage = document.getElementById('mainProductImage');
const productThumbs = document.getElementById('productThumbs');
const productTitle = document.querySelector('.product-title');
const productPrice = document.querySelector('.product-price');
const productOldPrice = document.querySelector('.product-old-price');
const productDescription = document.querySelector('.product-desc');
const productCategory = document.querySelector('.category-pill');
const productTags = document.querySelector('.product-tags');
const colorOptions = document.getElementById('colorOptions');
const sizeOptions = document.getElementById('sizeOptions');
const qtyInput = document.getElementById('qtyInput');
const decreaseQtyBtn = document.getElementById('decreaseQty');
const increaseQtyBtn = document.getElementById('increaseQty');
const addToCartBtn = document.getElementById('addToCartBtn');

// State
let selectedColor = '';
let selectedSize = '';
let currentProduct = null;

// Functions
function showLoading() {
    if (loadingOverlay) loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    if (loadingOverlay) loadingOverlay.style.display = 'none';
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger m-3';
    errorDiv.textContent = message;
    document.querySelector('.product-detail-main').prepend(errorDiv);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(badge => {
        badge.textContent = count || '';
        badge.style.display = count ? 'inline-block' : 'none';
    });
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast show position-fixed top-0 end-0 m-3`;
    toast.style.zIndex = '1050';
    toast.innerHTML = `
        <div class="toast-header bg-${type} text-white">
            <strong class="me-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function formatPrice(price) {
    return price.toLocaleString('en-IN');
}

function createThumbnail(imageUrl, index) {
    const thumb = document.createElement('div');
    thumb.className = 'thumb-img';
    thumb.style.backgroundImage = `url(${imageUrl})`;
    thumb.style.backgroundSize = 'cover';
    thumb.style.backgroundPosition = 'center';
    thumb.addEventListener('click', () => {
        document.querySelectorAll('.thumb-img').forEach(t => t.classList.remove('selected'));
        thumb.classList.add('selected');
        if (productImage) productImage.src = imageUrl;
    });
    return thumb;
}

function createColorDot(color) {
    const dot = document.createElement('span');
    dot.className = 'color-dot';
    dot.style.backgroundColor = color;
    dot.addEventListener('click', () => {
        document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'));
        dot.classList.add('selected');
        selectedColor = color;
        updateAddToCartButton();
    });
    return dot;
}

function createSizeButton(size) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'size-btn';
    btn.textContent = size.toUpperCase();
    btn.addEventListener('click', () => {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedSize = size;
        updateAddToCartButton();
    });
    return btn;
}

function updateQuantity(value) {
    const newValue = Math.max(1, Math.min(10, value));
    if (qtyInput) qtyInput.value = newValue;
}

function updateAddToCartButton() {
    if (!addToCartBtn) return;
    const isValid = selectedColor && selectedSize;
    addToCartBtn.disabled = !isValid;
    addToCartBtn.style.opacity = isValid ? '1' : '0.7';
}

function addToCart() {
    if (!selectedColor || !selectedSize || !currentProduct) return;

    const quantity = parseInt(qtyInput?.value || '1');
    if (isNaN(quantity) || quantity < 1 || quantity > 10) {
        showToast('Please select a valid quantity (1-10)', 'danger');
        return;
    }

    const cartItem = {
        id: currentProduct._id,
        title: currentProduct.title,
        price: currentProduct.price,
        image: currentProduct.images[0],
        color: selectedColor,
        size: selectedSize,
        quantity: quantity
    };

    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    const existingItemIndex = cart.findIndex(item => 
        item.id === cartItem.id && 
        item.color === cartItem.color && 
        item.size === cartItem.size
    );

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity = Math.min(10, cart[existingItemIndex].quantity + quantity);
    } else {
        cart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast('Product added to cart successfully!');

    // Reset selections
    selectedColor = '';
    selectedSize = '';
    if (qtyInput) qtyInput.value = '1';
    document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'));
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
    updateAddToCartButton();
}

// Initialize
async function initializeProduct() {
    if (!productId) {
        showError('No product ID provided');
        return;
    }

    try {
        showLoading();
        const response = await fetch(`${config.API_URL}/products/${productId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success || !data.data) {
            throw new Error('Product not found');
        }

        currentProduct = data.data;

        // Update UI
        document.title = `${currentProduct.title} | Aniyah`;
        
        if (productImage) {
            productImage.src = currentProduct.images[0];
            productImage.alt = currentProduct.title;
        }

        if (productThumbs && Array.isArray(currentProduct.images)) {
            currentProduct.images.forEach((image, index) => {
                productThumbs.appendChild(createThumbnail(image, index));
            });
            productThumbs.firstElementChild?.classList.add('selected');
        }

        if (productTitle) productTitle.textContent = currentProduct.title;
        if (productPrice) productPrice.textContent = `₹${formatPrice(currentProduct.price)}`;
        if (productOldPrice) productOldPrice.textContent = `₹${formatPrice(currentProduct.price * 1.2)}`;
        if (productDescription) productDescription.textContent = currentProduct.description;
        if (productCategory) productCategory.textContent = currentProduct.category;

        // Add tags
        if (productTags && Array.isArray(currentProduct.tags)) {
            productTags.innerHTML = `
                <span class="selector-label">Tags:</span>
                ${currentProduct.tags.map(tag => `<span class="tag-pill">${tag}</span>`).join('')}
            `;
        }

        // Add color options
        if (colorOptions && Array.isArray(currentProduct.colors)) {
            currentProduct.colors.forEach(color => {
                colorOptions.appendChild(createColorDot(color));
            });
        }

        // Add size options
        if (sizeOptions && Array.isArray(currentProduct.sizes)) {
            currentProduct.sizes.forEach(size => {
                sizeOptions.appendChild(createSizeButton(size));
            });
        }

        // Set up quantity controls
        if (decreaseQtyBtn) {
            decreaseQtyBtn.addEventListener('click', () => {
                const currentVal = parseInt(qtyInput?.value || '1');
                updateQuantity(currentVal - 1);
            });
        }

        if (increaseQtyBtn) {
            increaseQtyBtn.addEventListener('click', () => {
                const currentVal = parseInt(qtyInput?.value || '1');
                updateQuantity(currentVal + 1);
            });
        }

        if (qtyInput) {
            qtyInput.addEventListener('change', (e) => {
                updateQuantity(parseInt(e.target.value) || 1);
            });
        }

        // Set up add to cart button
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', addToCart);
        }

        updateAddToCartButton();
        updateCartCount();

        if (productContainer) productContainer.style.display = 'block';

    } catch (error) {
        console.error('Error loading product:', error);
        showError(`Error loading product: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Start the app
console.log('Starting product page initialization...');
initializeProduct(); 