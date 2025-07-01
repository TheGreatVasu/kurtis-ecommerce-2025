const express = require('express');
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductSummary,
    getProductAnalytics,
    uploadProductImage
} = require('../controllers/productController');
const Product = require('../models/Product');

const router = express.Router();

const { protect, authorize, admin } = require('../middleware/auth');

// Summary and Analytics routes
router.get('/summary', protect, authorize('admin'), getProductSummary);
router.get('/analytics', protect, authorize('admin'), getProductAnalytics);

// Image upload route
router.post('/upload', protect, authorize('admin'), uploadProductImage);

router
    .route('/')
    .get(getProducts)
    .post(protect, authorize('admin'), createProduct);

router
    .route('/:id')
    .get(getProduct)
    .put(protect, authorize('admin'), updateProduct)
    .delete(protect, authorize('admin'), deleteProduct);

module.exports = router; 