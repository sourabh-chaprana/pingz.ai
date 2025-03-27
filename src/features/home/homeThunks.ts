import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { RecentTemplate } from "./homeSlice";
import { RootState } from "@/src/store";

const API_BASE_URL = "https://dev.pingz.ai/api";

export const fetchRecentTemplates = createAsyncThunk<
  RecentTemplate[],
  void,
  { rejectValue: string; state: RootState }
>("home/fetchRecentTemplates", async (_, { getState, rejectWithValue }) => {
  try {
    const { auth } = getState();
    const userId = auth.user?.id;

    if (!userId) {
      return rejectWithValue("User ID is required");
    }

    if (!auth.token) {
      return rejectWithValue("Authentication token is required");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    };

    const response = await axios.get(
      `${API_BASE_URL}/template/recent/${userId}`,
      config
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch recent templates"
      );
    }
    return rejectWithValue("Failed to fetch recent templates");
  }
});
