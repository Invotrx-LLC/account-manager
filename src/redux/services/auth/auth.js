import { api } from "../api/api";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({
        url: "/acc/account_manager_login",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email: body.email,
          password: body.password,
        }),
      }),
    }),

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

export const { useLoginMutation, useSignupMutation } = authApi;
