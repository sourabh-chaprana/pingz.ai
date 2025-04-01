import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
// import userReducer from '../features/user/userSlice';
import templateReducer from "../features/template/templateSlice";
import homeReducer from "../features/home/homeSlice";
import searchReducer from "../features/search/searchSlice";

import accountReducer from "../features/accounts/accountSlice";
import transactionReducer from "../features/transaction/transactionSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  templates: templateReducer,
  home: homeReducer,
  search: searchReducer,
  account: accountReducer,
  transaction: transactionReducer,
  //   user: userReducer,
});

export default rootReducer;
