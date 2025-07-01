const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const path = require('path');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const setupDatabase = require('./utils/setupDatabase');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB().then(async () => {
    // Setup database with initial data if needed
    await setupDatabase();
}).catch(err => {
    console.error('Error during database setup:', err);
});

// Route files
const products = require('./routes/productRoutes');
const auth = require('./routes/authRoutes');
const contact = require('./routes/contactRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// File upload
app.use(fileUpload());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Enable CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5001',
    credentials: true
}));

// Set static folders
app.use('/kurtis-ecommerce-2025/frontend', express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Mount routers
app.use('/api/products', products);
app.use('/api/auth', auth);
app.use('/api/contact', contact);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    // Close server & exit process
    server.close(() => process.exit(1));
}); 