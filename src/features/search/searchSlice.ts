import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Template {
  id: string;
  templateName: string;
  description: string;
  url: string;
  mediaType: string | null;
  premium: boolean;
}

interface SearchState {
  results: Template[];
  loading: boolean;
  error: string | null;
}

const initialState: SearchState = {
  results: [],
  loading: false,
  error: null,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    searchStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    searchSuccess: (state, action: PayloadAction<Template[]>) => {
      state.results = action.payload;
      state.loading = false;
      state.error = null;
    },
    searchFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.results = [];
    },
    clearSearch: (state) => {
      state.results = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const { searchStart, searchSuccess, searchFailure, clearSearch } =
  searchSlice.actions;
export default searchSlice.reducer;
