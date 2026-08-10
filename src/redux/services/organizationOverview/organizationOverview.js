import { api } from "../api/api.js";

export const OrganizationOverviewService = api.injectEndpoints({
  endpoints: (builder) => ({
    getJobAnalyticsV2: builder.query({
  query: ({
    organisationId,
    groupBy = "month",
    periodCount = "all",
    status = "all",
    countsType = "cumulative",
    filterBySubfunction,
    country,
  }) => {
    const params = new URLSearchParams({
      organisation_id: organisationId,
      group_by: groupBy,
      status,
      counts_type: countsType,
      country: !country || country === "all" ? "all_locations" : country,
    });

    if (periodCount === "all") {
      params.append("all_time", "true");
    } else {
      params.append("period_count", periodCount);
    }

    if (filterBySubfunction) {
      params.append("sub_function", filterBySubfunction);
    }

    return `/acc/organisations/job-analytics_v2?${params.toString()}`;
  },
  providesTags: ["JobAnalytics"],
}),
  }),
});

// ── Export hooks ──
export const {
  useGetJobAnalyticsV2Query,
} = OrganizationOverviewService;