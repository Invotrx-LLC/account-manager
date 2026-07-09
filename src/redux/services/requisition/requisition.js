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
    updateOrganisationUpdatedScores: builder.mutation({
      query: ({ organisationId, updated_scores }) => ({
        url: `/acc/organisations/${organisationId}/updated-scores`,
        method: "PUT",
        body: {
          updated_scores,
        },
      }),
      invalidatesTags: (result, error, { organisationId }) => [
        { type: "Organisation", id: organisationId },
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
    // Add inside the `endpoints: (builder) => ({ ... })` block
    updateCandidateStatus: builder.mutation({
      query: ({ candidateId, newStatus, reason }) => ({
        url: `/acc/matched_candidates/update_status_v1`,
        method: "POST",
        params: {
          candidate_id: candidateId,
          new_status: newStatus,
          reason: reason
        },
        invalidatesTags: (result, error, arg) => [
          { type: "CandidateDetail", id: arg.candidateId },
          { type: "CandidateStageTimeline", id: arg.candidateId },
        ],
      }),
      // if you tag candidate detail queries, invalidate here so the page refetches
      invalidatesTags: (result, error, arg) => [
        { type: "CandidateDetail", id: arg.candidateId },
        { type: "CandidateStageTimeline", id: arg.candidateId },
      ]
    }),
    updateInterviewRoundStatus: builder.mutation({
      query: ({ interviewId, status, reason }) => ({
        url: `/acc/interviews/${interviewId}/status_v1`,
        method: "PUT",
        params: { new_status: status, reason },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "CandidateDetail", id: arg.candidateId },
        { type: "CandidateStageTimeline", id: arg.candidateId },
      ],
    }),

    updateInterviewResult: builder.mutation({
      query: ({ interviewId, result }) => ({
        url: `/acc/interviews/${interviewId}/status_v1`,
        method: "PUT",
        params: { result },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "CandidateDetail", id: arg.candidateId },
        { type: "CandidateStageTimeline", id: arg.candidateId },
      ],
    }),
    rescheduleInterview: builder.mutation({
      query: ({ interviewId, body }) => ({
        url: `/acc/interview/${interviewId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "CandidateDetail", id: arg.candidateId },
        { type: "CandidateStageTimeline", id: arg.candidateId },
      ],
    }),
    scheduleInterview: builder.mutation({
      query: ({ candidateId, payload }) => ({
        url: `/acc/matched_candidates/${candidateId}/schedule_interview`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "CandidateDetail", id: arg.candidateId },
      ],
    }),
    getInterviewFullDetails: builder.query({
      query: (interviewId) => `/acc/interviews_details/${interviewId}`,
    }),
    getInterviewFeedback: builder.query({
      query: (interviewId) => `/acc/interview/${interviewId}/feedback`,
      providesTags: (result, error, interviewId) => [
        { type: "InterviewFeedback", id: interviewId },
      ],
    }),
    getEmployeesByRole: builder.query({
      query: ({ organisationId, employeeExcludeIds }) => ({
        url: "/acc/user-employees/by-role_v1",
        method: "GET",
        params: {
          organisation_id: organisationId,
          ...(employeeExcludeIds && {
            employee_exclude_ids: employeeExcludeIds,
          }),
        },
      }),
      providesTags: ["EmployeesByRole"],
    }),
    scheduleInterviewInCandidates: builder.mutation({
      query: (payload) => ({
        url: "/acc/schedule_interview",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "CandidateStageTimeline", id: arg.matched_candidate_id },
        { type: "CandidateDetail", id: arg.matched_candidate_id },
      ],
    }),
    getCandidateDetail: builder.query({
      query: (matched_candidate_id) => ({
        url: `/acc/get_matched_candidates_details/${matched_candidate_id}`,
        method: "GET",
      }),
      providesTags: (result, error, matched_candidate_id) => [
        { type: "CandidateDetail", id: matched_candidate_id },
      ],
    }),

    getCandidateStageTimeline: builder.query({
      query: (candidateId) => ({
        url: `/acc/timeline/${candidateId}`,
        method: "GET",
      }),
      providesTags: (result, error, candidateId) => [
        { type: "CandidateStageTimeline", id: candidateId },
      ],
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
    getJobInterviews: builder.query({
      query: (jobId) => ({
        url: `/acc/interviews/by-job/${jobId}`,
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
          ...(params.cursor_created_at && {
            cursor_created_at: params.cursor_created_at,
          }),
          ...(params.cursor_id && { cursor_id: params.cursor_id }),
          ...(params.search && { search: params.search }),
          ...(params.domain && { domain: params.domain }),
          ...(params.function && { function: params.function }),
          ...(params.sub_function && { sub_function: params.sub_function }),
        },
      }),

    }),

    updateCandidateActiveStatus: builder.mutation({
      query: ({ candidate_id, is_active }) => ({
        url: `/acc/update_candidate_active_status`,
        method: "PUT",
        params: { candidate_id, is_active },
      }),
    }),

    uploadCandidateResume: builder.mutation({
      query: (formData) => ({
        url: "/acc/upload-resume-with-subfunction-or-job_id/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["ImportedCandidates"],
    }),


    getCandidateDetails: builder.query({
      query: (candidateId) =>
        `/acc/get_candidate_complete_details/${candidateId}`,
    }),

    searchCandidates: builder.query({
      query: (search) => ({
        url: `/acc/search_candidates`,
        params: { search },
        method: "GET",
      }),
      // No providesTags — purely on-demand, managed by lazy query
    }),
    getResumeView: builder.query({
      query: (candidateId) => ({
        url: `/acc/resume_view_by_input/`,
        params: { candidate_id: candidateId },
        method: "GET",
      }),
    }),
    getJobDetails: builder.query({
      query: (jobId) => ({
        url: `/acc/account_manager/get_job_details/${jobId}`,
        method: "GET",
      }),
      providesTags: (result, error, jobId) => [
        { type: "JobDetails", id: jobId },
      ],
    }),
    getInterviewDetails: builder.query({
      query: (interviewId) => `/acc/get_interview-details/${interviewId}`,
    }),
    getCandidateSkillInfo: builder.query({
      query: (candidateId) => ({
        url: `/acc/get_candidate_skills/${candidateId}/skills`,
        method: "GET",
      }),
      transformResponse: (response) => response.data,  // gives { candidate_id, sub_function, skills }
      providesTags: (result, error, candidateId) => [
        { type: "CandidateSkillInfo", id: candidateId }
      ],
    }),
    updateCandidateSkills: builder.mutation({
      query: ({ candidateId, body }) => ({
        url: `/acc/update_candidate_skills/${candidateId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { candidateId }) => [
        { type: "CandidateSkillInfo", id: candidateId }
      ],
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
  useGetJobInterviewsQuery,
  useGetInterviewStatusDropdownQuery,
  useAssignOrganisationMutation,
  useGetAllInternalUsersQuery,
  useGetOrganisationJobAnalyticsQuery,
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useGetImportedCandidatesQuery,
  useLazyGetImportedCandidatesQuery, //  lazy version for manual "Show More" fetching
  useUpdateCandidateActiveStatusMutation,
  useGetCandidateDetailsQuery,
  useUploadCandidateResumeMutation,
  useLazySearchCandidatesQuery,
  useLazyGetResumeViewQuery,
  useGetJobDetailsQuery,
  useGetInterviewDetailsQuery,
  useLazyGetInterviewDetailsQuery,
  useGetCandidateSkillInfoQuery,
  useUpdateCandidateSkillsMutation,
  useUpdateOrganisationUpdatedScoresMutation,
  useUpdateCandidateStatusMutation,
  useScheduleInterviewMutation,
  useGetEmployeesByRoleQuery,
  useLazyGetEmployeesByRoleQuery,
  useScheduleInterviewInCandidatesMutation,
  useRescheduleInterviewMutation,
  useUpdateInterviewRoundStatusMutation,
  useUpdateInterviewResultMutation,
  useLazyGetInterviewFullDetailsQuery,
  useLazyGetInterviewFeedbackQuery
} = requisitionApi;
