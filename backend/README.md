# Rastogi Kurties E-commerce Backend

This is the backend API for the Rastogi Kurties e-commerce website, built with Node.js, Express, and MongoDB.

## Features

- Product Management (CRUD operations)
- User Authentication (JWT)
- Contact Form with Email Notifications
- Admin Panel Access
- MongoDB Database
- Image URLs from Cloudinary

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `config/config.env` file and update the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_uri_here
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   EMAIL_USERNAME=your_gmail_username
   EMAIL_PASSWORD=your_gmail_app_password
   EMAIL_FROM=your_email@gmail.com
   EMAIL_TO=admin@rastogiKurties.com
   FRONTEND_URL=http://localhost:3000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Products
- GET /api/products - Get all products
- GET /api/products/:id - Get single product
- POST /api/products - Create product (Admin)
- PUT /api/products/:id - Update product (Admin)
- DELETE /api/products/:id - Delete product (Admin)

### Authentication
- POST /api/auth/register - Register user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Contact
- POST /api/contact - Submit contact form
- GET /api/contact - Get all contact submissions (Admin)

## Deployment

The API is designed to be deployed on Render. The frontend can be deployed on GitHub Pages or Netlify.

## Environment Variables

Make sure to set up all environment variables in your deployment platform:

- `NODE_ENV`: Set to 'production' in deployment
- `PORT`: Your desired port number
- `MONGO_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A secure random string for JWT signing
- `JWT_EXPIRE`: JWT token expiration time
- `JWT_COOKIE_EXPIRE`: Cookie expiration time in days
- `EMAIL_USERNAME`: Your Gmail username
- `EMAIL_PASSWORD`: Your Gmail app password
- `EMAIL_FROM`: Sender email address
- `EMAIL_TO`: Admin email address
- `FRONTEND_URL`: Your frontend application URL

## Security

- JWT authentication
- Password hashing with bcrypt
- HTTP-only cookies
- CORS enabled
- Rate limiting (TODO)
- XSS protection (TODO)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 