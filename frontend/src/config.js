// Easy toggle for development vs production
const USE_LOCAL_BACKEND = true; // Set to false for production

const config = {
  development: {
    apiUrl: 'http://localhost:8000'
  },
  production: {
    apiUrl: 'https://queryandbuy-production.up.railway.app'
  }
};

// Use local backend if toggle is on, otherwise use environment-based config
const getApiUrl = () => {
  if (USE_LOCAL_BACKEND) {
    return config.development.apiUrl;
  }
  
  // Check if we're in production environment
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || config.production.apiUrl;
  }
  
  return config.development.apiUrl;
};

export const API_BASE_URL = getApiUrl();

// Log current configuration for debugging
console.log('🔧 API Configuration:', {
  USE_LOCAL_BACKEND,
  NODE_ENV: process.env.NODE_ENV,
  API_BASE_URL,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL
}); 