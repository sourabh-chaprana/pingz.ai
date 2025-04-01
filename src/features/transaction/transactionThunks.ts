import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fetchTransactionsStart,
  fetchTransactionsSuccess,
  fetchTransactionsFailure,
  TransactionResponse,
} from "./transactionSlice";
import { AppDispatch } from "@/src/store";
import api from "@/src/services/api";
import Toast from "react-native-toast-message";
import { jwtDecode } from "jwt-decode";

// Function to get the user ID from the JWT token
const getUserIdFromToken = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found");
    }

    // Decode the JWT token using named import
    const decoded: any = jwtDecode(token);
    return decoded.userId || decoded.sub; // userId or subject claim
  } catch (error) {
    console.error("Error getting user ID from token:", error);
    throw error;
  }
};

interface FetchTransactionsParams {
  page: number;
  size: number;
  searchQuery?: string; // Will be mapped to templateName in the API
  fromDate?: string; // Format: YYYY-MM-DDT18:30:00.000Z
  toDate?: string; // Format: YYYY-MM-DDT18:30:00.000Z
}

export const fetchTransactions = (params: FetchTransactionsParams) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(
        fetchTransactionsStart({ page: params.page, size: params.size })
      );

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Get user ID from token
      const userId = await getUserIdFromToken();

      // Build query parameters - use templateName instead of search
      let queryParams = `?page=${params.page}&size=${params.size}`;

      if (params.searchQuery) {
        queryParams += `&templateName=${encodeURIComponent(
          params.searchQuery
        )}`;
      }

      if (params.fromDate) {
        queryParams += `&fromDate=${encodeURIComponent(params.fromDate)}`;
      }

      if (params.toDate) {
        queryParams += `&toDate=${encodeURIComponent(params.toDate)}`;
      }

      console.log(
        `API Request URL: /template/transactions/user/${userId}${queryParams}`
      );

      // Make API request
      const response = await api.get(
        `/template/transactions/user/${userId}${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Log the response structure to see the actual field names
      console.log(
        "Transaction API response:",
        JSON.stringify(response.data, null, 2)
      );

      dispatch(fetchTransactionsSuccess(response.data));
      return response.data;
    } catch (error) {
      console.error("Transactions fetch error:", error);

      let errorMessage = "Failed to fetch transactions";

      if (error.response) {
        errorMessage = `Error ${error.response.status}: ${
          error.response.data?.message || "Server error"
        }`;
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      Toast.show({
        type: "error",
        text1: "Loading Error",
        text2: errorMessage,
        position: "bottom",
      });

      dispatch(fetchTransactionsFailure(errorMessage));
      throw error;
    }
  };
};
