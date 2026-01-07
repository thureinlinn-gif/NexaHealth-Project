// API configuration
export const API_CONFIG = {
  // Backend API URL - change this if your backend runs on a different port/host
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001',
  // Google Maps API Key - must be set in .env file
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
};

