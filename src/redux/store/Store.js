import { configureStore } from "@reduxjs/toolkit";
import candidateReducer from "../slices/candidateSlice";
import { api } from "../services/api";

export const store = configureStore({
  reducer: {
    candidate: candidateReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});