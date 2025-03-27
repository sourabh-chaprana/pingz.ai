import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { UserData } from './accountSlice';

// Fetch user data
export const fetchUserData = createAsyncThunk(
  'account/fetchUserData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/user/user');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user data');
    }
  }
);

// Update user data
export const updateUserData = createAsyncThunk(
  'account/updateUserData',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      // Log the FormData entries
      console.log('Form data being sent:');
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
      
      const response = await api.put('/user/user', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Update error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to update user data');
    }
  }
);
