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
    const userId = auth.user?.id;

    if (!userId) {
      return rejectWithValue("User ID is required");
    }

    const response = await api.get(`/template/recent/${userId}`);
    return response.data;
  } catch (error: any) {
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
    const token = await AsyncStorage.getItem('token');
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
    const token = await AsyncStorage.getItem('token');
    const response = await api.get(`/template/search?query=${tag}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch templates by tag");
  }
});

// Fetch pharmacy templates
export const fetchPharmacyTemplates = createAsyncThunk<
  Template[],
  void,
  { rejectValue: string; state: RootState }
>("home/fetchPharmacyTemplates", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/template/event/Pharmacies');
    console.log('Pharmacy API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Pharmacy API error:', error);
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch pharmacy templates"
    );
  }
});
