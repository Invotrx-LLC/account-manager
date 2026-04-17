import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQuery";

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Organisations"],

  endpoints: (builder) => ({

    // ✅ GET ORGANISATIONS (correct)
    getMyOrganisations: builder.query({
      query: () => ({
        url: "/acc/account_manager_get_my_organisations",
        method: "GET",
      }),
      providesTags: ["Organisations"],
    }),
  }),
});

// ✅ correct hooks
export const {
  useGetMyOrganisationsQuery,
} = api;