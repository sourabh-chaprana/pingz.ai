import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
// import userReducer from '../features/user/userSlice';
import templateReducer from "../features/template/templateSlice";
import homeReducer from "../features/home/homeSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  templates: templateReducer,
  home: homeReducer,
  //   user: userReducer,
});

export default rootReducer;
