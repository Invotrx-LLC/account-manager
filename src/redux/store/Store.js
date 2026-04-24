import { configureStore } from "@reduxjs/toolkit";
import { requisitionApi } from "../services/requisition/requisition";
import breadcrumbReducer from "../slices/breadcrumbSlice";
export const store = configureStore({
  reducer: {
    [requisitionApi.reducerPath]: requisitionApi.reducer,
    breadcrumb: breadcrumbReducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(requisitionApi.middleware),
});