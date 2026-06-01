import { api } from "../api/api";

export const candidateService = api.injectEndpoints({
  endpoints: (builder) => ({
    deleteCandidate: builder.mutation({
      query: ({ candidate_id, confirmation_text }) => ({
        url: `/acc/candidate/delete-complete?candidate_id=${candidate_id}&confirmation_text=${confirmation_text}`,
        method: "DELETE",
      }),
    }),
    getCandidateMatchedJobs: builder.query({
      query: (candidate_id) => ({
        url: `/acc/candidate/jobs/${candidate_id}`,
        method: "GET",
      }),
    }),
  }),
});

// ── Export hooks ──
export const { useDeleteCandidateMutation, useGetCandidateMatchedJobsQuery } = candidateService;
