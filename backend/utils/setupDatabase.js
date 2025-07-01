const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const mockProducts = require('../mockProducts');

// Function to check if database is empty
const isDatabaseEmpty = async () => {
    const productCount = await Product.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    return { isEmpty: productCount === 0, noAdmin: adminCount === 0 };
};

// Function to seed products
const seedProducts = async () => {
    try {
        await Product.create(mockProducts);
        console.log('Products seeded successfully'.green.inverse);
    } catch (error) {
        console.error('Error seeding products:', error);
    }
};

// Function to seed admin
const seedAdmin = async () => {
    try {
        await User.create({
            name: 'Admin User',
            email: 'admin@aniyah.com',
            password: 'admin123',
            role: 'admin'
        });
        console.log('Admin user created successfully'.green.inverse);
    } catch (error) {
        console.error('Error creating admin:', error);
    }
};

// Main setup function
const setupDatabase = async () => {
    const { isEmpty, noAdmin } = await isDatabaseEmpty();
    
    if (isEmpty) {
        console.log('Database is empty, seeding products...'.yellow);
        await seedProducts();
    }
    
    if (noAdmin) {
        console.log('No admin user found, creating admin...'.yellow);
        await seedAdmin();
    }
};

module.exports = setupDatabase; 