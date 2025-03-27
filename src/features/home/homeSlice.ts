import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchRecentTemplates } from "./homeThunks";

export interface RecentTemplate {
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

interface HomeState {
  recentTemplates: RecentTemplate[];
  loading: boolean;
  error: string | null;
}

const initialState: HomeState = {
  recentTemplates: [],
  loading: false,
  error: null,
};

export const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    clearHomeErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecentTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchRecentTemplates.fulfilled,
        (state, action: PayloadAction<RecentTemplate[]>) => {
          state.loading = false;
          state.recentTemplates = action.payload;
        }
      )
      .addCase(fetchRecentTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to fetch recent templates";
      });
  },
});

export const { clearHomeErrors } = homeSlice.actions;
export default homeSlice.reducer;
