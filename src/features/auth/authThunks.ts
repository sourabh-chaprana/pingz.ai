import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  email?: string;
  password: string;
  userType?: string;
  mobileNumber?: string;
}

interface VerifyOtpCredentials {
  email?: string;
  code: string;
  txnId?: string;
}

interface ResendOtpCredentials {
  mobileNumber: string;
}

interface LoginResponse {
  idToken: string;
  refreshToken: string;
  message: string;
}

// Export individual thunks instead of an object
export const login = createAsyncThunk<LoginResponse, LoginCredentials>(
  '/user/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/user/login', credentials);
      // Store token immediately using AsyncStorage
      if (response.data.idToken) {
        await AsyncStorage.setItem('token', response.data.idToken);
        await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
      }
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Something went wrong';
      return rejectWithValue(errorMessage);
    }
  }
);

export const register = createAsyncThunk<LoginResponse, RegisterCredentials>(
  'auth/register',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/user/signUp', credentials);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Something went wrong';
      return rejectWithValue(errorMessage);
    }
  }
);

export const verifyOtp = createAsyncThunk<any, VerifyOtpCredentials>(
  'auth/verifyOtp',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('Verifying OTP with credentials:', credentials);
      const response = await api.post('/user/signUp/confirm', credentials);
      console.log('OTP verification response:', response.data);
      
      // Simply return success, no token handling
      return { success: true };
    } catch (error: any) {
      console.error('OTP verification error:', error);
      const errorMessage = error.response?.data?.message || 'OTP verification failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const resendOtp = createAsyncThunk<any, ResendOtpCredentials>(
  'auth/resendOtp',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/user/login', credentials);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to resend OTP';
      return rejectWithValue(errorMessage);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        return null;
      }
      
      const response = await api.post('/user/logout', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Clear tokens
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('refreshToken');
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Something went wrong';
      return rejectWithValue(errorMessage);
    }
  }
);

// Optional: Add refresh token functionality
export const refreshToken = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const refreshTokenValue = await AsyncStorage.getItem('refreshToken');
      
      if (!refreshTokenValue) {
        return rejectWithValue('No refresh token available');
      }
      
      const response = await api.post('/auth/refresh', { refreshToken: refreshTokenValue });
      
      // Update tokens
      if (response.data.idToken) {
        await AsyncStorage.setItem('token', response.data.idToken);
        await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Token refresh failed';
      return rejectWithValue(errorMessage);
    }
  }
); 