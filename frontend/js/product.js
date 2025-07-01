// Removed import { fetchProduct, fetchSimilarProducts } from '../../data/mockData';
// Ensure all product data is fetched from the backend API only.

// Utility to update cart count badge in navbar
function updateCartCountBadge() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count > 0 ? count : '';
        el.style.display = count > 0 ? 'inline-block' : 'none';
    });
}

document.addEventListener("DOMContentLoaded", function() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const spinner = document.getElementById("spinner");
    const productContainer = document.getElementById("productContainer");

    if (!id) {
        if (spinner) spinner.style.display = "none";
        if (productContainer) productContainer.innerHTML = "<div class='alert alert-danger'>Invalid product link.</div>";
        return;
    }

    updateCartCountBadge(); // Show cart count on page load

    fetch(`/api/products/${id}`)
        .then(res => res.json())
        .then(data => {
            if (spinner) spinner.style.display = "none";
            if (!data.data) {
                if (productContainer) productContainer.innerHTML = "<div class='alert alert-danger'>Product not found or an error occurred.</div>";
                return;
            }
            const product = data.data;
            // --- Begin: Backend Image Only Gallery Logic ---
            let images = [];
            if (product.images && product.images.length > 0) {
                images.push(product.images[0]);
            } else if (product.imageUrl) {
                images.push(product.imageUrl);
            }
            // --- End: Backend Image Only Gallery Logic ---
            // Placeholder colors (for now)
            const colors = ["#22223b", "#e44d6c", "#b8004c"];
            // Placeholder tags (for now)
            const tags = product.tags || ["fashion", "kurtis", "women"];
            // Placeholder rating (for now)
            const rating = product.rating || 4;
            // Placeholder old price (for now)
            const oldPrice = product.oldPrice || (product.price * 1.2).toFixed(0);

            productContainer.innerHTML = `
                <div class="row g-5 align-items-start flex-wrap">
                    <div class="col-lg-6 mb-4 mb-lg-0">
                        <div class="product-gallery">
                            <img src="${images[0]}" class="main-image" id="mainProductImage" alt="${product.title}">
                            ${images.length > 1 ? `<div class="thumbs-row mt-3">
                                ${images.map((img, idx) => `
                                    <img src="${img}" class="thumb-img${idx === 0 ? ' selected' : ''}" data-idx="${idx}" alt="Thumbnail">
                                `).join('')}
                            </div>` : ''}
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="product-details-card product-info-modern">
                            <div class="product-title mb-1">${product.title}</div>
                            <div class="mb-2">
                                <span class="product-price">₹${product.price}</span>
                                <span class="product-old-price">₹${oldPrice}</span>
                            </div>
                            <div class="star-rating mb-2">
                                ${'<i class="bi bi-star-fill"></i>'.repeat(Math.floor(rating))}
                                ${rating % 1 ? '<i class="bi bi-star-half"></i>' : ''}
                                ${'<i class="bi bi-star"></i>'.repeat(5 - Math.ceil(rating))}
                                <span class="ms-2 text-muted small">(${rating}.0)</span>
                            </div>
                            <div class="product-desc">${product.description}</div>
                            <div class="product-meta mb-2"><span class="fw-bold">Category:</span> <span class="category-pill">${product.category}</span></div>
                            <div class="product-tags mb-3"><span class="fw-bold">Tags:</span> ${tags.map(tag => `<span class='tag-pill'>${tag}</span>`).join('')}</div>
                            <div class="mb-3">
                                <span class="selector-label">Color:</span>
                                ${colors.map((color, idx) => `<span class="color-dot${idx === 0 ? ' selected' : ''}" style="background:${color}" data-color="${color}"></span>`).join('')}
                            </div>
                            ${product.sizes && product.sizes.length > 0 ? `
                            <div class="mb-3">
                                <span class="selector-label">Size:</span>
                                <div id="sizeBtnGroup" class="btn-group ms-2" role="group">
                                    ${product.sizes.map(size => `<button type='button' class='btn btn-outline-secondary btn-sm size-btn' data-size='${size}'>${size}</button>`).join('')}
                                </div>
                            </div>
                            ` : ''}
                            <div class="qty-controls mb-3">
                                <span class="selector-label">Quantity:</span>
                                <button class="btn btn-outline-secondary btn-sm" id="decreaseQty">-</button>
                                <input type="number" id="qtyInput" value="1" min="1" max="10" style="width: 60px; text-align: center;" class="form-control form-control-sm d-inline">
                                <button class="btn btn-outline-secondary btn-sm" id="increaseQty">+</button>
                            </div>
                            <button id="addToCartBtn" class="add-to-cart-btn"><i class="bi bi-cart-plus"></i> ADD TO CART</button>
                            <div class="social-icons mt-3">
                                <a href="#" title="Share on Facebook"><i class="bi bi-facebook"></i></a>
                                <a href="#" title="Share on Instagram"><i class="bi bi-instagram"></i></a>
                                <a href="#" title="Share on Twitter"><i class="bi bi-twitter"></i></a>
                                <a href="#" title="Share on Pinterest"><i class="bi bi-pinterest"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Image gallery logic
            const mainImg = document.getElementById('mainProductImage');
            document.querySelectorAll('.thumb-img').forEach(thumb => {
                thumb.addEventListener('click', function() {
                    document.querySelectorAll('.thumb-img').forEach(t => t.classList.remove('selected'));
                    this.classList.add('selected');
                    mainImg.src = this.src;
                });
            });

            // Color selection logic (placeholder)
            let selectedColor = colors[0];
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
            document.getElementById('decreaseQty').addEventListener('click', () => {
                let val = parseInt(qtyInput.value);
                if (val > 1) qtyInput.value = val - 1;
            });
            document.getElementById('increaseQty').addEventListener('click', () => {
                let val = parseInt(qtyInput.value);
                if (val < 10) qtyInput.value = val + 1;
            });

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
                    const existing = cart.find(item => item._id === product._id && item.size === selectedSize && item.color === selectedColor);
                    if (existing) {
                        existing.quantity += quantity;
                    } else {
                        cart.push(cartItem);
                    }
                    localStorage.setItem("cart", JSON.stringify(cart));
                    addToCartBtn.textContent = "Added!";
                    updateCartCountBadge();
                    setTimeout(() => {
                        addToCartBtn.innerHTML = "<i class='bi bi-cart-plus'></i> ADD TO CART";
                    }, 1500);
                });
            }
        })
        .catch(err => {
            if (spinner) spinner.style.display = "none";
            if (productContainer) productContainer.innerHTML = "<div class='alert alert-danger'>Product not found or an error occurred.</div>";
        });
}); 