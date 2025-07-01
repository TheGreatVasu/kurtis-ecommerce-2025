# Aniyah - Women's Ethnic Wear E-commerce Platform

A full-stack e-commerce platform specialized in women's ethnic wear, particularly kurtis. Built with modern web technologies and best practices.

## Features

- 👗 Product catalog with categories, filters, and search
- 🛒 Shopping cart functionality
- 💳 Secure payment processing with Razorpay
- 👤 User authentication and profiles
- 📦 Order management and tracking
- 💬 AI-powered chatbot for customer support
- 📱 Responsive design for all devices
- 👩‍💼 Admin dashboard for inventory management
- 📧 Email notifications for orders and updates
- ⭐ Product reviews and ratings

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Payment**: Razorpay
- **File Upload**: Express-fileupload
- **Email**: SMTP (Gmail/Mailtrap)
- **AI Chat**: Google Gemini API

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- Razorpay account
- Gmail account (for email notifications)
- Google Cloud account (for Gemini API)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd kurtis-ecommerce-2025
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp config/config.env.example config/config.env
   ```
   Edit `config.env` with your actual configuration values.

4. Create uploads directory:
   ```bash
   mkdir -p public/uploads/products
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

6. Open the frontend:
   - Navigate to the `frontend` directory
   - Open `index.html` in your browser
   - For development, use a local server like Live Server

## Environment Variables

Make sure to set up the following environment variables in your `config.env` file:

- `NODE_ENV`: development/production
- `PORT`: Server port number
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT
- `RAZORPAY_KEY_ID`: Razorpay API key
- `RAZORPAY_KEY_SECRET`: Razorpay secret key
- `EMAIL_USER`: Gmail address
- `EMAIL_PASS`: Gmail app password
- `GEMINI_API_KEY`: Google Gemini API key

## API Endpoints

### Products
- `GET /api/products`: Get all products
- `GET /api/products/:id`: Get single product
- `POST /api/products`: Create product (Admin)
- `PUT /api/products/:id`: Update product (Admin)
- `DELETE /api/products/:id`: Delete product (Admin)

### Auth
- `POST /api/auth/register`: Register user
- `POST /api/auth/login`: Login user
- `GET /api/auth/logout`: Logout user
- `GET /api/auth/me`: Get current user

### Orders
- `POST /api/orders`: Create order
- `GET /api/orders`: Get user orders
- `GET /api/orders/:id`: Get single order

### Payments
- `POST /api/payments`: Process payment
- `POST /api/payments/verify`: Verify payment

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Your Name - your.email@example.com
Project Link: [https://github.com/yourusername/kurtis-ecommerce-2025](https://github.com/yourusername/kurtis-ecommerce-2025)