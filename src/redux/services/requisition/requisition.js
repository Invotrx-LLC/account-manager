import { use } from "react";
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
        // url: `/acc/get_candidate_profile/${matched_candidate_id}`,
        url: `/acc/get_matched_candidates_details/${matched_candidate_id}`,
        method: "GET",
      }),
    }),

    // ======================= Get Candidate Timeline =======================
    getCandidateStageTimeline: builder.query({
      query: (candidateId) => ({
        url: `/acc/get_candidate_timeline/${candidateId}`,
        method: "GET",
      }),
    }),

    getAssignedOrgCandidates: builder.query({
      query: () => ({
        url: "/acc/get_assigned_org_candidates",
        method: "GET",
      }),
    }),

    getOrganisationInterviews: builder.query({
      query: (orgId) => ({
        url: `/acc/get_organisation_interviews/${orgId}`,
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
  }),
});

// Export hooks
export const {
  useGetMyOrganisationsQuery,
  useGetOrganisationJobsQuery,
  useGetJobMatchedCandidatesQuery,
  useGetCandidateStageTimelineQuery,
  useGetCandidateDetailQuery,
  useGetAssignedOrgCandidatesQuery,
  useGetOrganisationInterviewsQuery,
  useGetInterviewStatusDropdownQuery,
  useAssignOrganisationMutation,
  useGetAllInternalUsersQuery,
  useGetOrganisationJobAnalyticsQuery,
} = requisitionApi;
