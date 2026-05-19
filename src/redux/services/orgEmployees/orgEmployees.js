// src/redux/services/orgEmplyeeService.js
import { api } from "../api/api";

export const orgEmplyeeService = api.injectEndpoints({
  endpoints: (builder) => ({
    getEmployeeDetails: builder.query({
      query: (organisationId) => ({
        url: `/acc/get_employee_details_by_organisation/${organisationId}`,
        method: "GET",
      }),
      providesTags: ["EmployeeDetails"],
    }),
  }),
});

// ── Export hooks ──
export const { useGetEmployeeDetailsQuery } = orgEmplyeeService;