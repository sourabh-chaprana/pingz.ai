import axios from 'axios';
import { store } from '../store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logoutUser, setTokens } from '../features/auth/authSlice';
import { useRouter } from 'expo-router';

export const BASE_URL = 'https://dev.pingz.ai/api/';
// export const BASE_URL = 'https://pingz.ai/api/';

// List of endpoints that don't require authentication
const publicEndpoints = [
  '/user/login',
  '/user/signUp',
  '/user/signUp/confirm',
  '/user/refreshToken'
];

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Check if the request URL is a public endpoint that doesn't need authentication
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    if (!isPublicEndpoint) {
      // For protected endpoints, check if token exists
      let token;
      
      // First try to get token from Redux store (faster and avoids AsyncStorage race conditions)
      const storeToken = store.getState().auth.token;
      
      if (storeToken) {
        token = storeToken;
      } else {
        // Fallback to AsyncStorage if needed
        token = await AsyncStorage.getItem('auth_token');
        
        // If token exists in AsyncStorage but not in Redux, update Redux
        if (token) {
          const refreshToken = await AsyncStorage.getItem('refreshToken');
          store.dispatch(setTokens({ token, refreshToken }));
        }
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log('No token found for protected endpoint:', config.url);
      }
    }
    
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
      if (Platform.OS !== 'web') {
        // Additional platform-specific handling if needed
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Add detailed logging
    console.log("API Error:", error.config?.url, error.response?.status, error.message);
    
    if (error.response?.status === 401) {
      // Clear tokens from storage
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('refreshToken');
      
      // Dispatch logout action
      store.dispatch(logoutUser());
    }
    return Promise.reject(error);
  }
);

// Fix verifyStoredToken to be more reliable and check both Redux and AsyncStorage
export const verifyStoredToken = async () => {
  try {
    // First check Redux store (faster)
    const storeToken = store.getState().auth.token;
    
    if (storeToken) {
      console.log('Token found in Redux store');
      return true;
    }
    
    // Then check AsyncStorage
    const asyncToken = await AsyncStorage.getItem('auth_token');
    
    if (asyncToken) {
      console.log('Token found in AsyncStorage, updating Redux');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      // Update Redux store with the token from AsyncStorage
      store.dispatch(setTokens({ 
        token: asyncToken, 
        refreshToken 
      }));
      
      return true;
    }
    
    console.log('No token found in Redux or AsyncStorage');
    return false;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
};

// Improved logout function
export const performLogout = async () => {
  try {
    console.log('Performing logout...');
    
    // First dispatch the Redux action to clear the auth state
    store.dispatch(logoutUser());
    
    // Then clear tokens from AsyncStorage
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('refreshToken');
    
    console.log('Logout completed - tokens removed and Redux state cleared');
    return true;
  } catch (error) {
    console.error('Error during logout:', error);
    return false;
  }
};

export default api;