// src/redux/slices/breadcrumbSlice.js
import { createSlice } from "@reduxjs/toolkit";

const breadcrumbSlice = createSlice({
  name: "breadcrumb",
  initialState: { dynamicLabels: {} },
  reducers: {
    setDynamicLabels: (state, action) => {
      // merge — never wipes previous levels
      state.dynamicLabels = { ...state.dynamicLabels, ...action.payload };
    },
    clearDynamicLabels: (state) => {
      state.dynamicLabels = {};
    },
  },
});

export const { setDynamicLabels, clearDynamicLabels } = breadcrumbSlice.actions;
export const selectDynamicLabels = (state) => state.breadcrumb.dynamicLabels;
export default breadcrumbSlice.reducer;