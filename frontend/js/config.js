const config = {
    API_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:5001/api'
        : 'https://aniyah-backend.onrender.com/api'  // Your Render backend URL
};

export default config; 