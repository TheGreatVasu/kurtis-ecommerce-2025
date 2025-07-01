// Function to fix image paths based on environment
function getImagePath(imageName) {
    const basePath = window.location.hostname === 'localhost' 
        ? '' 
        : '';
    return `${basePath}/img/${imageName}`;
}

// Export the function for use in other files
export { getImagePath }; 