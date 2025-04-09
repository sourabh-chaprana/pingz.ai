import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setTokens } from '../../features/auth/authSlice';

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
  otp: string;
  txnId?: string;
}

interface ResendOtpCredentials {
  mobileNumber: string;
}

interface LoginResponse {
  txnId: any;
  idToken: string;
  refreshToken: string;
  message: string;
}

// Export individual thunks instead of an object
export const login = createAsyncThunk<LoginResponse, LoginCredentials>(
  '/user/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // Check if we already have a valid token
      const existingToken = await AsyncStorage.getItem('auth_token');
      if (existingToken && !credentials.otp) {
        // If we have a token and this isn't an OTP verification, return early
        return { 
          idToken: existingToken,
          refreshToken: await AsyncStorage.getItem('refreshToken'),
          message: 'Auto login successful'
        };
      }

      const response = await api.post('/user/login', credentials);
      
      // Only store tokens if this is an OTP verification or email login
      if (response.data.idToken) {
        await AsyncStorage.setItem('auth_token', response.data.idToken);
        await AsyncStorage.setItem('refreshToken', response.data.refreshToken || '');
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
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      console.log('Verifying OTP with credentials:', credentials);
      const response = await api.post('/user/signUp/confirm', credentials);
      console.log('OTP verification response:', response.data);
      
      // If verification is successful and we have tokens, store them
      if (response.data.idToken) {
        await AsyncStorage.setItem('auth_token', response.data.idToken);
        if (response.data.refreshToken) {
          await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        // Update Redux store with tokens
        dispatch(setTokens({
          token: response.data.idToken,
          refreshToken: response.data.refreshToken
        }));
      }
      
      return response.data;
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