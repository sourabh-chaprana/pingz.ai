import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define template interface
export interface Template {
  id: string;
  templateName: string;
  mediaType: string | null;
  description: string;
  url: string;
  userId: string;
  createdBy: string | null;
  createdDate: string;
  templateVariables: Array<{
    name: string;
    posWidth: string;
    posHeight: string;
    font: string;
    fontFamily: string;
    fontSize: string;
    imageUrl: string | null;
    x: number;
    y: number;
    color: string;
  }>;
  event: string;
  premium: boolean;
}

// State interface
interface TemplateState {
  templates: Template[];
  loading: boolean;
  error: string | null;
  currentCategory: string | null;
}

// Initial state
const initialState: TemplateState = {
  templates: [],
  loading: false,
  error: null,
  currentCategory: null,
};

// Create template slice
const templateSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    fetchTemplatesStart: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
      state.currentCategory = action.payload;
    },
    fetchTemplatesSuccess: (state, action: PayloadAction<Template[]>) => {
      state.templates = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchTemplatesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearTemplates: (state) => {
      state.templates = [];
      state.currentCategory = null;
    },
  },
});

export const { 
  fetchTemplatesStart, 
  fetchTemplatesSuccess, 
  fetchTemplatesFailure,
  clearTemplates
} = templateSlice.actions;

export default templateSlice.reducer;