import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Transaction {
  id: string;
  templateName: string;
  createdOn: string;
  count: number;
  records?: number;
}

export interface TransactionResponse {
  content: Transaction[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

const initialState: TransactionState = {
  transactions: [],
  loading: false,
  error: null,
  totalItems: 0,
  totalPages: 0,
  currentPage: 0,
  itemsPerPage: 10,
};

const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    fetchTransactionsStart: (
      state,
      action: PayloadAction<{ page: number; size: number }>
    ) => {
      state.loading = true;
      state.error = null;
      state.currentPage = action.payload.page;
      state.itemsPerPage = action.payload.size;
    },
    fetchTransactionsSuccess: (
      state,
      action: PayloadAction<TransactionResponse>
    ) => {
      state.transactions = action.payload.content.map((item) => ({
        ...item,
        count: item.count || item.records || 0,
      }));
      state.totalItems = action.payload.totalElements;
      state.totalPages = action.payload.totalPages;
      state.loading = false;
      state.error = null;
    },
    fetchTransactionsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearTransactions: (state) => {
      state.transactions = [];
      state.totalItems = 0;
      state.totalPages = 0;
    },
  },
});

export const {
  fetchTransactionsStart,
  fetchTransactionsSuccess,
  fetchTransactionsFailure,
  clearTransactions,
} = transactionSlice.actions;

export default transactionSlice.reducer;
