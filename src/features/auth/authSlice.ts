import { PayloadAction, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login, logout, register, refreshToken, verifyOtp } from './authThunks';

interface User {
  id: string;
  email: string;
  name: string;
  userType?: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  otpVerificationLoading: boolean;
}

// Helper function to decode JWT token
function decodeToken(token: string | null | undefined): any {
  try {
    if (!token) {
      console.log('Token is null or undefined');
      return null;
    }
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('Token does not have the expected format');
      return null;
    }
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error decoding token:', e);
    return null;
  }
}

const authSlice = createSlice({
    name: 'auth',
    initialState: {
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      otpVerificationLoading: false,
    } as AuthState,
    reducers: {
      setTokens: (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = !!action.payload.token;
      },
      loginSuccess: (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      },
      clearError: (state) => {
        state.error = null;
      }
    },
    extraReducers: (builder) => {
      builder
        .addCase(login.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(login.fulfilled, (state, action) => {
          state.loading = false;
          state.isAuthenticated = true;
          state.token = action.payload.idToken;
          state.refreshToken = action.payload.refreshToken;
          
          // Extract user data from token
          const tokenData = decodeToken(action.payload.idToken);
          if (tokenData) {
            state.user = {
              id: tokenData.userId || tokenData.sub,
              email: tokenData.email,
              name: tokenData.name,
              userType: tokenData.userType
            };
          }
          
          console.log('Auth state updated:', state);
        })
        .addCase(login.rejected, (state, action) => {
          state.loading = false;
          state.error = action.error.message || 'Login failed';
        })
        .addCase(register.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(register.fulfilled, (state, action) => {
          state.loading = false;
          // User is not authenticated yet, needs OTP verification
          state.isAuthenticated = false;
          
          console.log('Registration successful, waiting for OTP verification');
        })
        .addCase(register.rejected, (state, action) => {
          state.loading = false;
          state.error = action.error.message || 'Registration failed';
        })
        .addCase(verifyOtp.pending, (state) => {
          state.otpVerificationLoading = true;
          state.error = null;
        })
        .addCase(verifyOtp.fulfilled, (state, action) => {
          state.otpVerificationLoading = false;
          // No need to set tokens or authenticate
          console.log('OTP verification successful');
        })
        .addCase(verifyOtp.rejected, (state, action) => {
          state.otpVerificationLoading = false;
          state.error = action.error.message || 'OTP verification failed';
        })
        .addCase(logout.fulfilled, (state) => {
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
          state.refreshToken = null;
        })
        .addCase(refreshToken.fulfilled, (state, action) => {
          state.token = action.payload.idToken;
          state.refreshToken = action.payload.refreshToken;
          
          // Update user data if needed
          const tokenData = decodeToken(action.payload.idToken);
          if (tokenData) {
            state.user = {
              ...state.user,
              id: tokenData.userId || tokenData.sub,
              email: tokenData.email,
              name: tokenData.name,
              userType: tokenData.userType
            };
          }
        });
    },
});

export const { loginSuccess, clearError, setTokens } = authSlice.actions;
export default authSlice.reducer; 