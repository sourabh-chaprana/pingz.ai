import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchTemplates, fetchRecentTemplates, fetchWhatsNewTags, fetchTemplatesByTag } from "./homeThunks";

export interface Template {
  id: string;
  templateName: string;
  description: string;
  url: string;
  mediaType: string | null;
  userId: string;
  createdBy: string | null;
  createdDate: string;
  templateVariables: TemplateVariable[];
  event: string;
  premium: boolean;
  tags: string | null;
}

interface TemplateVariable {
  name: string;
  posWidth: string;
  posHeight: string;
  font: string | null;
  fontFamily: string | null;
  fontSize: string | null;
  imageUrl: string | null;
  x: number | null;
  y: number | null;
  color: string | null;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasMore: boolean;
  isLoadingMore: boolean;
}

interface HomeState {
  templates: Template[];
  recentTemplates: Template[];
  loading: boolean;
  recentLoading: boolean;
  error: string | null;
  recentError: string | null;
  pagination: PaginationInfo;
  whatsNewTags: string[];
  whatsNewTemplates: { [key: string]: Template[] };
  whatsNewLoading: boolean;
  whatsNewError: string | null;
}

const initialState: HomeState = {
  templates: [],
  recentTemplates: [],
  loading: false,
  recentLoading: false,
  error: null,
  recentError: null,
  pagination: {
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    hasMore: true,
    isLoadingMore: false,
  },
  whatsNewTags: [],
  whatsNewTemplates: {},
  whatsNewLoading: false,
  whatsNewError: null,
};

export const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    clearHomeErrors: (state) => {
      state.error = null;
      state.recentError = null;
    },
    resetTemplates: (state) => {
      state.templates = [];
      state.pagination = {
        ...initialState.pagination,
        currentPage: 0,
        hasMore: true,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (state, action) => {
        if (action.meta.arg.page === 0) {
          state.loading = true;
        } else {
          state.pagination.isLoadingMore = true;
        }
        state.error = null;
      })
      .addCase(
        fetchTemplates.fulfilled,
        (state, action: PayloadAction<{
          content: Template[];
          last: boolean;
          totalPages: number;
          totalElements: number;
          number: number;
        }>) => {
          state.loading = false;
          state.pagination.isLoadingMore = false;

          if (action.payload.number === 0) {
            state.templates = action.payload.content;
          } else {
            const newTemplates = action.payload.content.filter(
              (newTemplate) => 
                !state.templates.some(
                  (existingTemplate) => existingTemplate.id === newTemplate.id
                )
            );
            state.templates = [...state.templates, ...newTemplates];
          }

          state.pagination = {
            ...state.pagination,
            currentPage: action.payload.number + 1,
            totalPages: action.payload.totalPages,
            totalElements: action.payload.totalElements,
            hasMore: !action.payload.last,
          };
        }
      )
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.pagination.isLoadingMore = false;
        state.error = action.payload as string || "Failed to fetch templates";
      })
      .addCase(fetchRecentTemplates.pending, (state) => {
        state.recentLoading = true;
        state.recentError = null;
      })
      .addCase(
        fetchRecentTemplates.fulfilled,
        (state, action: PayloadAction<Template[]>) => {
          state.recentLoading = false;
          state.recentTemplates = action.payload;
        }
      )
      .addCase(fetchRecentTemplates.rejected, (state, action) => {
        state.recentLoading = false;
        state.recentError = action.payload as string || "Failed to fetch recent templates";
      })
      .addCase(fetchWhatsNewTags.pending, (state) => {
        state.whatsNewLoading = true;
        state.whatsNewError = null;
      })
      .addCase(fetchWhatsNewTags.fulfilled, (state, action) => {
        state.whatsNewLoading = false;
        state.whatsNewTags = action.payload;
      })
      .addCase(fetchWhatsNewTags.rejected, (state, action) => {
        state.whatsNewLoading = false;
        state.whatsNewError = action.payload as string;
      })
      .addCase(fetchTemplatesByTag.fulfilled, (state, action) => {
        const tag = action.meta.arg;
        state.whatsNewTemplates[tag] = action.payload;
      });
  },
});

export const { clearHomeErrors, resetTemplates } = homeSlice.actions;
export default homeSlice.reducer;
