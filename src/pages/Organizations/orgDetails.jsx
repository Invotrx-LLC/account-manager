// src/pages/Organizations/OrgDetail.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box, Typography, Tabs, Tab, CircularProgress, Alert,
  Grid, Card, CardContent, Chip, Divider, Button, Avatar,
  MenuItem, Select, FormControl, InputLabel,
} from "@mui/material";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
// import PersonOutlineIcon         from "@mui/icons-material/PersonOutline";
import { useDispatch } from "react-redux";
import { setDynamicLabels, clearDynamicLabels } from "../../redux/slices/breadcrumbSlice";
import {
  useGetMyOrganisationsQuery,
  useGetOrganisationJobsQuery,
  useGetAssignedOrgCandidatesQuery,
  useGetOrganisationInterviewsQuery,
} from "../../redux/services/requisition/requisition";

/* ─── Design tokens ── */
const C = {
  accent: "#FF5F1F",
  accentSoft: "#FFF0E8",
  green: "#0F6E56",
  greenSoft: "#E7F8EE",
  indigo: "#4338CA",
  indigoSoft: "#EEF2FF",
  amber: "#92400E",
  amberSoft: "#FEF3C7",
  red: "#B91C1C",
  redSoft: "#FEE2E2",
  border: "#E8E8EC",
  textPrimary: "#111118",
  textSecondary: "#5C5C70",
  textTertiary: "#9696A6",
};

const STATUS_CHIP = {
  open: { bg: C.greenSoft, color: C.green },
  active: { bg: C.greenSoft, color: C.green },
  closed: { bg: "#F3F4F6", color: "#6B7280" },
  filled: { bg: C.indigoSoft, color: C.indigo },
  on_hold: { bg: C.amberSoft, color: C.amber },
};
const statusChip = (s = "") =>
  STATUS_CHIP[s.toLowerCase().replace(/\s+/g, "_")] ?? { bg: "#F3F4F6", color: "#6B7280" };

const TAB_SX = {
  borderBottom: "1px solid #E5E7EB",
  mb: "24px",
  "& .MuiTab-root": {
    textTransform: "none", fontSize: 13, fontWeight: 500,
    color: "#6B7280", minWidth: "auto", px: "4px", mr: "24px",
  },
  "& .Mui-selected": { color: `${C.accent} !important`, fontWeight: 600 },
  "& .MuiTabs-indicator": { backgroundColor: C.accent },
};

