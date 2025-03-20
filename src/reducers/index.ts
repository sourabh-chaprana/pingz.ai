import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
// import userReducer from '../features/user/userSlice';

const rootReducer = combineReducers({
  auth: authReducer,
//   user: userReducer,
});

export default rootReducer; 