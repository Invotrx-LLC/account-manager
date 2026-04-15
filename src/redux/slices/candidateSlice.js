import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  loading: false,
};

const candidateSlice = createSlice({
  name: "candidate",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    logout: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, setLoading, logout } = candidateSlice.actions;
export default candidateSlice.reducer;