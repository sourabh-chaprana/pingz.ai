import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
// import userReducer from '../features/user/userSlice';
import templateReducer from '../features/template/templateSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  templates: templateReducer,
//   user: userReducer,
});

export default rootReducer; 