/* ═══════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════ */
export default function OrgDetail() {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [tab, setTab] = useState(0);

  const { data: orgsData, isLoading } = useGetMyOrganisationsQuery();
  const org = location.state?.org ?? orgsData?.data?.find((o) => String(o.id) === String(orgId));

  useEffect(() => {
    if (org?.organisation_name) {
      dispatch(setDynamicLabels({ orgId: org.organisation_name }));
    }
    return () => dispatch(clearDynamicLabels());
  }, [org?.organisation_name]);

  if (isLoading || !org) {
    return <Box display="flex" justifyContent="center" py={10}><CircularProgress sx={{ color: C.accent }} /></Box>;
  }

  return (
    <Box sx={{ p: 1 }}>
      <Typography fontSize={22} fontWeight={700} color={C.textPrimary} mb="2px">
        {org.organisation_name}
      </Typography>
      <Typography fontSize={13} color={C.textSecondary} mb="16px">
        {org.clin_org_id} · {org.industry ?? "—"} · {org.country ?? "—"}
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={TAB_SX}>
        <Tab label="Overview" />
        <Tab label="Requisitions" />
        <Tab label="Candidates" />
        <Tab label="Interviews" />
        <Tab label="Billing" />
      </Tabs>

      {tab === 0 && <OrgOverviewTab org={org} />}
      {tab === 1 && <OrgRequisitionsTab orgId={orgId} orgName={org.organisation_name} navigate={navigate} />}
      {tab === 2 && <OrgCandidatesTab orgId={orgId} navigate={navigate} orgName={org.organisation_name} />}
      {tab === 3 && <OrgInterviewsTab orgId={orgId} />}
      {tab === 4 && <StaticPlaceholder label="Billing" description="Billing and invoices will appear here." />}
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   TAB 0 — Overview (uses real org data)
═══════════════════════════════════════════════ */
function OrgOverviewTab({ org }) {
  const profileRows = [
    { label: "Company name", value: org.organisation_name },
    { label: "Location", value: org.country ?? "—" },
    { label: "Website", value: org.website_url ?? "—" },
    { label: "Industry", value: org.industry ?? "—" },
    { label: "Timezone", value: org.time_zone ?? "—" },
  ];
  const metricRows = [
    { label: "Total jobs", value: org.total_jobs ?? 0 },
    { label: "Total hires", value: org.total_hires ?? 0 },
    { label: "Total shortlisted", value: org.total_shortlisted ?? 0 },
    { label: "Interviews scheduled", value: org.total_interviews_scheduled ?? 0 },
    { label: "Interviews completed", value: org.total_interviews_completed ?? 0 },
    { label: "Total selected", value: org.total_selected ?? 0 },
    { label: "Success rate", value: `${org.success_rate ?? 0}%` },
  ];

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <SectionLabel>Core Company Profile</SectionLabel>
        {profileRows.map(({ label, value }) => (
          <InfoRow key={label} label={label} value={value} />
        ))}
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <SectionLabel>Essential Hiring Metrics</SectionLabel>
        {metricRows.map(({ label, value }) => (
          <InfoRow key={label} label={label} value={value} bold />
        ))}
      </Grid>
    </Grid>
  );
}

/* ═══════════════════════════════════════════════
   TAB 1 — Requisitions
═══════════════════════════════════════════════ */
function OrgRequisitionsTab({ orgId, orgName, navigate }) {
  const { data, isLoading, isError, error } = useGetOrganisationJobsQuery({ orgId, status: "all" });
  const jobs = data?.data ?? [];

  if (isLoading) return <Loader />;
  if (isError) return <ErrAlert msg={error?.data?.message ?? error?.status} />;
  if (!jobs.length) return <StaticPlaceholder label="No Requisitions" description="No job requisitions listed for this organization." />;

  return (
    <Grid container spacing={1.5}>
      {jobs.map((job) => {
        const id = job.job_id ?? job.id;
        return (
          <Grid size={{ xs: 12, sm: 6, md: 4, xl: 3 }} key={id}>
            <RequisitionCard
              job={job}
              onOpen={() => navigate(
                `/account-manager/org/${orgId}/requisitions/${id}`,
                { state: { jobTitle: job.job_title, orgName, job } }
              )}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}

/* ═══════════════════════════════════════════════
   TAB 2 — Candidates (uses get_assigned_org_candidates)
═══════════════════════════════════════════════ */
function OrgCandidatesTab({ orgId, navigate, orgName }) {
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, isError } = useGetAssignedOrgCandidatesQuery();

  // Filter candidates whose jobs belong to this org
  const allCandidates = data?.data ?? [];
  const orgCandidates = allCandidates.filter((c) =>
    c.jobs?.some((j) => j.organisation_id === orgId)
  );

  // Status filter options derived from all job statuses in this org
  const statusOptions = React.useMemo(() => {
    const set = new Set();
    orgCandidates.forEach((c) =>
      c.jobs?.filter((j) => j.organisation_id === orgId).forEach((j) => set.add(j.current_stage))
    );
    return Array.from(set);
  }, [orgCandidates]);

  const filtered = statusFilter === "all"
    ? orgCandidates
    : orgCandidates.filter((c) =>
      c.jobs?.some((j) => j.organisation_id === orgId && j.current_stage === statusFilter)
    );

  if (isLoading) return <Loader />;
  if (isError || !orgCandidates.length) return (
    <StaticPlaceholder label="No Candidates" description="No matched candidates found for this organization." />
  );

  return (
    <Box>
      {/* Filter bar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: "20px", flexWrap: "wrap" }}>
        <Typography fontSize={13} color={C.textSecondary}>
          {filtered.length} candidate{filtered.length !== 1 ? "s" : ""}
        </Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel sx={{ fontSize: 12 }}>Filter by stage</InputLabel>
          <Select
            value={statusFilter}
            label="Filter by stage"
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ fontSize: 12, borderRadius: "8px" }}
          >
            <MenuItem value="all">All Stages</MenuItem>
            {statusOptions.map((s) => (
              <MenuItem key={s} value={s} sx={{ textTransform: "capitalize" }}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={2}>
        {filtered.map((candidate) => {
          // Get the relevant job(s) for this org
          const orgJobs = candidate.jobs?.filter((j) => j.organisation_id === orgId) ?? [];
          const primaryJob = orgJobs[0];
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4, xl: 3 }} key={candidate.candidate_id}>
              <AssignedCandidateCard
                candidate={candidate}
                primaryJob={primaryJob}
                orgJobCount={orgJobs.length}
                // In RequisitionDetail → ReqCandidatesTab → CandidateCard onView:
                onView={() => navigate(
                  `/account-manager/candidate/${candidate.candidate_id}`,
                  { state: { orgName, jobTitle } }   // ✅ both must be passed
                )}
              />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   TAB 3 — Interviews (uses get_organisation_interviews)
═══════════════════════════════════════════════ */
function OrgInterviewsTab({ orgId }) {
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, isError } = useGetOrganisationInterviewsQuery(orgId);
  const interviews = data?.data ?? [];

  // Interview status options (from your dropdown API — hardcoded since it's static)
  const interviewStatuses = [
    { key: "scheduled", value: "Scheduled" },
    { key: "completed", value: "Completed" },
    { key: "cancelled", value: "Cancelled" },
    { key: "rescheduled", value: "Rescheduled" },
    { key: "no_show", value: "No Show" },
    { key: "not_conducted", value: "Not Conducted" },
  ];

  const filtered = statusFilter === "all"
    ? interviews
    : interviews.filter((iv) => (iv.status ?? "scheduled") === statusFilter);

  if (isLoading) return <Loader />;
  if (isError) return <ErrAlert msg="Failed to load interviews" />;

  return (
    <Box>
      {/* Filter bar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: "20px", flexWrap: "wrap" }}>
        <Typography fontSize={13} color={C.textSecondary}>
          {filtered.length} interview{filtered.length !== 1 ? "s" : ""}
        </Typography>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel sx={{ fontSize: 12 }}>Filter by status</InputLabel>
          <Select
            value={statusFilter}
            label="Filter by status"
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ fontSize: 12, borderRadius: "8px" }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            {interviewStatuses.map(({ key, value }) => (
              <MenuItem key={key} value={key}>{value}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {filtered.length === 0 ? (
        <StaticPlaceholder label="No Interviews" description="No interviews match the selected filter." />
      ) : (
        <Grid container spacing={2}>
          {filtered.map((iv) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, xl: 3 }} key={iv.interview_id}>
              <InterviewCard interview={iv} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   RequisitionCard
═══════════════════════════════════════════════ */
function RequisitionCard({ job, onOpen }) {
  const [hovered, setHovered] = React.useState(false);
  const title = job.job_title ?? "Untitled";
  const jobId = job.job_position_id ?? job.job_id ?? "—";
  const empType = job.job_type ?? "Full Time";
  const func = job.function ?? null;
  const subFunc = job.sub_function ?? null;
  const minYrs = job.min_years ?? null;
  const maxYrs = job.max_years ?? null;
  const positions = job.no_of_positions ?? null;
  const skills = job.skills ? job.skills.split(",").map((s) => s.trim()) : [];
  const status = job.status ?? "open";
  const chip = statusChip(status);
  const closingDate = job.closing_date
    ? new Date(job.closing_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : null;

  return (
    <Card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
      sx={{
        borderRadius: "12px",
        border: `1px solid ${hovered ? C.accent : C.border}`,
        boxShadow: hovered ? "0 0 0 3px rgba(255,95,31,0.07)" : "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
        cursor: "pointer", height: "100%", display: "flex", flexDirection: "column",
      }}
    >
      <CardContent sx={{ p: "16px", flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "12px" }}>
          <Box sx={{ width: 36, height: 36, borderRadius: "8px", backgroundColor: C.accentSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <WorkOutlineRoundedIcon sx={{ color: C.accent, fontSize: 18 }} />
          </Box>
          <Box component="span" sx={{ fontSize: 10, fontWeight: 700, px: "8px", py: "3px", borderRadius: "10px", backgroundColor: chip.bg, color: chip.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {status}
          </Box>
        </Box>

        <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, mb: "2px" }}>{title}</Typography>
        <Typography sx={{ fontSize: 11, color: C.textSecondary, mb: "10px" }}>{jobId} · {empType}</Typography>
        <Divider sx={{ mb: "10px" }} />

        {(func || subFunc) && (
          <Box sx={{ display: "flex", gap: 0.6, mb: "10px", flexWrap: "wrap" }}>
            {[func, subFunc].filter(Boolean).map((l) => (
              <Chip key={l} label={l} size="small" sx={{ fontSize: 10, height: 20, textTransform: "capitalize", backgroundColor: "#F3F4F6", color: C.textSecondary, "& .MuiChip-label": { px: "8px" } }} />
            ))}
          </Box>
        )}

        <Grid container spacing={1} sx={{ mb: "10px" }}>
          {(minYrs !== null && maxYrs !== null) && (
            <Grid size={{ xs: 6 }}>
              <Box sx={{ backgroundColor: "#F9FAFB", borderRadius: "8px", p: "8px" }}>
                <Typography sx={{ fontSize: 10, color: C.textSecondary, mb: "1px" }}>Experience</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: C.textPrimary }}>{minYrs}–{maxYrs} yrs</Typography>
              </Box>
            </Grid>
          )}
          {positions && (
            <Grid size={{ xs: 6 }}>
              <Box sx={{ backgroundColor: "#F9FAFB", borderRadius: "8px", p: "8px" }}>
                <Typography sx={{ fontSize: 10, color: C.textSecondary, mb: "1px" }}>Positions</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: C.textPrimary }}>{positions}</Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        {closingDate && (
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: "6px" }}>
            <Typography sx={{ fontSize: 11, color: C.textSecondary }}>Closing date</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: C.textPrimary }}>{closingDate}</Typography>
          </Box>
        )}

        {skills.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: "10px" }}>
            {skills.slice(0, 3).map((s) => (
              <Chip key={s} label={s} size="small" variant="outlined" sx={{ fontSize: 10, height: 20, textTransform: "capitalize", borderColor: C.border, color: C.textSecondary, "& .MuiChip-label": { px: "7px" } }} />
            ))}
            {skills.length > 3 && (
              <Chip label={`+${skills.length - 3} more`} size="small" variant="outlined" sx={{ fontSize: 10, height: 20, borderColor: C.border, color: C.textSecondary, "& .MuiChip-label": { px: "7px" } }} />
            )}
          </Box>
        )}

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: "auto", pt: "8px" }}>
          <Typography sx={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: hovered ? C.accent : C.textTertiary, transition: "color 0.15s" }}>
            See full details
          </Typography>
          <ArrowForwardIcon sx={{ fontSize: 11, color: hovered ? C.accent : C.textTertiary, transition: "color 0.15s, transform 0.15s", transform: hovered ? "translateX(3px)" : "none" }} />
        </Box>
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════
   AssignedCandidateCard
═══════════════════════════════════════════════ */
function AssignedCandidateCard({ candidate, primaryJob, orgJobCount, onView }) {
  const [hovered, setHovered] = React.useState(false);

  const stageColor = (stage = "") => {
    const s = stage.toLowerCase();
    if (s.includes("reject")) return { bg: C.redSoft, color: C.red };
    if (s.includes("shortlist")) return { bg: C.greenSoft, color: C.green };
    if (s.includes("onboard")) return { bg: C.indigoSoft, color: C.indigo };
    if (s.includes("interview")) return { bg: C.amberSoft, color: C.amber };
    return { bg: "#F3F4F6", color: "#6B7280" };
  };

  const sc = stageColor(primaryJob?.current_stage);

  return (
    <Card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        borderRadius: "12px",
        border: `1px solid ${hovered ? C.accent : C.border}`,
        boxShadow: hovered ? "0 0 0 3px rgba(255,95,31,0.07)" : "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
        height: "100%", display: "flex", flexDirection: "column",
      }}
    >
      <CardContent sx={{ p: "16px", flexGrow: 1, display: "flex", flexDirection: "column" }}>

        {/* Avatar + name + stage */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: "12px" }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: C.accent, fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
            {candidate.candidate_name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {candidate.candidate_name}
            </Typography>
            <Typography sx={{ fontSize: 11, color: C.textSecondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {candidate.email}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: "10px" }} />

        {/* Stage + job count tiles */}
        <Grid container spacing={1} sx={{ mb: "10px" }}>
          <Grid size={{ xs: 7 }}>
            <Box sx={{ backgroundColor: "#F9FAFB", borderRadius: "8px", p: "8px" }}>
              <Typography sx={{ fontSize: 10, color: C.textSecondary, mb: "2px" }}>Current Stage</Typography>
              <Box component="span" sx={{ fontSize: 10, fontWeight: 700, px: "6px", py: "2px", borderRadius: "6px", backgroundColor: sc.bg, color: sc.color, textTransform: "capitalize" }}>
                {primaryJob?.current_stage ?? "—"}
              </Box>
            </Box>
          </Grid>
          <Grid size={{ xs: 5 }}>
            <Box sx={{ backgroundColor: "#F9FAFB", borderRadius: "8px", p: "8px" }}>
              <Typography sx={{ fontSize: 10, color: C.textSecondary, mb: "2px" }}>Jobs Here</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: C.textPrimary }}>{orgJobCount}</Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Job title */}
        {primaryJob?.job_title && (
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: "6px" }}>
            <Typography sx={{ fontSize: 11, color: C.textSecondary }}>Job</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: C.textPrimary, maxWidth: "65%", textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {primaryJob.job_title}
            </Typography>
          </Box>
        )}

        {/* Phone */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: "6px" }}>
          <Typography sx={{ fontSize: 11, color: C.textSecondary }}>Phone</Typography>
          <Typography sx={{ fontSize: 11, fontWeight: 500, color: C.textPrimary }}>{candidate.phone_number}</Typography>
        </Box>

        {/* Stats row */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: "4px", mb: "10px" }}>
          {[
            { label: "Shortlisted", value: candidate.shortlisted_count, color: C.green },
            { label: "Interviewing", value: candidate.interviewing_count, color: C.amber },
            { label: "Selected", value: candidate.selected_count, color: C.indigo },
          ].map(({ label, value, color }) => value > 0 && (
            <Box key={label} sx={{ fontSize: 10, fontWeight: 600, px: "6px", py: "2px", borderRadius: "6px", backgroundColor: "#F3F4F6", color }}>
              {label}: {value}
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: "auto" }}>
          <Button variant="outlined" fullWidth size="small" onClick={onView}
            sx={{ borderColor: C.accent, color: C.accent, textTransform: "none", fontWeight: 600, borderRadius: "8px", fontSize: 12, "&:hover": { backgroundColor: C.accentSoft, borderColor: C.accent } }}>
            View Profile
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════
   InterviewCard
═══════════════════════════════════════════════ */
function InterviewCard({ interview }) {
  const typeColor = interview.interview_type?.toLowerCase() === "technical"
    ? { bg: C.indigoSoft, color: C.indigo }
    : { bg: C.amberSoft, color: C.amber };

  const formattedDate = interview.interview_date
    ? new Date(interview.interview_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  return (
    <Card sx={{ borderRadius: "12px", border: `1px solid ${C.border}`, height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ p: "16px", flexGrow: 1, display: "flex", flexDirection: "column" }}>

        {/* Header: type badge */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "10px" }}>
          <Box sx={{ width: 36, height: 36, borderRadius: "8px", backgroundColor: C.accentSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CalendarMonthOutlinedIcon sx={{ color: C.accent, fontSize: 18 }} />
          </Box>
          <Box component="span" sx={{ fontSize: 10, fontWeight: 700, px: "8px", py: "3px", borderRadius: "10px", backgroundColor: typeColor.bg, color: typeColor.color, textTransform: "capitalize", letterSpacing: "0.05em" }}>
            {interview.interview_type ?? "Interview"}
          </Box>
        </Box>

        {/* Job title */}
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, mb: "2px", lineHeight: 1.3 }}>
          {interview.job_title}
        </Typography>
        <Typography sx={{ fontSize: 11, color: C.textSecondary, mb: "10px" }}>
          {interview.job_position_id} · {interview.sub_function}
        </Typography>

        <Divider sx={{ mb: "10px" }} />

        {/* Date + time */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: "6px" }}>
          <CalendarMonthOutlinedIcon sx={{ fontSize: 13, color: C.textSecondary }} />
          <Typography sx={{ fontSize: 11, color: C.textPrimary, fontWeight: 500 }}>{formattedDate}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: "6px" }}>
          <AccessTimeIcon sx={{ fontSize: 13, color: C.textSecondary }} />
          <Typography sx={{ fontSize: 11, color: C.textPrimary, fontWeight: 500 }}>
            {interview.start_time} – {interview.end_time} · {interview.duration} min
          </Typography>
        </Box>

        {/* Step */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: "6px" }}>
          <Typography sx={{ fontSize: 11, color: C.textSecondary }}>Round</Typography>
          <Typography sx={{ fontSize: 11, fontWeight: 500, color: C.textPrimary }}>
            {interview.interview_step_name} (Step {interview.interview_step_number})
          </Typography>
        </Box>

        {/* Created by */}
        {interview.created_by && (
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: "6px" }}>
            <Typography sx={{ fontSize: 11, color: C.textSecondary }}>Created by</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: C.textPrimary }}>{interview.created_by}</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Shared helpers ── */
