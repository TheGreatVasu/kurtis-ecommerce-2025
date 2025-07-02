const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const mockProducts = require('./mockProducts');
const Product = require('./models/Product');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('MongoDB Connected...'.cyan.underline.bold);
    
    try {
        // Delete existing products
        await Product.deleteMany();
        console.log('Existing products deleted...'.red);

        // Insert mock products
        const products = await Product.insertMany(mockProducts);
        console.log(`${products.length} products inserted...`.green);

        // Log the first product ID for testing
        if (products.length > 0) {
            console.log(`\nTest product ID: ${products[0]._id}`.yellow);
            console.log(`\nUse this URL to test: http://localhost:5001/kurtis-ecommerce-2025/frontend/product.html?id=${products[0]._id}`.cyan);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
}); 