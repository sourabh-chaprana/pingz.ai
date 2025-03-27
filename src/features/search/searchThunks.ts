import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/src/services/api";
import { searchStart, searchSuccess, searchFailure } from "./searchSlice";

export const searchTemplates = (query: string) => async (dispatch: any) => {
  try {
    dispatch(searchStart());
    const response = await api.get(
      `/template/search?query=${encodeURIComponent(query)}`
    );
    dispatch(searchSuccess(response.data));
  } catch (error: unknown) {
    dispatch(
      searchFailure(
        error instanceof Error ? error.message : "Failed to search templates"
      )
    );
  }
};
