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

// Add new thunks for what's new section
export const fetchWhatsNewTags = createAsyncThunk<
  string[],
  void,
  { rejectValue: string }
>("home/fetchWhatsNewTags", async (_, { rejectWithValue }) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await api.get('/template/whats-new', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch what's new tags");
  }
});

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
