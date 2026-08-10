import React, { useState, useEffect, useContext } from "react";
import {
  Grid, Typography, Button, Avatar, TextField,
  IconButton, Box, Skeleton,
  DialogTitle,
  Dialog,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  FormControl,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import WorkOffOutlinedIcon from "@mui/icons-material/WorkOffOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import CasesOutlinedIcon from "@mui/icons-material/CasesOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { useNavigate } from "react-router-dom";
import _isArray from "lodash/isArray";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { useTheme, useMediaQuery } from "@mui/material";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import MuiTooltip from "@mui/material/Tooltip";
import {
  DashboardContainer, SectionCard, JobItem, StatusChip,
  StatCard, getDashboardStyles,
} from "./styles";
// import { AppContext } from "../../../AppContext";
import { useLocation } from "react-router-dom";
import {
  useGetCandidateListByStatusQuery,
  useGetJobAnalyticsQuery,
  useGetJobsListQuery,
  useLazyGetStageDetailsQuery,
} from "../../redux/services/dashboard/dashboardService.js";
import {
  COLORS,
  Dashboard_STATUS_COLORS,
  INTERVIEW_ROUND_STATUS_COLORS,
} from "../../theme/index";
import { toast } from "react-toastify";
import CandidatePipelineFunnel from "./CandidatePipelineFunnel";
import TrendLineChart from "./charts/TrendLineChart";
import DonutChart from "./charts/DonutChart";
import HorizontalBarChart from "./charts/HorizontalBarChart";
import DashboardTableView from "./DashboardTableView";
import PeriodSelect, { SubFunctionSelect, CountrySelect } from "./DashboardFilterBar";
import Sparkline from "./charts/Sparkline";
import { exportDashboardToPdf } from "../../utils/dashboardExportPdf.js";
import { useRef } from "react";
import Confetti from "react-confetti"; // npm install react-confetti
// import ClinicalHiringLogo from "../../../assets/clinical-hiring-logo.jpeg";
import { AddCircleOutlineRounded, PersonSearchOutlined, RocketLaunchOutlined } from "@mui/icons-material";
import { EMPLOYEE_NAME } from "../../utils/constants.js";
import { useSelector } from "react-redux";
import { selectGlobalSearchQuery } from "../../redux/slices/globalSearchSlice.js";
import { useGetJobAnalyticsV2Query } from "../../redux/services/organizationOverview/organizationOverview.js";

// ── Constants ──────────────────────────────────────────────────────────────
const STATS_CONFIG = [
  {
    title: "Total Jobs",
    key: "job_overview.total_jobs",
    Icon: BusinessCenterOutlinedIcon,
    iconBg: "#E3F2FD",
    iconColor: "#1976D2",
    sparkColor: "#1976D2",
    navType: "all",
  },
  {
    title: "Open Jobs",
    key: "job_overview.open_jobs",
    Icon: CasesOutlinedIcon,
    iconBg: "#E0F7FA",
    iconColor: "#0097A7",
    sparkColor: "#0097A7",
    navType: "active",
  },
  {
    title: "Closed Jobs",
    key: "job_overview.closed_jobs",
    Icon: WorkOffOutlinedIcon,
    iconBg: "#FFEBEE",
    iconColor: "#D32F2F",
    sparkColor: "#D32F2F",
    navType: "closed",
  },
  {
    title: "Onboarded Candidates",
    key: "candidate_stage_breakdown.onboarded",
    Icon: BadgeOutlinedIcon,
    iconBg: Dashboard_STATUS_COLORS.onboarded.bg,
    iconColor: Dashboard_STATUS_COLORS.onboarded.color,
    sparkColor: Dashboard_STATUS_COLORS.onboarded.color,
    navType: "stage",
  },
];

const CANDIDATE_STATS_CONFIG = [
  {
    title: "Matched",
    key: "candidate_stage_breakdown.matched",
    Icon: HandshakeOutlinedIcon,
    iconBg: Dashboard_STATUS_COLORS.matched.bg,
    color: Dashboard_STATUS_COLORS.matched.color,
  },
  {
    title: "Shortlisted",
    key: "candidate_stage_breakdown.shortlisted",
    Icon: BadgeOutlinedIcon,
    iconBg: Dashboard_STATUS_COLORS.shortlisted.bg,
    color: Dashboard_STATUS_COLORS.shortlisted.color,
  },
  {
    title: "Interview",
    key: "candidate_stage_breakdown.interviewing.total",   // ← .total added
    Icon: EventAvailableOutlinedIcon,
    iconBg: Dashboard_STATUS_COLORS.interviewing.bg,
    color: Dashboard_STATUS_COLORS.interviewing.color,
  },
  {
    title: "Selected",
    key: "candidate_stage_breakdown.selected",
    Icon: HowToRegOutlinedIcon,
    iconBg: Dashboard_STATUS_COLORS.selected.bg,
    color: Dashboard_STATUS_COLORS.selected.color,
  },
  {
    title: "Offer Released",
    key: "candidate_stage_breakdown.offers.offer_released.total",   // ← .total added
    Icon: DescriptionOutlinedIcon,
    iconBg: Dashboard_STATUS_COLORS.offer_released.bg,
    color: Dashboard_STATUS_COLORS.offer_released.color,
  },
  {
    title: "Offer Rejected",
    key: "candidate_stage_breakdown.offers.offer_released.offer_rejected",
    Icon: ThumbDownAltOutlinedIcon,
    iconBg: Dashboard_STATUS_COLORS.offer_rejected.bg,
    color: Dashboard_STATUS_COLORS.offer_rejected.color,
  },
  {
    title: "Offer Revoked",
    key: "candidate_stage_breakdown.offers.offer_released.offer_revoked",
    Icon: BlockOutlinedIcon,
    iconBg: Dashboard_STATUS_COLORS.offer_revoked.bg,
    color: Dashboard_STATUS_COLORS.offer_revoked.color,
  },
  {
    title: "Onboarded",
    key: "candidate_stage_breakdown.onboarded",
    Icon: BadgeOutlinedIcon,
    iconBg: Dashboard_STATUS_COLORS.onboarded.bg,
    color: Dashboard_STATUS_COLORS.onboarded.color,
  },
];


const CHART_COLORS = {
  open: COLORS.royalBlue,
  closed: "#F44336",
  matched: Dashboard_STATUS_COLORS.matched.color,
  shortlisted: Dashboard_STATUS_COLORS.shortlisted.color,
  selected: Dashboard_STATUS_COLORS.selected.color,
  rejected: Dashboard_STATUS_COLORS.rejected.color,
  onboarded: Dashboard_STATUS_COLORS.onboarded.color,
  interviewPassed: INTERVIEW_ROUND_STATUS_COLORS.completed.color,
  interviewFailed: "#FF5722",
  interviewNoShow: INTERVIEW_ROUND_STATUS_COLORS["no show"].color,
  interviewCancelled: INTERVIEW_ROUND_STATUS_COLORS.cancelled.color,
  interviewScheduled: INTERVIEW_ROUND_STATUS_COLORS.scheduled.color,
  interviewRescheduled: INTERVIEW_ROUND_STATUS_COLORS.rescheduled.color,
  offerReleased: Dashboard_STATUS_COLORS.offer_released.color,
  offerAccepted: Dashboard_STATUS_COLORS.offer_accepted.color,
  offerRejected: Dashboard_STATUS_COLORS.offer_rejected.color,
  offerRevoked: Dashboard_STATUS_COLORS.offer_revoked.color,
  interviewing: Dashboard_STATUS_COLORS.interviewing.color,
};

// ── Utility helpers ────────────────────────────────────────────────────────
const getNestedValue = (obj, path) =>
  path.split(".").reduce((acc, part) => acc?.[part], obj);

const getSafeCount = (obj, path) => {
  const val = getNestedValue(obj, path);

  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return val;

  // Handle nested structures like interviewing.total or offers.offer_released.total
  if (typeof val === "object" && val !== null) {
    return val?.total ?? val?.value ?? 0;
  }

  return Number(val) || 0;
};

const formatMonthLabel = (label) => {
  const [year, month] = label.split("-");
  // The "All time" period filter collapses the trend into a single
  // "all" bucket instead of a "YYYY-MM" month — nothing to parse as a date.
  if (!month) return "All";
  return new Date(year, month - 1).toLocaleString("default", { month: "short" });
};

const sortJobsByDate = (jobs) =>
  [...jobs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

const mapJobData = (jobData) =>
  jobData.map((item, index) => ({
    id: item.job_position_id || item.job_details_id || `job-${index}`,
    job_details_id: item.job_details_id,
    title: item.job_title || "Unknown Job",
    location: item.country || "N/A",
    status: item.status
      ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
      : "N/A",
    color: item.status?.toLowerCase() === "closed" ? CHART_COLORS.closed : CHART_COLORS.open,
    created_at: item.created_at,
    sub_function: item.sub_function || "",
  }));

// ── Chart data builders (Recharts-shaped: array of row objects) ────────────
const createInterviewChartData = (trend) => {
  const labels = (trend.labels || []).map(formatMonthLabel);
  const scheduled = trend.interview_scheduled || [];
  const rescheduled = trend.interview_rescheduled || [];
  // Backend sometimes returns an aggregate { total } instead of a per-month array —
  // in that case there's no real monthly breakdown, so surface the total on the
  // most recent month rather than fabricating a trend across every month.
  const completedRaw = trend.interview_completed;
  const completed = Array.isArray(completedRaw)
    ? completedRaw
    : labels.map((_, i) => (i === labels.length - 1 ? (completedRaw?.total || 0) : 0));
  const cancelled = trend.interview_cancelled || [];

  return labels.map((label, i) => ({
    label,
    scheduled: scheduled[i] || 0,
    rescheduled: rescheduled[i] || 0,
    completed: completed[i] || 0,
    cancelled: cancelled[i] || 0,
  }));
};

const createPipelineTrendData = (trend = {}) => {
  const labels = (trend.labels || []).map(formatMonthLabel);
  const stages = ["matched", "shortlisted", "interviewing", "selected", "offers", "onboarded"];
  return labels.map((label, index) => stages.reduce(
    (row, stage) => ({ ...row, [stage]: Array.isArray(trend[stage]) ? trend[stage][index] || 0 : 0 }),
    { label },
  ));
};

const createOfferTrendData = (trend = {}) => {
  const labels = (trend.labels || []).map(formatMonthLabel);
  const fields = ["offer_released", "offer_accepted", "offer_rejected", "offer_revoked"];
  return labels.map((label, index) => fields.reduce(
    (row, f) => ({ ...row, [f]: Array.isArray(trend[f]) ? trend[f][index] || 0 : 0 }),
    { label },
  ));
};

// ── Donut data builders ─────────────────────────────────────────────────────
const buildExperienceDonutData = (experience = {}) => {
  const buckets = [
    { key: "0-2_years", name: "0–2 yrs", color: "#174FDF" },
    { key: "3-5_years", name: "3–5 yrs", color: "#0571ED" },
    { key: "6-10_years", name: "6–10 yrs", color: "#0097A7" },
    { key: "10+_years", name: "10+ yrs", color: "#00BBD4" },
  ];
  return buckets.map((b) => ({ name: b.name, value: experience?.[b.key] || 0, color: b.color }));
};

const buildOfferBreakdownData = (summary) => [
  { name: "Accepted", value: getSafeCount(summary, "candidate_stage_breakdown.offers.offer_released.offer_accepted"), color: CHART_COLORS.offerAccepted },
  { name: "Rejected", value: getSafeCount(summary, "candidate_stage_breakdown.offers.offer_released.offer_rejected"), color: CHART_COLORS.offerRejected },
  { name: "Revoked", value: getSafeCount(summary, "candidate_stage_breakdown.offers.offer_released.offer_revoked"), color: CHART_COLORS.offerRevoked },
];

const INTERVIEW_BAR_FIELDS = [
  { key: "interview_scheduled", label: "Scheduled", color: "#FFC107" },
  { key: "interview_rescheduled", label: "Rescheduled", color: COLORS.skyBlue },
  { key: "interview_completed", label: "Completed", color: CHART_COLORS.interviewPassed },
  { key: "interview_cancelled", label: "Cancelled", color: CHART_COLORS.interviewCancelled },
];

const FUNNEL_BAR_FIELDS = [
  { key: "matched", label: "Matched", color: CHART_COLORS.matched },
  { key: "shortlisted", label: "Shortlisted", color: CHART_COLORS.shortlisted },
  { key: "interviewing", label: "Interview", color: CHART_COLORS.interviewing },
  { key: "onboarded", label: "Onboarded", color: CHART_COLORS.onboarded },
];

const OFFER_BAR_FIELDS = [
  { key: "offer_released", label: "Released", color: CHART_COLORS.offerReleased },
  { key: "offer_accepted", label: "Accepted", color: CHART_COLORS.offerAccepted },
  { key: "offer_rejected", label: "Rejected", color: CHART_COLORS.offerRejected },
  { key: "offer_revoked", label: "Revoked", color: CHART_COLORS.offerRevoked },
];

const buildBarSeriesData = (trend = {}, fields) =>
  fields.map(({ key, label, color }) => {
    const raw = trend?.[key];
    const value = Array.isArray(raw) ? (raw[raw.length - 1] || 0) : (raw?.total ?? raw ?? 0);
    return { name: label, value, color };
  });

const getSparkValues = (config, summary) => {
  switch (config.title) {
    case "Total Jobs":
      return {
        values: Object.values(summary?.job_overview?.total_jobs?.breakdown || {}),
        labels: Object.keys(summary?.job_overview?.total_jobs?.breakdown || {}),
      };
    case "Open Jobs":
      return {
        values: Object.values(summary?.job_overview?.open_jobs?.breakdown || {}),
        labels: Object.keys(summary?.job_overview?.open_jobs?.breakdown || {}),
      };
    case "Closed Jobs":
      return {
        values: Object.values(summary?.job_overview?.closed_jobs?.breakdown || {}),
        labels: Object.keys(summary?.job_overview?.closed_jobs?.breakdown || {}),
      };
    case "Onboarded Candidates": {
      // onboarded_trend.breakdown is month-keyed regardless of period filter
      // and should be used whenever the backend provides it.
      const breakdown = summary?.onboarded_trend?.breakdown;
      if (breakdown && Object.keys(breakdown).length > 0) {
        const months = Object.keys(breakdown).sort();
        return { values: months.map((m) => breakdown[m]), labels: months };
      }
      return {
        values: summary?.candidate_funnel_trend?.onboarded || [],
        labels: summary?.candidate_funnel_trend?.labels || [],
      };
    }
    default:
      return { values: [], labels: [] };
  }
};

const MiniTotalBar = ({ color, width, height, value = 0 }) => {
  const size = Math.max(36, Math.min(height, width));
  return (
    <Box sx={{ width, height, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Box
        sx={{
          width: size, height: size, borderRadius: "50%", p: "3px", flexShrink: 0,
          background: `conic-gradient(${color} 0deg 360deg)`,
          boxShadow: `0 3px 10px ${color}4D`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <Box sx={{ width: "100%", height: "100%", borderRadius: "50%", bgcolor: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography sx={{ fontSize: size > 46 ? 14 : 12, fontWeight: 800, color, lineHeight: 1 }}>{value}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

// ── Primary stat card ────────────────────────────────────────────────────
const PrimaryStatCard = ({ config, count, loading, sparkValues, onClick }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("xl"));
  const sparkWidth = isDesktop ? 130 : 72;
  const sparkHeight = isDesktop ? 56 : 46;

  return (
    <StatCard
      accent={config.accent}
      onClick={onClick}
      sx={{
        height: "100%",
        boxSizing: "border-box",
        py: 1.75,
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.15s, box-shadow 0.15s",
        "&:hover": onClick ? { transform: "translateY(-2px)", boxShadow: "0 6px 18px rgba(23,79,223,0.16)" } : {},
      }}
    >
      <Box>
        <Typography sx={{ fontSize: 13, color: COLORS.textSecondary, fontWeight: 600, mb: 0.4 }}>
          {config.title}
        </Typography>
        {loading ? (
          <Skeleton width={56} height={34} />
        ) : (
          <Typography sx={{ fontSize: 26, fontWeight: 800, color: COLORS.textPrimary, lineHeight: 1.1 }}>
            {count}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        {(sparkValues?.values?.length || 0) > 1 ? (
          <Sparkline
            values={sparkValues?.values || []}
            labels={sparkValues?.labels || []}
            color={config.sparkColor || config.iconColor}
            uid={config.title}
            width={sparkWidth}
            height={sparkHeight}
          />
        ) : (
          <MiniTotalBar color={config.sparkColor || config.iconColor} width={sparkWidth} height={sparkHeight} value={count} />
        )}
      </Box>
    </StatCard>
  );
};

// ── Search field ───────────────────────────────────────────────────────────
const SearchField = ({ searchTerm, onChange, onClear, classes }) => (
  <TextField
    variant="outlined"
    placeholder="Search..."
    value={searchTerm}
    onChange={onChange}
    size="small"
    InputProps={{
      endAdornment: (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <SearchIcon sx={{ fontSize: "16px", color: COLORS.textMuted, mr: searchTerm ? 0.5 : 0 }} />
          {searchTerm && (
            <IconButton size="small" onClick={onClear}>
              <CloseIcon sx={{ fontSize: "14px" }} />
            </IconButton>
          )}
        </Box>
      ),
      sx: {
        borderRadius: "8px", height: "32px", fontSize: "12px",
        backgroundColor: COLORS.bgPage,
        "& .MuiOutlinedInput-notchedOutline": { borderColor: COLORS.border },
        width: 180,
      },
    }}
    className={classes.searchInput}
  />
);

// ── Job list row ───────────────────────────────────────────────────────────
const JobList = ({ jobs, onViewJob }) => (
  <Box>
    {jobs.map((job, index) => {
      const isClosed = job.status.toLowerCase() === "closed";
      return (
        <JobItem key={`${job.id || "job"}-${job.job_details_id || index}`}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 32, height: 32, borderRadius: "8px",
                bgcolor: isClosed ? "#FFF0F3" : "#EEF2FF",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <CasesOutlinedIcon sx={{ fontSize: 16, color: isClosed ? CHART_COLORS.closed : COLORS.royalBlue }} />
            </Box>
            <Box>
              <Typography sx={{ color: COLORS.textPrimary, fontSize: "13px", fontWeight: 700 }}>
                {job.title}
              </Typography>
              <Typography sx={{ color: COLORS.textMuted, fontSize: "11px" }}>
                {job?.id?.toUpperCase()} • {job?.location}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <StatusChip color={job.color} label={job.status} size="small" />
            <Button
              variant="outlined"
              size="small"
              onClick={() => onViewJob(job)}
              sx={{
                borderRadius: "20px", fontSize: "11px", py: 0.3, px: 1.5,
                borderColor: COLORS.border, color: COLORS.royalBlue,
                "&:hover": { borderColor: COLORS.royalBlue, bgcolor: "#EEF2FF" },
              }}
            >
              View
            </Button>
          </Box>
        </JobItem>
      );
    })}
  </Box>
);
const humanize = (s = "") =>
  s.replace(/_/g, " ").split(" ").filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
const CANDIDATE_STAGE_META = {
  matched: { ...Dashboard_STATUS_COLORS.matched, label: "Matched" },
  shortlisted: { ...Dashboard_STATUS_COLORS.shortlisted, label: "Shortlisted" },
  interview_scheduled: { ...Dashboard_STATUS_COLORS.interviewing, label: "Interview Scheduled" },
  interview_completed: { ...Dashboard_STATUS_COLORS.interviewing, label: "Interview Completed" },
  interview_rescheduled: { ...Dashboard_STATUS_COLORS.interviewing, label: "Interview Rescheduled" },
  interview_cancelled: { ...Dashboard_STATUS_COLORS.interviewing, label: "Interview Cancelled" },
  interview_no_show: { ...Dashboard_STATUS_COLORS.interviewing, label: "No Show" },
  interview_not_conducted: { ...Dashboard_STATUS_COLORS.interviewing, label: "Not Conducted" },
  selected: { ...Dashboard_STATUS_COLORS.selected, label: "Selected" },
  offer_released: { ...Dashboard_STATUS_COLORS.offer_released, label: "Offer Released" },
  offer_accepted: { ...Dashboard_STATUS_COLORS.offer_accepted, label: "Offer Accepted" },
  offer_rejected: { ...Dashboard_STATUS_COLORS.offer_rejected, label: "Offer Rejected" },
  offer_revoked: { ...Dashboard_STATUS_COLORS.offer_revoked, label: "Offer Revoked" },
  rejected: { ...Dashboard_STATUS_COLORS.rejected, label: "Rejected" },
  onboarded: { ...Dashboard_STATUS_COLORS.onboarded, label: "Onboarded" },
};
const PIPELINE_STEPS = [
  { key: "matched", label: "Matched", color: Dashboard_STATUS_COLORS.matched.color },
  { key: "shortlisted", label: "Shortlisted", color: Dashboard_STATUS_COLORS.shortlisted.color },
  { key: "interviewing", label: "Interview", color: Dashboard_STATUS_COLORS.interviewing.color },
  { key: "selected", label: "Selected", color: Dashboard_STATUS_COLORS.selected.color },
  { key: "offers", label: "Offers", color: Dashboard_STATUS_COLORS.offer_released.color },
  { key: "onboarded", label: "Onboarded", color: Dashboard_STATUS_COLORS.onboarded.color },
];
const getInterviewRounds = (interviewing) => {
  if (!interviewing) return [];
  return Array.isArray(interviewing) ? interviewing : [interviewing];
};
const getCandidateLatestStageDate = (c) => {
  let latest = 0;
  const consider = (iso) => {
    const t = iso ? new Date(iso).getTime() : 0;
    if (t > latest) latest = t;
  };
  (c.jobs || []).forEach((job) => {
    ["matched", "shortlisted", "selected", "offers", "onboarded"].forEach((key) => consider(job[key]?.staged_at));
    getInterviewRounds(job.interviewing).forEach((round) => {
      (round.stage_transitions || []).forEach((t) => consider(t.staged_at));
    });
  });
  return latest;
};

const buildJobMilestones = (job) => {
  const rounds = getInterviewRounds(job.interviewing);
  return PIPELINE_STEPS.map((step) => {
    if (step.key === "interviewing") {
      return { ...step, reached: rounds.length > 0, rounds };
    }
    const data = job[step.key];
    return { ...step, reached: Boolean(data), data };
  });
};

const INTERVIEW_STATUS_META = INTERVIEW_ROUND_STATUS_COLORS;

const PipelineStepper = ({ milestones }) => (
  <Box sx={{ overflowX: "auto", mt: 1 }}>
    <Box sx={{ display: "flex", alignItems: "flex-start", minWidth: 320 }}>
      {milestones.map((m, idx) => {
        const tooltip = m.key === "interviewing"
          ? (m.rounds.length ? `${m.rounds.length} interview round${m.rounds.length === 1 ? "" : "s"}` : "Not started yet")
          : m.data?.staged_at
            ? `${new Date(m.data.staged_at).toLocaleString()}${m.data.triggered_by_name ? ` · ${m.data.triggered_by_name}` : ""}`
            : "Not reached yet";
        return (
          <React.Fragment key={m.key}>
            <MuiTooltip arrow title={tooltip}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: 58, flexShrink: 0 }}>
                <Box
                  sx={{
                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    bgcolor: m.reached ? m.color : "#fff",
                    border: `2px solid ${m.reached ? m.color : COLORS.border}`,
                  }}
                >
                  {m.reached && <CheckRoundedIcon sx={{ fontSize: 12, color: "#fff" }} />}
                </Box>
                <Typography
                  sx={{
                    fontSize: 9.5, fontWeight: m.reached ? 700 : 500, mt: 0.4, textAlign: "center", lineHeight: 1.2,
                    color: m.reached ? m.color : COLORS.textMuted,
                  }}
                >
                  {m.label}
                </Typography>
              </Box>
            </MuiTooltip>
            {idx < milestones.length - 1 && (
              <Box sx={{
                flex: 1, height: 2, mt: "9px", minWidth: 12,
                bgcolor: m.reached && milestones[idx + 1].reached ? milestones[idx + 1].color : COLORS.border,
              }} />
            )}
          </React.Fragment>
        );
      })}
    </Box>
  </Box>
);
const StageCandidateRow = React.memo(function StageCandidateRow({ candidate: c, index: i, navigate }) {
  const avatarColors = ["#174FDF", "#0097A7", "#673AB7", "#E65100", "#0571ED"];
  const jobsList = c.jobs || [];
  const latestTs = getCandidateLatestStageDate(c);
  const latestDateLabel = latestTs
    ? new Date(latestTs).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
  const jobCount = jobsList.length || c.job_count || 0;
  const metaLine = [c.designation, c.total_experience].filter(Boolean).join(" · ");

  return (
    <Accordion
      disableGutters
      elevation={0}
      square
      sx={{
        border: `1px solid ${COLORS.border}`,
        borderRadius: "10px !important",
        mb: 1,
        "&:before": { display: "none" },
        overflow: "hidden",
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />}
        sx={{
          px: 1.5, minHeight: 56,
          "& .MuiAccordionSummary-content": { alignItems: "center", my: 0.75, minWidth: 0, gap: 1.25 },
          "&:hover": { bgcolor: "#f8f9ff" },
        }}
      >
        <Box sx={{
          width: 36, height: 36, borderRadius: "50%",
          bgcolor: avatarColors[i % avatarColors.length],
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>
            {c.candidate_name?.trim()?.charAt(0)?.toUpperCase() || String(c.clin_id || "00").slice(-2)}
          </Typography>
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: COLORS.textPrimary, flexShrink: 0 }}>
              CLIN{c.clin_id}
            </Typography>
            {c.candidate_name && (
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: COLORS.royalBlue, minWidth: 0 }} noWrap>
                {c.candidate_name}
              </Typography>
            )}
            {!c.is_active && (
              <Chip label="Inactive" size="small" sx={{ height: 16, fontSize: 9, bgcolor: "#FFEBEE", color: "#D32F2F", flexShrink: 0 }} />
            )}
          </Box>
          <Typography sx={{ fontSize: 11, color: COLORS.textSecondary, mt: 0.1 }} noWrap>
            {metaLine || "—"}
          </Typography>
        </Box>

        <Chip
          label={`${jobCount} job${jobCount === 1 ? "" : "s"}`}
          size="small"
          sx={{ height: 22, fontSize: 10.5, fontWeight: 700, bgcolor: "#EEF3FF", color: COLORS.royalBlue, flexShrink: 0, mr: 0.5 }}
        />
      </AccordionSummary>

      {/* Jobs this candidate is in the current stage for — each with its
          own pipeline progress, since the same clin_id can be at a
          different point of the funnel on each job opening. Contact
          details live on the candidate now, so they're shown once here
          rather than repeated per job. */}
      <AccordionDetails sx={{ p: 0, borderTop: `1px solid ${COLORS.border}`, bgcolor: "#FAFBFF" }}>
        {(c.email || c.phone_number) && (
          <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            {/* The API already redacts email/phone in-place (e.g. "d***2@gmail.com")
                when pii_masked is true — show that string as-is rather than hiding
                it behind a placeholder, and just flag it with a small icon. */}
            {c.email && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, minWidth: 0 }}>
                <EmailOutlinedIcon sx={{ fontSize: 12, color: COLORS.textMuted, flexShrink: 0 }} />
                <Typography sx={{ fontSize: 10.5, color: COLORS.textSecondary }} noWrap>{c.email}</Typography>
              </Box>
            )}
            {c.phone_number && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                <LocalPhoneOutlinedIcon sx={{ fontSize: 12, color: COLORS.textMuted, flexShrink: 0 }} />
                <Typography sx={{ fontSize: 10.5, color: COLORS.textSecondary }}>{c.phone_number}</Typography>
              </Box>
            )}
            {c.pii_masked && (
              <MuiTooltip arrow title="Contact details are partially masked">
                <VisibilityOffOutlinedIcon sx={{ fontSize: 12, color: COLORS.textMuted }} />
              </MuiTooltip>
            )}
          </Box>
        )}

        {jobsList.map((job, ji) => {
          const stageMeta = CANDIDATE_STAGE_META[job.current_stage];
          const milestones = buildJobMilestones(job);
          const rounds = [...getInterviewRounds(job.interviewing)].sort(
            (a, b) => new Date(`${a.date || ""}T${a.start_time || "00:00:00"}`) - new Date(`${b.date || ""}T${b.start_time || "00:00:00"}`)
          );

          return (
            <Box
              key={job.job_details_id || ji}
              sx={{
                px: 2, py: 1.5,
                borderBottom: ji < jobsList.length - 1 ? `1px solid ${COLORS.border}` : "none",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, minWidth: 0 }}>
                  <CasesOutlinedIcon sx={{ fontSize: 16, color: COLORS.royalBlue, mt: 0.2, flexShrink: 0 }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: COLORS.textPrimary }} noWrap>
                      {job.job_title || "Untitled role"}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, flexWrap: "wrap", mt: 0.2 }}>
                      {job.job_position_id && (
                        <Typography sx={{ fontSize: 10.5, color: COLORS.textMuted }}>
                          {job.job_position_id.toUpperCase()}
                        </Typography>
                      )}
                      {job.job_country && (
                        <>
                          <Typography sx={{ fontSize: 10.5, color: COLORS.textMuted }}>·</Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                            <PublicOutlinedIcon sx={{ fontSize: 11, color: COLORS.textMuted }} />
                            <Typography sx={{ fontSize: 10.5, color: COLORS.textMuted }}>{job.job_country}</Typography>
                          </Box>
                        </>
                      )}
                      {job.sub_function && (
                        <>
                          <Typography sx={{ fontSize: 10.5, color: COLORS.textMuted }}>·</Typography>
                          <Typography sx={{ fontSize: 10.5, color: COLORS.textMuted }}>{humanize(job.sub_function)}</Typography>
                        </>
                      )}
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0 }}>
                  {job.current_stage && (
                    <Chip
                      label={stageMeta?.label || humanize(job.current_stage)}
                      size="small"
                      sx={{
                        height: 22, fontSize: 10, fontWeight: 700,
                        bgcolor: stageMeta?.bg || "#F5F5F5",
                        color: stageMeta?.color || COLORS.textSecondary,
                      }}
                    />
                  )}
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate("/recruit/requisitions/Job-details", {
                      state: {
                        job_details_id: job.job_details_id,
                        matched_candidate_id: job.matched_candidate_id || c.candidate_id,
                        fromDashboard: true,
                      },
                    })}
                    sx={{
                      borderRadius: "20px", fontSize: "11px", py: 0.3, px: 1.75, flexShrink: 0,
                      borderColor: COLORS.border, color: COLORS.royalBlue,
                      "&:hover": { borderColor: COLORS.royalBlue, bgcolor: "#EEF2FF" },
                    }}
                  >
                    View
                  </Button>
                </Box>
              </Box>

              {/* Pipeline progress — factual "reached" state per stage,
                  independent of the (possibly "rejected") current_stage
                  chip shown above. */}
              <PipelineStepper milestones={milestones} />

              {/* Individual interview rounds, chronological */}
              {rounds.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6, mt: 1.1 }}>
                  {rounds.map((round, ri) => {
                    const statusMeta = INTERVIEW_STATUS_META[(round.status || "").toLowerCase()] || { color: COLORS.textSecondary, bg: "#F5F5F5" };
                    const stepName = round.interview_step_name?.trim() || `Round ${round.interview_step_number || ri + 1}`;
                    const dateLabel = round.date
                      ? new Date(round.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
                      : "—";
                    const timeLabel = round.start_time
                      ? `${round.start_time.slice(0, 5)}–${round.end_time?.slice(0, 5) || ""}`
                      : "";
                    return (
                      <MuiTooltip
                        key={round.interview_id || ri}
                        arrow
                        title={
                          <Box sx={{ fontSize: 11 }}>
                            {round.interview_step_type && (
                              <Box sx={{ fontWeight: 700, mb: 0.3 }}>
                                {humanize(round.interview_step_type)}{round.is_final ? " · Final round" : ""}
                              </Box>
                            )}
                            {round.date && (
                              <Box>
                                {new Date(round.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                                {timeLabel ? ` · ${timeLabel}` : ""}
                              </Box>
                            )}
                            {(round.stage_transitions || []).map((t, ti) => (
                              <Box key={ti} sx={{ mt: 0.3, opacity: 0.85 }}>
                                {humanize(t.stage)} — {t.staged_at ? new Date(t.staged_at).toLocaleString() : "—"}
                                {t.triggered_by_name ? ` by ${t.triggered_by_name}` : ""}
                              </Box>
                            ))}
                          </Box>
                        }
                      >
                        <Chip
                          label={`${stepName}${round.is_final ? " ★" : ""} · ${round.status || "—"} · ${dateLabel}`}
                          size="small"
                          sx={{
                            height: 22, fontSize: 10, fontWeight: 600,
                            bgcolor: statusMeta.bg,
                            color: statusMeta.color,
                          }}
                        />
                      </MuiTooltip>
                    );
                  })}
                </Box>
              )}
            </Box>
          );
        })}
      </AccordionDetails>
    </Accordion>
  );
});
const CountsToggle = ({ value, onChange }) => (
  <MuiTooltip
    arrow
    placement="top"
    title={
      <Box sx={{ p: 0.5, maxWidth: 220 }}>
        <Typography sx={{ fontSize: 11, lineHeight: 1.5 }}>
          <b>Cumulative</b>: Total candidates who have reached this stage at any point in the hiring process.<br />
          <b>Current</b>: Candidates currently in this stage.
        </Typography>
      </Box>
    }
  >
    <Box sx={{
      display: "flex", alignItems: "center", bgcolor: COLORS.bgPage,
      borderRadius: "20px", p: "2px", border: `1px solid ${COLORS.border}`,
    }}>
      {[
        { value: "cumulative", label: "Cumulative" },
        { value: "current", label: "Current" },
      ].map((opt) => (
        <Box
          key={opt.value}
          onClick={() => onChange(opt.value)}
          sx={{
            px: 1.5, py: 0.4, borderRadius: "18px", cursor: "pointer",
            fontSize: 11, fontWeight: 600, textTransform: "capitalize",
            color: value === opt.value ? "#fff" : COLORS.textSecondary,
            bgcolor: value === opt.value ? COLORS.royalBlue : "transparent",
            transition: "background-color 0.15s, color 0.15s",
          }}
        >
          {opt.label}
        </Box>
      ))}
    </Box>
  </MuiTooltip>
);
const ViewToggle = ({ value, onChange }) => (
  <Box sx={{
    display: "flex", alignItems: "center", bgcolor: COLORS.bgPage,
    borderRadius: "20px", p: "2px", border: `1px solid ${COLORS.border}`,
  }}>
    {[
      { value: "organisation", label: "All Users" },
      { value: "user", label: "Current User" },
    ].map((opt) => (
      <Box
        key={opt.value}
        onClick={() => onChange(opt.value)}
        sx={{
          px: 1.5, py: 0.4, borderRadius: "18px", cursor: "pointer",
          fontSize: 11, fontWeight: 600,
          color: value === opt.value ? "#fff" : COLORS.textSecondary,
          bgcolor: value === opt.value ? COLORS.royalBlue : "transparent",
          transition: "background-color 0.15s, color 0.15s",
        }}
      >
        {opt.label}
      </Box>
    ))}
  </Box>
);
const useCountUp = (target, duration = 1200, start = false) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start || !target) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
};
const STEPS = [
  { icon: AddCircleOutlineRounded, title: "Create your first Job", desc: "Post a role and let the platform match top candidates automatically." },
  { icon: PersonSearchOutlined, title: "Review Matched Candidates", desc: "Our AI shortlists the best-fit profiles for your role." },
  { icon: EventAvailableOutlinedIcon, title: "Schedule Interviews", desc: "Book slots, add panel members, and track interview progress." },
  { icon: RocketLaunchOutlined, title: "Onboard & Grow", desc: "Move candidates through the pipeline and build your dream team." },
];
const WelcomeToast = ({ totalJobs = 0, totalCandidates = 0, onDismiss }) => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [confetti, setConfetti] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [autoTimerActive, setAutoTimerActive] = useState(true);

  const jobCount = useCountUp(totalJobs, 900, showStats);
  const candidateCount = useCountUp(totalCandidates, 1100, showStats);

  const userName = localStorage.getItem(EMPLOYEE_NAME)

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 80);
    const t2 = setTimeout(() => setConfetti(false), 2800);
    const t3 = setTimeout(() => setShowStats(true), 350);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 320);
  };

  // Auto-dismiss after 8s — pauses while expanded or hovered
  useEffect(() => {
    if (!autoTimerActive || expanded) return;
    const t = setTimeout(handleDismiss, 8000);
    return () => clearTimeout(t);
  }, [autoTimerActive, expanded]);

  return (
    <>
      {confetti && (
        <Confetti
          width={window.innerWidth}
          height={260}
          numberOfPieces={90}
          recycle={false}
          gravity={0.2}
          colors={["#1A56DB", "#3B82F6", "#60A5FA", "#06B6D4", "#FCD34D"]}
          style={{ position: "fixed", top: 0, left: 0, zIndex: 1500, pointerEvents: "none" }}
        />
      )}

      <Box
        onMouseEnter={() => setAutoTimerActive(false)}
        onMouseLeave={() => setAutoTimerActive(true)}
        sx={{
          position: "fixed",
          top: visible ? 18 : -60,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1400,
          opacity: visible ? 1 : 0,
          width: { xs: "94%", sm: 520 },
          maxWidth: "calc(100vw - 24px)",
          transition: "top .45s cubic-bezier(.34,1.56,.64,1), opacity .3s ease",
        }}
      >
        <Box sx={{
          borderRadius: "16px",
          border: "1px solid #BAE6FD",
          background: "linear-gradient(135deg,#fff 0%,#F0F9FF 60%,#E0F2FE 100%)",
          boxShadow: "0 14px 36px rgba(14,165,233,.20), 0 4px 14px rgba(15,23,42,.08)",
          overflow: "hidden",
        }}>
          {/* ── Main row ── */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: "12px 14px" }}>
            <Box sx={{
              width: 42, height: 42, borderRadius: "10px", flexShrink: 0,
              border: "2px solid rgba(14,165,233,.3)", overflow: "hidden", bgcolor: "#fff",
            }}>
              {/* <Box component="img" src={ClinicalHiringLogo} alt="Clinical Hiring"
                sx={{ width: "100%", height: "100%", objectFit: "cover" }} >

              </Box> */}
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: "#0F172A", lineHeight: 1.25 }}>
                Hey {userName}! 👋 Welcome to Clinical Hiring
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: "#64748B", mt: 0.2 }}>
                <b style={{ color: "#1D4ED8" }}>{jobCount}</b> jobs ·{" "}
                <b style={{ color: "#0E9F6E" }}>{candidateCount}</b> candidates ready to explore
              </Typography>
            </Box>

            <Button
              size="small"
              onClick={() => setExpanded((p) => !p)}
              sx={{ fontSize: 11, fontWeight: 600, color: "#0369A1", minWidth: 0, px: 1, whiteSpace: "nowrap" }}
            >
              {expanded ? "Hide" : "Get started"}
            </Button>

            <IconButton
              size="small"
              onClick={handleDismiss}
              sx={{
                width: 26, height: 26, color: "#64748B",
                "&:hover": { bgcolor: "rgba(220,38,38,.08)", color: "#DC2626" },
              }}
            >
              <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>

          {/* ── Expandable onboarding steps ── */}
          <Box sx={{
            maxHeight: expanded ? 280 : 0,
            opacity: expanded ? 1 : 0,
            overflow: "hidden",
            transition: "max-height .35s ease, opacity .25s ease",
            borderTop: expanded ? "1px solid rgba(15,23,42,.08)" : "none",
          }}>
            <Box sx={{ p: "14px", display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4,1fr)" }, gap: 1 }}>
              {STEPS.map((step, i) => {
                const StepIcon = step.icon;
                return (
                  <Box key={i} sx={{ borderRadius: "10px", p: "10px", bgcolor: "#fff", border: "1px solid rgba(15,23,42,.08)" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, mb: 0.6 }}>
                      <Box sx={{
                        width: 18, height: 18, borderRadius: "50%", bgcolor: "#0EA5E9", color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700,
                      }}>
                        {i + 1}
                      </Box>
                      <StepIcon sx={{ fontSize: 14, color: "#0EA5E9" }} />
                    </Box>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#1E293B", lineHeight: 1.3 }}>
                      {step.title}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
            <Box sx={{ px: "14px", pb: "14px" }}>
              <Button
                fullWidth
                variant="contained"
                size="small"
                onClick={() => { navigate("/recruit/create-job/job-requirements"); handleDismiss(); }}
                sx={{
                  borderRadius: "10px", textTransform: "none", fontSize: 12.5, fontWeight: 700,
                  background: "linear-gradient(135deg,#06B6D4,#1A56DB)", color: "#fff",
                  "&:hover": { background: "linear-gradient(135deg,#0891B2,#1D4ED8)" },
                }}
              >
                🚀 Create your first job
              </Button>
            </Box>
          </Box>

          {/* ── Auto-dismiss progress bar ── */}
          {!expanded && (
            <Box sx={{ height: 2, bgcolor: "rgba(14,165,233,.15)" }}>
              <Box sx={{
                height: "100%", bgcolor: "#0EA5E9",
                animation: autoTimerActive ? "welcomeToastShrink 8s linear forwards" : "none",
                "@keyframes welcomeToastShrink": { from: { width: "100%" }, to: { width: "0%" } },
              }} />
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};
const OrganizationOverview = ({ selectedStatus = "all" ,orgId}) => {
  const classes = getDashboardStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const globalSearchQuery = useSelector(selectGlobalSearchQuery);

  console.log("OrgIDFromReqOverview...", orgId)
  // const { userInfo } = useContext(AppContext);  // or however you get user
  const [showWelcome, setShowWelcome] = useState(false);



  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [closedSearchTerm, setClosedSearchTerm] = useState("");
  const [activeJobs, setActiveJobs] = useState([]);
  const [closedJobs, setClosedJobs] = useState([]);
  const [originalActiveJobs, setOriginalActiveJobs] = useState([]);
  const [originalClosedJobs, setOriginalClosedJobs] = useState([]);
  const [jobsDialog, setJobsDialog] = useState({ open: false, filter: "all" });
  const [jobsDialogSearch, setJobsDialogSearch] = useState("");
  const [candidateSummary, setCandidateSummary] = useState({});
  const [analyticsView, setAnalyticsView] = useState("user");
  const [countsType, setCountsType] = useState("current");
  const [periodCount, setPeriodCount] = useState("all");
  const isAllTime = periodCount === "all";

  const [interviewChartData, setInterviewChartData] = useState([]);

  const [subFunction, setSubFunction] = useState("");  // "" = All
  const [analyticsCountry, setAnalyticsCountry] = useState("all");
  const [dashboardView, setDashboardView] = useState("chart"); // "chart" | "table"
  const [stageSortOrder, setStageSortOrder] = useState("latest"); // "latest" | "oldest"
  const [stageDialog, setStageDialog] = useState({
    open: false,
    stage: "",
    data: [],
    count: 0,
    loading: false,
    page: 1,
    pageSize: 10,
  });

  const [fetchStage, { data: stageRes, isFetching: stageLoading }] = useLazyGetStageDetailsQuery();
  const [stageSearchInput, setStageSearchInput] = useState("");
  const [stageSearchTerm, setStageSearchTerm] = useState("");

  const [exportingPdf, setExportingPdf] = useState(false);

  const isNewUser = "false" // from API

  const handleDismissWelcome = () => {
    setShowWelcome(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setStageSearchTerm(stageSearchInput);
    }, 250);
    return () => clearTimeout(timer);
  }, [stageSearchInput]);

  const getLastNMonthPeriods = (n) => {
    const periods = [];
    const now = new Date();
    for (let i = 0; i < n; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      periods.push(d.toISOString().slice(0, 7)); // "YYYY-MM"
    }
    return periods; // most recent first
  };

  const handleStageClick = async (stageKey, page = 1) => {
    const stage = stageKey.split(".").pop();
    const pageSize = 10;
    setStageDialog((p) => ({ ...p, open: true, stage, data: [], loading: true, page, pageSize }));
    setStageSearchInput("");
    setStageSearchTerm("");
    setStageSortOrder("latest");
    try {
      const stageResData = await fetchStage({
        stage, period: "", status: "all", scope: analyticsView,
        countsType, filterBySubfunction: subFunction, country: analyticsCountry,
        page, pageSize,
      }, true).unwrap();
      const candidates = stageResData?.data?.candidates ?? [];

      const total =
        stageResData?.data?.total_count ??
        stageResData?.data?.total ??
        stageResData?.data?.total_records ??
        stageResData?.total_count ??
        stageResData?.total ??
        stageResData?.total_records ??
        candidates.length;

      setStageDialog((p) => ({
        ...p,
        stage,
        data: candidates,
        count: total,
        loading: false,
        page,
        pageSize,
      }));
    } catch (err) {
      console.error("stage-details fetch failed:", err);
      toast.error("Failed to load stage details");
      setStageDialog((p) => ({ ...p, loading: false }));
    }
  };

  const handleStagePageChange = (newPage) => {
    handleStageClick(`candidate_stage_breakdown.${stageDialog.stage}`, newPage);
  };

  useEffect(() => {
    const requestedStage = location.state?.copilotStage;
    if (!requestedStage) return;
    handleStageClick("candidate_stage_breakdown." + requestedStage);
    navigate(location.pathname, { replace: true, state: {} });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.copilotStage]);

  useEffect(() => {
    if (!stageDialog.open || !stageDialog.stage) return;
    handleStageClick(`candidate_stage_breakdown.${stageDialog.stage}`, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countsType, subFunction]);

  const closeStageDialog = () => {
    setStageDialog((p) => ({ ...p, open: false, page: 1, hasMore: true }));
    setStageSearchInput("");
    setStageSearchTerm("");
  };
  const normalizedStatus = selectedStatus.toLowerCase() === "all" ? "" : selectedStatus.toLowerCase();

  // ── RTK queries ──────────────────────────────────────────────────────────
 const { data: res, isLoading, isFetching, refetch } = useGetJobAnalyticsV2Query(
  {
    organisationId: orgId,
    groupBy: "month",
    periodCount,
    status: "all",
    countsType,
    filterBySubfunction: subFunction,
    country: analyticsCountry,
  },
  { skip: !orgId }
);
  const { data: jobsResponse, isLoading: jobsLoading } =
    useGetJobsListQuery({
      status: selectedStatus === "all" ? "" : selectedStatus,
      country: analyticsCountry, filterBySubfunction: subFunction, periodCount,
    });

  const { data: candidateDashboard, isLoading: dashboardLoading } =
    useGetCandidateListByStatusQuery(normalizedStatus);

  // ── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!jobsResponse?.success) return;
    const jobs = jobsResponse?.data || [];
    const mapped = mapJobData(_isArray(jobs) ? jobs : []);
    const sorted = sortJobsByDate(mapped);
    const active = sorted.filter((j) => j.status.toLowerCase() === "open");
    const closed = sorted.filter((j) => j.status.toLowerCase() === "closed");
    setActiveJobs(active);
    setClosedJobs(closed);
    setOriginalActiveJobs(active);
    setOriginalClosedJobs(closed);
  }, [jobsResponse]);

  useEffect(() => {
    if (!res?.success) return;
    const summary = res?.data || {};
    setCandidateSummary(summary);
    if (summary.interview_analysis_trend) {
      setInterviewChartData(createInterviewChartData(summary.interview_analysis_trend));
    }
  }, [res]);
  useEffect(() => {
    setAnalyticsView(location.pathname.includes("/dashboard/organization") ? "organisation" : "user");
  }, [location.pathname]);

  const filteredStageData = React.useMemo(() => {
    let list = stageDialog.data;
    if (stageSearchTerm.trim()) {
      const q = stageSearchTerm.toLowerCase().trim();
      list = list.filter((c) => {
        const name = c.candidate_name || "";
        return String(c.clin_id || "").toLowerCase().includes(q) || name.toLowerCase().includes(q);
      });
    }

    return [...list].sort((a, b) => {
      const da = getCandidateLatestStageDate(a);
      const db = getCandidateLatestStageDate(b);
      return stageSortOrder === "latest" ? db - da : da - db;
    });
  }, [stageDialog.data, stageSearchTerm, stageSortOrder]);

  // ── Search helpers ────────────────────────────────────────────────────────
  const filterJobs = (search, type) => {
    const base = type === "active" ? [...originalActiveJobs] : [...originalClosedJobs];
    const filtered = search
      ? base.filter((j) =>
        [j.title, j.id, j.location, j.status].some((f) =>
          f.toLowerCase().includes(search.toLowerCase())
        )
      )
      : base;
    type === "active" ? setActiveJobs(filtered) : setClosedJobs(filtered);
  };

  useEffect(() => {
    filterJobs(globalSearchQuery || activeSearchTerm, "active");
    filterJobs(globalSearchQuery || closedSearchTerm, "closed");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalSearchQuery, originalActiveJobs, originalClosedJobs]);

  const handleViewJob = (job) =>
    navigate("/recruit/requisitions/Job-details", { state: { job_details_id: job.job_details_id } });

  const closeJobsDialog = () => { setJobsDialog((p) => ({ ...p, open: false })); setJobsDialogSearch(""); };

  // ── KPI stat-card click → open the jobs dialog (Total/Open/Closed) or the stage dialog (Onboarded) ──
  const handleStatClick = (config) => {
    if (config.navType === "stage") return handleStageClick(config.key);
    setJobsDialog({ open: true, filter: config.navType }); // "all" | "active" | "closed"
  };
  const jobsDialogAll = sortJobsByDate([...originalActiveJobs, ...originalClosedJobs]);
  const jobsDialogSource =
    jobsDialog.filter === "active" ? originalActiveJobs :
      jobsDialog.filter === "closed" ? originalClosedJobs :
        jobsDialogAll;
  const jobsDialogTerm = jobsDialogSearch.trim().toLowerCase();
  const jobsDialogData = jobsDialogTerm
    ? jobsDialogSource.filter((j) => j.title?.toLowerCase().includes(jobsDialogTerm) || j.id?.toLowerCase().includes(jobsDialogTerm))
    : jobsDialogSource;
  const jobsDialogTitle = jobsDialog.filter === "active" ? "Open Jobs" : jobsDialog.filter === "closed" ? "Closed Jobs" : "Total Jobs";
  const rawMonthKeys =
    candidateSummary?.interview_analysis_trend?.labels ||
    candidateSummary?.candidate_funnel_trend?.labels ||
    [];
  const monthlyColumns = rawMonthKeys.map(formatMonthLabel);
  const jobOverview = candidateSummary?.job_overview || {};
  const jobOverviewSeries = (metric) =>
    isAllTime ? [jobOverview?.[metric]?.value || 0] : rawMonthKeys.map((k) => jobOverview?.[metric]?.breakdown?.[k] || 0);

  const funnelTrendRows = createPipelineTrendData(candidateSummary?.candidate_funnel_trend);
  const offerTrendRows = createOfferTrendData(candidateSummary?.offer_analysis_trend);

  const withTotals = (rows) => rows.map((row) => ({ ...row, total: row.values.reduce((sum, v) => sum + v, 0) }));

  const monthlySections = [
    {
      title: "Job Overview",
      rows: withTotals([
        { label: "Total Jobs", color: COLORS.royalBlue, values: jobOverviewSeries("total_jobs") },
        { label: "Open Jobs", color: CHART_COLORS.open, values: jobOverviewSeries("open_jobs") },
        { label: "Closed Jobs", color: CHART_COLORS.closed, values: jobOverviewSeries("closed_jobs") },
      ]),
    },
    {
      title: "Interview Analysis",
      rows: withTotals([
        { label: "Scheduled", color: "#FFC107", values: interviewChartData.map((r) => r.scheduled) },
        { label: "Rescheduled", color: COLORS.skyBlue, values: interviewChartData.map((r) => r.rescheduled) },
        { label: "Completed", color: CHART_COLORS.interviewPassed, values: interviewChartData.map((r) => r.completed) },
        { label: "Cancelled", color: CHART_COLORS.interviewCancelled, values: interviewChartData.map((r) => r.cancelled) },
      ]),
    },
    {
      title: "Candidate Funnel",
      rows: withTotals([
        { label: "Matched", color: CHART_COLORS.matched, values: funnelTrendRows.map((r) => r.matched) },
        { label: "Shortlisted", color: CHART_COLORS.shortlisted, values: funnelTrendRows.map((r) => r.shortlisted) },
        { label: "Interview", color: CHART_COLORS.interviewing, values: funnelTrendRows.map((r) => r.interviewing) },
        { label: "Onboarded", color: CHART_COLORS.onboarded, values: funnelTrendRows.map((r) => r.onboarded) },
      ]),
    },
    {
      title: "Offer Status",
      rows: withTotals([
        { label: "Released", color: CHART_COLORS.offerReleased, values: offerTrendRows.map((r) => r.offer_released) },
        { label: "Accepted", color: CHART_COLORS.offerAccepted, values: offerTrendRows.map((r) => r.offer_accepted) },
        { label: "Rejected", color: CHART_COLORS.offerRejected, values: offerTrendRows.map((r) => r.offer_rejected) },
        { label: "Revoked", color: CHART_COLORS.offerRevoked, values: offerTrendRows.map((r) => r.offer_revoked) },
      ]),
    },
  ];

  const snapshotSections = [
    {
      title: "Candidate Pipeline",
      rows: [
        { label: "Matched", color: CHART_COLORS.matched, value: getSafeCount(candidateSummary, "candidate_stage_breakdown.matched") },
        { label: "Shortlisted", color: CHART_COLORS.shortlisted, value: getSafeCount(candidateSummary, "candidate_stage_breakdown.shortlisted") },
        { label: "Interview", color: CHART_COLORS.interviewing, value: getSafeCount(candidateSummary, "candidate_stage_breakdown.interviewing.total") },
        { label: "Selected", color: CHART_COLORS.selected, value: getSafeCount(candidateSummary, "candidate_stage_breakdown.selected") },
        { label: "Offer Released", color: CHART_COLORS.offerReleased, value: getSafeCount(candidateSummary, "candidate_stage_breakdown.offers.offer_released.total") },
        { label: "Offer Accepted", color: CHART_COLORS.offerAccepted, value: getSafeCount(candidateSummary, "candidate_stage_breakdown.offers.offer_released.offer_accepted") },
        { label: "Offer Rejected", color: CHART_COLORS.offerRejected, value: getSafeCount(candidateSummary, "candidate_stage_breakdown.offers.offer_released.offer_rejected") },
        { label: "Offer Revoked", color: CHART_COLORS.offerRevoked, value: getSafeCount(candidateSummary, "candidate_stage_breakdown.offers.offer_released.offer_revoked") },
        { label: "Onboarded", color: CHART_COLORS.onboarded, value: getSafeCount(candidateSummary, "candidate_stage_breakdown.onboarded") },
        { label: "Rejected", color: CHART_COLORS.rejected, value: getSafeCount(candidateSummary, "candidate_stage_breakdown.rejected") },
      ],
    },
    {
      title: "Candidates by Experience",
      rows: [
        { label: "0–2 yrs", color: "#174FDF", value: candidateSummary?.candidate_experience?.["0-2_years"] || 0 },
        { label: "3–5 yrs", color: "#0571ED", value: candidateSummary?.candidate_experience?.["3-5_years"] || 0 },
        { label: "6–10 yrs", color: "#0097A7", value: candidateSummary?.candidate_experience?.["6-10_years"] || 0 },
        { label: "10+ yrs", color: "#00BBD4", value: candidateSummary?.candidate_experience?.["10+_years"] || 0 },
      ],
    },
  ];
  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      await exportDashboardToPdf({
        scope: analyticsView,
        sectionSelectors: [
          "#dash-stat-cards",
          // "#dash-requisitions",
          "#dash-chart-interviews",
          "#dash-pipeline-trend",
          "#dash-experience-hired",
          "#dash-chart-offers",
          "#dash-pipeline-funnel",
        ],
      });
    } catch (err) {
      console.error("PDF export failed:", err);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setExportingPdf(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <DashboardContainer>
      <Dialog
        open={showWelcome}
        onClose={handleDismissWelcome}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "20px", overflow: "hidden", background: "transparent", boxShadow: "none" } }}
        BackdropProps={{ sx: { backdropFilter: "blur(3px)", bgcolor: "rgba(10,14,26,0.6)" } }}
      >
        {showWelcome && (
          <WelcomeToast
            // userName={userInfo?.first_name || userInfo?.name || "there"}
            userName={"User"}
            totalJobs={getSafeCount(candidateSummary, "job_overview.total_jobs")}
            totalCandidates={candidateSummary?.total_candidates || 0}
            onDismiss={handleDismissWelcome}
          />
        )}
      </Dialog>

      {/* ── Export button — floating icon, doesn't push layout down ── */}
      <MuiTooltip
        title={exportingPdf ? "Generating PDF…" : "Download Report"}
        placement="left"
        arrow
      >
        <span style={{ position: "absolute", top: 60, right: 40, zIndex: 20 }}>
          <IconButton
            onClick={handleExportPdf}
            disabled={exportingPdf}
            sx={{
              width: 38,
              height: 38,
              bgcolor: COLORS.royalBlue,
              color: "#fff",
              boxShadow: "0 2px 10px rgba(23,79,223,0.3)",
              transition: "background-color 0.2s, box-shadow 0.2s, transform 0.15s",
              "&:hover": {
                bgcolor: "#1240C0",
                boxShadow: "0 4px 14px rgba(23,79,223,0.4)",
                transform: "translateY(-1px)",
              },
              "&.Mui-disabled": { bgcolor: COLORS.royalBlue, color: "#fff", opacity: 0.6 },
            }}
          >
            {exportingPdf
              ? <CircularProgress size={16} sx={{ color: "#fff" }} />
              : <DownloadOutlinedIcon sx={{ fontSize: 19 }} />}
          </IconButton>
        </span>
      </MuiTooltip>

      {/* ── Dashboard body: top filter bar, then vertical KPI rail (left) + analytics (right) ── */}
      <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>

        {/* Top-level filter bar — All Users/Current User, Sub-function, Period, Cumulative/Current, all drive the one shared analytics query */}
        <Box sx={{
          bgcolor: "#fff", borderRadius: "12px", border: `1px solid ${COLORS.border}`,
          boxShadow: "0 2px 12px rgba(23,79,223,0.07)", p: 1.25,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.25, flexWrap: "wrap", flexShrink: 0,
        }}>
          <ViewToggle
            value={analyticsView}
            onChange={(view) => navigate(view === "organisation" ? "/recruit/dashboard/organization" : "/recruit/dashboard")}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
            <CountrySelect value={analyticsCountry} onChange={setAnalyticsCountry} disabled={isLoading} />
            <SubFunctionSelect value={subFunction} onChange={setSubFunction} disabled={isLoading} />
            <PeriodSelect value={periodCount} onChange={setPeriodCount} disabled={isLoading} />
            <CountsToggle value={countsType} onChange={setCountsType} />
            {/* <ViewModeToggle value={dashboardView} onChange={setDashboardView} /> */}
          </Box>
        </Box>

        {/* Left: Total/Open/Closed/Onboarded — stretches to match the right column's full height */}
        <Grid id="dash-stat-cards" container spacing={1.5} sx={{ flexShrink: 0 }}>
          {STATS_CONFIG.map((config) => (
            <Grid key={config.title} item size={{ xs: 12, sm: 6, md: 3 }}>
              <PrimaryStatCard
                config={config}
                count={getSafeCount(candidateSummary, config.key)}
                loading={isLoading}
                sparkValues={getSparkValues(config, candidateSummary)}
                onClick={() => handleStatClick(config)}
              />
            </Grid>
          ))}
        </Grid>

        {/* Analytics charts on the left, detailed pipeline on the right. */}
        <Box sx={{
          position: "relative",
          flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 1.5,
        }}>
          {dashboardView === "table" ? (
            <DashboardTableView
              monthlyColumns={monthlyColumns}
              monthlySections={monthlySections}
              snapshotSections={snapshotSections}
            />
          ) : (
            <>
              <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gridTemplateRows: { lg: "repeat(2, minmax(0, 1fr))" } }}>
                <Box id="dash-chart-interviews" sx={{ minWidth: 0, minHeight: 0 }}>
                  {isAllTime ? (
                    <HorizontalBarChart
                      title="Interviews by Status"
                      data={buildBarSeriesData(candidateSummary?.interview_analysis_trend, INTERVIEW_BAR_FIELDS)}
                    />
                  ) : (
                    <TrendLineChart
                      title="Interviews by Status"
                      data={interviewChartData}
                      series={[
                        { key: "scheduled", label: "Scheduled", color: "#FFC107" },
                        { key: "rescheduled", label: "Rescheduled", color: COLORS.skyBlue },
                        { key: "completed", label: "Completed", color: CHART_COLORS.interviewPassed },
                        { key: "cancelled", label: "Cancelled", color: CHART_COLORS.interviewCancelled },
                      ]}
                    />
                  )}
                </Box>
                <Box id="dash-pipeline-trend" sx={{ minWidth: 0, minHeight: 0 }}>
                  {isAllTime ? (
                    <HorizontalBarChart
                      title="Candidates by Status"
                      data={buildBarSeriesData(candidateSummary?.candidate_funnel_trend, FUNNEL_BAR_FIELDS)}
                    />
                  ) : (
                    <TrendLineChart
                      title="Candidates by Status"
                      data={createPipelineTrendData(candidateSummary?.candidate_funnel_trend)}
                      series={[
                        { key: "matched", label: "Matched", color: CHART_COLORS.matched },
                        { key: "shortlisted", label: "Shortlisted", color: CHART_COLORS.shortlisted },
                        { key: "interviewing", label: "Interview", color: CHART_COLORS.interviewing },
                        { key: "onboarded", label: "Onboarded", color: CHART_COLORS.onboarded },
                      ]}
                    />
                  )}
                </Box>
                <Box id="dash-experience-hired" sx={{ minWidth: 0, minHeight: 0 }}>
                  <DonutChart title="Candidate by Experience" data={buildExperienceDonutData(candidateSummary?.candidate_experience)} chartTypes={["donut", "bar"]} />
                </Box>
                <Box id="dash-chart-offers" sx={{ minWidth: 0, minHeight: 0 }}>
                  {isAllTime ? (
                    <HorizontalBarChart
                      title="Offer Status"
                      data={buildBarSeriesData(candidateSummary?.offer_analysis_trend, OFFER_BAR_FIELDS)}
                    />
                  ) : (
                    <DonutChart title="Offer Status" data={buildOfferBreakdownData(candidateSummary)} />
                  )}
                </Box>
              </Box>

              <Box id="dash-pipeline-funnel" sx={{ flex: 1, minWidth: 0, minHeight: { xs: 360, lg: 0 } }}>
                <CandidatePipelineFunnel
                  data={candidateSummary?.candidate_stage_breakdown}
                  totalCount={candidateSummary?.total_candidates || 0}
                  loading={isLoading || isFetching}
                  onStageClick={(stageKey) => handleStageClick(`candidate_stage_breakdown.${stageKey}`)}
                  countsType={countsType}
                />
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* ── No data overlay ── */}
      {/* {isNoData && (
          <Box sx={{ position: "absolute", top: "35%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", zIndex: 10 }}>
            <Box sx={{ bgcolor: "#fff", borderRadius: "16px", p: 4, boxShadow: "0 8px 32px rgba(23,79,223,0.15)", border: `1px solid ${COLORS.border}` }}>
              <Typography sx={{ fontSize: 15, color: COLORS.textSecondary, mb: 1 }}>
                No data yet —{" "}
                <span
                  onClick={() => navigate("/recruit/create-job/job-requirements")}
                  style={{ color: COLORS.royalBlue, cursor: "pointer", textDecoration: "underline", fontWeight: 600 }}
                >
                  create a job
                </span>{" "}
                to unlock analytics 🚀
              </Typography>
            </Box>
          </Box>
        )} */}

      {/* ============================ Stage Details Dialog ============================== */}
      <Dialog
        open={stageDialog.open}
        onClose={closeStageDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: "14px", overflow: "hidden" } }}
      >
        {/* Header */}
        <Box sx={{
          px: 3, py: 2,
          borderBottom: `1px solid ${COLORS.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Box>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: COLORS.royalBlue, textTransform: "capitalize" }}>
              {stageDialog.stage} Candidates
            </Typography>
            {/* <Typography sx={{ fontSize: 12, color: COLORS.textSecondary, mt: 0.3 }}>
              {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
              {stageDialog.count > 0 && ` · ${stageDialog.count} total`}
            </Typography> */}
            <Typography sx={{ fontSize: 12, color: COLORS.textSecondary, mt: 0.3 }}>
              All time
              {stageDialog.count > 0 && ` · ${stageDialog.count} total`}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={closeStageDialog}
            sx={{
              border: `1px solid ${COLORS.border}`, borderRadius: "8px",
              width: 30, height: 30,
              "&:hover": { bgcolor: "#FEECEC", borderColor: "#FCC", color: "#D93026" },
            }}
          >
            <CloseIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Box>


        {/*====================== Search Bar ================================ */}
        {!stageDialog.loading && stageDialog.data.length > 0 && (
          <>
            {/* Search + sort row (existing) */}
            <Box sx={{ px: 3, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by CLIN ID or name..."
                value={stageSearchInput}
                onChange={(e) => setStageSearchInput(e.target.value)}
                size="small"
                InputProps={{
                  endAdornment: (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <SearchIcon sx={{ fontSize: "16px", color: COLORS.textMuted, mr: stageSearchInput ? 0.5 : 0 }} />
                      {stageSearchInput && (
                        <IconButton size="small" onClick={() => { setStageSearchInput(""); setStageSearchTerm(""); }}>
                          <CloseIcon sx={{ fontSize: "14px" }} />
                        </IconButton>
                      )}
                    </Box>
                  ),
                  sx: {
                    borderRadius: "8px", fontSize: "13px",
                    backgroundColor: COLORS.bgPage,
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: COLORS.border },
                  },
                }}
              />
              <FormControl size="small" sx={{ minWidth: 130, flexShrink: 0 }}>
                <Select value={stageSortOrder} onChange={(e) => setStageSortOrder(e.target.value)}
                  sx={{ height: 40, fontSize: 12, borderRadius: "8px", bgcolor: COLORS.bgPage }}>
                  <MenuItem value="latest" sx={{ fontSize: 12 }}>Latest first</MenuItem>
                  <MenuItem value="oldest" sx={{ fontSize: 12 }}>Oldest first</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* NEW: filter chips row */}
            <Box sx={{ px: 3, py: 1.2, borderBottom: `1px solid ${COLORS.border}`, display: "flex", gap: 1, flexWrap: "wrap" }}>
            </Box>
          </>
        )}

        {/* Body */}
        <DialogContent sx={{ p: 0 }}>
          {stageDialog.loading ? (
            <Box sx={{ p: 3 }}>
              {[1, 2, 3, 4].map((i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1.5, borderBottom: `0.5px solid ${COLORS.border}` }}>
                  <Skeleton variant="circular" width={36} height={36} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="60%" height={16} />
                    <Skeleton width="40%" height={12} sx={{ mt: 0.5 }} />
                  </Box>
                  <Skeleton width={70} height={12} />
                </Box>
              ))}
            </Box>
          ) : stageDialog.data.length === 0 ? (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Typography sx={{ fontSize: 13, color: COLORS.textMuted }}>
                No candidates found for this stage.
              </Typography>
            </Box>
          ) : filteredStageData.length === 0 ? (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Typography sx={{ fontSize: 13, color: COLORS.textMuted }}>
                No candidates match "<strong>{stageSearchInput}</strong>".
              </Typography>
            </Box>
          ) : (
            <Box sx={{ px: 3 }}>
              {filteredStageData.map((c, i) => (
                <StageCandidateRow
                  key={c.candidate_id || c.clin_id || i}
                  candidate={c}
                  index={i}
                  navigate={navigate}
                />
              ))}
              {!stageDialog.loading && filteredStageData.length > 0 && stageDialog.count > stageDialog.pageSize && !stageSearchTerm.trim() && (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1, px: 3, py: 2, borderTop: `1px solid ${COLORS.border}` }}>
                  <IconButton
                    size="small"
                    disabled={stageDialog.page <= 1}
                    onClick={() => handleStagePageChange(stageDialog.page - 1)}
                    sx={{ border: `1px solid ${COLORS.border}`, borderRadius: "8px" }}
                  >
                    <ChevronLeftIcon sx={{ fontSize: 18 }} />
                  </IconButton>

                  <Typography sx={{ fontSize: 12, color: COLORS.textSecondary, minWidth: 80, textAlign: "center" }}>
                    Page {stageDialog.page} of {Math.ceil(stageDialog.count / stageDialog.pageSize)}
                  </Typography>

                  <IconButton
                    size="small"
                    disabled={stageDialog.page >= Math.ceil(stageDialog.count / stageDialog.pageSize)}
                    onClick={() => handleStagePageChange(stageDialog.page + 1)}
                    sx={{ border: `1px solid ${COLORS.border}`, borderRadius: "8px" }}
                  >
                    <ChevronRightIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              )}
            </Box>

          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 1.5, borderTop: `1px solid ${COLORS.border}` }}>
          <Button onClick={closeStageDialog} sx={{ color: COLORS.royalBlue, fontSize: 13, textTransform: "none" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================ Jobs Dialog (Total/Open/Closed) ============================== */}
      <Dialog
        open={jobsDialog.open}
        onClose={closeJobsDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "14px", overflow: "hidden" } }}
      >
        {/* Header */}
        <Box sx={{
          px: 3, py: 2,
          borderBottom: `1px solid ${COLORS.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Box>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: COLORS.royalBlue }}>
              {jobsDialogTitle}
            </Typography>
            <Typography sx={{ fontSize: 12, color: COLORS.textSecondary, mt: 0.3 }}>
              {jobsDialogData.length} total
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={closeJobsDialog}
            sx={{
              border: `1px solid ${COLORS.border}`, borderRadius: "8px",
              width: 30, height: 30,
              "&:hover": { bgcolor: "#FEECEC", borderColor: "#FCC", color: "#D93026" },
            }}
          >
            <CloseIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Box>

        {/* Filter chips + search */}
        <Box sx={{ px: 3, py: 1.5, borderBottom: `1px solid ${COLORS.border}`, display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", bgcolor: COLORS.bgPage, borderRadius: "20px", p: "2px", border: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
            {[
              { value: "all", label: "All" },
              { value: "active", label: "Open" },
              { value: "closed", label: "Closed" },
            ].map((opt) => (
              <Box
                key={opt.value}
                onClick={() => setJobsDialog((p) => ({ ...p, filter: opt.value }))}
                sx={{
                  px: 1.5, py: 0.5, borderRadius: "18px", cursor: "pointer",
                  fontSize: 11.5, fontWeight: 600,
                  color: jobsDialog.filter === opt.value ? "#fff" : COLORS.textSecondary,
                  bgcolor: jobsDialog.filter === opt.value ? COLORS.royalBlue : "transparent",
                  transition: "background-color 0.15s, color 0.15s",
                }}
              >
                {opt.label}
              </Box>
            ))}
          </Box>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by job title or ID..."
            value={jobsDialogSearch}
            onChange={(e) => setJobsDialogSearch(e.target.value)}
            size="small"
            InputProps={{
              endAdornment: (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <SearchIcon sx={{ fontSize: "16px", color: COLORS.textMuted, mr: jobsDialogSearch ? 0.5 : 0 }} />
                  {jobsDialogSearch && (
                    <IconButton size="small" onClick={() => setJobsDialogSearch("")}>
                      <CloseIcon sx={{ fontSize: "14px" }} />
                    </IconButton>
                  )}
                </Box>
              ),
              sx: {
                borderRadius: "8px", fontSize: "13px",
                backgroundColor: COLORS.bgPage,
                "& .MuiOutlinedInput-notchedOutline": { borderColor: COLORS.border },
              },
            }}
            sx={{ minWidth: 200, flex: 1 }}
          />
        </Box>

        <DialogContent sx={{ p: 0, maxHeight: 420 }}>
          {jobsDialogData.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <Typography sx={{ fontSize: 13, color: COLORS.textMuted }}>No jobs found.</Typography>
            </Box>
          ) : (
            <Box sx={{ px: 1, py: 1 }}>
              <JobList jobs={jobsDialogData} onViewJob={(job) => { closeJobsDialog(); handleViewJob(job); }} />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 1.5, borderTop: `1px solid ${COLORS.border}` }}>
          <Button onClick={closeJobsDialog} sx={{ color: COLORS.royalBlue, fontSize: 13, textTransform: "none" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContainer>
  );
};

export default OrganizationOverview;
