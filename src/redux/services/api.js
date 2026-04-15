import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Profile"],
  endpoints: (builder) => ({
    // 🔥 get profile
    getProfile: builder.query({
      query: () => "/candidate/profile",
      providesTags: ["Profile"],
    }),

    // 🔥 login
    login: builder.mutation({
      query: (body) => ({
        url: "/auth/candidate/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),
    refreshMe: builder.query({
  query: () => "/candidate/me", // 🔥 change based on your API
}),
  }),
});

export const {
  useGetProfileQuery,
  useLoginMutation,
  useLazyRefreshMeQuery,
} = api;