function SectionLabel({ children }) {
  return (
    <Typography fontSize={11} fontWeight={700} color={C.textSecondary}
      letterSpacing="0.08em" mb="12px" sx={{ textTransform: "uppercase" }}>
      {children}
    </Typography>
  );
}

function InfoRow({ label, value, bold }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", py: "10px", borderBottom: "1px solid #F3F4F6" }}>
      <Typography fontSize={13} color={C.textSecondary}>{label}</Typography>
      <Typography fontSize={13} fontWeight={bold ? 600 : 500} color={C.textPrimary}>{value}</Typography>
    </Box>
  );
}

function StaticPlaceholder({ label, description }) {
  return (
    <Box sx={{ textAlign: "center", py: 10, border: `1px solid ${C.border}`, borderRadius: "12px", backgroundColor: "#fff" }}>
      <WorkOutlineRoundedIcon sx={{ fontSize: 42, color: C.textTertiary, mb: 1.5 }} />
      <Typography fontSize={15} fontWeight={600} color={C.textPrimary}>{label}</Typography>
      {description && <Typography fontSize={13} color={C.textSecondary} mt={0.5}>{description}</Typography>}
    </Box>
  );
}

function Loader() {
  return <Box display="flex" justifyContent="center" py={6}><CircularProgress sx={{ color: C.accent }} /></Box>;
}

function ErrAlert({ msg }) {
  return <Alert severity="error" sx={{ borderRadius: "10px" }}>Failed to load: {msg ?? "Unknown error"}</Alert>;
}