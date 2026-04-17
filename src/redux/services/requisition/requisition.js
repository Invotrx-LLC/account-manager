import { api } from "../api/api"; // 🔥 import base api

export const requisitionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMyOrganisations: builder.query({
      query: () => ({
        url: "/acc/account_manager_get_my_organisations",
        method: "GET",
      }),
      providesTags: ["Organisations"],
    }),
  }),
});

export const { useGetMyOrganisationsQuery } = requisitionApi;
