document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.getElementById('productsContainer');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');
    const sizeFilter = document.getElementById('sizeFilter');
    const sortFilter = document.getElementById('sortFilter');

    let page = 1;
    const limit = 8;
    let loading = false;
    let allLoaded = false;
    let currentFilters = {
        category: '',
        price: '',
        size: '',
        sort: 'newest'
    };

    // Fetch and render products
    async function fetchProducts(isLoadMore = false) {
        if (loading || allLoaded && isLoadMore) return;
        loading = true;
        loadingSpinner.style.display = 'block';

        // Build query params
        const params = new URLSearchParams({
            page,
            limit
        });
        if (currentFilters.category) params.append('category', currentFilters.category);
        if (currentFilters.price) params.append('price', currentFilters.price);
        if (currentFilters.size) params.append('size', currentFilters.size);
        if (currentFilters.sort && currentFilters.sort !== 'newest') params.append('sort', currentFilters.sort);

        try {
            const res = await fetch(`/api/products?${params}`);
            const data = await res.json();
            if (data.success) {
                if (data.data.length < limit) {
                    allLoaded = true;
                    loadMoreBtn.style.display = 'none';
                } else {
                    loadMoreBtn.style.display = 'inline-block';
                }
                renderProducts(data.data, isLoadMore);
            } else {
                showError('Failed to load products.');
            }
        } catch (err) {
            showError('Error fetching products.');
        } finally {
            loading = false;
            loadingSpinner.style.display = 'none';
        }
    }

    // Render products
    function renderProducts(products, isLoadMore) {
        const productsGrid = document.getElementById('productsGrid') || productsContainer;
        const html = products.map(product => `
            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <div class="product-card card h-100">
                    <div class="product-image-wrapper" style="position:relative;">
                        ${product.badge ? `<span class='product-badge' style='position:absolute;top:16px;left:16px;z-index:2;'>${product.badge}</span>` : ''}
                        <img src="${product.imageUrl}" class="card-img-top" alt="${product.title}">
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${product.title}</h5>
                        <p class="card-text text-primary fw-bold">₹${product.price.toFixed(2)}</p>
                        <p class="card-text"><small>${product.category}</small></p>
                        <a href="product.html?id=${product._id}" class="btn btn-primary mt-auto">View Details</a>
                    </div>
                </div>
            </div>
        `).join('');
        if (isLoadMore) {
            productsGrid.insertAdjacentHTML('beforeend', html);
        } else {
            productsGrid.innerHTML = html;
        }
    }

    // Show error
    function showError(msg) {
        productsContainer.innerHTML = `<div class='alert alert-danger text-center'>${msg}</div>`;
    }

    // Load more button
    loadMoreBtn.addEventListener('click', () => {
        page++;
        fetchProducts(true);
    });

    // Filter change handler
    function onFilterChange() {
        page = 1;
        allLoaded = false;
        currentFilters = {
            category: categoryFilter.value,
            price: priceFilter.value,
            size: sizeFilter.value,
            sort: sortFilter.value
        };
        fetchProducts(false);
    }

    categoryFilter.addEventListener('change', onFilterChange);
    priceFilter.addEventListener('change', onFilterChange);
    sizeFilter.addEventListener('change', onFilterChange);
    sortFilter.addEventListener('change', onFilterChange);

    // Initial load
    fetchProducts();

    function updateLoginButtonAndUser() {
        const token = localStorage.getItem('token');
        const btn = document.getElementById('loginBtn');
        const userDisplay = document.getElementById('userDisplay');
        if (btn) {
            if (token) {
                btn.textContent = 'Logout';
                btn.onclick = function() { localStorage.removeItem('token'); location.reload(); };
                // Fetch user info
                if (userDisplay) {
                    fetch('/api/auth/me', {
                        headers: { 'Authorization': 'Bearer ' + token }
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success && data.data && data.data.name) {
                            userDisplay.textContent = 'Hello, ' + data.data.name;
                        }
                    });
                }
            } else {
                btn.textContent = 'Login';
                btn.onclick = function() { window.location.href = 'login.html'; };
                if (userDisplay) userDisplay.textContent = '';
            }
        }
    }
    document.addEventListener('DOMContentLoaded', updateLoginButtonAndUser);
}); 