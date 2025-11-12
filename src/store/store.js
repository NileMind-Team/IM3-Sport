import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "../redux/slices/loginSlice";
import registerReducer from "../redux/slices/registerSlice";

export const store = configureStore({
  reducer: {
    login: loginReducer,
    register: registerReducer,
  },
});