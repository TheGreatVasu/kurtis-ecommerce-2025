const config = {
    API_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:5001/api'
        : 'https://your-render-backend-url.onrender.com/api'
};

export default config; 