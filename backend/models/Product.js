const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [2000, 'Description cannot be more than 2000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        min: [0, 'Price must be greater than 0']
    },
    stock: {
        type: Number,
        required: [true, 'Please add stock quantity'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        enum: [
            'Kurtis',
            'Sarees',
            'Lehengas',
            'Dresses',
            'Accessories',
            'Silk',
            'Cotton',
            'Designer',
            'Traditional',
            'Casual',
            'Party Wear'
        ],
        default: 'Kurtis'
    },
    imageUrl: {
        type: String,
        required: [true, 'Please add an image URL']
    },
    images: {
        type: [String],
        default: function() {
            return [this.imageUrl];
        }
    },
    sizes: {
        type: [String],
        required: [true, 'Please add available sizes'],
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'],
        default: ['S', 'M', 'L']
    },
    colors: {
        type: [String],
        default: ['Multi'],
        validate: {
            validator: function(v) {
                return Array.isArray(v) && v.length > 0;
            },
            message: 'Product must have at least one color'
        }
    },
    rating: {
        type: Number,
        min: [0, 'Rating must be at least 0'],
        max: [5, 'Rating cannot be more than 5'],
        default: 0
    },
    reviews: {
        type: Number,
        default: 0
    },
    badge: {
        type: String,
        enum: ['Best Seller', 'New', 'Sale', null],
        default: null
    },
    sku: {
        type: String,
        default: function() {
            const randomNum = Math.floor(Math.random() * 10000);
            return `${this.title.substring(0, 3).toUpperCase()}-${randomNum}`;
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Create SKU and set defaults before saving
ProductSchema.pre('save', async function(next) {
    // Set images array if not provided
    if (!this.images || this.images.length === 0) {
        this.images = [this.imageUrl];
    }
    // Set default color if not provided
    if (!this.colors || this.colors.length === 0) {
        this.colors = ['Multi'];
    }
    next();
});

// Virtual for discounted price
ProductSchema.virtual('discountedPrice').get(function() {
    if (!this.discount) return this.price;
    return this.price - (this.price * (this.discount / 100));
});

// Virtual for stock status
ProductSchema.virtual('stockStatus').get(function() {
    if (this.stock === 0) return 'Out of Stock';
    if (this.stock <= 10) return 'Low Stock';
    return 'In Stock';
});

// Index for better search performance
ProductSchema.index({ title: 'text', description: 'text', category: 1, tags: 1 });

module.exports = mongoose.model('Product', ProductSchema); 