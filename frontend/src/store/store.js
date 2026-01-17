// frontend/src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import companyReducer from "./slices/companySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    company: companyReducer,
  },
});

export default store;
