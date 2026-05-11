// src/pages/Organizations/OrgDetail.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Button,
  Avatar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
// import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import { useDispatch } from "react-redux";
import {
  setDynamicLabels,
  clearDynamicLabels,
} from "../../redux/slices/breadcrumbSlice";
import {
  useGetMyOrganisationsQuery,
  useGetOrganisationJobsQuery,
  // useGetAssignedOrgCandidatesQuery,
  useGetOrganisationInterviewsQuery,
  useGetOrganisationJobAnalyticsQuery,
  useGetOrganisationCandidatesQuery
} from "../../redux/services/requisition/requisition";
import { PeopleOutlineOutlined } from "@mui/icons-material";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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
  STATUS_CHIP[s.toLowerCase().replace(/\s+/g, "_")] ?? {
    bg: "#F3F4F6",
    color: "#6B7280",
  };

const TAB_SX = {
  borderBottom: "1px solid #E5E7EB",
  mb: "24px",
  "& .MuiTab-root": {
    textTransform: "none",
    fontSize: 13,
    fontWeight: 500,
    color: "#6B7280",
    minWidth: "auto",
    px: "4px",
    mr: "24px",
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
  const org =
    location.state?.org ??
    orgsData?.data?.find((o) => String(o.id) === String(orgId));

  useEffect(() => {
    if (org?.organisation_name) {
      dispatch(setDynamicLabels({ orgId: org.organisation_name }));
    }
    return () => dispatch(clearDynamicLabels());
  }, [org?.organisation_name]);

  if (isLoading || !org) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress sx={{ color: C.accent }} />
      </Box>
    );
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
        {/* <Tab label="Analytics" /> */}
        <Tab label="Billing" />
      </Tabs>

      {tab === 0 && <OrgOverviewTab org={org} orgId={orgId} />}
      {tab === 1 && (
        <OrgRequisitionsTab
          orgId={orgId}
          orgName={org.organisation_name}
          navigate={navigate}
        />
      )}
      {tab === 2 && (
        <OrgCandidatesTab
          orgId={orgId}
          navigate={navigate}
          orgName={org.organisation_name}
        />
      )}
      {tab === 3 && <OrgInterviewsTab orgId={orgId} />}
      {tab === 4 && <OrgAnalyticsTab orgId={orgId} />}
      {tab === 5 && (
        <StaticPlaceholder
          label="Billing"
          description="Billing and invoices will appear here."
        />
      )}
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   TAB 0 — Overview (enriched with live analytics)


/* ═══════════════════════════════════════════════
   TAB 0 — Overview
═══════════════════════════════════════════════ */
function OrgOverviewTab({ org, orgId }) {
  const [groupBy, setGroupBy] = useState("month");

  const { data: analyticsData, isLoading: analyticsLoading } =
    useGetOrganisationJobAnalyticsQuery({
      organisationId: orgId,
      groupBy,
      status: "all",
    });

  const analytics = analyticsData?.data;

  const profileRows = [
    { label: "Company name", value: org.organisation_name },
    { label: "Location", value: org.country ?? "—" },
    { label: "Website", value: org.website_url ?? "—" },
    { label: "Industry", value: org.industry ?? "—" },
    { label: "Timezone", value: org.time_zone ?? "—" },
  ];

  /* ── Derived chart data ── */
  const jobTrendData =
    analytics?.job_status_trend?.labels?.map((label, i) => ({
      label,
      Open: analytics.job_status_trend.open[i] ?? 0,
      Closed: analytics.job_status_trend.closed[i] ?? 0,
    })) ?? [];

  const funnelData = analytics
    ? [
        { name: "Matched", value: analytics.candidate_stage_breakdown.matched },
        {
          name: "Shortlisted",
          value: analytics.candidate_stage_breakdown.shortlisted,
        },
        {
          name: "Interviewing",
          value:
            analytics.candidate_stage_breakdown.interview_scheduled +
            analytics.candidate_stage_breakdown.interview_rescheduled,
        },
        {
          name: "Selected",
          value: analytics.candidate_stage_breakdown.selected,
        },
        {
          name: "Rejected",
          value: analytics.candidate_stage_breakdown.rejected,
        },
        {
          name: "Onboarded",
          value: analytics.candidate_stage_breakdown.onboarded,
        },
      ].filter((d) => d.value > 0)
    : [];

  const candidateTrendData =
    analytics?.candidate_funnel_trend?.labels?.map((label, i) => ({
      label,
      Matched: analytics.candidate_funnel_trend.matched[i] ?? 0,
      Shortlisted: analytics.candidate_funnel_trend.shortlisted[i] ?? 0,
      Rejected: analytics.candidate_funnel_trend.rejected[i] ?? 0,
      Onboarded: analytics.candidate_funnel_trend.onboarded[i] ?? 0,
    })) ?? [];

  const offerTrendData =
    analytics?.offer_analysis_trend?.labels?.map((label, i) => ({
      label,
      Released: analytics.offer_analysis_trend.offer_released[i] ?? 0,
      Accepted: analytics.offer_analysis_trend.offer_accepted[i] ?? 0,
      Rejected: analytics.offer_analysis_trend.offer_rejected[i] ?? 0,
      Revoked: analytics.offer_analysis_trend.offer_revoked[i] ?? 0,
    })) ?? [];

  const PIE_COLORS = [C.accent, C.green, C.indigo, "#F59E0B", C.red, "#8B5CF6"];

  const overviewCards = analytics
    ? [
        {
          label: "Total Jobs",
          value: analytics.job_overview.total_jobs,
          color: C.accent,
          soft: C.accentSoft,
        },
        {
          label: "Open Jobs",
          value: analytics.job_overview.open_jobs,
          color: C.green,
          soft: C.greenSoft,
        },
        {
          label: "Closed Jobs",
          value: analytics.job_overview.closed_jobs,
          color: "#6B7280",
          soft: "#F3F4F6",
        },
        {
          label: "Total Candidates",
          value: analytics.total_candidates,
          color: C.indigo,
          soft: C.indigoSoft,
        },
      ]
    : [];

  return (
    <Grid container spacing={3} sx={{display:'flex',flexDirection:'column'}}>
      {/* ── Left: profile ── */}
      {/* <Grid size={{ xs: 12, md: 12 }}>
        <SectionLabel>Core Company Profile</SectionLabel>
        {profileRows.map(({ label, value }) => (
          <InfoRow key={label} label={label} value={value} />
        ))}
      </Grid> */}

      {/* ── Right: analytics ── */}
      <Grid size={{ xs: 12, md: 12 }}>
        {/* Group-by toggle */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: "16px",
          }}
        >
          <SectionLabel>Job Analytics</SectionLabel>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              sx={{ fontSize: 12, borderRadius: "8px" }}
            >
              <MenuItem value="month">Monthly</MenuItem>
              <MenuItem value="week">Weekly</MenuItem>
              <MenuItem value="day">Daily</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {analyticsLoading ? (
          <Loader />
        ) : !analytics ? (
          <ErrAlert msg="Could not load analytics" />
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* ── KPI cards ── */}
            <Grid container spacing={1.5}>
              {overviewCards.map(({ label, value, color, soft }) => (
                <Grid size={{ xs: 6, sm: 3 }} key={label}>
                  <Box
                    sx={{
                      borderRadius: "10px",
                      border: `1px solid ${C.border}`,
                      p: "14px",
                      backgroundColor: soft,
                    }}
                  >
                    <Typography
                      sx={{ fontSize: 11, color, fontWeight: 600, mb: "4px" }}
                    >
                      {label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 26,
                        fontWeight: 800,
                        color,
                        lineHeight: 1,
                      }}
                    >
                      {value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* ── Candidate funnel trend (Line) ── */}
            <ChartCard title="Candidate Funnel Trend">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={candidateTrendData}
                  margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Line
                    type="monotone"
                    dataKey="Matched"
                    stroke={C.accent}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Shortlisted"
                    stroke={C.green}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Rejected"
                    stroke={C.red}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Onboarded"
                    stroke={C.indigo}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* ── Stage breakdown (Pie) + Offer trend (Bar) side by side ── */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <ChartCard title="Candidate Stage Breakdown">
                  {funnelData.length === 0 ? (
                    <NoData />
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={funnelData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          label={({ name, value }) => `${name}: ${value}`}
                          labelLine={false}
                        >
                          {funnelData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={PIE_COLORS[i % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ fontSize: 11, borderRadius: 8 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </ChartCard>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <ChartCard title="Offer Analysis Trend">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={offerTrendData}
                      margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ fontSize: 11, borderRadius: 8 }}
                      />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      <Bar
                        dataKey="Released"
                        fill={C.green}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="Accepted"
                        fill={C.indigo}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="Rejected"
                        fill={C.red}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="Revoked"
                        fill={C.amber}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>
            </Grid>

            {/* ── Job status trend (Bar) ── */}
            <ChartCard title="Job Status Trend">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={jobTrendData}
                  margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Open" fill={C.green} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Closed" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Box>
        )}
      </Grid>
    </Grid>
  );
}

/* ── Small helpers (add these alongside your existing helpers) ── */
function ChartCard({ title, children }) {
  return (
    <Box
      sx={{
        border: `1px solid ${C.border}`,
        borderRadius: "12px",
        p: "16px",
        backgroundColor: "#fff",
      }}
    >
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 700,
          color: C.textSecondary,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          mb: "12px",
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function NoData() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 200,
      }}
    >
      <Typography fontSize={12} color={C.textTertiary}>
        No data available
      </Typography>
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   TAB 4 — Analytics (new, full analytics view)
═══════════════════════════════════════════════ */
function OrgAnalyticsTab({ orgId }) {
  const [groupBy, setGroupBy] = useState("month");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, isError, error, refetch } = useGetJobAnalyticsQuery({
    organisationId: orgId,
    groupBy,
    status: statusFilter,
  });

  const analytics = data?.data;

  if (isLoading) return <Loader />;
  if (isError)
    return (
      <ErrAlert msg={error?.data?.message ?? "Failed to load analytics"} />
    );
  if (!analytics) return null;

  const {
    job_overview,
    candidate_stage_breakdown,
    total_candidates,
    job_status_trend,
    candidate_funnel_trend,
    offer_analysis_trend,
    interview_analysis_trend,
  } = analytics;

  return (
    <Box>
      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: "24px", flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel sx={{ fontSize: 12 }}>Group by</InputLabel>
          <Select
            value={groupBy}
            label="Group by"
            onChange={(e) => setGroupBy(e.target.value)}
            sx={{ fontSize: 12, borderRadius: "8px" }}
          >
            <MenuItem value="month">Month</MenuItem>
            <MenuItem value="week">Week</MenuItem>
            <MenuItem value="day">Day</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel sx={{ fontSize: 12 }}>Job status</InputLabel>
          <Select
            value={statusFilter}
            label="Job status"
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ fontSize: 12, borderRadius: "8px" }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* ── Section 1: Job Overview KPI cards ── */}
      <SectionLabel>Job Overview</SectionLabel>
      <Grid container spacing={2} sx={{ mb: "28px" }}>
        {[
          {
            label: "Total Jobs",
            value: job_overview.total_jobs,
            icon: (
              <WorkOutlineRoundedIcon sx={{ fontSize: 20, color: C.accent }} />
            ),
            bg: C.accentSoft,
          },
          {
            label: "Open Jobs",
            value: job_overview.open_jobs,
            icon: <TrendingUpIcon sx={{ fontSize: 20, color: C.green }} />,
            bg: C.greenSoft,
          },
          {
            label: "Closed Jobs",
            value: job_overview.closed_jobs,
            icon: (
              <AssessmentOutlinedIcon sx={{ fontSize: 20, color: "#6B7280" }} />
            ),
            bg: "#F3F4F6",
          },
          {
            label: "Total Candidates",
            value: total_candidates,
            icon: (
              <PeopleOutlineOutlined sx={{ fontSize: 20, color: C.indigo }} />
            ),
            bg: C.indigoSoft,
          },
        ].map(({ label, value, icon, bg }) => (
          <Grid size={{ xs: 6, sm: 3 }} key={label}>
            <KpiCard label={label} value={value} icon={icon} bg={bg} />
          </Grid>
        ))}
      </Grid>

      {/* ── Section 2: Candidate Stage Breakdown ── */}
      <SectionLabel>Candidate Stage Breakdown</SectionLabel>
      <Card
        sx={{
          borderRadius: "12px",
          border: `1px solid ${C.border}`,
          mb: "28px",
          boxShadow: "none",
        }}
      >
        <CardContent sx={{ p: "16px" }}>
          <Grid container spacing={1.5}>
            {Object.entries(candidate_stage_breakdown).map(([key, val]) => {
              const label = key
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase());
              const isActive = val > 0;
              return (
                <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={key}>
                  <Box
                    sx={{
                      textAlign: "center",
                      p: "10px 8px",
                      borderRadius: "10px",
                      backgroundColor: isActive ? C.accentSoft : "#F9FAFB",
                      border: `1px solid ${isActive ? "#FFDBC7" : C.border}`,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: isActive ? C.accent : C.textTertiary,
                        lineHeight: 1.1,
                      }}
                    >
                      {val}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 10,
                        color: C.textSecondary,
                        mt: "2px",
                        lineHeight: 1.3,
                      }}
                    >
                      {label}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* ── Section 3: Candidate Funnel Trend ── */}
      <SectionLabel>Candidate Funnel Trend</SectionLabel>
      <TrendTable
        trend={candidate_funnel_trend}
        colorMap={{
          matched: C.accent,
          shortlisted: C.green,
          interviewing: C.amber,
          selected: C.indigo,
          rejected: C.red,
          onboarded: "#0891B2",
        }}
        sx={{ mb: "28px" }}
      />

      {/* ── Section 4: Job Status Trend ── */}
      <SectionLabel>Job Status Trend</SectionLabel>
      <TrendTable
        trend={job_status_trend}
        colorMap={{ open: C.green, closed: "#6B7280" }}
        sx={{ mb: "28px" }}
      />

      {/* ── Section 5: Interview Analysis Trend ── */}
      <SectionLabel>Interview Analysis</SectionLabel>
      <TrendTable
        trend={interview_analysis_trend}
        colorMap={{
          interview_scheduled: C.indigo,
          interview_rescheduled: C.amber,
          interview_completed: C.green,
          interview_passed: C.green,
          interview_failed: C.red,
          interview_cancelled: "#6B7280",
          interview_no_show: C.red,
          interview_not_conducted: C.textTertiary,
        }}
        sx={{ mb: "28px" }}
      />

      {/* ── Section 6: Offer Analysis Trend ── */}
      <SectionLabel>Offer Analysis</SectionLabel>
      <TrendTable
        trend={offer_analysis_trend}
        colorMap={{
          offer_released: C.indigo,
          offer_accepted: C.green,
          offer_rejected: C.red,
          offer_revoked: C.amber,
        }}
      />
    </Box>
  );
}

/* ─── KPI Card ── */
function KpiCard({ label, value, icon, bg }) {
  return (
    <Card
      sx={{
        borderRadius: "12px",
        border: `1px solid ${C.border}`,
        boxShadow: "none",
      }}
    >
      <CardContent sx={{ p: "16px !important" }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: "8px",
            backgroundColor: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: "10px",
          }}
        >
          {icon}
        </Box>
        <Typography
          sx={{
            fontSize: 26,
            fontWeight: 800,
            color: C.textPrimary,
            lineHeight: 1,
          }}
        >
          {value}
        </Typography>
        <Typography sx={{ fontSize: 11, color: C.textSecondary, mt: "4px" }}>
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

/* ─── Trend Table ── */
function TrendTable({ trend, colorMap, sx }) {
  const { labels = [], ...series } = trend;

  // Filter out keys with all-zero data to keep it clean
  const activeKeys = Object.keys(series).filter((k) =>
    series[k].some((v) => v > 0),
  );
  const displayKeys = activeKeys.length > 0 ? activeKeys : Object.keys(series);

  return (
    <Card
      sx={{
        borderRadius: "12px",
        border: `1px solid ${C.border}`,
        boxShadow: "none",
        mb: "28px",
        ...sx,
      }}
    >
      <CardContent sx={{ p: "0 !important", overflowX: "auto" }}>
        <Box
          component="table"
          sx={{ width: "100%", borderCollapse: "collapse" }}
        >
          <Box component="thead">
            <Box component="tr" sx={{ backgroundColor: "#F9FAFB" }}>
              <Box
                component="th"
                sx={{
                  textAlign: "left",
                  p: "10px 16px",
                  fontSize: 11,
                  fontWeight: 600,
                  color: C.textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  borderBottom: `1px solid ${C.border}`,
                  whiteSpace: "nowrap",
                }}
              >
                Metric
              </Box>
              {labels.map((lbl) => (
                <Box
                  component="th"
                  key={lbl}
                  sx={{
                    textAlign: "center",
                    p: "10px 16px",
                    fontSize: 11,
                    fontWeight: 600,
                    color: C.textSecondary,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    borderBottom: `1px solid ${C.border}`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {lbl}
                </Box>
              ))}
              <Box
                component="th"
                sx={{
                  textAlign: "center",
                  p: "10px 16px",
                  fontSize: 11,
                  fontWeight: 600,
                  color: C.textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                Total
              </Box>
            </Box>
          </Box>
          <Box component="tbody">
            {displayKeys.map((key, i) => {
              const values = series[key] ?? [];
              const total = values.reduce((acc, v) => acc + v, 0);
              const color = colorMap?.[key] ?? C.textPrimary;
              const rowLabel = key
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase());
              return (
                <Box
                  component="tr"
                  key={key}
                  sx={{
                    backgroundColor: i % 2 === 0 ? "#fff" : "#FAFAFA",
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                >
                  <Box
                    component="td"
                    sx={{
                      p: "10px 16px",
                      fontSize: 12,
                      fontWeight: 600,
                      color,
                      borderBottom: `1px solid ${C.border}`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {rowLabel}
                  </Box>
                  {values.map((v, idx) => (
                    <Box
                      component="td"
                      key={idx}
                      sx={{
                        textAlign: "center",
                        p: "10px 16px",
                        fontSize: 13,
                        fontWeight: v > 0 ? 700 : 400,
                        color: v > 0 ? color : C.textTertiary,
                        borderBottom: `1px solid ${C.border}`,
                      }}
                    >
                      {v}
                    </Box>
                  ))}
                  <Box
                    component="td"
                    sx={{
                      textAlign: "center",
                      p: "10px 16px",
                      fontSize: 13,
                      fontWeight: 700,
                      color: total > 0 ? color : C.textTertiary,
                      borderBottom: `1px solid ${C.border}`,
                      backgroundColor: total > 0 ? `${color}10` : "transparent",
                    }}
                  >
                    {total}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════
   TAB 1 — Requisitions (unchanged)
═══════════════════════════════════════════════ */
function OrgRequisitionsTab({ orgId, orgName, navigate }) {
  const { data, isLoading, isError, error } = useGetOrganisationJobsQuery({
    orgId,
    status: "all",
  });
  const jobs = data?.data ?? [];

  if (isLoading) return <Loader />;
  if (isError) return <ErrAlert msg={error?.data?.message ?? error?.status} />;
  if (!jobs.length)
    return (
      <StaticPlaceholder
        label="No Requisitions"
        description="No job requisitions listed for this organization."
      />
    );

  return (
    <Grid container spacing={1.5}>
      {jobs.map((job) => {
        const id = job.job_id ?? job.id;
        return (
          <Grid size={{ xs: 12, sm: 6, md: 4, xl: 3 }} key={id}>
            <RequisitionCard
              job={job}
              onOpen={() =>
                navigate(`/account-manager/org/${orgId}/requisitions/${id}`, {
                  state: { jobTitle: job.job_title, orgName, job },
                })
              }
            />
          </Grid>
        );
      })}
    </Grid>
  );
}

/* ═══════════════════════════════════════════════
   TAB 2 — Candidates (unchanged)
═══════════════════════════════════════════════ */
function OrgCandidatesTab({ orgId, navigate, orgName }) {
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, isError } = useGetOrganisationCandidatesQuery(orgId);
  const candidates = data?.data ?? [];

  // Collect all unique stages across all candidates' jobs
  const statusOptions = React.useMemo(() => {
    const set = new Set();
    candidates.forEach((c) =>
      c.jobs?.forEach((j) => set.add(j.current_stage))
    );
    return Array.from(set);
  }, [candidates]);

  const filtered =
    statusFilter === "all"
      ? candidates
      : candidates.filter((c) =>
          c.jobs?.some((j) => j.current_stage === statusFilter)
        );

  if (isLoading) return <Loader />;
  if (isError || !candidates.length)
    return (
      <StaticPlaceholder
        label="No Candidates"
        description="No matched candidates found for this organization."
      />
    );

  return (
    <Box>
      {/* Header row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: "20px",
          flexWrap: "wrap",
        }}
      >
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
              <MenuItem key={s} value={s} sx={{ textTransform: "capitalize" }}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={2}>
        {filtered.map((candidate) => {
          // All jobs for this candidate are already org-scoped from the API
          const orgJobs = candidate.jobs ?? [];
          const primaryJob = orgJobs[0];
          return (
          <Grid
              size={{ xs: 12, sm: 6, md: 4, xl: 3 }}
              key={candidate.candidate_id}
            >
              <AssignedCandidateCard
                candidate={candidate}
                primaryJob={primaryJob}
                orgJobCount={orgJobs.length}
                onView={(matchedCandidateId) =>               // ← accepts the id
                  navigate(
                    `/account-manager/candidate/${candidate.candidate_id}`,
                    {
                      state: {
                        orgName,
                        matched_candidate_id: matchedCandidateId, // ← passes it
                      },
                    }
                  )
                }
              />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   TAB 3 — Interviews (unchanged)
═══════════════════════════════════════════════ */
function OrgInterviewsTab({ orgId }) {
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, isError } = useGetOrganisationInterviewsQuery(orgId);
  const interviews = data?.data ?? [];

  const interviewStatuses = [
    { key: "scheduled", value: "Scheduled" },
    { key: "completed", value: "Completed" },
    { key: "cancelled", value: "Cancelled" },
    { key: "rescheduled", value: "Rescheduled" },
    { key: "no_show", value: "No Show" },
    { key: "not_conducted", value: "Not Conducted" },
  ];

  const filtered =
    statusFilter === "all"
      ? interviews
      : interviews.filter((iv) => (iv.status ?? "scheduled") === statusFilter);

  if (isLoading) return <Loader />;
  if (isError) return <ErrAlert msg="Failed to load interviews" />;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: "20px",
          flexWrap: "wrap",
        }}
      >
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
              <MenuItem key={key} value={key}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {filtered.length === 0 ? (
        <StaticPlaceholder
          label="No Interviews"
          description="No interviews match the selected filter."
        />
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
   RequisitionCard (unchanged)
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
    ? new Date(job.closing_date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
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
        cursor: "pointer",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        sx={{
          p: "16px",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: "12px",
          }}
        >
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: "8px",
              backgroundColor: C.accentSoft,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WorkOutlineRoundedIcon sx={{ color: C.accent, fontSize: 18 }} />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}
            >
              {title}
            </Typography>
            <Typography sx={{ fontSize: 11, color: C.textSecondary }}>
              {jobId} · {empType}
            </Typography>
          </Box>
          <Box
            component="span"
            sx={{
              fontSize: 10,
              fontWeight: 700,
              px: "8px",
              py: "3px",
              borderRadius: "10px",
              backgroundColor: chip.bg,
              color: chip.color,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {status}
          </Box>
        </Box>

        <Divider sx={{ mb: "10px" }} />

        {(func || subFunc) && (
          <Box sx={{ display: "flex", gap: 0.6, mb: "10px", flexWrap: "wrap" }}>
            {[func, subFunc].filter(Boolean).map((l) => (
              <Chip
                key={l}
                label={l}
                size="small"
                sx={{
                  fontSize: 10,
                  height: 20,
                  textTransform: "capitalize",
                  backgroundColor: "#F3F4F6",
                  color: C.textSecondary,
                  "& .MuiChip-label": { px: "8px" },
                }}
              />
            ))}
          </Box>
        )}

        <Grid container spacing={1} sx={{ mb: "10px" }}>
          {minYrs !== null && maxYrs !== null && (
            <Grid size={{ xs: 6 }}>
              <Box
                sx={{
                  backgroundColor: "#F9FAFB",
                  borderRadius: "8px",
                  p: "8px",
                }}
              >
                <Typography
                  sx={{ fontSize: 10, color: C.textSecondary, mb: "1px" }}
                >
                  Experience
                </Typography>
                <Typography
                  sx={{ fontSize: 12, fontWeight: 700, color: C.textPrimary }}
                >
                  {minYrs}–{maxYrs} yrs
                </Typography>
              </Box>
            </Grid>
          )}
          {positions && (
            <Grid size={{ xs: 6 }}>
              <Box
                sx={{
                  backgroundColor: "#F9FAFB",
                  borderRadius: "8px",
                  p: "8px",
                }}
              >
                <Typography
                  sx={{ fontSize: 10, color: C.textSecondary, mb: "1px" }}
                >
                  Positions
                </Typography>
                <Typography
                  sx={{ fontSize: 12, fontWeight: 700, color: C.textPrimary }}
                >
                  {positions}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        {closingDate && (
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: "6px" }}
          >
            <Typography sx={{ fontSize: 11, color: C.textSecondary }}>
              Closing date
            </Typography>
            <Typography
              sx={{ fontSize: 11, fontWeight: 600, color: C.textPrimary }}
            >
              {closingDate}
            </Typography>
          </Box>
        )}

        {skills.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: "10px" }}>
            {skills.slice(0, 3).map((s) => (
              <Chip
                key={s}
                label={s}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: 10,
                  height: 20,
                  textTransform: "capitalize",
                  borderColor: C.border,
                  color: C.textSecondary,
                  "& .MuiChip-label": { px: "7px" },
                }}
              />
            ))}
            {skills.length > 3 && (
              <Chip
                label={`+${skills.length - 3} more`}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: 10,
                  height: 20,
                  borderColor: C.border,
                  color: C.textSecondary,
                  "& .MuiChip-label": { px: "7px" },
                }}
              />
            )}
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.4,
            mt: "auto",
            pt: "8px",
          }}
        >
          <Typography
            sx={{
              fontSize: 10.5,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: hovered ? C.accent : C.textTertiary,
              transition: "color 0.15s",
            }}
          >
            See full details
          </Typography>
          <ArrowForwardIcon
            sx={{
              fontSize: 11,
              color: hovered ? C.accent : C.textTertiary,
              transition: "color 0.15s, transform 0.15s",
              transform: hovered ? "translateX(3px)" : "none",
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════
   AssignedCandidateCard (unchanged)
═══════════════════════════════════════════════ */


function AssignedCandidateCard({ candidate, primaryJob, orgJobCount, onView }) {
  const [hovered, setHovered] = React.useState(false);
  const [jobsDialogOpen, setJobsDialogOpen] = React.useState(false);

  const stageColor = (stage = "") => {
    const s = stage.toLowerCase();
    if (s.includes("reject")) return { bg: C.redSoft, color: C.red };
    if (s.includes("shortlist")) return { bg: C.greenSoft, color: C.green };
    if (s.includes("onboard")) return { bg: C.indigoSoft, color: C.indigo };
    if (s.includes("interview")) return { bg: C.amberSoft, color: C.amber };
    if (s.includes("select")) return { bg: C.indigoSoft, color: C.indigo };
    return { bg: "#F3F4F6", color: "#6B7280" };
  };

  const sc = stageColor(primaryJob?.current_stage);
  const orgJobs = candidate.jobs ?? [];

  return (
    <>
      {/* ── Card ── */}
      <Card
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          borderRadius: "12px",
          border: `1px solid ${hovered ? C.accent : C.border}`,
          boxShadow: hovered ? "0 0 0 3px rgba(255,95,31,0.07)" : "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardContent
          sx={{
            p: "16px",
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: "12px" }}>
            <Avatar
              sx={{
                width: 40, height: 40,
                bgcolor: C.accent, fontWeight: 700, fontSize: 15, flexShrink: 0,
              }}
            >
              {candidate.candidate_name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.textPrimary,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {candidate.candidate_name}
              </Typography>
              <Typography sx={{ fontSize: 11, color: C.textSecondary,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {candidate.email}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: "10px" }} />

          {/* Stats */}
          <Grid container spacing={1} sx={{ mb: "10px" }}>
            <Grid size={{ xs: 7 }}>
              <Box sx={{ backgroundColor: "#F9FAFB", borderRadius: "8px", p: "8px" }}>
                <Typography sx={{ fontSize: 10, color: C.textSecondary, mb: "2px" }}>
                  Current Stage
                </Typography>
                <Box component="span" sx={{
                  fontSize: 10, fontWeight: 700, px: "6px", py: "2px",
                  borderRadius: "6px", backgroundColor: sc.bg, color: sc.color,
                  textTransform: "capitalize",
                }}>
                  {primaryJob?.current_stage ?? "—"}
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 5 }}>
              <Box sx={{ backgroundColor: "#F9FAFB", borderRadius: "8px", p: "8px" }}>
                <Typography sx={{ fontSize: 10, color: C.textSecondary, mb: "2px" }}>
                  Jobs Here
                </Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: C.textPrimary }}>
                  {orgJobCount}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Phone */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: "6px" }}>
            <Typography sx={{ fontSize: 11, color: C.textSecondary }}>Phone</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: C.textPrimary }}>
              {candidate.phone_number}
            </Typography>
          </Box>

          {/* Stage badges */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: "4px", mb: "12px" }}>
            {[
              { label: "Matched", value: candidate.matched_count, color: C.accent },
              { label: "Shortlisted", value: candidate.shortlisted_count, color: "#0F6E56" },
              { label: "Interviewing", value: candidate.interviewing_count, color: "#92400E" },
              { label: "Selected", value: candidate.selected_count, color: C.indigo },
            ].map(({ label, value, color }) =>
              value > 0 && (
                <Box key={label} sx={{
                  fontSize: 10, fontWeight: 600, px: "6px", py: "2px",
                  borderRadius: "6px", backgroundColor: "#F3F4F6", color,
                }}>
                  {label}: {value}
                </Box>
              )
            )}
          </Box>

          {/* View Jobs button */}
          <Box sx={{ mt: "auto" }}>
            <Button
              variant="outlined"
              fullWidth
              size="small"
              onClick={() => setJobsDialogOpen(true)}
              sx={{
                borderColor: C.accent, color: C.accent,
                textTransform: "none", fontWeight: 600,
                borderRadius: "8px", fontSize: 12,
                "&:hover": { backgroundColor: C.accentSoft, borderColor: C.accent },
              }}
            >
              View Jobs ({orgJobCount})
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* ── Jobs Dialog ── */}
      <Dialog
        open={jobsDialogOpen}
        onClose={() => setJobsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            p: 0,
            overflow: "hidden",
          },
        }}
      >
        {/* Dialog Header */}
        <DialogTitle
          sx={{
            px: "20px", py: "16px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: C.accent, fontWeight: 700, fontSize: 14 }}>
              {candidate.candidate_name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography fontSize={14} fontWeight={700} color={C.textPrimary}>
                {candidate.candidate_name}
              </Typography>
              <Typography fontSize={11} color={C.textSecondary}>
                {orgJobCount} job{orgJobCount !== 1 ? "s" : ""} matched
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={() => setJobsDialogOpen(false)}
            sx={{ color: "#9CA3AF", "&:hover": { backgroundColor: "#F3F4F6" } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        {/* Dialog Body */}
        <DialogContent sx={{ p: 0 }}>
          {orgJobs.map((job, idx) => {
            const jsc = stageColor(job.current_stage);
            const isLast = idx === orgJobs.length - 1;

            return (
              <Box
                key={job.matched_candidate_id}
                sx={{
                  px: "20px", py: "16px",
                  borderBottom: isLast ? "none" : `1px solid ${C.border}`,
                  backgroundColor: idx % 2 === 0 ? "#fff" : "#FAFAFA",
                }}
              >
                {/* Job title row */}
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, mb: "10px" }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography fontSize={13} fontWeight={700} color={C.textPrimary} lineHeight={1.4}>
                      {job.job_title}
                    </Typography>
                    <Typography fontSize={11} color={C.textSecondary} mt="2px" sx={{ textTransform: "capitalize" }}>
                      {job.function} · {job.sub_function}
                    </Typography>
                  </Box>
                  {/* Match score badge */}
                  <Box sx={{
                    fontSize: 11, fontWeight: 700, px: "8px", py: "3px",
                    borderRadius: "8px", backgroundColor: C.accentSoft, color: C.accent,
                    whiteSpace: "nowrap", flexShrink: 0,
                  }}>
                    Score: {job.match_score}
                  </Box>
                </Box>

                {/* Stage + matched date + View Profile */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {/* Stage chip */}
                    <Box component="span" sx={{
                      fontSize: 10, fontWeight: 700, px: "8px", py: "3px",
                      borderRadius: "8px", backgroundColor: jsc.bg, color: jsc.color,
                      textTransform: "capitalize",
                    }}>
                      {job.current_stage}
                    </Box>
                    {/* Matched date */}
                    <Typography fontSize={11} color={C.textSecondary}>
                      {new Date(job.matched_at).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </Typography>
                  </Box>

                  {/* View Profile button — passes matched_candidate_id */}
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      setJobsDialogOpen(false);
                      onView(job.matched_candidate_id);
                    }}
                    sx={{
                      backgroundColor: C.accent, color: "#fff",
                      textTransform: "none", fontWeight: 600,
                      borderRadius: "8px", fontSize: 11,
                      boxShadow: "none",
                      "&:hover": { backgroundColor: "#e04e10", boxShadow: "none" },
                    }}
                  >
                    View Profile
                  </Button>
                </Box>
              </Box>
            );
          })}
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ═══════════════════════════════════════════════
   InterviewCard (unchanged)
═══════════════════════════════════════════════ */
function InterviewCard({ interview }) {
  const typeColor =
    interview.interview_type?.toLowerCase() === "technical"
      ? { bg: C.indigoSoft, color: C.indigo }
      : { bg: C.amberSoft, color: C.amber };

  const formattedDate = interview.interview_date
    ? new Date(interview.interview_date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <Card
      sx={{
        borderRadius: "12px",
        border: `1px solid ${C.border}`,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        sx={{
          p: "16px",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: "10px",
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "8px",
              backgroundColor: C.accentSoft,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CalendarMonthOutlinedIcon sx={{ color: C.accent, fontSize: 18 }} />
          </Box>
          <Box
            component="span"
            sx={{
              fontSize: 10,
              fontWeight: 700,
              px: "8px",
              py: "3px",
              borderRadius: "10px",
              backgroundColor: typeColor.bg,
              color: typeColor.color,
              textTransform: "capitalize",
              letterSpacing: "0.05em",
            }}
          >
            {interview.interview_type ?? "Interview"}
          </Box>
        </Box>

        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: C.textPrimary,
            mb: "2px",
            lineHeight: 1.3,
          }}
        >
          {interview.job_title}
        </Typography>
        <Typography sx={{ fontSize: 11, color: C.textSecondary, mb: "10px" }}>
          {interview.job_position_id} · {interview.sub_function}
        </Typography>

        <Divider sx={{ mb: "10px" }} />

        <Box
          sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: "6px" }}
        >
          <CalendarMonthOutlinedIcon
            sx={{ fontSize: 13, color: C.textSecondary }}
          />
          <Typography
            sx={{ fontSize: 11, color: C.textPrimary, fontWeight: 500 }}
          >
            {formattedDate}
          </Typography>
        </Box>
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: "6px" }}
        >
          <AccessTimeIcon sx={{ fontSize: 13, color: C.textSecondary }} />
          <Typography
            sx={{ fontSize: 11, color: C.textPrimary, fontWeight: 500 }}
          >
            {interview.start_time} – {interview.end_time} · {interview.duration}{" "}
            min
          </Typography>
        </Box>

        <Box
          sx={{ display: "flex", justifyContent: "space-between", mb: "6px" }}
        >
          <Typography sx={{ fontSize: 11, color: C.textSecondary }}>
            Round
          </Typography>
          <Typography
            sx={{ fontSize: 11, fontWeight: 500, color: C.textPrimary }}
          >
            {interview.interview_step_name} (Step{" "}
            {interview.interview_step_number})
          </Typography>
        </Box>

        {interview.created_by && (
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: "6px" }}
          >
            <Typography sx={{ fontSize: 11, color: C.textSecondary }}>
              Created by
            </Typography>
            <Typography
              sx={{ fontSize: 11, fontWeight: 500, color: C.textPrimary }}
            >
              {interview.created_by}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Shared helpers ── */
function SectionLabel({ children }) {
  return (
    <Typography
      fontSize={11}
      fontWeight={700}
      color={C.textSecondary}
      letterSpacing="0.08em"
      mb="12px"
      sx={{ textTransform: "uppercase" }}
    >
      {children}
    </Typography>
  );
}

function InfoRow({ label, value, bold }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        py: "10px",
        borderBottom: "1px solid #F3F4F6",
      }}
    >
      <Typography fontSize={13} color={C.textSecondary}>
        {label}
      </Typography>
      <Typography
        fontSize={13}
        fontWeight={bold ? 600 : 500}
        color={C.textPrimary}
      >
        {value}
      </Typography>
    </Box>
  );
}

function StaticPlaceholder({ label, description }) {
  return (
    <Box
      sx={{
        textAlign: "center",
        py: 10,
        border: `1px solid ${C.border}`,
        borderRadius: "12px",
        backgroundColor: "#fff",
      }}
    >
      <WorkOutlineRoundedIcon
        sx={{ fontSize: 42, color: C.textTertiary, mb: 1.5 }}
      />
      <Typography fontSize={15} fontWeight={600} color={C.textPrimary}>
        {label}
      </Typography>
      {description && (
        <Typography fontSize={13} color={C.textSecondary} mt={0.5}>
          {description}
        </Typography>
      )}
    </Box>
  );
}

function Loader() {
  return (
    <Box display="flex" justifyContent="center" py={6}>
      <CircularProgress sx={{ color: C.accent }} />
    </Box>
  );
}

function ErrAlert({ msg }) {
  return (
    <Alert severity="error" sx={{ borderRadius: "10px" }}>
      Failed to load: {msg ?? "Unknown error"}
    </Alert>
  );
}
