// src/redux/services/userManagement.js
import { api } from "../api/api";

export const userManagement = api.injectEndpoints({
  endpoints: (builder) => ({
    createUser: builder.mutation({
      query: (body) => ({
        url: "/acc/create_internal_user",
        method: "POST",
        body,
      }),
      //   providesTags: ["EmployeeDetails"],
      invalidatesTags: ["InternalUsers"],
    }),
    updateUserByAdmin: builder.mutation({
      query: ({ userId, body }) => ({
        url: `/acc/update_user_details_by_admin/${userId}`,
        method: "PUT",
        body,
      }),
    }),
  }),
});

// ── Export hooks ──
export const { useCreateUserMutation, useUpdateUserByAdminMutation } = userManagement;
