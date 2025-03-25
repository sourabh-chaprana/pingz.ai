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

// Update the Category interface to match API response
export interface CategoryResponse {
  id: string;
  name: string;
}

// Add icon and color to the final Category interface
export interface Category extends CategoryResponse {
  icon: string;
  color: string;
}

// State interface
interface TemplateState {
  templates: Template[];
  currentTemplate: Template | null;
  loading: boolean;
  error: string | null;
  currentCategory: string | null;
  generatedImage: string | null;
  generatingImage: boolean;
  generateImageError: string | null;
  mediaLibrary: Array<any>;
  loadingMedia: boolean;
  mediaError: string | null;
  categories: Category[];
  loadingCategories: boolean;
  categoriesError: string | null;
}

// Initial state
const initialState: TemplateState = {
  templates: [],
  currentTemplate: null,
  loading: false,
  error: null,
  currentCategory: null,
  generatedImage: null,
  generatingImage: false,
  generateImageError: null,
  mediaLibrary: [],
  loadingMedia: false,
  mediaError: null,
  categories: [],
  loadingCategories: false,
  categoriesError: null,
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
    fetchTemplateByIdStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTemplateByIdSuccess: (state, action: PayloadAction<Template>) => {
      state.currentTemplate = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchTemplateByIdFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearCurrentTemplate: (state) => {
      state.currentTemplate = null;
    },
    generateImageStart: (state) => {
      state.generatingImage = true;
      state.generateImageError = null;
    },
    generateImageSuccess: (state, action: PayloadAction<string>) => {
      state.generatedImage = action.payload;
      state.generatingImage = false;
      state.generateImageError = null;
    },
    generateImageFailure: (state, action: PayloadAction<string>) => {
      state.generatingImage = false;
      state.generateImageError = action.payload;
    },
    clearGeneratedImage: (state) => {
      state.generatedImage = null;
    },
    fetchMediaStart: (state) => {
      state.loadingMedia = true;
      state.mediaError = null;
    },
    fetchMediaSuccess: (state, action: PayloadAction<any[]>) => {
      state.mediaLibrary = action.payload;
      state.loadingMedia = false;
      state.mediaError = null;
    },
    fetchMediaFailure: (state, action: PayloadAction<string>) => {
      state.loadingMedia = false;
      state.mediaError = action.payload;
    },
    fetchCategoriesStart: (state) => {
      state.loadingCategories = true;
      state.categoriesError = null;
    },
    fetchCategoriesSuccess: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
      state.loadingCategories = false;
      state.categoriesError = null;
    },
    fetchCategoriesFailure: (state, action: PayloadAction<string>) => {
      state.loadingCategories = false;
      state.categoriesError = action.payload;
    }
  },
});

export const { 
  fetchTemplatesStart, 
  fetchTemplatesSuccess, 
  fetchTemplatesFailure,
  clearTemplates,
  fetchTemplateByIdStart,
  fetchTemplateByIdSuccess,
  fetchTemplateByIdFailure,
  clearCurrentTemplate,
  generateImageStart,
  generateImageSuccess,
  generateImageFailure,
  clearGeneratedImage,
  fetchMediaStart,
  fetchMediaSuccess,
  fetchMediaFailure,
  fetchCategoriesStart,
  fetchCategoriesSuccess,
  fetchCategoriesFailure
} = templateSlice.actions;

export default templateSlice.reducer;