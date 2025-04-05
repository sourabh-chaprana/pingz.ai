import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchUserData, updateUserData } from './accountsThunk';

export interface UserData {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  type: string;
  emailVerified: boolean;
  header: string | null;
  footer: string | null;
  profileImage: string | null;
  mobileNumber: string | null;
  dob: string | null;
  anniversaryDate: string | null;
  purposeOfUse: string | null;
  membership: string;
}

interface AccountState {
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  updateSuccess: boolean;
}

const initialState: AccountState = {
  userData: null,
  loading: false,
  error: null,
  updateSuccess: false,
};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    resetUpdateStatus: (state) => {
      state.updateSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user data
      .addCase('account/fetchUserData/pending', (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase('account/fetchUserData/fulfilled', (state, action) => {
        state.loading = false;
        state.userData = action.payload;
        state.error = null;
      })
      .addCase('account/fetchUserData/rejected', (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user data';
      })
      // Update user data
      .addCase('account/updateUserData/pending', (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase('account/updateUserData/fulfilled', (state, action) => {
        state.loading = false;
        state.userData = action.payload;
        state.updateSuccess = true;
        state.error = null;
      })
      .addCase('account/updateUserData/rejected', (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update user data';
        state.updateSuccess = false;
      });
  },
});

export const { resetUpdateStatus } = accountSlice.actions;
export default accountSlice.reducer;
