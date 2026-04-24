// src/pages/OrgRequisitions/RequisitionDetail.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box, Typography, Tabs, Tab, CircularProgress, Alert,
  Grid, Card, CardContent, Chip, Divider, Button, Avatar,
  FormControl, InputLabel, Select, MenuItem,
} from "@mui/material";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useDispatch } from "react-redux";
import { setDynamicLabels } from "../../redux/slices/breadcrumbSlice";
import {
  useGetOrganisationJobsQuery,
  useGetJobMatchedCandidatesQuery,
  useGetOrganisationInterviewsQuery,
} from "../../redux/services/requisition/requisition";

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

export default function RequisitionDetail() {
  const { orgId, jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [tab, setTab] = useState(0);

  const { data: jobsData, isLoading } = useGetOrganisationJobsQuery({ orgId, status: "all" });
  const job = location.state?.job ?? jobsData?.data?.find((j) => (j.job_id ?? j.id) === jobId);
  const orgName = location.state?.orgName ?? jobsData?.organisation_name ?? null;

  useEffect(() => {
    const labels = {};
    if (orgName) labels.orgId = orgName;
    if (job?.job_title) labels.jobId = job.job_title;
    if (Object.keys(labels).length) dispatch(setDynamicLabels(labels));
  }, [orgName, job?.job_title]);

  if (isLoading || !job) {
    return <Box display="flex" justifyContent="center" py={10}><CircularProgress sx={{ color: C.accent }} /></Box>;
  }

  const chip = statusChip(job.status);

  return (
    <Box sx={{ p: 1 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "2px", flexWrap: "wrap", gap: 1 }}>
        <Typography fontSize={22} fontWeight={700} color={C.textPrimary}>
          {job.job_title}
        </Typography>
        <Box component="span" sx={{ fontSize: 11, fontWeight: 700, px: "10px", py: "4px", borderRadius: "10px", backgroundColor: chip.bg, color: chip.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {job.status}
        </Box>
      </Box>
      <Typography fontSize={13} color={C.textSecondary} mb="16px">
        {job.job_position_id} · {job.job_type}
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={TAB_SX}>
        <Tab label="Overview" />
        <Tab label="Candidates" />
        <Tab label="Interviews" />
        <Tab label="Activity" />
      </Tabs>

      {tab === 0 && <ReqOverviewTab job={job} />}
      {tab === 1 && <ReqCandidatesTab jobId={jobId} orgId={orgId} navigate={navigate} orgName={orgName} jobTitle={job.job_title} />}
      {tab === 2 && <ReqInterviewsTab orgId={orgId} jobPositionId={job.job_position_id} />}
      {tab === 3 && (
        <Box sx={{ textAlign: "center", py: 10, border: `1px solid ${C.border}`, borderRadius: "12px", backgroundColor: "#fff" }}>
          <Typography fontSize={15} fontWeight={600} color={C.textPrimary}>Activity</Typography>
          <Typography fontSize={13} color={C.textSecondary} mt={0.5}>Activity log coming soon.</Typography>
        </Box>
      )}
    </Box>
  );
}

/* ─── Tab 0: Overview ── */
function ReqOverviewTab({ job }) {
  const skills = job.skills ? job.skills.split(",").map((s) => s.trim()) : [];
  const closingDate = job.closing_date
    ? new Date(job.closing_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : null;

  const rows = [
    { label: "Function", value: job.function },
    { label: "Sub-function", value: job.sub_function },
    { label: "Experience", value: `${job.min_years}–${job.max_years} yrs` },
    { label: "Positions", value: job.no_of_positions },
    { label: "Closing date", value: closingDate },
    { label: "Created by", value: job.created_by },
    { label: "Approver", value: job.job_approver },
  ].filter((r) => r.value);

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <SectionLabel>Job Details</SectionLabel>
        {rows.map(({ label, value }) => (
          <Box key={label} sx={{ display: "flex", justifyContent: "space-between", py: "10px", borderBottom: "1px solid #F3F4F6" }}>
            <Typography fontSize={13} color={C.textSecondary}>{label}</Typography>
            <Typography fontSize={13} fontWeight={500} color={C.textPrimary} sx={{ textTransform: "capitalize" }}>{value}</Typography>
          </Box>
        ))}
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <SectionLabel>Required Skills</SectionLabel>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
          {skills.map((skill) => (
            <Chip key={skill} label={skill} size="small" variant="outlined"
              sx={{ fontSize: 11, textTransform: "capitalize", borderColor: C.border, color: C.textSecondary }} />
          ))}
        </Box>
      </Grid>
    </Grid>
  );
}

/* ─── Tab 1: Candidates ── */
function ReqCandidatesTab({ jobId, orgId, navigate, orgName, jobTitle }) {
  const [stageFilter, setStageFilter] = useState("all");
  const { data, isLoading, isError, error } = useGetJobMatchedCandidatesQuery(jobId);
  const all = data?.data ?? [];

  const stages = React.useMemo(() => [...new Set(all.map((c) => c.current_stage))], [all]);

  const filtered = stageFilter === "all"
    ? all
    : all.filter((c) => c.current_stage === stageFilter);

  if (isLoading) return <Box display="flex" justifyContent="center" py={6}><CircularProgress sx={{ color: C.accent }} /></Box>;
  if (isError) return <Alert severity="error">Failed to load candidates: {error?.data?.message}</Alert>;

  return (
    <Box>
      {/* Filter */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: "20px", flexWrap: "wrap" }}>
        <Typography fontSize={13} color={C.textSecondary}>{filtered.length} candidate{filtered.length !== 1 ? "s" : ""}</Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel sx={{ fontSize: 12 }}>Filter by stage</InputLabel>
          <Select value={stageFilter} label="Filter by stage" onChange={(e) => setStageFilter(e.target.value)} sx={{ fontSize: 12, borderRadius: "8px" }}>
            <MenuItem value="all">All Stages</MenuItem>
            {stages.map((s) => (
              <MenuItem key={s} value={s} sx={{ textTransform: "capitalize" }}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {filtered.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography fontSize={13} color={C.textSecondary}>No candidates match the selected stage.</Typography>
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {filtered.map((candidate) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, xl: 3 }} key={candidate.matched_candidate_id}>
              <CandidateCard
                candidate={candidate}
                // In RequisitionDetail → ReqCandidatesTab → CandidateCard onView:
                onView={() => navigate(
                  `/account-manager/candidate/${candidate.matched_candidate_id}`,
                  { state: { orgName, jobTitle } }   // ✅ both must be passed
                )}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

/* ─── Tab 2: Interviews (filtered by job_position_id) ── */
function ReqInterviewsTab({ orgId, jobPositionId }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const { data, isLoading, isError } = useGetOrganisationInterviewsQuery(orgId);

  const all = (data?.data ?? []).filter((iv) => iv.job_position_id === jobPositionId);

  const interviewStatuses = [
    { key: "scheduled", value: "Scheduled" },
    { key: "completed", value: "Completed" },
    { key: "cancelled", value: "Cancelled" },
    { key: "rescheduled", value: "Rescheduled" },
    { key: "no_show", value: "No Show" },
    { key: "not_conducted", value: "Not Conducted" },
  ];

  const filtered = statusFilter === "all"
    ? all
    : all.filter((iv) => (iv.status ?? "scheduled") === statusFilter);

  if (isLoading) return <Box display="flex" justifyContent="center" py={6}><CircularProgress sx={{ color: C.accent }} /></Box>;
  if (isError) return <Alert severity="error">Failed to load interviews.</Alert>;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: "20px", flexWrap: "wrap" }}>
        <Typography fontSize={13} color={C.textSecondary}>{filtered.length} interview{filtered.length !== 1 ? "s" : ""}</Typography>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel sx={{ fontSize: 12 }}>Filter by status</InputLabel>
          <Select value={statusFilter} label="Filter by status" onChange={(e) => setStatusFilter(e.target.value)} sx={{ fontSize: 12, borderRadius: "8px" }}>
            <MenuItem value="all">All Statuses</MenuItem>
            {interviewStatuses.map(({ key, value }) => (
              <MenuItem key={key} value={key}>{value}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {filtered.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography fontSize={13} color={C.textSecondary}>No interviews found for this requisition.</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((iv) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, xl: 3 }} key={iv.interview_id}>
              <ReqInterviewCard interview={iv} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

function ReqInterviewCard({ interview }) {
  const typeColor = interview.interview_type?.toLowerCase() === "technical"
    ? { bg: C.indigoSoft, color: C.indigo }
    : { bg: C.amberSoft, color: C.amber };

  const formattedDate = interview.interview_date
    ? new Date(interview.interview_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  return (
    <Card sx={{ borderRadius: "12px", border: `1px solid ${C.border}`, height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ p: "16px", flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "10px" }}>
          <Box sx={{ width: 36, height: 36, borderRadius: "8px", backgroundColor: C.accentSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CalendarMonthOutlinedIcon sx={{ color: C.accent, fontSize: 18 }} />
          </Box>
          <Box component="span" sx={{ fontSize: 10, fontWeight: 700, px: "8px", py: "3px", borderRadius: "10px", backgroundColor: typeColor.bg, color: typeColor.color, textTransform: "capitalize", letterSpacing: "0.05em" }}>
            {interview.interview_type}
          </Box>
        </Box>

        <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, mb: "2px" }}>{interview.interview_step_name}</Typography>
        <Typography sx={{ fontSize: 11, color: C.textSecondary, mb: "10px" }}>Step {interview.interview_step_number}</Typography>

        <Divider sx={{ mb: "10px" }} />

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

        {interview.created_by && (
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: 11, color: C.textSecondary }}>Created by</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: C.textPrimary }}>{interview.created_by}</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── CandidateCard ── */
function CandidateCard({ candidate, onView }) {
  const [hovered, setHovered] = React.useState(false);
  const matchColor =
    candidate.match_score >= 80 ? { bg: "#E7F8EE", color: "#0F6E56" } :
      candidate.match_score >= 60 ? { bg: "#FFF8E1", color: "#B45309" } :
        { bg: "#FEE2E2", color: "#B91C1C" };
  return (
    <Card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        height: "100%", borderRadius: "12px",
        border: `1px solid ${hovered ? C.accent : C.border}`,
        boxShadow: hovered ? "0 0 0 3px rgba(255,95,31,0.07)" : "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
        display: "flex", flexDirection: "column",
      }}
    >
      <CardContent sx={{ p: "16px", flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: "12px" }}>
          <Avatar sx={{ width: 42, height: 42, fontWeight: 700, fontSize: 16, bgcolor: C.accent, flexShrink: 0 }}>
            {candidate.full_name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {candidate.full_name}
            </Typography>
            <Typography sx={{ fontSize: 11, color: C.textSecondary }}>{candidate.clin_id}</Typography>
          </Box>
          <Chip label={`${candidate.match_score}%`} size="small"
            sx={{ fontSize: 11, fontWeight: 700, height: 24, backgroundColor: matchColor.bg, color: matchColor.color, flexShrink: 0, "& .MuiChip-label": { px: "8px" } }} />
        </Box>
        <Divider sx={{ mb: "12px" }} />
        <Grid container spacing={1} sx={{ mb: "12px" }}>
          <Grid size={{ xs: 6 }}>
            <Box sx={{ backgroundColor: "#F9FAFB", borderRadius: "8px", p: "8px" }}>
              <Typography sx={{ fontSize: 10, color: C.textSecondary, mb: "2px" }}>Stage</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: C.textPrimary, textTransform: "capitalize" }}>{candidate.current_stage}</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Box sx={{ backgroundColor: "#F9FAFB", borderRadius: "8px", p: "8px" }}>
              <Typography sx={{ fontSize: 10, color: C.textSecondary, mb: "2px" }}>Availability</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: candidate.availability === 0 ? C.green : C.textPrimary }}>
                {candidate.availability === 0 ? "Immediate" : `${candidate.availability} days`}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        {[
          { label: "Experience", value: candidate.total_experience },
          { label: "Email", value: candidate.email },
          { label: "Phone", value: candidate.phone_number },
        ].map(({ label, value }) => (
          <Box key={label} sx={{ display: "flex", justifyContent: "space-between", mb: "6px" }}>
            <Typography sx={{ fontSize: 11, color: C.textSecondary }}>{label}</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: C.textPrimary, maxWidth: "60%", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</Typography>
          </Box>
        ))}
        <Box sx={{ mt: "auto" }}>
          <Button variant="outlined" fullWidth size="small" onClick={onView}
            sx={{ borderColor: C.accent, color: C.accent, textTransform: "none", fontWeight: 600, borderRadius: "8px", fontSize: 12, "&:hover": { backgroundColor: C.accentSoft, borderColor: C.accent } }}>
            View Profile &amp; Timeline
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

function SectionLabel({ children }) {
  return (
    <Typography fontSize={11} fontWeight={700} color={C.textSecondary}
      letterSpacing="0.08em" mb="12px" sx={{ textTransform: "uppercase" }}>
      {children}
    </Typography>
  );
}