// dashboardService.js
import { api } from "../api/api";

export const dashboardService = api.injectEndpoints({
    endpoints: (builder) => ({
        getCandidateListByStatus: builder.query({
            query: (status = "") => ({
                url: "/acc/candidate_list_by_status",
                params: { status },
            }),
        }),

        getJobAnalytics: builder.query({
            query: ({
                groupBy = "month",
                periodCount = 6,
                status = "all",
                scope = "user",
                countsType = "cumulative",
                filterBySubfunction = "",   // empty = All
                country = "all",
            } = {}) => {
                const isAllTime = periodCount === "all";
                return {
                    url: "/acc/organisations/job-analytics_v2",
                    params: {
                        group_by: groupBy,
                        status,
                        scope,
                        counts_type: countsType,
                        all_time: isAllTime,
                        ...(isAllTime ? {} : { period_count: periodCount }),
                        country,
                        ...(filterBySubfunction ? { filter_by_subfunction: filterBySubfunction } : {}),
                    },
                };
            },
        }),

        getStageDetails: builder.query({
            query: ({
                stage, period = "", status = "all", scope = "user",
                countsType = "cumulative", filterBySubfunction = "",
                country = "all", page = 1, pageSize = 50,
            }) => ({
                url: "/acc/analytics/jobs/stage-details",
                params: {
                    stage, period, status, scope,
                    counts_type: countsType,
                    country,
                    ...(filterBySubfunction ? { filter_by_subfunction: filterBySubfunction } : {}),
                    page, page_size: pageSize,
                },
            }),
            // Stage dialogs are often reopened while reviewing candidates.
            // Keep their paginated results in the Redux RTK Query cache so
            // reopening a stage is immediate instead of making another call.
            keepUnusedDataFor: 300,
        }),

        getJobsList: builder.query({
            query: ({
                status = "all",
                country = "all",
                filterBySubfunction = "all",
                periodCount,   // 3 | 6 | "all"/undefined = leave empty (all time)
            } = {}) => ({
                url: "/acc/get_jobs_list_v1",
                params: {
                    status,
                    country,
                    // The sub-function filter key is underscored (e.g. "clinical_data_manager"),
                    // but this endpoint expects it space-separated (e.g. "clinical data manager").
                    sub_function: filterBySubfunction ? filterBySubfunction.replace(/_/g, " ") : "all",
                    ...(periodCount === 3 || periodCount === 6 ? { period: periodCount } : {}),
                },
            }),
        }),

        // ── org-wide stage drill-down — now filter-aware ─────────────────────
        // getStageDetails: builder.query({
        //     query: ({
        //         stage,
        //         period = "",
        //         status = "all",
        //         scope = "user",
        //         countsType = "cumulative",
        //         domain = "all",
        //         function: fn = "all",
        //         subFunction = "all",
        //         page = 1,
        //         pageSize = 50,
        //     }) => ({
        //         url: "/analytics/jobs/stage-details",
        //         params: {
        //             stage,
        //             period,            // leave blank to get all months, never force a specific month
        //             status,
        //             scope,
        //             counts_type: countsType,
        //             domain,
        //             function: fn,
        //             sub_function: subFunction,
        //             page,
        //             page_size: pageSize,
        //         },
        //     }),
        // }),

        // ── Job analytics by specific job ID ─────────────────────────────────
        getJobAnalyticsById: builder.query({
            query: ({
                jobId,
                groupBy = "month",
                periodCount = 6,
                status = "all",
                countsType = "cumulative",
            }) => ({
                url: "/acc/analytics/jobs/by-id",
                params: {
                    job_ids: jobId,
                    group_by: groupBy,
                    period_count: periodCount,
                    status,
                    counts_type: countsType,
                },
            }),
            keepUnusedDataFor: 60,
        }),

        // ── Stage-level candidate drill-down for a specific job ──────────────
        getJobStageDetails: builder.query({
            query: ({ jobId, stage }) => ({
                url: "/acc/analytics/jobs/by-id/stage-details",
                params: {
                    job_id: jobId,
                    stage,
                },
            }),
            keepUnusedDataFor: 30,
        }),
        getSubFunctions: builder.query({
            query: () => ({
                url: "/acc/dropdown/job-analytics/sub-functions",
            }),
            keepUnusedDataFor: 300,
        }),
    }),
});

// ── Export hooks ──
export const {
    useGetCandidateListByStatusQuery,
    useGetJobAnalyticsQuery,
    useGetJobsListQuery,
    useLazyGetStageDetailsQuery,
    useGetJobAnalyticsByIdQuery,
    useLazyGetJobStageDetailsQuery,
    useGetSubFunctionsQuery,
} = dashboardService;