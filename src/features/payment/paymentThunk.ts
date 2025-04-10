import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getAuthToken } from "@/src/utils/authUtils";

// Helper to get auth token from storage
// const getAuthToken = () => {
//   // Replace with your actual token retrieval logic
//   return localStorage.getItem("authToken");
// };

// Initiate Payment API
export const initiatePayment = createAsyncThunk(
  "payment/initiatePayment",
  async (amount: number, { rejectWithValue }) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        console.error("Authentication token not found");
        return rejectWithValue("Authentication required. Please log in again.");
      }

      console.log(
        "Initiating payment with token:",
        token.substring(0, 10) + "..."
      );

      const response = await axios.get(
        `https://pingz.ai/api/user/payments/razorpay/initiate?amount=${amount}`,
        {
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Initiate payment API response:", response.status);
      return response.data;
    } catch (error: any) {
      console.error("Payment initiation error:", error.response || error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to initiate payment";

      return rejectWithValue(errorMessage);
    }
  }
);
