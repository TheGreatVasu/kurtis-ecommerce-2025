const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const path = require('path');
const fs = require('fs');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
    // Pagination and limit
    let { page = 1, limit = 16, category, price, size, sort } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (category) {
        filter.category = new RegExp('^' + category + '$', 'i'); // case-insensitive exact match
    }
    if (size) {
        filter.sizes = size;
    }
    if (price) {
        // price=1000-2000 or price=3000+
        if (price.includes('-')) {
            const [min, max] = price.split('-').map(Number);
            filter.price = { $gte: min, $lte: max };
        } else if (price.endsWith('+')) {
            const min = Number(price.replace('+', ''));
            filter.price = { $gte: min };
        }
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // newest first default
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter).sort(sortOption).skip(skip).limit(limit);
    res.status(200).json({
        success: true,
        count: products.length,
        page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        data: products
    });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: product });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin)
exports.createProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin)
exports.updateProduct = asyncHandler(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({ success: true, data: product });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
exports.deleteProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }

    await product.remove();

    res.status(200).json({ success: true, data: {} });
});

// @desc    Get product summary
// @route   GET /api/products/summary
// @access  Private/Admin
exports.getProductSummary = asyncHandler(async (req, res, next) => {
    const count = await Product.countDocuments();
    const outOfStock = await Product.countDocuments({ stock: 0 });
    const lowStock = await Product.countDocuments({ stock: { $gt: 0, $lte: 10 } });
    const totalValue = await Product.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: { $multiply: ["$price", "$stock"] } }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: {
            count,
            outOfStock,
            lowStock,
            totalValue: totalValue[0]?.total || 0
        }
    });
});

// @desc    Get product analytics
// @route   GET /api/products/analytics
// @access  Private/Admin
exports.getProductAnalytics = asyncHandler(async (req, res, next) => {
    // Get top selling products
    const topProducts = await Product.aggregate([
        {
            $project: {
                title: 1,
                totalValue: { $multiply: ["$price", "$stock"] }
            }
        },
        { $sort: { totalValue: -1 } },
        { $limit: 5 }
    ]);

    // Get category distribution
    const categoryDistribution = await Product.aggregate([
        {
            $group: {
                _id: "$category",
                count: { $sum: 1 }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: {
            labels: topProducts.map(p => p.title),
            values: topProducts.map(p => p.totalValue),
            categories: categoryDistribution
        }
    });
});

// @desc    Upload product image
// @route   POST /api/products/upload
// @access  Private/Admin
exports.uploadProductImage = asyncHandler(async (req, res, next) => {
    if (!req.files || !req.files.image) {
        return next(new ErrorResponse('Please upload a file', 400));
    }

    const file = req.files.image;

    // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse('Please upload an image file', 400));
    }

    // Check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD || 1024 * 1024 * 5) { // 5MB default
        return next(new ErrorResponse('Please upload an image less than 5MB', 400));
    }

    // Create custom filename
    const filename = `product_${Date.now()}${path.parse(file.name).ext}`;

    // Create uploads directory if it doesn't exist
    const uploadDir = 'public/uploads/products';
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Move file to upload directory
    file.mv(`${uploadDir}/${filename}`, async err => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse('Problem with file upload', 500));
        }

        res.status(200).json({
            success: true,
            data: `/uploads/products/${filename}`
        });
    });
}); 