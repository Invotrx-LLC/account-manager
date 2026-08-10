import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  query: "",
};

const globalSearchSlice = createSlice({
  name: "globalSearch",
  initialState,
  reducers: {
    setGlobalSearchQuery: (state, action) => {
      state.query = action.payload || "";
    },
    clearGlobalSearchQuery: (state) => {
      state.query = "";
    },
  },
});

export const { setGlobalSearchQuery, clearGlobalSearchQuery } =
  globalSearchSlice.actions;

export const selectGlobalSearchQuery = (state) =>
  state.globalSearch?.query || "";

export default globalSearchSlice.reducer;
