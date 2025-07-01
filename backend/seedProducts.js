const mongoose = require('mongoose');
const Product = require('./models/Product');
const mockProducts = require('./mockProducts');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Seed Products
const seedProducts = async () => {
    try {
        await Product.deleteMany();
        console.log('Deleted existing products');

        // Patch products: ensure images/colors are present and valid
        const productsToSeed = mockProducts.map(product => {
            let fixed = { ...product };
            // Fix images
            if (!Array.isArray(fixed.images) || fixed.images.length === 0) {
                if (fixed.imageUrl) {
                    fixed.images = [fixed.imageUrl];
                } else {
                    fixed.images = ['https://via.placeholder.com/400x600?text=No+Image'];
                }
            }
            // Fix colors
            if (!Array.isArray(fixed.colors) || fixed.colors.length === 0) {
                fixed.colors = ['Multi'];
            }
            // Add SKU if missing
            if (!fixed.sku) {
                fixed.sku = `${fixed.title.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 10000)}`;
            }
            return fixed;
        });

        await Product.insertMany(productsToSeed);
        console.log('Products seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding products:', error);
        process.exit(1);
    }
};

seedProducts(); 