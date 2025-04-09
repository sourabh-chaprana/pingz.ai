import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@/src/store";
import { api } from "@/src/services/api";
import { Template } from "./homeSlice";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fetch paginated templates
export const fetchTemplates = createAsyncThunk<
  any,
  { page: number; size: number },
  { rejectValue: string; state: RootState }
>("home/fetchTemplates", async ({ page, size }, { rejectWithValue }) => {
  try {
    const response = await api.get(`/template/?page=${page}&size=${size}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch templates"
    );
  }
});

// Fetch recent templates
export const fetchRecentTemplates = createAsyncThunk<
  Template[],
  void,
  { rejectValue: string; state: RootState }
>("home/fetchRecentTemplates", async (_, { getState, rejectWithValue }) => {
  try {
    const { auth } = getState();
    let userId = auth.user?.id;

    // If userId is not available in auth.user, try to get it from token
    if (!userId) {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        try {
          // Decode token to get user data
          const tokenParts = token.split('.');
          const tokenPayload = JSON.parse(atob(tokenParts[1]));
          userId = tokenPayload.userId || tokenPayload.sub;
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
    }

    if (!userId) {
      return rejectWithValue("User ID is required");
    }

    const response = await api.get(`/template/recent/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching recent templates:', error);
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch recent templates"
    );
  }
});

// Update the fetchWhatsNewTags thunk to use the new active endpoint
export const fetchWhatsNewTags = createAsyncThunk<
  { id: string; label: string; tags: string[] }[],
  void,
  { rejectValue: string }
>("home/fetchWhatsNewTags", async (_, { rejectWithValue }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    const response = await api.get('/template/whats-new/active', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch what's new tags");
  }
});

// Updated to accept multiple tags as a string
export const fetchTemplatesByTag = createAsyncThunk<
  Template[],
  string,
  { rejectValue: string }
>("home/fetchTemplatesByTag", async (tag, { rejectWithValue }) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    const response = await api.get(`/template/search?query=${tag}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch templates by tag");
  }
});

// Fetch holiday templates with token handling
export const fetchHolidayTemplates = createAsyncThunk<
  Template[],
  void,
  { rejectValue: string; state: RootState }
>(
  'home/fetchHolidayTemplates',
  async (_, { rejectWithValue }) => {
    try {
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        return rejectWithValue('No authentication token available');
      }

      const response = await api.get('/template/event/holidays');
      console.log('Holiday API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Holiday API error:', error);

      if (error.response?.status === 401) {
        // Clear tokens on authentication error
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('refreshToken');
        return rejectWithValue('Authentication required. Please log in again.');
      }

      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch holiday templates'
      );
    }
  }
);
