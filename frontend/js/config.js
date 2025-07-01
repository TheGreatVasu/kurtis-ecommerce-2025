const BACKEND_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5001'
    : 'https://aniyah-backend.onrender.com';  // Your Render backend URL

const config = {
    API_URL: `${BACKEND_URL}/api`,  // For API endpoints
    UPLOADS_URL: `${BACKEND_URL}/uploads`,  // For uploaded files
    FRONTEND_URL: window.location.hostname === 'localhost'
        ? 'http://localhost:5500'
        : 'https://kurtis-ecommerce-2025.vercel.app',  // Your Vercel frontend URL
    getProductImageUrl: (imagePath) => {
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        return `${BACKEND_URL}/uploads/products/${imagePath}`;
    }
};

export default config; 