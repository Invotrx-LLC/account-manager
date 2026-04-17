import { configureStore } from "@reduxjs/toolkit";
import { requisitionApi } from "../services/requisition/requisition";
export const store = configureStore({
  reducer: {
    [requisitionApi.reducerPath]: requisitionApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(requisitionApi.middleware),
});