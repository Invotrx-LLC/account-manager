import { api } from "../api/api"; // base api

export const requisitionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMyOrganisations: builder.query({
      query: () => ({
        url: "/acc/get_assigned_organisations",
        method: "GET",
      }),
      providesTags: ["Organisations"],
    }),

    getOrganisationJobs: builder.query({
      query: ({ orgId, status = "all" }) => ({
        url: `/acc/get_organisation_requisitions/${orgId}`,
        params: { status },
        method: "GET",
      }),
      providesTags: (result, error, { orgId }) => [
        { type: "OrganisationJobs", id: orgId },
      ],
    }),

    getJobMatchedCandidates: builder.query({
      query: (jobId) => ({
        url: `/acc/get_job_matched_candidates/${jobId}`,
        method: "GET",
      }),
      providesTags: (result, error, jobId) => [
        { type: "JobMatchedCandidates", id: jobId },
      ],
    }),

    getCandidateDetail: builder.query({
      query: (matched_candidate_id) => ({
        url: `/acc/get_matched_candidates_details/${matched_candidate_id}`,
        method: "GET",
      }),
    }),

    getCandidateStageTimeline: builder.query({
      query: (candidateId) => ({
        url: `/acc/get_candidate_timeline/${candidateId}`,
        method: "GET",
      }),
    }),

    getOrganisationCandidates: builder.query({
      query: (organisationId) => ({
        url: `/acc/get_candidates_by_organisation`,
        params: { organisation_id: organisationId },
      }),
    }),

    getOrganisationInterviews: builder.query({
      query: (jobId) => ({
        url: `/acc/get_organisation_interviews/${jobId}`,
        method: "GET",
      }),
    }),

    getInterviewStatusDropdown: builder.query({
      query: () => ({
        url: "/acc/get_interview-status-dropdown",
        method: "GET",
      }),
    }),

    getAllInternalUsers: builder.query({
      query: () => ({ url: "/acc/get_all_internal_users", method: "GET" }),
      providesTags: ["InternalUsers"],
    }),

    assignOrganisation: builder.mutation({
      query: ({ user_id, organisation_id }) => ({
        url: "/acc/assign_organisation",
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ user_id, organisation_id }).toString(),
      }),
      invalidatesTags: ["InternalUsers"],
    }),

    getOrganisationJobAnalytics: builder.query({
      query: ({ organisationId, groupBy = "month", status = "all" }) => ({
        url: `/acc/organisations/job-analytics_v2`,
        params: {
          organisation_id: organisationId,
          group_by: groupBy,
          status,
        },
      }),
    }),

    getMyProfile: builder.query({
      query: () => ({
        url: `/acc/get_my_profile`,
        method: "GET",
      }),
    }),

    updateMyProfile: builder.mutation({
      query: (body) => ({
        url: `/acc/update_my_profile`,
        method: "PUT",
        body,
      }),
    }),

    // ── Imported candidates with cursor pagination + filters ──
    getImportedCandidates: builder.query({
      query: (params) => ({
        url: `/acc/get_all_imported_candidates_with_pagination`,
        params: {
          limit: params.limit ?? 100,
          ...(params.cursor_created_at && { cursor_created_at: params.cursor_created_at }),
          ...(params.cursor_id         && { cursor_id: params.cursor_id }),
          ...(params.search            && { search: params.search }),
          ...(params.domain            && { domain: params.domain }),
          ...(params.function          && { function: params.function }),
          ...(params.sub_function      && { sub_function: params.sub_function }),
        },
      }),
      // ⚠️  No providesTags here — we manage state manually with useLazyQuery
      //     so RTK cache invalidation won't interfere with our accumulation logic
    }),

    updateCandidateActiveStatus: builder.mutation({
      query: ({ candidate_id, is_active }) => ({
        url: `/acc/update_candidate_active_status`,
        method: "PUT",
        params: { candidate_id, is_active },
      }),
    }),

    getCandidateDetails: builder.query({
      query: (candidateId) => `/acc/get_candidate_complete_details/${candidateId}`,
    }),
  }),
});

// ── Export hooks ──
export const {
  useGetMyOrganisationsQuery,
  useGetOrganisationJobsQuery,
  useGetJobMatchedCandidatesQuery,
  useGetCandidateStageTimelineQuery,
  useGetCandidateDetailQuery,
  useGetOrganisationCandidatesQuery,
  useGetOrganisationInterviewsQuery,
  useGetInterviewStatusDropdownQuery,
  useAssignOrganisationMutation,
  useGetAllInternalUsersQuery,
  useGetOrganisationJobAnalyticsQuery,
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useGetImportedCandidatesQuery,
  useLazyGetImportedCandidatesQuery,   //  lazy version for manual "Show More" fetching
  useUpdateCandidateActiveStatusMutation,
  useGetCandidateDetailsQuery
} = requisitionApi;