// API Configuration
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Shared API URL logic
export const getApiUrl = () => {
  // Priority 1: Environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Priority 2: Local development fallback
  if (isLocal) {
    return 'http://localhost:5000';
  }
  
  // Priority 3: Production fallback
  return 'https://paath-sohayok-backend.vercel.app';
};

export const API_URL = getApiUrl();

console.log(`[Config] App running on ${window.location.hostname}. API URL: ${API_URL}`);
