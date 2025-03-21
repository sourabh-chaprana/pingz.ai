import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  fetchTemplatesStart, 
  fetchTemplatesSuccess, 
  fetchTemplatesFailure 
} from './templateSlice';
import { AppDispatch } from '@/src/store';
import api from '@/src/services/api';
// import { AppDispatch } from '../../store/store';

// Base URL for the API
const API_BASE_URL = 'https://api.evolvpix.whilter.ai';

// Token key in AsyncStorage
const AUTH_TOKEN_KEY = 'auth_token';

// Thunk for fetching templates by category
export const fetchTemplatesByCategory = (categoryName: string) => {
  return async (dispatch: AppDispatch) => {
    try {
      // Dispatch start action with the category name
      dispatch(fetchTemplatesStart(categoryName));
      
      // Format category name for API call (lowercase, replace spaces with hyphens)
      const formattedCategory = categoryName.toLowerCase().replace(/\s+/g, '-');
      
      // Make API call using the existing API service
      const response = await api.get(`/template/event/${formattedCategory}`);
      
      // Dispatch success with the data
      dispatch(fetchTemplatesSuccess(response.data));
      
      return response.data;
    } catch (error) {
      let errorMessage = 'Failed to fetch templates';
      
      if (error.response) {
        // The request was made and the server responded with an error status
        errorMessage = `Error ${error.response.status}: ${error.response.data?.message || 'Server error'}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      } else if (error instanceof Error) {
        // Something happened in setting up the request
        errorMessage = error.message;
      }
      
      // Dispatch failure with error message
      dispatch(fetchTemplatesFailure(errorMessage));
      throw error;
    }
  };
};

// Add a function to refresh the token if needed
export const refreshAuthToken = async () => {
  try {
    // Get refresh token from AsyncStorage
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    // Make refresh token API call (assuming your API has this endpoint)
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken
    });
    
    // Store the new token
    if (response.data.token) {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
      return response.data.token;
    }
    
    throw new Error('Failed to refresh token');
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Clear tokens if refresh fails
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem('refresh_token');
    throw error;
  }
}; 