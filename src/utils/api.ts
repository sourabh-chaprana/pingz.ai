import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for the API
export const API_BASE_URL = 'https://api.evolvpix.whilter.ai';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to all requests
api.interceptors.request.use(
  async (config) => {
    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem('auth_token');
    
    // If token exists, add it to the request header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        
        if (refreshToken) {
          // Call refresh token endpoint
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          });
          
          // Save new token
          if (response.data.token) {
            await AsyncStorage.setItem('auth_token', response.data.token);
            
            // Update the Authorization header
            originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
            
            // Retry the original request
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Token refresh failed
        console.error('Token refresh failed:', refreshError);
        
        // Clear tokens
        await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
        
        // You might want to redirect to login here
        // or dispatch an action to update auth state
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 