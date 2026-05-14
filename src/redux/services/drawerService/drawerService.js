// drawerService.js
import { api } from "../api/api";

export const drawerService = api.injectEndpoints({
  endpoints: (builder) => ({
    getMyAssignedRequests: builder.query({
      query: () => ({
        url: "/acc/my-assigned-requests",
        method: "GET",
      }),
      providesTags: ["AssignedRequests"],
    }),

    getRequestCandidateScores: builder.query({
      query: (requestUuid) =>
        `/acc/get-request-candidate-scores/${requestUuid}`,
      providesTags: (result, error, requestUuid) => [
        { type: "CandidateScores", id: requestUuid },
      ],
    }),

    closeRequestAndAddCandidates: builder.mutation({
      query: ({ requestUuid, candidateIds }) => ({
        url: `/acc/close-request-and-add-candidates?request_id=${requestUuid}`,
        method: "POST",
        body: candidateIds, // string[]
      }),
      invalidatesTags: ["AssignedRequests"],
    }),
  }),
});

// ── Export hooks ──
export const {
  useGetMyAssignedRequestsQuery,
  useGetRequestCandidateScoresQuery,
  useCloseRequestAndAddCandidatesMutation,
} = drawerService;