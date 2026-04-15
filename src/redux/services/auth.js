import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [],
  endpoints: (builder) => ({
    // ✅ FIXED LOGIN
    login: builder.mutation({
      query: (body) => ({
        url: "/acc/account_manager_login",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
        body: new URLSearchParams({
          email: body.email,
          password: body.password,
        }),
      }),
    }),

    // ✅ KEEP THIS (your signup is correct based on your backend)
    signup: builder.mutation({
      query: (body) => {
        const queryParams = new URLSearchParams({
          email: body.email,
          password: body.password,
          confirm_password: body.confirm_password,
          phone_no: body.phone_no,
        }).toString();

        return {
          url: `/auth/candidate/signup?${queryParams}`,
          method: "POST",
        };
      },
    }),
  }),
});

export const { useLoginMutation, useSignupMutation } = api;
