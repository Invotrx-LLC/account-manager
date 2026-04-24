import { api } from "../api/api";
import { getItem } from "../../../utils/constants";
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
      query: (body) => ({
        url: "/acc/account_manager_signup",
        method: "POST",
        body: {
          first_name: body.first_name,
          last_name: body.last_name,
          phone_number: body.phone_number,
          email: body.email,
          password: body.password,
          confirm_password: body.confirm_password,
        },
      }),
    }),
    signupVerifyOTP: builder.mutation({
      query: (body) => ({
        url: "/acc/account_manager_verify_otp",
        method: "POST",
        body: {
          email: body.email,
          otp: body.otp,
        },
      }),
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({
        url: `/acc/forgot-password?email=${encodeURIComponent(body.email)}`,
        method: "POST",
      }),
    }),
    forgotVerifyOTP: builder.mutation({
      query: (body) => {
        return {
          url: "/acc/hiring_manager/aws_confirm-forgot-password",
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            confirmation_code: body.otp, // ✅ FIXED
            new_password: body.password, // ✅ FIXED
            confirm_password: body.confirmPassword, // ✅ FIXED
          }),
        };
      },
    }),
    forgotResendOTP: builder.mutation({
      query: (body) => ({
        url: `/acc/resend-otp`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          email: body.email,
        },
      }),
    }),
    logout: builder.query({
      query: () => ({
        url: "/acc/account_manager_logout",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useForgotPasswordMutation,
  useForgotVerifyOTPMutation,
  useSignupVerifyOTPMutation,
  useForgotResendOTPMutation,
  useLazyLogoutQuery,
} = authApi;
