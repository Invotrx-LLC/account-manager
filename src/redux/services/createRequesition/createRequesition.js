import { api } from "../api/api";

export const createRequisitionService = api.injectEndpoints({
    endpoints: (builder) => ({
        getCountries: builder.query({
            query: () => ({
                url: "/acc/dropdown/countries",
                method: "GET",
            }),
        }),

        getCitiesByCountry: builder.query({
            query: (country) => ({
                url: `/acc/dropdown/locations?country=${country}`,
                method: "GET",
            }),
        }),

        getHiringManagers: builder.query({
            query: () => ({
                url: "/acc/hiring-managers",
                method: "GET",
            }),
        }),

        getSubFunctions: builder.query({
            query: (functionKey) => ({
                url: `/acc/dropdown/${functionKey}`,
                method: "GET",
            }),
        }),

        getNormalSkills: builder.query({
            query: (subFunction) =>
                `/normal_skill/by-sub_function?sub_function=${subFunction}`,
            transformResponse: (response) => response.data,
        }),

        getPrimarySkills: builder.query({
            query: (subFunction) => ({
                url: `/acc/skills/${subFunction}`,
                method: "GET",
            }),
        }),

        getMandatorySkills: builder.query({
            query: ({ subFunction, primarySelected }) => ({
                url: `/acc/mandatory_skill/by-primary?sub_function=${encodeURIComponent(
                    subFunction
                )}&primary_selected=${encodeURIComponent(primarySelected)}`,
                method: "GET",
            }),
            transformResponse: (response) => response.data,
        }),

        getApprovers: builder.query({
            query: ({ orgID }) => ({
                url: `/acc/get_employee_details_by_organisation/${orgID}`,
                method: "GET",
            }),
        }),

        getSecondarySkills: builder.query({
            query: ({ subFunction, primarySelected, mandatorySelected }) => ({
                url: `/acc/secondary_skill/by-mandatory?sub_function=${encodeURIComponent(
                    subFunction
                )}&primary_selected=${encodeURIComponent(
                    primarySelected
                )}&mandatory_selected=${encodeURIComponent(
                    mandatorySelected
                )}`,
                method: "POST",
                body: "",
            }),
            transformResponse: (response) => response.data,
        }),

        getEdcTools: builder.query({
            query: () => ({
                url: "/acc/edc-tools",
                method: "GET",
            }),
            transformResponse: (response) => response.data,
        }),

        getTherapeuticAreas: builder.query({
            query: () => ({
                url: "/acc/therapeutic-areas",
                method: "GET",
            }),
            transformResponse: (response) => response.data,
        }),

        getCPSkills: builder.query({
            query: (mode = "normal") => ({
                url: "/acc/raveprogrammer/skills",
                method: "GET",
                params: { mode },
            }),
            transformResponse: (response) => response.data,
        }),

        getCPRemainingSkills: builder.query({
            query: ({ mode = "advanced", selectedSkills = [] }) => ({
                url: `/acc/raveprogrammerskills/remaining`,
                method: "POST",
                params: { mode },
                body: { selected_skill_keys: selectedSkills },
            }),
            transformResponse: (response) => response.data,
        }),

        getTemplates: builder.query({
            query: ({ orgID }) => ({
                url: `/acc/job-templates?organisation_id=${orgID}`,
                method: "GET",
            }),
        }),

        deleteTemplate: builder.mutation({
            query: (templateId) => ({
                url: `/acc/templates/${templateId}`,
                method: "DELETE",
            }),
        }),

        // ── KEY FIX: pass FormData directly, no Content-Type header ──
        createRequisition: builder.mutation({
            query: (formData) => ({
                url: "/acc/account_manager/create-new-job",
                method: "POST",
                body: formData,
                // fetchBaseQuery detects FormData and skips JSON serialization
                // DO NOT set headers here — browser sets multipart/form-data + boundary
            }),
        }),
        getMatchingCandidates: builder.mutation({
            query: ({ jobId, orgEmpId }) => ({
                url: `/acc/get_matching_candidates/${jobId}`,
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    org_emp_id: orgEmpId,
                }).toString(),
            }),
        }),
        getMatchedCandidateDetails: builder.query({
            query: (candidateId) => ({
                url: `/acc/get_matched_candidates_details/${candidateId}`,
                method: "GET",
            }),
            transformResponse: (response) => response.data,
        }),
    }),
});

export const {
    useGetCountriesQuery,
    useGetCitiesByCountryQuery,
    useGetHiringManagersQuery,
    useGetSubFunctionsQuery,
    useGetNormalSkillsQuery,
    useGetPrimarySkillsQuery,
    useGetMandatorySkillsQuery,
    useGetSecondarySkillsQuery,
    useGetEdcToolsQuery,
    useGetTherapeuticAreasQuery,
    useGetCPMandatorySkillsQuery,
    useGetCPSecondarySkillsQuery,
    useGetCPRemainingSkillsQuery,
    useGetTemplatesQuery,
    useDeleteTemplateMutation,
    useGetCPSkillsQuery,
    useGetApproversQuery,
    useCreateRequisitionMutation,
    useGetMatchingCandidatesMutation,
    useGetMatchedCandidateDetailsQuery,
    useLazyGetMatchedCandidateDetailsQuery
} = createRequisitionService;