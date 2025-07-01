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

    fetch(`/api/products/${id}`)
        .then(res => res.json())
        .then(data => {
            if (spinner) spinner.style.display = "none";
            if (!data.data) {
                if (productContainer) productContainer.innerHTML = "<div class='alert alert-danger'>Product not found or an error occurred.</div>";
                return;
            }
            const product = data.data;
            productContainer.innerHTML = `
                <div class="card mx-auto" style="max-width: 600px;">
                    <img src="${product.imageUrl}" class="card-img-top" alt="${product.title}">
                    <div class="card-body">
                        <h3 class="card-title">${product.title}</h3>
                        <p class="card-text">${product.description}</p>
                        <p class="card-text"><strong>Price:</strong> ₹${product.price}</p>
                        <p class="card-text"><strong>Category:</strong> ${product.category}</p>
                        <p class="card-text"><strong>Sizes:</strong> ${product.sizes.join(', ')}</p>
                        <p class="card-text"><strong>Stock:</strong> ${product.stock}</p>
                    </div>
                </div>
            `;
        })
        .catch(err => {
            if (spinner) spinner.style.display = "none";
            if (productContainer) productContainer.innerHTML = "<div class='alert alert-danger'>Product not found or an error occurred.</div>";
        });
});