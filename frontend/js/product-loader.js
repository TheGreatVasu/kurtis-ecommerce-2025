import config from './config.js';

// Function to load top selling products
export async function loadTopSellingProducts() {
    const container = document.getElementById('topSellingProducts');
    const loadingSpinner = document.getElementById('loadingSpinner');

    try {
        const response = await fetch(`${config.API_URL}/products?limit=4&sort=rating`);
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            const productsHtml = data.data.map(product => `
                <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                    <div class="product-card card h-100">
                        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                        <img src="${product.imageUrl}" class="card-img-top" alt="${product.title}">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${product.title}</h5>
                            <p class="card-text text-primary">₹${product.price.toFixed(2)}</p>
                            <a href="product.html?id=${product._id}" class="btn btn-primary mt-auto">View Details</a>
                        </div>
                    </div>
                </div>
            `).join('');
            container.innerHTML = productsHtml;
        } else {
            container.innerHTML = '<div class="col-12 text-center">No products found</div>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = '<div class="col-12 text-center text-danger">Error loading products. Please try again later.</div>';
    } finally {
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
    }
}

// Function to format price
export function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(price);
}

// Function to handle product image errors
export function handleImageError(img) {
    img.onerror = null;
    img.src = 'img/placeholder.jpg';
} 