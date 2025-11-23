import Constants from 'expo-constants';

// Get the API URL from app.config.js extra field, or use default
export const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://172.23.57.4:8000/api/v1';

// You can add other API-related configurations here
export const API_CONFIG = {
  baseUrl: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};