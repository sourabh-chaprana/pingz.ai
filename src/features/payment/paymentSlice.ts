import { createSlice } from "@reduxjs/toolkit";
import { initiatePayment } from "./paymentThunk";

interface PaymentState {
  loading: boolean;
  error: string | null;
  orderData: any | null;
}

const initialState: PaymentState = {
  loading: false,
  error: null,
  orderData: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    resetPaymentState: (state) => {
      state.loading = false;
      state.error = null;
      state.orderData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initiate Payment
      .addCase(initiatePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.orderData = action.payload;
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;
