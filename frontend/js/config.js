const BACKEND_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5001'
    : 'https://aniyah-backend.onrender.com';

const config = {
    API_URL: `${BACKEND_URL}/api`,
    UPLOADS_URL: `${BACKEND_URL}/uploads`,
    getProductImageUrl: (imagePath) => {
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        return `${BACKEND_URL}/uploads/products/${imagePath}`;
    }
};

export default config; 