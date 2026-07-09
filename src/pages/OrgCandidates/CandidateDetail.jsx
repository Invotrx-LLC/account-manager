// src/pages/OrgCandidates/CandidateDetail.jsx

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Grid,
  Chip,
  Button,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Stack,
  Divider,
  Link,
  DialogActions,
  Tooltip,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Autocomplete,
  Checkbox,
  Menu,
  ListItemIcon,
  ListItemText,
  Rating,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import { useDispatch } from "react-redux";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Person2OutlinedIcon from '@mui/icons-material/Person2Outlined';
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
// import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import EventRepeatOutlinedIcon from "@mui/icons-material/EventRepeatOutlined";
import NotInterestedOutlinedIcon from "@mui/icons-material/NotInterestedOutlined";
import RemoveCircleOutlinedIcon from "@mui/icons-material/RemoveCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

import {
  setDynamicLabels,
  clearDynamicLabels,
} from "../../redux/slices/breadcrumbSlice";
import {
  useGetCandidateDetailQuery,
  useGetCandidateStageTimelineQuery,
  useLazyGetResumeViewQuery,
  useGetInterviewDetailsQuery,
  useLazyGetInterviewDetailsQuery,
  useScheduleInterviewInCandidatesMutation,
  useUpdateCandidateStatusMutation,
  useLazyGetEmployeesByRoleQuery,
  useRescheduleInterviewMutation,
  useUpdateInterviewRoundStatusMutation,
  useUpdateInterviewResultMutation,
  useLazyGetInterviewFullDetailsQuery,
  useLazyGetInterviewFeedbackQuery,
} from "../../redux/services/requisition/requisition";
import {
  PersonOutlineOutlined,
  WorkOutlineOutlined,
  EmailOutlined,
  PhoneOutlined,
  AccessTimeOutlined,
  CheckCircleOutlineOutlined,
} from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { toast } from "react-toastify";

/* ═══════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════ */
const STAGE_CONFIG = [
  { key: "matched", label: "Matched" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "interviewing", label: "Interviewing" },
  { key: "selected", label: "Selected" },
  { key: "offer", label: "Offer" },
  { key: "hired", label: "Hired" },
];

// Maps a granular lifecycle value (the `type` on a simple timeline entry,
// or `candidate.current_stage`) to one of the STAGE_CONFIG group keys.
const STAGE_GROUP = {
  matched: "matched",
  shortlisted: "shortlisted",
  interview_scheduled: "interviewing",
  interview_completed: "interviewing",
  interview_cancelled: "interviewing",
  interview_passed: "interviewing",
  interview_failed: "interviewing",
  selected: "selected",
  offer_released: "offer",
  offer_revoked: "offer",
  offer_accepted: "offer",
  offer_declined: "offer",
  hired: "hired",
  // rejected: "Rejected",
};

const SUB_LABEL = {
  interview_scheduled: "scheduled",
  interview_completed: "completed",
  interview_cancelled: "Cancelled",
  interview_passed: "passed",
  interview_failed: "failed",
  offer_released: "released",
  offer_revoked: "revoked",
  offer_accepted: "accepted",
  offer_declined: "declined",
  rejected: "Rejected",
};
const BADGE_COLOR = {
  interview_scheduled: "scheduled",
  interview_completed: "completed",
  interview_passed: "completed",
  interview_failed: "failed",
  interview_cancelled: "failed",
};
const STATE_COLORS = {
  completed: { bg: "#22C55E", border: "#22C55E", icon: "#fff" },
  current: { bg: "#FF5F1F", border: "#FF5F1F", icon: "#fff" },
  failed: { bg: "#EF4444", border: "#EF4444", icon: "#fff" },
  pending: { bg: "#F9FAFB", border: "#D1D5DB", icon: "#D1D5DB" },
};

const C = {
  accent: "#FF5F1F",
  accentSoft: "#FFF0E8",
  teal: "#00B4D8",
  tealSoft: "#E0F7FA",
  border: "#E8E8EC",
  textPrimary: "#111118",
  textSecondary: "#5C5C70",
};

const T = {
  stageTitle: 15,
  metaLabel: 11,
  metaValue: 12,
  subTitle: 12,
  subDate: 11,
};

const TAB_SX = {
  // borderBottom: "1px solid #E5E7EB",
  mb: "0px",
  minHeight: 38,
  "& .MuiTabs-flexContainer": { gap: "4px" },
  "& .MuiTab-root": {
    textTransform: "none",
    fontSize: 13,
    fontWeight: 500,
    color: "#6B7280",
    minWidth: "auto",
    minHeight: 28,
    px: "6px",
    py: "0px",
    mr: "14px",
  },
  "& .MuiTab-iconWrapper": { marginRight: "6px" },
  "& .Mui-selected": { color: `${C.accent} !important`, fontWeight: 600 },
  "& .MuiTabs-indicator": { backgroundColor: C.accent, height: 2, bottom: 0 },
};

const INTERVIEW_STATUS_OPTIONS = [
  {
    value: "completed",
    label: "Completed",
    icon: CheckCircleOutlineOutlined,
    color: "#16A34A",
    requiresPast: true,
  },
  {
    value: "no_show",
    label: "No Show",
    icon: NotInterestedOutlinedIcon,
    color: "#F59E0B",
    requiresPast: true,
  },
  {
    value: "not_conducted",
    label: "Not Conducted",
    icon: RemoveCircleOutlinedIcon,
    color: "#6B7280",
    requiresPast: true,
  },
  {
    value: "cancelled",
    label: "Cancelled",
    icon: CancelOutlinedIcon,
    color: "#DC2626",
    requiresPast: false,
  },
];
const OPEN_INTERVIEW_STAGES = ["interview_scheduled", "scheduled"];

// ── Pass / Fail options for a round that has already been marked "completed" ──
const INTERVIEW_RESULT_OPTIONS = [
  {
    value: "pass",
    label: "Pass",
    icon: CheckCircleOutlineOutlined,
    color: "#16A34A",
  },
  {
    value: "fail",
    label: "Fail",
    icon: CancelOutlinedIcon,
    color: "#DC2626",
  },
];

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
function fmtDateIST(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
function getEntryGroup(entry) {
  const lookupKey = entry.stage?.toLowerCase().startsWith("interview_")
    ? "interview_scheduled"
    : entry.type?.toLowerCase();
  return STAGE_GROUP[lookupKey] ?? null;
}
function groupState(groupKey, grouped, currentStage, hasRejected) {
  const groupEntries = grouped[groupKey] ?? [];
  if (!groupEntries.length) return "pending";

  const hasFailed = groupEntries.some((e) => e.type === "offer_revoked");
  if (hasFailed) return "failed";

  const groupKeys = STAGE_CONFIG.map((s) => s.key);
  const curGroup = STAGE_GROUP[currentStage?.toLowerCase()] ?? "";
  const curIdx = groupKeys.indexOf(curGroup);
  const thisIdx = groupKeys.indexOf(groupKey);

  const groupsWithEntries = groupKeys.filter((gk) => grouped[gk]?.length);
  const lastGroupWithEntries = groupsWithEntries[groupsWithEntries.length - 1];
  const lastIdx = groupKeys.indexOf(lastGroupWithEntries);

  if (hasRejected && thisIdx === lastIdx) return "failed";

  if (curIdx !== -1) {
    if (thisIdx < curIdx) return "completed";
    if (thisIdx === curIdx) return "current";
    return "pending";
  }

  if (thisIdx < lastIdx) return "completed";
  if (thisIdx === lastIdx) return "current";
  return "pending";
}

function normalizeInterviewStatus(rawStatus) {
  if (!rawStatus) return "scheduled";
  const key = rawStatus.trim().toLowerCase().replace(/\s+/g, "_");
  return key === "rescheduled" ? "scheduled" : key;
}

// Normalizes whatever the backend sends for a round's outcome ("pass",
// "Pass", "PASSED", etc.) down to "pass" | "fail" | null.
function normalizeInterviewResult(rawResult) {
  if (!rawResult) return null;
  const key = rawResult.trim().toLowerCase();
  if (key.startsWith("pass")) return "pass";
  if (key.startsWith("fail")) return "fail";
  return null;
}

/* ═══════════════════════════════════════════════
   SECTION HEADER — reusable divider with label
═══════════════════════════════════════════════ */
function SectionHeader({ icon, label }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        mb: "16px",
        pb: "10px",
        borderBottom: `1.5px solid ${C.border}`,
      }}
    >
      {icon}
      <Typography sx={{ fontSize: 15, fontWeight: 700, color: C.textPrimary }}>
        {label}
      </Typography>
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   PLATFORM ICON — real brand logos for interview modal
═══════════════════════════════════════════════ */
function PlatformIcon({ platform, size = 20 }) {
  const p = (platform || "").toLowerCase();

  if (p.includes("zoom")) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="7" fill="#2D8CFF" />
        <path
          d="M8 12.5C8 11.67 8.67 11 9.5 11H17.5C18.33 11 19 11.67 19 12.5V19.5C19 20.33 18.33 21 17.5 21H9.5C8.67 21 8 20.33 8 19.5V12.5Z"
          fill="white"
        />
        <path d="M20 14.2L24 11.8V20.2L20 17.8V14.2Z" fill="white" />
      </svg>
    );
  }

  if (p.includes("meet") || p.includes("google")) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="7" fill="white" />
        <path d="M8 11h5.5L17 15.5V11H8z" fill="#2684FC" />
        <path d="M8 21h5.5L17 16.5V21H8z" fill="#00AC47" />
        <path d="M17 15.5L13.5 11H17v4.5z" fill="#FFBA00" />
        <path d="M17 16.5L13.5 21H17v-4.5z" fill="#00832D" />
        <path d="M17 14.5l6-4v11l-6-4v-3z" fill="#00AC47" />
      </svg>
    );
  }

  if (p.includes("teams") || p.includes("microsoft")) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="7" fill="#5059C9" />
        <circle cx="21.5" cy="10.5" r="2.5" fill="#7B83EB" />
        <rect x="17" y="13" width="8" height="8.5" rx="2" fill="#7B83EB" />
        <circle cx="12.5" cy="10" r="3.2" fill="#5059C9" />
        <rect x="8" y="13.2" width="9" height="9.3" rx="2.2" fill="white" />
        <path
          d="M10.2 15.8h4.6M12.5 15.8v5.2"
          stroke="#5059C9"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // Generic fallback (in-person / phone / other)
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "6px",
        bgcolor: "#E6F1FB",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <VideocamOutlinedIcon sx={{ fontSize: size * 0.62, color: "#185FA5" }} />
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   INTERVIEW DETAILS MODAL — redesigned
═══════════════════════════════════════════════ */
function formatInterviewDateTime(date, startTime, endTime, duration) {
  if (!date) return { dateLabel: "—", timeLabel: "—" };
  const d = dayjs(date);
  const dateLabel = d.isValid() ? d.format("dddd, MMMM D, YYYY") : "—";
  const start = startTime ? startTime.slice(0, 5) : "—";
  const end = endTime ? endTime.slice(0, 5) : "—";
  const timeLabel = `${start} → ${end}${duration ? ` (${duration} mins)` : ""}`;
  return { dateLabel, timeLabel };
}

const SKILL_GROUP_STYLE = {
  mandatory: { label: "MANDATORY SKILLS", color: "#E53935", bg: "#FEECEC" },
  primary: { label: "PRIMARY SKILLS", color: "#1976D2", bg: "#E8F1FD" },
  secondary: { label: "SECONDARY SKILLS", color: "#00A76F", bg: "#E6F7F1" },
  edc_tools: { label: "EDC TOOLS", color: "#7C3AED", bg: "#F1EBFE" },
  custom: { label: "CUSTOM SKILLS", color: "#7C3AED", bg: "#F1EBFE" },
};

function DetailRow({ icon, iconBg, title, children }) {
  return (
    <Box sx={{ display: "flex", gap: 1.5, px: 2.5, py: 2, borderBottom: `1px solid ${C.border}` }}>
      <Box
        sx={{
          width: 32, height: 32, borderRadius: "8px", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          bgcolor: iconBg,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#111827", mb: 0.3 }}>
          {title}
        </Typography>
        {children}
      </Box>
    </Box>
  );
}

function InterviewDetailsModal({ open, onClose, selectedInterview, isFetching, onEdit }) {
  const d = selectedInterview;
  const isCompleted = (d?.status ?? "").toLowerCase() === "completed";

  const { dateLabel, timeLabel } = d
    ? formatInterviewDateTime(d.date, d.start_time, d.end_time, d.duration)
    : { dateLabel: "—", timeLabel: "—" };

  const skillGroups = Object.entries(d?.template?.skills ?? {}).filter(
    ([, labels]) => Array.isArray(labels) && labels.length > 0,
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: { width: 480, maxWidth: "95vw", borderRadius: "16px", overflow: "hidden" },
      }}
    >
      {/* HEADER */}
      <Box sx={{ bgcolor: "#FF5722", px: 3, py: 2.5, textAlign: "center" }}>
        <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>
          Interview Details
        </Typography>
      </Box>

      <DialogContent sx={{ p: 0, maxHeight: "65vh", overflowY: "auto" }}>
        {isFetching || !d ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <DetailRow
              icon={<CalendarMonthOutlinedIcon sx={{ fontSize: 18, color: "#00B4D8" }} />}
              iconBg="#E0F7FA"
              title="Interview Name"
            >
              <Typography sx={{ fontSize: 14, color: "#4B5563" }}>
                {d.interview_step_name}
                {d.interview_step_type ? ` — ${d.interview_step_type.toLowerCase()}` : ""}
              </Typography>
            </DetailRow>

            <DetailRow
              icon={<PersonOutlineOutlined sx={{ fontSize: 18, color: "#2563EB" }} />}
              iconBg="#E8F1FD"
              title="Candidate"
            >
              <Typography sx={{ fontSize: 14, color: "#111827" }}>
                {d.matched_candidate?.fullname}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#9CA3AF" }}>
                {d.matched_candidate?.email}
              </Typography>
            </DetailRow>

            {d.primary_interviewer_org_emp?.interviewer_full_name && (
              <DetailRow
                icon={<PersonOutlineOutlined sx={{ fontSize: 18, color: "#16A34A" }} />}
                iconBg="#EAF8EE"
                title="Primary Interviewer"
              >
                <Typography sx={{ fontSize: 14, color: "#111827" }}>
                  {d.primary_interviewer_org_emp.interviewer_full_name}
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#9CA3AF" }}>
                  {d.primary_interviewer_org_emp.email}
                </Typography>
              </DetailRow>
            )}

            {(d.panel_members_org_emp_ids ?? []).length > 0 && (
              <DetailRow
                icon={<PersonOutlineOutlined sx={{ fontSize: 18, color: "#6B7280" }} />}
                iconBg="#F3F4F6"
                title="Panel Members"
              >
                {d.panel_members_org_emp_ids.map((p) => (
                  <Typography key={p.primary_interviewer_org_emp} sx={{ fontSize: 14, color: "#111827" }}>
                    {p.interviewer_full_name}{" "}
                    <Box component="span" sx={{ fontSize: 13, color: "#9CA3AF" }}>
                      ({p.email})
                    </Box>
                  </Typography>
                ))}
              </DetailRow>
            )}

            <DetailRow
              icon={<AccessTimeOutlined sx={{ fontSize: 18, color: "#2563EB" }} />}
              iconBg="#E8F1FD"
              title="Date & Time"
            >
              <Typography sx={{ fontSize: 14, color: "#4B5563" }}>{dateLabel}</Typography>
              <Typography sx={{ fontSize: 14, color: "#4B5563" }}>{timeLabel}</Typography>
            </DetailRow>

            <DetailRow
              icon={<VideocamOutlinedIcon sx={{ fontSize: 18, color: "#DC2626" }} />}
              iconBg="#FEECEC"
              title="Meeting Link"
            >
              {d.meeting_url ? (
                <Button
                  component="a"
                  // href={d.meeting_url}
                  target="_blank"
                  size="small"
                  variant="outlined"
                  startIcon={<VideocamOutlinedIcon sx={{ fontSize: 15 }} />}
                  sx={{
                    mt: 0.5, textTransform: "none", borderRadius: "8px",
                    fontSize: 13, fontWeight: 600,
                  }}
                >
                  Join Meeting
                </Button>
              ) : (
                <Typography sx={{ fontSize: 13, color: "#9CA3AF" }}>No link provided</Typography>
              )}
            </DetailRow>

            {skillGroups.length > 0 && (
              <DetailRow
                icon={<CheckCircleOutlineOutlined sx={{ fontSize: 18, color: "#16A34A" }} />}
                iconBg="#EAF8EE"
                title="Skills to Evaluate"
              >
                {skillGroups.map(([bucket, labels]) => {
                  const style = SKILL_GROUP_STYLE[bucket] ?? SKILL_GROUP_STYLE.custom;
                  return (
                    <Box key={bucket} sx={{ mt: 1 }}>
                      <Typography
                        sx={{ fontSize: 11, fontWeight: 700, color: style.color, mb: 0.5 }}
                      >
                        • {style.label}
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                        {labels.map((label) => (
                          <Chip
                            key={label}
                            label={label}
                            size="small"
                            sx={{
                              height: 26, fontSize: 12, fontWeight: 500,
                              bgcolor: style.bg, color: style.color,
                              border: `1px solid ${style.color}33`,
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  );
                })}
              </DetailRow>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 2, borderTop: `1px solid ${C.border}`, gap: 1 }}>
        {!isCompleted && (
          <Button
            variant="contained"
            startIcon={<EditOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={() => onEdit?.(d.interview_id)}
            sx={{
              flex: 1, textTransform: "none", borderRadius: "10px",
              fontWeight: 600, bgcolor: "#FF5722", boxShadow: "none",
              "&:hover": { bgcolor: "#FF5722", boxShadow: "none" },
            }}
          >
            Edit Interview
          </Button>
        )}
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            flex: isCompleted ? 1 : "0 0 auto", textTransform: "none",
            borderRadius: "10px", fontWeight: 500, color: "#111827",
            borderColor: "#E5E7EB", px: 3,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
/* ═══════════════════════════════════════════════
   INTERVIEW FEEDBACK MODAL — view-only, per-interviewer
   Feedback API returns dynamically-keyed interviewer ids
   (e.g. "interviewer_id- 1") and nested feedback arrays.
   Interviewer names + skill buckets aren't in that payload,
   so we cross-reference them from the full interview details
   object (primary_interviewer_org_emp / panel_members_org_emp_ids
   / template.skills) that's fetched alongside it.
═══════════════════════════════════════════════ */

const AVATAR_COLORS = ["#2563EB", "#7C3AED", "#16A34A", "#F97316", "#DB2777", "#0891B2"];

function extractInterviewerId(item) {
  const key = Object.keys(item).find((k) => k.startsWith("interviewer_id"));
  return key ? item[key] : null;
}

// Tries every id field shape we've seen on interviewer/panel objects.
function matchesInterviewerId(candidate, id) {
  if (!candidate || !id) return false;
  return (
    candidate.id === id ||
    candidate.org_employee_id === id ||
    candidate.employee_id === id ||
    candidate.primary_interviewer_org_emp === id
  );
}

function resolveInterviewerName(id, interview, fallbackIndex) {
  if (!interview) return `Interviewer ${fallbackIndex + 1}`;

  if (
    matchesInterviewerId(interview.primary_interviewer_org_emp, id) ||
    interview.org_employee_id === id
  ) {
    return interview.primary_interviewer_org_emp?.interviewer_full_name
      ?? `Interviewer ${fallbackIndex + 1}`;
  }

  const panelMatch = (interview.panel_members_org_emp_ids ?? []).find((p) =>
    matchesInterviewerId(p, id),
  );
  if (panelMatch) return panelMatch.interviewer_full_name ?? `Interviewer ${fallbackIndex + 1}`;

  return `Interviewer ${fallbackIndex + 1}`;
}

// Builds { "technical specification documents": "mandatory", ... } from
// interview.template.skills so feedback rows can show the right badge.
function buildSkillBucketMap(templateSkills) {
  const map = {};
  Object.entries(templateSkills ?? {}).forEach(([bucket, labels]) => {
    (labels ?? []).forEach((label) => {
      map[label.trim().toLowerCase()] = bucket;
    });
  });
  return map;
}

function FeedbackRatingBadge({ rating }) {
  const color = rating >= 4 ? "#16A34A" : rating >= 3 ? "#F97316" : "#DC2626";
  const bg = rating >= 4 ? "#EAF8EE" : rating >= 3 ? "#FFF3E8" : "#FEECEC";
  return (
    <Box
      sx={{
        px: 1.25, py: "3px", borderRadius: "999px",
        bgcolor: bg, color, fontSize: 12, fontWeight: 700, flexShrink: 0,
      }}
    >
      {rating}/5
    </Box>
  );
}

function InterviewFeedbackModal({ open, onClose, interview, feedbackItems, isFetching }) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    if (open) setSelectedIdx(0);
  }, [open]);

  const skillBucketMap = useMemo(
    () => buildSkillBucketMap(interview?.template?.skills),
    [interview],
  );

  const panelists = useMemo(() => {
    return (feedbackItems ?? []).map((item, i) => {
      const interviewerId = extractInterviewerId(item);
      const name = resolveInterviewerName(interviewerId, interview, i);
      const ratings = (item.feedback ?? []).flat().filter(Boolean);
      return {
        interviewerId,
        name,
        ratings,
        comments: item.feedback_comments ?? "",
        done: ratings.length > 0,
      };
    });
  }, [feedbackItems, interview]);

  const current = panelists[selectedIdx];
  const loading = isFetching || !feedbackItems;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{ sx: { width: 560, maxWidth: "95vw", borderRadius: "16px", overflow: "hidden" } }}
    >
      {/* Header */}
      <Box sx={{ px: 3, pt: 2.5, pb: 2, position: "relative" }}>
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#6366F1", letterSpacing: "0.08em" }}>
          EVALUATION PANEL
        </Typography>
        <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#111827", mt: "2px" }}>
          Interview Feedback
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            position: "absolute", top: 18, right: 18,
            width: 34, height: 34, borderRadius: "50%", backgroundColor: "#EEF2FF",
          }}
        >
          <CloseIcon sx={{ fontSize: 16, color: "#4B5563" }} />
        </IconButton>
      </Box>

      {/* Interviewer tabs */}
      {!loading && panelists.length > 0 && (
        <Box sx={{ px: 3, display: "flex", gap: 3, borderBottom: `1px solid ${C.border}`, overflowX: "auto" }}>
          {panelists.map((p, i) => {
            const isSelected = i === selectedIdx;
            const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
            return (
              <Box
                key={p.interviewerId ?? i}
                onClick={() => setSelectedIdx(i)}
                sx={{
                  display: "flex", alignItems: "center", gap: 1, pb: 1.5,
                  cursor: "pointer", flexShrink: 0,
                  borderBottom: isSelected ? `2.5px solid #2563EB` : "2.5px solid transparent",
                }}
              >
                <Avatar sx={{ width: 26, height: 26, fontSize: 12, fontWeight: 700, bgcolor: isSelected ? color : "#E5E7EB", color: isSelected ? "#fff" : "#6B7280" }}>
                  {p.name?.[0]?.toUpperCase() ?? "?"}
                </Avatar>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: isSelected ? "#2563EB" : "#9CA3AF" }}>
                  {p.name}
                </Typography>
                {p.done && (
                  <Chip
                    label="✓ Done"
                    size="small"
                    sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: "#EAF8EE", color: "#16A34A" }}
                  />
                )}
              </Box>
            );
          })}
        </Box>
      )}

      <DialogContent sx={{ p: 0, maxHeight: "65vh", overflowY: "auto" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : panelists.length === 0 ? (
          <Typography sx={{ fontSize: 14, color: "#9CA3AF", textAlign: "center", py: 6 }}>
            No feedback submitted yet.
          </Typography>
        ) : (
          <Box sx={{ px: 3, py: 2.5 }}>
            {/* Selected interviewer row */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
              <Avatar sx={{ width: 44, height: 44, fontSize: 16, fontWeight: 700, bgcolor: AVATAR_COLORS[selectedIdx % AVATAR_COLORS.length] }}>
                {current?.name?.[0]?.toUpperCase() ?? "?"}
              </Avatar>
              <Typography sx={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>
                {current?.name}
              </Typography>
            </Box>

            {/* Skill ratings */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2.5 }}>
              {(current?.ratings ?? []).map((r, i) => {
                const bucket = skillBucketMap[r.skill?.trim().toLowerCase()];
                const bucketStyle = bucket ? SKILL_GROUP_STYLE[bucket] : null;
                return (
                  <Box
                    key={`${r.skill}-${i}`}
                    sx={{ border: `1px solid ${C.border}`, borderRadius: "12px", p: 1.75 }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 0.75 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                          {r.skill}
                        </Typography>
                        {bucketStyle && (
                          <Chip
                            label={bucketStyle.label}
                            size="small"
                            sx={{
                              height: 20, fontSize: 10, fontWeight: 700,
                              bgcolor: bucketStyle.bg, color: bucketStyle.color,
                            }}
                          />
                        )}
                      </Box>
                      <FeedbackRatingBadge rating={r.rating} />
                    </Box>
                    <Rating value={r.rating} precision={0.5} readOnly size="small" />
                    {r.feedback && (
                      <Typography sx={{ fontSize: 12.5, color: "#6B7280", mt: 0.75 }}>
                        {r.feedback}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>

            {/* Overall comment */}
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#2563EB", letterSpacing: "0.06em", mb: 1 }}>
                OVERALL COMMENT
              </Typography>
              <Box
                sx={{
                  border: `1px solid ${C.border}`, borderRadius: "12px",
                  borderLeft: "3px solid #2563EB", p: 1.75, backgroundColor: "#F8FAFF",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13.5,
                    color: current?.comments ? "#374151" : "#9CA3AF",
                    fontStyle: current?.comments ? "normal" : "italic",
                  }}
                >
                  {current?.comments || "No overall comment provided."}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${C.border}` }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ textTransform: "none", borderRadius: "10px", color: "#111827", borderColor: "#E5E7EB", px: 3 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const INTERVIEW_STAGE_STATUSES = [
  "shortlisted",
  "interview_scheduled",
  "interview_completed",
  "interviewing",
];

function CandidateActionButtons({
  status,
  onShortlist,
  onReject,
  onInterview,
  onSelect,
  onReleaseOffer,
  onRevokeOffer,
  onOfferAccepted,
  onOfferRejected,
}) {
  const normalized = (status ?? "").toLowerCase().trim();

  // ── Shortlisted / interviewing stage: Interview, Select (blue), Reject ──
  // Shortlisted -> only Interview + Reject
  if (normalized === "shortlisted") {
    return (
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          size="small"
          startIcon={<PersonAddAltOutlinedIcon />}
          onClick={onInterview}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            backgroundColor: "#16A34A",
          }}
        >
          Interview
        </Button>

        <Button
          variant="contained"
          size="small"
          startIcon={<BlockOutlinedIcon />}
          onClick={onReject}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            backgroundColor: "#EF4444",
          }}
        >
          Reject
        </Button>
      </Stack>
    );
  }

  // After interview is scheduled/completed -> Interview + Select + Reject
  if (
    [
      "interview_scheduled",
      "interview_completed",
      "interviewing",
    ].includes(normalized)
  ) {
    return (
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          size="small"
          startIcon={<PersonAddAltOutlinedIcon />}
          onClick={onInterview}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            backgroundColor: "#16A34A",
          }}
        >
          Interview
        </Button>

        <Button
          variant="contained"
          size="small"
          startIcon={<CheckCircleOutlineOutlined />}
          onClick={onSelect}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            backgroundColor: "#2563EB",
          }}
        >
          Select
        </Button>

        <Button
          variant="contained"
          size="small"
          startIcon={<BlockOutlinedIcon />}
          onClick={onReject}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            backgroundColor: "#EF4444",
          }}
        >
          Reject
        </Button>
      </Stack>
    );
  }

  // ── Matched: Shortlist / Reject ──
  if (normalized === "matched") {
    return (
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          size="small"
          startIcon={<CheckCircleOutlineOutlined sx={{ fontSize: 16 }} />}
          onClick={onShortlist}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: 13,
            borderRadius: "8px",
            backgroundColor: "#B8860B",
            boxShadow: "none",
            px: 2,
            "&:hover": { backgroundColor: "#9A6F09", boxShadow: "none" },
          }}
        >
          Shortlist
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={<BlockOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={onReject}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: 13,
            borderRadius: "8px",
            backgroundColor: "#EF4444",
            boxShadow: "none",
            px: 2,
            "&:hover": { backgroundColor: "#DC2626", boxShadow: "none" },
          }}
        >
          Reject
        </Button>
      </Stack>
    );
  }

  // ── Selected: Release Offer ──
  if (normalized === "selected") {
    return (
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          size="small"
          startIcon={<LocalOfferOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={onReleaseOffer}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: 13,
            borderRadius: "8px",
            backgroundColor: "#2563EB",
            boxShadow: "none",
            px: 2,
            "&:hover": { backgroundColor: "#1D4ED8", boxShadow: "none" },
          }}
        >
          Release Offer
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={<BlockOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={onReject}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: 13,
            borderRadius: "8px",
            backgroundColor: "#EF4444",
            boxShadow: "none",
            px: 2,
            "&:hover": { backgroundColor: "#DC2626", boxShadow: "none" },
          }}
        >
          Reject
        </Button>
      </Stack>
    );
  }

  // ── Offer Released: Revoke Offer (orange) / Offer Accepted (green) / Offer Rejected (red) ──
  if (normalized === "offer_released") {
    return (
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          size="small"
          startIcon={<UndoOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={onRevokeOffer}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: 13,
            borderRadius: "8px",
            backgroundColor: "#F97316",
            boxShadow: "none",
            px: 2,
            "&:hover": { backgroundColor: "#EA580C", boxShadow: "none" },
          }}
        >
          Revoke Offer
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={<ThumbUpAltOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={onOfferAccepted}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: 13,
            borderRadius: "8px",
            backgroundColor: "#16A34A",
            boxShadow: "none",
            px: 2,
            "&:hover": { backgroundColor: "#15803D", boxShadow: "none" },
          }}
        >
          Offer Accepted
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={<ThumbDownAltOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={onOfferRejected}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: 13,
            borderRadius: "8px",
            backgroundColor: "#EF4444",
            boxShadow: "none",
            px: 2,
            "&:hover": { backgroundColor: "#DC2626", boxShadow: "none" },
          }}
        >
          Offer Rejected
        </Button>
      </Stack>
    );
  }

  return null;
}

const STATUS_DISPLAY = {
  shortlisted: { label: "Shortlisted", color: "#16A34A" },
  rejected: { label: "Rejected", color: "#DC2626" },
  selected: { label: "Selected", color: "#2563EB" },
  offer_released: { label: "Offer Released", color: "#2563EB" },
  offer_revoked: { label: "Offer Revoked", color: "#F97316" },
  offer_accepted: { label: "Offer Accepted", color: "#16A34A" },
  offer_rejected: { label: "Offer Rejected", color: "#DC2626" },
  // Interview round outcomes (Update Status dropdown on a scheduled round)
  completed: { label: "Completed", color: "#16A34A" },
  no_show: { label: "No Show", color: "#F59E0B" },
  not_conducted: { label: "Not Conducted", color: "#6B7280" },
  cancelled: { label: "Cancelled", color: "#DC2626" },
};

// Confirm-button colors, keyed by the same `action` value passed to
// StatusConfirmModal / updateCandidateStatus's `new_status`.
const CONFIRM_BTN_COLORS = {
  shortlisted: { bg: "#2563EB", hover: "#1D4ED8" },
  rejected: { bg: "#DC2626", hover: "#B91C1C" },
  selected: { bg: "#2563EB", hover: "#1D4ED8" },
  offer_released: { bg: "#2563EB", hover: "#1D4ED8" },
  offer_revoked: { bg: "#F97316", hover: "#EA580C" },
  offer_accepted: { bg: "#16A34A", hover: "#15803D" },
  offer_rejected: { bg: "#DC2626", hover: "#B91C1C" },
  completed: { bg: "#16A34A", hover: "#15803D" },
  no_show: { bg: "#F59E0B", hover: "#D97706" },
  not_conducted: { bg: "#6B7280", hover: "#4B5563" },
  cancelled: { bg: "#DC2626", hover: "#B91C1C" },
};

function StatusConfirmModal({ open, onClose, action, onConfirm, loading }) {
  const [comment, setComment] = useState("");
  const display = STATUS_DISPLAY[action] ?? { label: action, color: "#111827" };
  const isReject = action === "rejected";
  const btnColors =
    CONFIRM_BTN_COLORS[action] ?? { bg: "#2563EB", hover: "#1D4ED8" };

  useEffect(() => {
    if (open) setComment("");
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "14px", p: 0 } }}
    >
      <DialogContent sx={{ px: 3, py: 3 }}>
        <Typography sx={{ fontSize: 15, color: "#374151", mb: 2 }}>
          This action will update the candidate status to:{" "}
          <Box component="span" sx={{ fontWeight: 700, color: display.color }}>
            {display.label}
          </Box>
        </Typography>

        <TextField
          fullWidth
          multiline
          minRows={3}
          placeholder="Add a comment (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              fontSize: 14,
            },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 0, gap: 1.5 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: 14,
            color: "#111827",
            backgroundColor: "#F3F4F6",
            px: 3,
            "&:hover": { backgroundColor: "#E5E7EB" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => onConfirm(comment)}
          variant="contained"
          disabled={loading}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: 14,
            boxShadow: "none",
            px: 3,
            backgroundColor: btnColors.bg,
            "&:hover": {
              backgroundColor: btnColors.hover,
              boxShadow: "none",
            },
          }}
        >
          {loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Confirm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function getInterviewEndTime(interviewTimeISO, durationMinutes) {
  if (!interviewTimeISO) return null;

  const start = dayjs.utc(interviewTimeISO);

  if (!start.isValid()) return null;

  return start.add(Number(durationMinutes || 30), "minute");
}
function hasInterviewTimePassed(interviewEndTime) {
  if (!interviewEndTime) return false;

  return dayjs.utc().isAfter(interviewEndTime);
}
function InterviewStatusMenu({ interviewEndTime, currentStatus, onSelect, disabled }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const timePassed = hasInterviewTimePassed(interviewEndTime);
  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handlePick = (value) => {
    handleClose();
    onSelect(value);
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        disabled={disabled}
        variant="outlined"
        size="small"
        endIcon={<ArrowDropDownIcon />}
        sx={{
          textTransform: "none",
          fontSize: "12px",
          fontWeight: 500,
          borderRadius: "5px",
          borderColor: "#16A34A",
          color: "#16A34A",
          px: 2,
          py: 0,
          height: "30px",
          "&:hover": { borderColor: "#15803D", backgroundColor: "#F0FDF4" },
        }}
      >
        Update Status
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            mt: 0.5,
            borderRadius: "12px",
            minWidth: 200,
            boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
          },
        }}
      >
        {INTERVIEW_STATUS_OPTIONS.map((opt) => {
          const isDisabled =
            opt.value === currentStatus || (opt.requiresPast && !timePassed);
          const Icon = opt.icon;
          return (
            <MenuItem
              key={opt.value}
              disabled={isDisabled}
              onClick={() => handlePick(opt.value)}
              sx={{ py: 1, px: 1.8 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Icon sx={{ fontSize: 18, color: isDisabled ? "#D1D5DB" : opt.color }} />
              </ListItemIcon>
              <ListItemText
                primary={opt.label}
                primaryTypographyProps={{
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: isDisabled ? "#B0B0BC" : "#111827",
                }}
              />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}

/* ═══════════════════════════════════════════════
   INTERVIEW RESULT MENU — Pass / Fail dropdown
   Shown once a round's status has been set to "completed".
   Fires onSelect("pass" | "fail"), which the parent wires to
   useUpdateInterviewResultMutation (PUT /acc/interviews/{id}/status_v1).
═══════════════════════════════════════════════ */
function InterviewResultMenu({ currentResult, onSelect, disabled }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handlePick = (value) => {
    handleClose();
    onSelect(value);
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        disabled={disabled}
        variant="outlined"
        size="small"
        endIcon={<ArrowDropDownIcon />}
        sx={{
          textTransform: "none",
          fontSize: "12px",
          fontWeight: 500,
          borderRadius: "5px",
          borderColor: "#F97316",
          color: "#F97316",
          px: 2,
          py: 0,
          height: "30px",
          "&:hover": { borderColor: "#EA580C", backgroundColor: "#FFF7ED" },
        }}
      >
        Update Result
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            mt: 0.5,
            borderRadius: "12px",
            minWidth: 160,
            boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
          },
        }}
      >
        {INTERVIEW_RESULT_OPTIONS.map((opt) => {
          const isDisabled = opt.value === currentResult;
          const Icon = opt.icon;
          return (
            <MenuItem
              key={opt.value}
              disabled={isDisabled}
              onClick={() => handlePick(opt.value)}
              sx={{ py: 1, px: 1.8 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Icon sx={{ fontSize: 18, color: isDisabled ? "#D1D5DB" : opt.color }} />
              </ListItemIcon>
              <ListItemText
                primary={opt.label}
                primaryTypographyProps={{
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: isDisabled ? "#B0B0BC" : "#111827",
                }}
              />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}

const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const AVAILABILITY_BASE_URL =
  "https://dev-backend.invotrx.com/acc/employees/availability/slots/by-date";

function buildCalendarWeeks(monthStart) {
  // dayjs .day(): 0 = Sunday ... 6 = Saturday. Convert to Monday-first index.
  const firstWeekdayIdx = (monthStart.day() + 6) % 7;
  const daysInMonth = monthStart.daysInMonth();

  const cells = [];
  for (let i = 0; i < firstWeekdayIdx; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(monthStart.date(d));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function parseDurationMinutes(durationLabel) {
  const match = String(durationLabel ?? "").match(/\d+/);
  return match ? parseInt(match[0], 10) : 30;
}

// Extracts an "HH:mm" fragment from a variety of time-string shapes the
// backend might send back for a scheduled interview, e.g.
// "14:00:00.000Z", "14:00:00", "14:00". Returns null if nothing matches.
function extractHHmm(timeStr) {
  if (!timeStr) return null;
  const match = String(timeStr).match(/^(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : null;
}

// Rebuilds the flat `skills` array (used by the Skills-to-Evaluate
// Autocomplete) from the bucketed `template.skills` shape the API stores
// on an existing interview (used to prefill the Reschedule modal).
function skillsFromTemplate(templateSkills) {
  if (!templateSkills) return [];
  const out = [];
  Object.entries(templateSkills).forEach(([bucket, labels]) => {
    (labels || []).forEach((label) => {
      out.push({ label, type: bucket === "custom" ? "custom" : bucket });
    });
  });
  return out;
}

function SelectSlotModal({
  open,
  onClose,
  employeeIds = [],
  durationLabel,
  initialDateTime,
  onConfirm,
}) {
  const today = dayjs().startOf("day");
  const [viewMonth, setViewMonth] = useState(today.startOf("month"));
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const slotDurationMinutes = parseDurationMinutes(durationLabel);

  // Reset to a sensible starting point whenever the modal opens
  useEffect(() => {
    if (!open) return;
    const base =
      initialDateTime && dayjs(initialDateTime).isValid()
        ? dayjs(initialDateTime).startOf("day")
        : today;
    setSelectedDate(base);
    setViewMonth(base.startOf("month"));
    setSelectedSlot(null);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSlots = useCallback(
    async (dateObj) => {
      if (!employeeIds.length) {
        setSlots([]);
        setErrorMsg("Select an interviewer first to see availability.");
        return;
      }
      setLoading(true);
      setErrorMsg("");
      try {
        const params = new URLSearchParams({
          employee_ids: employeeIds.join(","),
          slot_duration_minutes: String(slotDurationMinutes),
          selected_date: dateObj.format("YYYY-MM-DD"),
        });
        const res = await fetch(`${AVAILABILITY_BASE_URL}?${params.toString()}`, {
          headers: { accept: "application/json" },
        });
        if (!res.ok) throw new Error(`Request failed with ${res.status}`);
        const data = await res.json();
        setSlots(data?.available_slots ?? []);
      } catch (err) {
        console.error("Failed to fetch availability slots:", err);
        setErrorMsg("Could not load available slots. Please try again.");
        setSlots([]);
      } finally {
        setLoading(false);
      }
    },
    [employeeIds, slotDurationMinutes],
  );

  useEffect(() => {
    if (open) fetchSlots(selectedDate);
  }, [open, selectedDate, fetchSlots]);

  const handlePickDate = (d) => {
    if (!d || d.isBefore(today, "day")) return;
    setSelectedDate(d);
    setSelectedSlot(null);
  };

  const handleConfirm = () => {
    if (!selectedDate || !selectedSlot) return;
    const startTime = selectedSlot.split("-")[0].trim();
    const combined = dayjs(
      `${selectedDate.format("YYYY-MM-DD")} ${startTime}`,
      "YYYY-MM-DD HH:mm",
    );
    if (!combined.isValid()) return;
    onConfirm(combined);
  };

  const weeks = buildCalendarWeeks(viewMonth);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: 760,
          maxWidth: "95vw",
          borderRadius: "18px",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          pt: 2.5,
          pb: 2,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 19, fontWeight: 700, color: "#111827" }}>
            Select Date & Time
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#9CA3AF", mt: 0.3 }}>
            Pick an available slot for the interview.
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ width: 30, height: 30, borderRadius: "8px", backgroundColor: "#F3F4F6" }}
        >
          <CloseIcon sx={{ fontSize: 15 }} />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, minHeight: 300, maxHeight: "70vh" }}>
        {/* LEFT: calendar */}
        <Box
          sx={{
            flex: "0 0 auto",
            width: { xs: "100%", sm: 340 },
            px: 3,
            py: 2.5,
            borderRight: { sm: `1px solid ${C.border}` },
            borderBottom: { xs: `1px solid ${C.border}`, sm: "none" },
          }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827", mb: 1.5 }}>
            Select Date
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <IconButton
              size="small"
              onClick={() => setViewMonth((m) => m.subtract(1, "month"))}
              sx={{ width: 30, height: 30, border: `1px solid ${C.border}`, borderRadius: "8px" }}
            >
              <ArrowBackIcon sx={{ fontSize: 14 }} />
            </IconButton>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
              {viewMonth.format("MMMM YYYY")}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setViewMonth((m) => m.add(1, "month"))}
              sx={{ width: 30, height: 30, border: `1px solid ${C.border}`, borderRadius: "8px" }}
            >
              <ArrowBackIcon sx={{ fontSize: 14, transform: "rotate(180deg)" }} />
            </IconButton>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px", mb: 1 }}>
            {WEEKDAY_LABELS.map((w) => (
              <Typography key={w} sx={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textAlign: "center" }}>
                {w}
              </Typography>
            ))}
          </Box>

          {weeks.map((week, wi) => (
            <Box key={wi} sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px", mb: "6px" }}>
              {week.map((d, di) => {
                if (!d) return <Box key={di} />;
                const isPast = d.isBefore(today, "day");
                const isSelected = selectedDate && d.isSame(selectedDate, "day");
                const isToday = d.isSame(today, "day");
                return (
                  <Box
                    key={di}
                    onClick={() => handlePickDate(d)}
                    sx={{
                      height: 34,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "8px",
                      fontSize: 13,
                      fontWeight: isSelected ? 700 : 500,
                      cursor: isPast ? "default" : "pointer",
                      color: isPast ? "#D1D5DB" : isSelected ? "#fff" : "#111827",
                      backgroundColor: isSelected ? "#1976D2" : "transparent",
                      border: isToday && !isSelected ? "1.5px solid #1976D2" : "1.5px solid transparent",
                      "&:hover": !isPast && !isSelected ? { backgroundColor: "#F3F4F6" } : {},
                      transition: "background-color 0.15s, color 0.15s",
                    }}
                  >
                    {d.date()}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>

        {/* RIGHT: available slots */}
        <Box sx={{ flex: 1, px: 3, py: 2.5, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111827", mb: 1 }}>
            Available Slots — {selectedDate ? selectedDate.format("DD MMM YYYY") : "—"}
          </Typography>

          <Chip
            label="Asia/Kolkata"
            size="small"
            sx={{
              alignSelf: "flex-start",
              mb: 1.5,
              bgcolor: "#E8F1FD",
              color: "#1976D2",
              fontSize: 12,
              fontWeight: 600,
              height: 24,
            }}
          />

          <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5, display: "flex", flexDirection: "column", gap: "10px" }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                <CircularProgress size={26} sx={{ color: "#1976D2" }} />
              </Box>
            ) : errorMsg ? (
              <Typography sx={{ fontSize: 13, color: "#DC2626", py: 2 }}>{errorMsg}</Typography>
            ) : slots.length === 0 ? (
              <Typography sx={{ fontSize: 13, color: "#9CA3AF", py: 2 }}>
                No slots available for this date.
              </Typography>
            ) : (
              slots.map((s) => {
                const isSelected = selectedSlot === s;
                return (
                  <Box
                    key={s}
                    onClick={() => setSelectedSlot(s)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "10px",
                      py: 1.3,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      userSelect: "none",
                      color: isSelected ? "#fff" : "#111827",
                      backgroundColor: isSelected ? "#1976D2" : "#fff",
                      border: `1.5px solid ${isSelected ? "#1976D2" : C.border}`,
                      "&:hover": !isSelected ? { borderColor: "#1976D2", backgroundColor: "#F5F9FF" } : {},
                      transition: "background-color 0.15s, border-color 0.15s",
                    }}
                  >
                    {s}
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${C.border}`,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "flex-end",
          gap: 1.5,
          bgcolor: "#FAFAFA",
        }}
      >
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ textTransform: "none", borderRadius: "8px", color: "#111827", borderColor: "#E5E7EB" }}
          >
            ← Back
          </Button>
          <Button
            variant="contained"
            disabled={!selectedSlot}
            onClick={handleConfirm}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              boxShadow: "none",
              backgroundColor: "#1976D2",
              "&:hover": { backgroundColor: "#1259A8", boxShadow: "none" },
            }}
          >
            Continue →
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════
   SCHEDULE / RESCHEDULE INTERVIEW MODAL
═══════════════════════════════════════════════ */
const INTERVIEW_TYPES = ["Technical", "HR", "Managerial", "Telephonic", "Final Round"];
const DURATIONS = ["10 mins", "15 mins", "30 mins", "45 mins", "60 mins", "90 mins"];
const PLATFORMS = [
  { key: "google_meet", label: "Google Meet", icon: "📅" },
  { key: "zoom", label: "Zoom", icon: "🎥" },
  { key: "teams", label: "Teams", icon: "🟣" },
  { key: "other", label: "Other", icon: "🔗" },
];

const EMPTY_SCHEDULE_FORM = {
  round: "",
  type: "",
  interviewer: null,
  panelMembers: [],
  duration: "10 mins",
  dateTime: "",
  platform: "google_meet",
  meetingUrl: "",
  skills: [],
};

function ScheduleInterviewModal({
  open,
  onClose,
  candidate,
  skillOptions = [],
  allSkillOptions = [],
  onSchedule,
  loading,
  orgId,
  matched_candidate_id,
  // ── Reschedule mode ──
  // When `isReschedule` is true this same modal is reused to move an
  // existing interview round to a new slot / interviewer / platform.
  // `initialData` seeds the form instead of starting blank, and
  // `interviewId` is threaded straight through to onSchedule's payload.
  //
  // `initialData` can arrive in two phases:
  //   1. { interviewId, loading: true }              — fetch in flight
  //   2. { interviewId, loading: false, ...fields }   — fully hydrated,
  //      using the SAME shape returned by GET /acc/interviews/{id}
  //      (the exact values that were saved when the interview was
  //      originally scheduled), so the form is faithfully pre-filled
  //      with what's currently on record for this round.
  isReschedule = false,
  interviewId = null,
  initialData = null,
}) {
  const [form, setForm] = useState(EMPTY_SCHEDULE_FORM);
  const [customSkills, setCustomSkills] = useState([]);
  const [interviewerOptions, setInterviewerOptions] = useState([]);
  const [panelOptions, setPanelOptions] = useState([]);
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(false);
  const [getEmployeesByRole, { data: interviewersData, isLoading }] =
    useLazyGetEmployeesByRoleQuery();

  // True while we're still waiting on the initial GET /acc/interviews/{id}
  // fetch that hydrates `initialData` for a reschedule. Distinct from
  // `prefillLoading` (which only covers the panel-options refresh) and
  // from `loading` (which covers the final submit).
  const isFetchingInitialData = isReschedule && !!initialData?.loading;

  useEffect(() => {
    if (!open || !orgId) return;

    getEmployeesByRole({
      organisationId: orgId,
    })
      .unwrap()
      .then((res) => {
        const users = res.data.map((u) => ({
          id: u.id,
          name: u.name,
          role: u.role,
          designation: u.designation,
        }));

        setInterviewerOptions(users);   // Keep interviewer list fixed
        setPanelOptions(users);         // Initial panel list
      });
  }, [open, orgId]);

  useEffect(() => {
    if (!open) return;

    if (isReschedule) {
      if (!initialData || initialData.loading) return; // wait for fetch to finish
      // Also wait for the employee list to load — we need it to resolve
      // names for interviewer/panel members when initialData only has IDs
      // (e.g. the local-schedule-payload fallback path).
      if (!interviewerOptions.length) return;

      const primaryInterviewerId =
        initialData.primary_interviewer?.id ?? initialData.org_employee_id ?? null;

      const primaryInterviewerName =
        initialData.primary_interviewer?.name ??
        interviewerOptions.find((u) => u.id === primaryInterviewerId)?.name ??
        "";

      // Normalize panel IDs across every shape we might receive:
      //  - GET /interviews/{id} response: panel_members: [{id, name}, ...]
      //  - local schedule-payload fallback: list_org_employee_id: ["id1", "id2"]
      const panelIds = initialData.panel_members
        ? initialData.panel_members.map((p) => p.id ?? p.org_employee_id)
        : initialData.list_org_employee
          ? initialData.list_org_employee.map((p) => p.id ?? p.org_employee_id)
          : initialData.list_org_employee_id ?? [];

      const panelMembers = panelIds
        .filter((id) => id && id !== primaryInterviewerId)
        .map((id) => ({
          id,
          name: interviewerOptions.find((u) => u.id === id)?.name ?? "",
        }));

      const hhmm = extractHHmm(initialData.start_time);
      const combinedDateTime =
        initialData.date && hhmm
          ? dayjs(`${initialData.date} ${hhmm}`, "YYYY-MM-DD HH:mm")
          : null;

      setForm({
        round: initialData.interview_step_name ?? initialData.round ?? "",
        type: initialData.interview_step_type ?? initialData.type ?? "",
        interviewer: primaryInterviewerId
          ? { id: primaryInterviewerId, name: primaryInterviewerName }
          : null,
        panelMembers,
        duration: initialData.duration ? `${initialData.duration} mins` : "",
        dateTime:
          combinedDateTime && combinedDateTime.isValid()
            ? combinedDateTime.format("YYYY-MM-DDTHH:mm")
            : "",
        platform: initialData.platform ?? "google_meet",
        meetingUrl: initialData.meeting_url ?? "",
        skills: skillsFromTemplate(initialData.template?.skills),
      });

      // Prime the panel-members pool by excluding the seeded primary
      // interviewer, mirroring what happens when a person picks an
      // interviewer manually in the "new schedule" flow.
      if (primaryInterviewerId && orgId) {
        setPrefillLoading(true);
        getEmployeesByRole({
          organisationId: orgId,
          employeeExcludeIds: primaryInterviewerId,
        })
          .unwrap()
          .then((res) => {
            setPanelOptions(
              res.data.map((u) => ({
                id: u.id,
                name: u.name,
                role: u.role,
                designation: u.designation,
              })),
            );
          })
          .finally(() => setPrefillLoading(false));
      }
    } else {
      setForm(EMPTY_SCHEDULE_FORM);
    }
  }, [open, isReschedule, initialData, orgId, interviewerOptions]);

  const setField = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const isValid = form.round.trim() && form.type && form.interviewer && form.dateTime;

  const interviewerId = form.interviewer?.id ?? form.interviewer ?? null;

  const handleSubmit = () => {
    if (!isValid) return;

    const durationMinutes = parseDurationMinutes(form.duration);
    const start = dayjs(form.dateTime);
    const end = start.add(durationMinutes, "minute");

    const skillsByType = form.skills.reduce(
      (acc, s) => {
        const bucket =
          s.type === "mandatory"
            ? "mandatory"
            : s.type === "primary"
              ? "primary"
              : s.type === "secondary"
                ? "secondary"
                : "custom"; // freeSolo/typed skills fall here
        acc[bucket].push(s.label);
        return acc;
      },
      { primary: [], secondary: [], mandatory: [], edc_tools: [], custom: [] }
    );
    const basePayload = {
      org_employee_id: form.interviewer?.id,
      list_org_employee_id: form.panelMembers.map((p) => p.id),
      interview_step_name: form.round,
      interview_step_type: form.type,
      is_final: false,

      date: start.utc().format("YYYY-MM-DD"),
      start_time: start.utc().format("HH:mm:ss"),
      end_time: end.utc().format("HH:mm:ss"),

      duration: durationMinutes,
      template: {
        rating_scale: 5,
        skills: skillsByType,
      },
      platform: form.platform,
      meeting_url: form.meetingUrl,
    };

    if (isReschedule) {
      onSchedule({ interviewId, matched_candidate_id, ...basePayload });
    } else {
      onSchedule({ matched_candidate_id, ...basePayload });
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={loading ? undefined : onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden" } }}
      >
        {/* Header */}
        <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${C.border}` }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
                {isReschedule ? "Reschedule Interview" : "Schedule Interview"}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#9CA3AF", mt: 0.25 }}>
                {isReschedule
                  ? "Update the slot, interviewer, or platform for this round."
                  : "Reserve an interview slot by choosing your preferred schedule."}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={onClose}
              disabled={loading}
              sx={{ width: 30, height: 30, borderRadius: "8px", backgroundColor: "#F3F4F6" }}
            >
              <CloseIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Box>
        </Box>

        <DialogContent sx={{ px: 3, py: 2.5, maxHeight: "70vh" }}>
          {isFetchingInitialData || (isReschedule && prefillLoading) ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress size={26} sx={{ color: C.accent }} />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {/* Interview Round */}
              <Grid item size={{ xs: 12, sm: 6 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 0.5 }}>
                  Interview Round <Box component="span" sx={{ color: "#EF4444" }}>*</Box>
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g. Technical Round 1"
                  value={form.round}
                  onChange={(e) => setField("round")(e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
              </Grid>

              {/* Interview Type */}
              <Grid item size={{ xs: 12, sm: 6 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 0.5 }}>
                  Interview Type <Box component="span" sx={{ color: "#EF4444" }}>*</Box>
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    displayEmpty
                    value={form.type}
                    onChange={(e) => setField("type")(e.target.value)}
                    sx={{ borderRadius: "8px" }}
                    renderValue={(v) => v || <span style={{ color: "#9CA3AF" }}>Select type</span>}
                  >
                    {INTERVIEW_TYPES.map((t) => (
                      <MenuItem key={t} value={t}>{t}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Interviewer */}
              <Grid item size={{ xs: 12, sm: 6 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 0.5 }}>
                  Interviewer <Box component="span" sx={{ color: "#EF4444" }}>*</Box>
                </Typography>
                <Autocomplete
                  size="small"
                  options={interviewerOptions}
                  value={form.interviewer}
                  onChange={async (_, val) => {
                    setField("interviewer")(val);

                    if (!val) return;

                    const res = await getEmployeesByRole({
                      organisationId: orgId,
                      employeeExcludeIds: val.id,
                    }).unwrap();

                    setPanelOptions(
                      res.data.map((u) => ({
                        id: u.id,
                        name: u.name,
                        role: u.role,
                        designation: u.designation,
                      }))
                    );
                  }}
                  getOptionLabel={(option) => option.name || ""}
                  isOptionEqualToValue={(option, value) => option.id === value?.id}
                  renderOption={(props, option) => {
                    const initials = option.name
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();

                    return (
                      <li
                        {...props}
                        style={{
                          ...props.style,
                          paddingTop: 8,
                          paddingBottom: 8,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              fontSize: 13,
                              fontWeight: 600,
                              bgcolor: "#FF5722",
                            }}
                          >
                            {initials}
                          </Avatar>

                          <Box sx={{ display: "flex", flexDirection: "column" }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                              {option.name}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.4 }}>
                              {option.role}
                            </Typography>
                          </Box>
                        </Box>
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select interviewer"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Panel Members */}
              <Grid item size={{ xs: 12, sm: 6 }} >
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 0.5 }}>
                  Panel Members <Box component="span" sx={{ color: "#9CA3AF" }}>(optional)</Box>
                </Typography>
                <Autocomplete
                  multiple
                  size="small"
                  options={panelOptions}
                  getOptionLabel={(o) => o.name ?? o.label ?? ""}
                  isOptionEqualToValue={(option, value) => option.id === value?.id}
                  value={form.panelMembers}
                  onChange={(_, val) => setField("panelMembers")(val)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Add panel members"
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                    />
                  )}
                />
              </Grid>

              {/* Duration */}
              <Grid item size={{ xs: 12, sm: 6 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 0.5 }}>
                  Duration
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    displayEmpty
                    value={form.duration}
                    onChange={(e) => {
                      setField("duration")(e.target.value);
                      // Duration changed → any previously chosen slot may no longer
                      // be valid, so clear it and let the person re-pick.
                      setField("dateTime")("");
                    }}
                    sx={{ borderRadius: "8px" }}
                    renderValue={(v) => v || <span style={{ color: "#9CA3AF" }}>Select duration</span>}
                  >
                    {DURATIONS.map((d) => (
                      <MenuItem key={d} value={d}>{d}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Select Day & Time — opens calendar + live availability modal */}
              <Grid item size={{ xs: 12, sm: 6 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 0.5 }}>
                  Select Day & Time <Box component="span" sx={{ color: "#EF4444" }}>*</Box>
                </Typography>
                <Box
                  onClick={() => setSlotModalOpen(true)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    border: `1px solid ${C.border}`,
                    borderRadius: "8px",
                    px: 1.5,
                    py: "8.5px",
                    cursor: "pointer",
                    backgroundColor: "#fff",
                    "&:hover": { borderColor: C.accent },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 13.5,
                      color: form.dateTime ? "#111827" : "#9CA3AF",
                      fontWeight: form.dateTime ? 600 : 400,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {form.dateTime && dayjs(form.dateTime).isValid()
                      ? dayjs(form.dateTime).format("ddd, DD MMM YYYY · HH:mm")
                      : "Select a slot"}
                  </Typography>
                  <CalendarMonthOutlinedIcon sx={{ fontSize: 16, color: "#9CA3AF", flexShrink: 0 }} />
                </Box>
              </Grid>

              {/* Platform */}
              <Grid item size={{ xs: 12 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 1 }}>
                  Platform
                </Typography>
                <Grid container spacing={1}>
                  {PLATFORMS.map((p) => (
                    <Grid item size={{ xs: 6, sm: 3 }} key={p.key}>
                      <Box
                        onClick={() => setField("platform")(p.key)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          justifyContent: "center",
                          border: `1.5px solid ${form.platform === p.key ? C.accent : C.border}`,
                          backgroundColor: form.platform === p.key ? C.accentSoft : "#fff",
                          borderRadius: "8px",
                          py: 1,
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 600,
                          color: form.platform === p.key ? C.accent : "#374151",
                          userSelect: "none",
                        }}
                      >
                        <span>{p.icon}</span> {p.label}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {/* Meeting URL */}
              <Grid item size={{ xs: 12, }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 0.5 }}>
                  Meeting URL
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="https://meet.google.com/abc-def-ghi"
                  value={form.meetingUrl}
                  onChange={(e) => setField("meetingUrl")(e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
              </Grid>

              {/* Skills to Evaluate */}
              <Grid item size={{ xs: 12 }}>
                <Box sx={{ border: `1px solid ${C.border}`, borderRadius: "10px", overflow: "hidden" }}>
                  <Box
                    sx={{
                      px: 2,
                      py: 1.2,
                      backgroundColor: "#F9FAFB",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                      ⭐ Skills to Evaluate
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    <Autocomplete
                      multiple
                      freeSolo
                      disableCloseOnSelect
                      size="small"
                      options={[
                        { label: "Select All", type: "select_all" },
                        ...allSkillOptions,
                      ]}
                      value={form.skills}
                      isOptionEqualToValue={(option, value) =>
                        option.label === value.label && option.type === value.type
                      }
                      getOptionLabel={(option) =>
                        typeof option === "string" ? option : option.label
                      }
                      groupBy={(option) => {
                        switch (option.type) {
                          case "custom":
                            return "CUSTOM";
                          case "mandatory":
                            return "MANDATORY";
                          case "primary":
                            return "PRIMARY";
                          case "secondary":
                            return "SECONDARY";
                          default:
                            return "";
                        }
                      }}
                      onChange={(event, value, reason, details) => {
                        const isAllSelected =
                          form.skills.length === allSkillOptions.length;

                        if (details?.option?.type === "select_all") {
                          if (isAllSelected) {
                            setField("skills")([]);
                          } else {
                            setField("skills")(allSkillOptions);
                          }
                          return;
                        }

                        setField("skills")(
                          value.filter((v) => v.type !== "select_all")
                        );
                      }}
                      renderGroup={(params) => {
                        if (!params.group) {
                          return <li key={params.key}>{params.children}</li>;
                        }

                        return (
                          <li key={params.key}>
                            <Box
                              sx={{
                                px: 2,
                                py: 1,
                                fontWeight: 700,
                                fontSize: 13,
                                color:
                                  params.group === "MANDATORY"
                                    ? "#E53935"
                                    : params.group === "PRIMARY"
                                      ? "#1976D2"
                                      : params.group === "SECONDARY"
                                        ? "#00A76F"
                                        : "#7C3AED",
                                textTransform: "uppercase",
                              }}
                            >
                              {params.group}
                            </Box>

                            <ul style={{ margin: 0, padding: 0 }}>
                              {params.children}
                            </ul>
                          </li>
                        );
                      }}
                      renderOption={(props, option, { selected }) => {
                        const isAllSelected =
                          form.skills.length === allSkillOptions.length;

                        if (option.type === "select_all") {
                          return (
                            <li {...props} style={{ minHeight: "auto", padding: "4px 12px" }}>
                              <Checkbox
                                size="small"
                                sx={{ p: 0.5 }}
                                checked={isAllSelected}
                                indeterminate={
                                  form.skills.length > 0 &&
                                  form.skills.length < allSkillOptions.length
                                }
                              />

                              <Typography fontWeight={700} fontSize={13}>
                                Select All
                              </Typography>
                            </li>
                          );
                        }

                        return (
                          <li
                            {...props}
                            style={{
                              ...props.style,
                              minHeight: "auto",
                              padding: "4px 12px",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <Checkbox checked={selected} size="small" sx={{ p: 0.5 }} />

                              <Typography sx={{ fontSize: 12 }}>{option.label}</Typography>
                            </Box>
                          </li>
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Type skill + Enter to add"
                          onKeyDown={(e) => {
                            if (e.key !== "Enter") return;

                            const value = e.target.value.trim();

                            if (!value) return;

                            e.preventDefault();

                            const exists = allSkillOptions.some(
                              (s) =>
                                s.label.toLowerCase() === value.toLowerCase()
                            );

                            if (exists) return;

                            const newSkill = {
                              label: value,
                              type: "custom",
                            };

                            setCustomSkills((prev) => [...prev, newSkill]);

                            setForm((prev) => ({
                              ...prev,
                              skills: [...prev.skills, newSkill],
                            }));
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "8px",
                            },
                          }}
                        />
                      )}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${C.border}`, gap: 1 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            disabled={loading}
            sx={{ textTransform: "none", borderRadius: "8px", color: "#111827", borderColor: "#E5E7EB" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!isValid || loading || isFetchingInitialData}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              boxShadow: "none",
              background: "#FF5F1F",
              "&:hover": {
                boxShadow: "none",
                background: "linear-gradient(90deg, #0C9090 0%, #0596B0 100%)",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : isReschedule ? (
              "Reschedule Interview →"
            ) : (
              "Schedule Interview →"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Calendar + live availability picker */}
      <SelectSlotModal
        open={slotModalOpen}
        onClose={() => setSlotModalOpen(false)}
        employeeIds={interviewerId ? [interviewerId] : []}
        durationLabel={form.duration}
        initialDateTime={form.dateTime}
        onConfirm={(combinedDayjs) => {
          setField("dateTime")(combinedDayjs.format("YYYY-MM-DDTHH:mm"));
          setSlotModalOpen(false);
        }}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════
   TIMELINE SMALL COMPONENTS
═══════════════════════════════════════════════ */
function CheckIcon({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M2.5 7L5.5 10L11.5 4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StageCircle({ state, size = 32 }) {
  const sc = STATE_COLORS[state] ?? STATE_COLORS.pending;
  const glowColor =
    state === "completed"
      ? "rgba(34,197,94,0.18)"
      : state === "current"
        ? "rgba(255,95,31,0.18)"
        : state === "failed"
          ? "rgba(239,68,68,0.18)"
          : "transparent";

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: sc.bg,
        border: `2px solid ${sc.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: state !== "pending" ? `0 0 0 5px ${glowColor}` : "none",
        mt: "2px",
        flexShrink: 0,
        transition: "background-color 0.3s, border-color 0.3s, box-shadow 0.3s",
      }}
    >
      {state === "failed" ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 2L10 10M10 2L2 10"
            stroke={sc.icon}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <CheckIcon color={sc.icon} />
      )}
    </Box>
  );
}

function SubStageCircle({ state, size = 20 }) {
  const sc = STATE_COLORS[state] ?? STATE_COLORS.pending;
  const glowColor =
    state === "completed"
      ? "rgba(34,197,94,0.16)"
      : state === "current"
        ? "rgba(255,95,31,0.16)"
        : state === "failed"
          ? "rgba(239,68,68,0.16)"
          : "transparent";

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: sc.bg,
        border: `2px solid ${sc.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: state !== "pending" ? `0 0 0 3px ${glowColor}` : "none",
        mt: "2px",
        flexShrink: 0,
        transition: "background-color 0.3s, border-color 0.3s",
      }}
    >
      {state === "failed" ? (
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path
            d="M1.5 1.5L6.5 6.5M6.5 1.5L1.5 6.5"
            stroke={sc.icon}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M1.5 5L4 7.5L8.5 2.5"
            stroke={sc.icon}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </Box>
  );
}

function StatusBadge({ label, color = "orange" }) {
  const styles = {
    completed: {
      bg: "#EAF8EE",
      color: "#22863A",
    },
    scheduled: {
      bg: "#FFF3E8",
      color: "#F97316",
    },
    failed: {
      bg: "#FEECEC",
      color: "#DC2626",
    },
  };

  const s = styles[color] ?? styles.scheduled;

  return (
    <Box
      sx={{
        ml: 1.5,
        px: 1.5,
        py: "5px",
        borderRadius: "999px",
        bgcolor: s.bg,
        color: s.color,
        fontSize: 12,
        fontWeight: 600,

        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "fit-content",
        alignSelf: "flex-start",   // <-- important
      }}
    >
      {label}
    </Box>
  );
}

function ConnectorLine({ state, minHeight }) {
  const lineColor =
    state === "completed"
      ? "#22C55E"
      : state === "current"
        ? "#FF5F1F"
        : state === "failed"
          ? "#EF4444"
          : "#E5E7EB";

  return (
    <Box
      sx={{
        width: 2,
        flex: 1,
        minHeight,
        background:
          state !== "pending"
            ? `linear-gradient(to bottom, ${lineColor}80, ${lineColor}20)`
            : "#E5E7EB",
        my: "4px",
        borderRadius: 2,
        transition: "background 0.3s",
      }}
    />
  );
}

/* ═══════════════════════════════════════════════
   RADAR CHART
═══════════════════════════════════════════════ */
const SkillBarCompare = ({ scoreIntel, size = 350 }) => {
  const barWidth = 64;
  const chartH = 220;
  const gridVals = [0, 25, 50, 75, 100];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 24, alignSelf: "flex-end" }}>
        {[{ dot: "#818CF8", label: "Candidate" }, { dot: "#22C55E", label: "Desired" }].map(({ dot, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: dot }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: C.gray900 }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", width: "100%", maxWidth: size + 150 }}>
        {/* Y-axis labels + gridlines */}
        <div style={{ position: "relative", height: chartH, width: 36, flexShrink: 0 }}>
          {gridVals.map((v) => (
            <span
              key={v}
              style={{
                position: "absolute",
                right: 8,
                bottom: (v / 100) * chartH - 6,
                fontSize: 12,
                color: C.gray400,
              }}
            >
              {v}
            </span>
          ))}
        </div>

        {/* Chart area */}
        <div style={{ position: "relative", flex: 1, height: chartH, borderLeft: `1px solid ${C.gray200}`, borderBottom: `1px solid ${C.gray200}` }}>
          {/* Gridlines */}
          {gridVals.map((v) => (
            <div
              key={v}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: (v / 100) * chartH,
                borderTop: v === 0 ? "none" : "1px dashed #E5E7EB",
              }}
            />
          ))}

          {/* Bars */}
          <div style={{ display: "flex", justifyContent: "center", gap: 56, height: "100%", position: "relative" }}>
            {scoreIntel.map((d, i) => {
              const candH = (Math.min(d.candidate, 100) / 100) * chartH;
              const desH = (Math.min(d.desired, 100) / 100) * chartH;
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
                  <div style={{ position: "relative", width: barWidth / 2, height: candH, background: "#818CF8", borderRadius: "4px 4px 0 0" }} />
                  <div style={{ position: "relative", width: barWidth / 2, height: desH, background: "#22C55E", borderRadius: "4px 4px 0 0" }} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Skill labels under chart, aligned to bar groups */}
      <div style={{ display: "flex", justifyContent: "center", gap: 56, width: "100%", maxWidth: size + 150, marginLeft: 36, marginTop: 8 }}>
        {scoreIntel.map((d, i) => (
          <div key={i} style={{ width: barWidth, textAlign: "center", fontSize: 13, fontWeight: 600, color: "#475569" }}>
            {d.skill}
          </div>
        ))}
      </div>
    </div>
  );
};
function RadarChart({ scoreIntel, size = 400 }) {
  if (!scoreIntel?.length) return null;
  if (scoreIntel.length < 3) {
    return <SkillBarCompare scoreIntel={scoreIntel} size={size} />;
  }
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    data: null,
  });
  const svgRef = useRef(null);
  const wrapRef = useRef(null);

  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.28;
  const levels = 5;
  const n = scoreIntel.length;

  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const polar = (val, i) => {
    const r = (val / 100) * R;
    return { x: cx + r * Math.cos(angle(i)), y: cy + r * Math.sin(angle(i)) };
  };
  const gridPoly = (level) =>
    Array.from({ length: n }, (_, i) => {
      const r = (level / levels) * R;
      const a = angle(i);
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(" ");
  const toPath = (pts) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";

  const candidatePts = scoreIntel.map((d, i) => polar(d.candidate, i));
  const desiredPts = scoreIntel.map((d, i) => polar(d.desired, i));

  function distToSegment(px, py, ax, ay, bx, by) {
    const dx = bx - ax,
      dy = by - ay;
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) return Math.hypot(px - ax, py - ay);
    const t = Math.max(
      0,
      Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2),
    );
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
  }

  function isInsidePolygon(px, py, pts) {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i].x,
        yi = pts[i].y;
      const xj = pts[j].x,
        yj = pts[j].y;
      const intersect =
        yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function closestSkill(mx, my) {
    let bestIdx = -1,
      bestDist = Infinity;
    for (let i = 0; i < n; i++) {
      const end = polar(100, i);
      const dist = distToSegment(mx, my, cx, cy, end.x, end.y);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    if (bestDist <= 22) return bestIdx;

    if (
      isInsidePolygon(mx, my, candidatePts) ||
      isInsidePolygon(mx, my, desiredPts)
    ) {
      let nearIdx = -1,
        nearDist = Infinity;
      candidatePts.forEach((p, i) => {
        const d = Math.hypot(mx - p.x, my - p.y);
        if (d < nearDist) {
          nearDist = d;
          nearIdx = i;
        }
      });
      return nearIdx;
    }
    return -1;
  }

  const handleMouseMove = useCallback(
    (e) => {
      const svgEl = svgRef.current;
      const wrapEl = wrapRef.current;
      if (!svgEl || !wrapEl) return;

      const svgRect = svgEl.getBoundingClientRect();
      const wrapRect = wrapEl.getBoundingClientRect();
      const scaleX = size / svgRect.width;
      const scaleY = size / svgRect.height;
      const mx = (e.clientX - svgRect.left) * scaleX;
      const my = (e.clientY - svgRect.top) * scaleY;

      const idx = closestSkill(mx, my);
      if (idx !== -1) {
        const ttW = 170,
          ttH = 82;
        let left = e.clientX - wrapRect.left + 14;
        let top = e.clientY - wrapRect.top - 20;
        if (left + ttW > wrapRect.width)
          left = e.clientX - wrapRect.left - ttW - 10;
        if (top + ttH > wrapRect.height)
          top = e.clientY - wrapRect.top - ttH - 10;
        if (top < 0) top = 4;

        setTooltip({ visible: true, x: left, y: top, data: scoreIntel[idx] });
      } else {
        setTooltip((prev) => ({ ...prev, visible: false }));
      }
    },
    [scoreIntel, size],
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      {/* Legend */}
      <Box
        sx={{ display: "flex", gap: "16px", mb: "10px", alignSelf: "flex-end" }}
      >
        {[
          { dot: "#818CF8", label: "Candidate" },
          { dot: "#22C55E", label: "Desired" },
        ].map(({ dot, label }) => (
          <Box
            key={label}
            sx={{ display: "flex", alignItems: "center", gap: "5px" }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: dot,
              }}
            />
            <Typography
              sx={{ fontSize: 13, fontWeight: 500, color: "text.primary" }}
            >
              {label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Chart + Tooltip wrapper */}
      <Box
        ref={wrapRef}
        sx={{ position: "relative", width: size, height: size }}
      >
        <svg
          ref={svgRef}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ overflow: "visible", display: "block" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Grid polygons */}
          {Array.from({ length: levels }, (_, i) => (
            <polygon
              key={i}
              points={gridPoly(i + 1)}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}

          {/* Axis lines */}
          {scoreIntel.map((_, i) => {
            const end = polar(100, i);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={end.x}
                y2={end.y}
                stroke="#E5E7EB"
                strokeWidth="1"
              />
            );
          })}

          {/* Desired polygon */}
          <path
            d={toPath(desiredPts)}
            fill="rgba(34,197,94,0.10)"
            stroke="#22C55E"
            strokeWidth="1.5"
          />

          {/* Candidate polygon */}
          <path
            d={toPath(candidatePts)}
            fill="rgba(129,140,248,0.20)"
            stroke="#818CF8"
            strokeWidth="2"
          />

          {/* Skill labels */}
          {scoreIntel.map((d, i) => {
            const labelR = R + 52;
            const lx = cx + labelR * Math.cos(angle(i));
            const ly = cy + labelR * Math.sin(angle(i));
            const anchor =
              Math.abs(lx - cx) < 5 ? "middle" : lx < cx ? "end" : "start";
            const label =
              d.skill.length > 24 ? d.skill.slice(0, 22) + "…" : d.skill;
            return (
              <text
                key={i}
                x={lx}
                y={ly}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontSize="13"
                fontWeight="600"
                fill="#475569"
              >
                {label}
              </text>
            );
          })}

          {/* Level labels */}
          {Array.from({ length: levels }, (_, i) => {
            const r = ((i + 1) / levels) * R;
            return (
              <text
                key={i}
                x={cx + 4}
                y={cy - r + 4}
                fontSize="8"
                fill="#9CA3AF"
              >
                {(i + 1) * 20}
              </text>
            );
          })}

          {/* Candidate data points */}
          {candidatePts.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#818CF8"
              style={{ pointerEvents: "none" }}
            />
          ))}
        </svg>

        {/* Floating tooltip */}
        {tooltip.visible && tooltip.data && (
          <Box
            sx={{
              position: "absolute",
              left: tooltip.x,
              top: tooltip.y,
              pointerEvents: "none",
              background: "#1E293B",
              borderRadius: "8px",
              padding: "10px 12px",
              minWidth: 160,
              zIndex: 10,
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: "#F1F5F9",
                mb: "6px",
              }}
            >
              {tooltip.data.skill}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                mt: "4px",
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#818CF8",
                  flexShrink: 0,
                }}
              />
              <Typography sx={{ fontSize: 11, color: "#94A3B8" }}>
                Candidate
              </Typography>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#818CF8",
                  ml: "auto",
                }}
              >
                {Math.round(tooltip.data.candidate)}%
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                mt: "4px",
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#22C55E",
                  flexShrink: 0,
                }}
              />
              <Typography sx={{ fontSize: 11, color: "#94A3B8" }}>
                Desired
              </Typography>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#22C55E",
                  ml: "auto",
                }}
              >
                {Math.round(tooltip.data.desired)}%
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   PROFILE: EXPERIENCE LIST
═══════════════════════════════════════════════ */
function ExperienceList({ candidate }) {
  const employment = candidate?.employment ?? [];
  // Track which cards have "show all skills" expanded
  const [expandedSkills, setExpandedSkills] = useState({});

  if (!employment.length)
    return (
      <Typography fontSize={15} color="#9CA3AF">
        No experience listed.
      </Typography>
    );

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {employment.map((emp, i) => {
        const isLast = i === employment.length - 1;
        const isSkillsExpanded = !!expandedSkills[i];
        const allSkills = emp.skills_used ?? [];
        const LIMIT = 8;
        const visibleSkills = isSkillsExpanded
          ? allSkills
          : allSkills.slice(0, LIMIT);
        const hiddenCount = allSkills.length - LIMIT;

        return (
          <Box key={emp.id ?? i} sx={{ display: "flex", gap: "8px", mt: -2 }}>
            {/* Left connector column */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  width: 35,
                  height: 35,
                  borderRadius: "50%",
                  backgroundColor: emp.is_current ? C.accent : "#F3F4F6",
                  border: `1px solid ${emp.is_current ? C.accent : C.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <BusinessOutlinedIcon
                  sx={{
                    fontSize: 15,
                    color: emp.is_current ? "#FFFFFF" : "#9CA3AF",
                  }}
                />
              </Box>
              {!isLast && (
                <Box
                  sx={{
                    width: 1.5,
                    flex: 1,
                    minHeight: 24,
                    backgroundColor: C.border,
                    my: "6px",
                  }}
                />
              )}
            </Box>

            {/* Card */}
            <Box
              sx={{
                width: "100%",
                border: emp.is_current ? "1px solid #FFD6C7" : "1px solid #E8E8EC",
                borderRadius: "14px",
                backgroundColor: emp.is_current ? "#FFFAF7" : "#fff",
                p: "16px",
                mb: 3,
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 2,
                  mb: 0,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#0F172A",
                        lineHeight: 1.3,
                      }}
                    >
                      {emp.job_title}
                    </Typography>
                    {emp.is_current && (
                      <Chip
                        label="CURRENT"
                        size="small"
                        sx={{
                          height: 18,
                          backgroundColor: "#FFF0E8",
                          color: "#FF5F1F",
                          fontSize: 9,
                          fontWeight: 700,
                          borderRadius: "6px",
                          "& .MuiChip-label": { px: 1 },
                        }}
                      />
                    )}
                  </Box>
                  <Typography
                    sx={{
                      mt: 0.25,
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#FF5F1F",
                    }}
                  >
                    {emp.company_name}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: "right" }}>
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: "8px",
                      border: "1px solid #E5E7EB",
                      backgroundColor: "#F8FAFC",
                    }}
                  >
                    <Typography
                      sx={{ fontSize: 12, fontWeight: 600, color: "#475569" }}
                    >
                      {emp.joining_date ?? "—"} —{" "}
                      {emp.is_current ? "Present" : (emp.end_date ?? "—")}
                    </Typography>
                  </Box>
                  {emp.duration && (
                    <Typography
                      sx={{ mt: 0.25, fontSize: 12, color: "#94A3B8" }}
                    >
                      {emp.duration}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Location */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                  mt: 0,
                  mb: 1,
                }}
              >
                {emp.location && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <LocationOnOutlinedIcon
                      sx={{ fontSize: 14, color: "#8B8BA7" }}
                    />
                    <Typography sx={{ fontSize: 12, color: "#475569" }}>
                      {emp.location}
                    </Typography>
                  </Box>
                )}
                {emp.country && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <PublicOutlinedIcon
                      sx={{ fontSize: 14, color: "#8B8BA7" }}
                    />
                    <Typography sx={{ fontSize: 12, color: "#475569" }}>
                      {emp.country}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Skills Used */}
              {allSkills.length > 0 && (
                <>
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#7C7C98",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      mb: 1,
                    }}
                  >
                    Skills Used
                  </Typography>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    {visibleSkills.map((sk) => (
                      <Chip
                        key={sk}
                        label={sk}
                        size="small"
                        sx={{
                          height: 24,
                          backgroundColor: "#EEF2FF",
                          color: "#4338CA",
                          border: "1px solid #DDE4FF",
                          borderRadius: "8px",
                          fontSize: 11,
                          fontWeight: 500,
                          "& .MuiChip-label": { px: 1 },
                        }}
                      />
                    ))}

                    {/* +N more / Show less toggle */}
                    {!isSkillsExpanded && hiddenCount > 0 && (
                      <Chip
                        label={`+${hiddenCount} more`}
                        size="small"
                        onClick={() =>
                          setExpandedSkills((prev) => ({ ...prev, [i]: true }))
                        }
                        sx={{
                          height: 24,
                          backgroundColor: "#FFF7ED",
                          color: "#F97316",
                          border: "1px solid #FDBA74",
                          borderRadius: "8px",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                          "& .MuiChip-label": { px: 1 },
                          "&:hover": { backgroundColor: "#FFEDD5" },
                        }}
                      />
                    )}

                    {isSkillsExpanded && allSkills.length > LIMIT && (
                      <Chip
                        label="Show less"
                        size="small"
                        onClick={() =>
                          setExpandedSkills((prev) => ({ ...prev, [i]: false }))
                        }
                        sx={{
                          height: 24,
                          backgroundColor: "#F3F4F6",
                          color: "#6B7280",
                          border: "1px solid #E5E7EB",
                          borderRadius: "8px",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                          "& .MuiChip-label": { px: 1 },
                          "&:hover": { backgroundColor: "#E5E7EB" },
                        }}
                      />
                    )}
                  </Box>
                </>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   PROFILE: EDUCATION LIST
═══════════════════════════════════════════════ */
function EducationList({ candidate }) {
  const education = [...(candidate?.education ?? [])].sort(
    (a, b) => (b.end_year ?? 0) - (a.end_year ?? 0),
  );

  if (!education.length)
    return (
      <Typography fontSize={15} color="#9CA3AF">
        No education listed.
      </Typography>
    );

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {education.map((edu, i) => {
        const isLast = i === education.length - 1;
        return (
          <Box key={edu.id ?? i} sx={{ display: "flex", gap: "16px" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "10px",
                  backgroundColor: C.tealSoft,
                  border: `1px solid #B2EBF2`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <SchoolOutlinedIcon sx={{ fontSize: 18, color: "#059669" }} />
              </Box>
              {!isLast && (
                <Box
                  sx={{
                    width: 1.5,
                    flex: 1,
                    minHeight: 24,
                    backgroundColor: C.border,
                    my: "6px",
                  }}
                />
              )}
            </Box>
            <Box sx={{ pb: isLast ? 0 : "24px", flex: 1, pt: "6px" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "4px",
                  mb: "2px",
                }}
              >
                <Typography
                  sx={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}
                >
                  {edu.course}
                </Typography>
                {edu.end_year && (
                  <Typography sx={{ fontSize: 13, color: "#9CA3AF" }}>
                    {edu.end_year}
                  </Typography>
                )}
              </Box>
              <Typography
                sx={{ fontSize: 13, color: "#059669", fontWeight: 600 }}
              >
                {edu.university}
              </Typography>
              {edu.specialization && (
                <Typography sx={{ fontSize: 13, color: "#9CA3AF", mt: "2px" }}>
                  {edu.specialization}
                </Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   PROFILE: SKILLS PANEL
═══════════════════════════════════════════════ */
function SkillsPanel({ candidate }) {
  const keySkills = candidate?.skill_info?.[0]?.key_skills ?? "";
  const skills = keySkills
    ? keySkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    : [];

  const matchedPrimary = (candidate?.matched_primary_skills ?? []).map((s) =>
    s.toLowerCase(),
  );
  const matchedSecondary = (candidate?.matched_secondary_skills ?? []).map(
    (s) => s.toLowerCase(),
  );
  const matchedMandatory = (candidate?.matched_mandatory_skills ?? []).map(
    (s) => s.toLowerCase(),
  );

  const getChipStyle = (skill) => {
    const sl = skill.toLowerCase();
    if (matchedMandatory.some((m) => sl.includes(m) || m.includes(sl)))
      return { bg: "#FFF0E8", color: C.accent, border: "#FFCFB3" };
    if (matchedPrimary.some((m) => sl.includes(m) || m.includes(sl)))
      return { bg: "#E0F2FE", color: "#0369A1", border: "#BAE6FD" };
    if (matchedSecondary.some((m) => sl.includes(m) || m.includes(sl)))
      return { bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" };
    return { bg: "#F9FAFB", color: "#6B7280", border: "#E5E7EB" };
  };

  if (!skills.length)
    return (
      <Typography fontSize={15} color="#9CA3AF">
        No skills listed.
      </Typography>
    );

  return (
    <Box>
      <Box sx={{ display: "flex", gap: "14px", mb: "16px", flexWrap: "wrap" }}>
        {[
          {
            label: "Mandatory Match",
            bg: "#FFF0E8",
            color: C.accent,
            border: "#fa6007",
          },
          {
            label: "Primary Match",
            bg: "#E0F2FE",
            color: "#1803ff",
            border: "#BAE6FD",
          },
          {
            label: "Secondary Match",
            bg: "#F3F4F6",
            color: "#556c91",
            border: "#E5E7EB",
          },
        ].map((l) => (
          <Box
            key={l.label}
            sx={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Box
              sx={{
                width: 9,
                height: 9,
                borderRadius: "3px",
                backgroundColor: l.bg,
                border: `1px solid ${l.border}`,
              }}
            />
            <Typography sx={{ fontSize: 13 }}>{l.label}</Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
        {skills.map((skill) => {
          const style = getChipStyle(skill);
          return (
            <Chip
              key={skill}
              label={skill}
              size="small"
              sx={{
                fontSize: 12,
                height: 26,
                backgroundColor: style.bg,
                color: style.color,
                border: `1px solid ${style.border}`,
                borderRadius: "6px",
                fontWeight: 500,
                "& .MuiChip-label": { px: "9px" },
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   PROFILE: SKILL INTEL PANEL (radar + scores dialog)
═══════════════════════════════════════════════ */
const getScoreColors = (score) => {
  if (score >= 80) {
    return {
      ring: "#10B981",
      text: "#059669",
      bg: "#ECFDF5",
    };
  }

  if (score >= 50) {
    return {
      ring: "#F59E0B",
      text: "#D97706",
      bg: "#FFFBEB",
    };
  }

  return {
    ring: "#DC2626",
    text: "#DC2626",
    bg: "#FEF2F2",
  };
};
function SkillNotesAccordion({ skillNotes = {}, scoreIntel = [] }) {
  const notesArray = Object.entries(skillNotes);

  if (!notesArray.length) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        sx={{
          fontSize: 16,
          fontWeight: 700,
          mb: 2,
          color: "#111827",
        }}
      >
        Skill Notes
      </Typography>

      {notesArray.map(([skill, note]) => {
        const scoreData = scoreIntel.find(
          (s) => s.skill?.toLowerCase() === skill?.toLowerCase(),
        );

        const score = scoreData?.candidate || 0;

        const colors = getScoreColors(score);
        const noteText = typeof note === "object" ? note.value : note;

        return (
          <Accordion
            key={skill}
            disableGutters
            sx={{
              mb: 1.5,
              border: "1px solid #E5E7EB",
              borderRadius: "14px !important",
              overflow: "hidden",
              boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
              "&:before": {
                display: "none",
              },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                {/* Left Section */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flex: 1,
                  }}
                >
                  <Box sx={{ position: "relative" }}>
                    {/* Background ring */}
                    <CircularProgress
                      variant="determinate"
                      value={100}
                      size={42}
                      thickness={5}
                      sx={{
                        color: "#E5E7EB",
                        position: "absolute",
                        left: 0,
                        top: 0,
                      }}
                    />

                    {/* Actual progress */}
                    <CircularProgress
                      variant="determinate"
                      value={score}
                      size={42}
                      thickness={5}
                      sx={{
                        color: colors.ring,
                        "& .MuiCircularProgress-circle": {
                          strokeLinecap: "round",
                        },
                      }}
                    />

                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 8,
                          fontWeight: 700,
                          color: colors.text,
                        }}
                      >
                        {Math.round(score)}%
                      </Typography>
                    </Box>
                  </Box>

                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#111827",
                    }}
                  >
                    {skill}
                  </Typography>
                </Box>

                {/* Right Section */}
                <Box sx={{ width: 240 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        width: 20,
                        fontSize: 10,
                        fontWeight: 600,
                        mr: 1,
                      }}
                    >
                      Score
                    </Typography>

                    <LinearProgress
                      variant="determinate"
                      value={score}
                      sx={{
                        flex: 1,
                        height: 4,
                        borderRadius: 999,
                        backgroundColor: "#E5E7EB",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 999,
                          backgroundColor: "#10B981",
                        },
                      }}
                    />

                    <Chip
                      label={`${score}%`}
                      size="small"
                      sx={{
                        bgcolor: "#ECFDF5",
                        color: "#059669",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </AccordionSummary>

            <AccordionDetails
              sx={{
                background: "#FAFAFA",
                borderTop: "1px solid #F3F4F6",
              }}
            >
              {/* AI Notes */}
              <Box
                sx={{
                  p: 0,
                  borderRadius: 2,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 14,
                    lineHeight: 1.8,
                    color: "#374151",
                  }}
                >
                  {noteText}
                </Typography>
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}
function SkillIntelPanel({ candidate }) {
  const skillInfo = candidate?.skill_info?.[0] ?? {};
  const scoreIntel = candidate?.score_intel ?? [];
  const skillNotes = candidate?.skill_notes ?? {};
  const summary = skillInfo.summary ?? "";
  const [skillScoresOpen, setSkillScoresOpen] = React.useState(false);

  const hasContent =
    scoreIntel.length > 0 || summary || Object.keys(skillNotes).length > 0;
  if (!hasContent) return null;

  return (
    <Box>
      {scoreIntel.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: "20px",
            width: "100%",
          }}
        >
          <RadarChart scoreIntel={scoreIntel} size={350} />
        </Box>
      )}

      {scoreIntel.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: "12px" }}>
          <Box
            onClick={() => setSkillScoresOpen(true)}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              border: `1px solid ${C.border}`,
              borderRadius: "8px",
              px: "12px",
              py: "6px",
              cursor: "pointer",
              "&:hover": { backgroundColor: C.accentSoft },
            }}
          >
            <TrendingUpIcon sx={{ fontSize: 14, color: C.accent }} />
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: C.accent }}>
              View all skill scores
            </Typography>
          </Box>
        </Box>
      )}

      {summary && (
        <Box sx={{ mb: "16px" }}>
          <Typography
            sx={{ fontSize: 14, fontWeight: 600, color: "#000", mb: 1 }}
          >
            Skill Summary
          </Typography>
          <Typography sx={{ fontSize: 15 }} lineHeight={1.75}>
            {summary}
          </Typography>
        </Box>
      )}

      <SkillNotesAccordion
        skillNotes={candidate?.skill_notes ?? {}}
        scoreIntel={candidate?.score_intel ?? []}
      />

      {/* Skill Scores Dialog */}
      <Dialog
        open={skillScoresOpen}
        onClose={() => setSkillScoresOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            width: "500px",
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow: "0 16px 50px rgba(0,0,0,0.14)",
          },
        }}
      >
        <DialogTitle
          sx={{
            px: "16px",
            py: "12px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#fff",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                background: "#FFF7ED",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <TrendingUpIcon sx={{ fontSize: 15, color: "#F97316" }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.textPrimary,
                  lineHeight: 1.1,
                }}
              >
                All Skill Scores
              </Typography>
              <Typography sx={{ fontSize: 10, color: "#9CA3AF", mt: "2px" }}>
                {scoreIntel.length} skills evaluated
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={() => setSkillScoresOpen(false)}
            sx={{
              width: 26,
              height: 26,
              borderRadius: "7px",
              backgroundColor: "#F3F4F6",
              "&:hover": { backgroundColor: "#E5E7EB" },
            }}
          >
            <CloseIcon sx={{ fontSize: 12, color: "#6B7280" }} />
          </IconButton>
        </DialogTitle>

        <Box
          sx={{
            px: "16px",
            py: "9px",
            display: "flex",
            gap: "7px",
            borderBottom: `1px solid ${C.border}`,
            backgroundColor: "#FAFAFA",
          }}
        >
          {[
            {
              label: "Strong",
              color: "#22C55E",
              bg: "#DCFCE7",
              count: scoreIntel.filter(
                (s) => s.desired > 0 && s.candidate / s.desired >= 0.9,
              ).length,
            },
            {
              label: "Good",
              color: "#F97316",
              bg: "#FED7AA",
              count: scoreIntel.filter(
                (s) =>
                  s.desired > 0 &&
                  s.candidate / s.desired >= 0.7 &&
                  s.candidate / s.desired < 0.9,
              ).length,
            },
            {
              label: "Gap",
              color: "#EF4444",
              bg: "#FECACA",
              count: scoreIntel.filter(
                (s) => s.desired > 0 && s.candidate / s.desired < 0.7,
              ).length,
            },
          ].map(({ label, color, bg, count }) => (
            <Box
              key={label}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                px: "9px",
                py: "4px",
                borderRadius: "999px",
                backgroundColor: bg,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: color,
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{ fontSize: 10, fontWeight: 700, color, lineHeight: 1 }}
              >
                {count}
              </Typography>
              <Typography
                sx={{ fontSize: 10, fontWeight: 600, color, lineHeight: 1 }}
              >
                {label}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 0px 58px",
            px: "16px",
            py: "6px",
            backgroundColor: "#F9FAFB",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          {["Skill", "Score"].map((h) => (
            <Typography
              key={h}
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: "#9CA3AF",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {h}
            </Typography>
          ))}
        </Box>

        <DialogContent sx={{ p: 0, maxHeight: 300, overflowY: "auto" }}>
          {scoreIntel.map((s, i) => {
            const pct =
              s.desired > 0 ? Math.round((s.candidate / s.desired) * 100) : 0;
            const isStrong = pct >= 90;
            const isGood = pct >= 70 && pct < 90;
            const barColor = isStrong
              ? "#22C55E"
              : isGood
                ? "#F97316"
                : "#EF4444";
            const badgeBg = isStrong
              ? "#DCFCE7"
              : isGood
                ? "#FED7AA"
                : "#FECACA";
            return (
              <Box
                key={s.skill}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 150px",
                  px: "16px",
                  py: "7px",
                  alignItems: "center",
                  borderBottom: "1px solid #F3F4F6",
                  backgroundColor: i % 2 === 0 ? "#fff" : "#FCFCFD",
                  "&:hover": { backgroundColor: "#F9FAFB" },
                  transition: "background 0.15s",
                }}
              >
                {/* Skill */}
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.textPrimary,
                    lineHeight: 1.3,
                    pr: "10px",
                  }}
                >
                  {s.skill}
                </Typography>

                {/* Candidate Score */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      height: 4,
                      backgroundColor: "#E5E7EB",
                      borderRadius: "999px",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        width: `${Math.min(s.candidate, 100)}%`,
                        backgroundColor: barColor,
                        borderRadius: "999px",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </Box>

                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: barColor,
                      ml: "auto",
                      minWidth: "55px",
                      textAlign: "right",
                      px: "10px",
                      py: "1px",
                      borderRadius: "999px",
                      backgroundColor: badgeBg,
                    }}
                  >
                    {s.candidate}%
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </DialogContent>

        <Box
          sx={{
            px: "16px",
            py: "10px",
            borderTop: `1px solid ${C.border}`,
            backgroundColor: "#FAFAFA",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ fontSize: 12, color: C.textSecondary }}>
            Scores are out of 100
          </Typography>
          <Box sx={{ display: "flex", gap: "12px" }}>
            {[
              { label: "≥ 90%", color: "#22C55E" },
              { label: "≥ 70%", color: "#F97316" },
              { label: "< 70%", color: "#EF4444" },
            ].map(({ label, color }) => (
              <Box
                key={label}
                sx={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: color,
                  }}
                />
                <Typography sx={{ fontSize: 12, color: C.textSecondary }}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   PROFILE TAB — Skill Intel only
═══════════════════════════════════════════════ */

function SkillIntelTab({ candidate }) {
  const hasSkillIntel =
    (candidate?.score_intel ?? []).length > 0 ||
    candidate?.skill_info?.[0]?.summary ||
    Object.keys(candidate?.skill_notes ?? {}).length > 0;

  if (!hasSkillIntel) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 8,
          border: `1px solid ${C.border}`,
          borderRadius: "12px",
          backgroundColor: "#fff",
        }}
      >
        <TrendingUpIcon sx={{ fontSize: 40, color: "#D1D5DB", mb: 1.5 }} />
        <Typography fontSize={15} color={C.textSecondary}>
          No skill intelligence data available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        border: `1px solid ${C.border}`,
        borderRadius: "14px",
        backgroundColor: "#fff",
        px: "28px",
        py: "24px",
      }}
    >
      <SkillIntelPanel candidate={candidate} />
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   EXPERIENCE TAB
═══════════════════════════════════════════════ */
function ExperienceTab({ candidate }) {
  return (
    <Box
      sx={{
        borderRadius: "14px",
        backgroundColor: "#fff",
        px: "5px",
        py: "24px",
      }}
    >
      <ExperienceList candidate={candidate} />
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   EDUCATION TAB
═══════════════════════════════════════════════ */
function EducationTab({ candidate }) {
  return (
    <Box
      sx={{
        border: `1px solid ${C.border}`,
        borderRadius: "14px",
        backgroundColor: "#fff",
        px: "28px",
        py: "24px",
      }}
    >
      <EducationList candidate={candidate} />
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   SKILLS TAB
═══════════════════════════════════════════════ */
function SkillsTab({ candidate }) {
  const certifications = candidate?.certifications ?? [];
  return (
    <Box
      sx={{
        border: `1px solid ${C.border}`,
        borderRadius: "14px",
        backgroundColor: "#fff",
        px: "28px",
        py: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "28px",
      }}
    >
      <Box>
        <SectionHeader
          icon={
            <PsychologyOutlinedIcon sx={{ fontSize: 18, color: "#818CF8" }} />
          }
          label="Skills"
        />
        <SkillsPanel candidate={candidate} />
      </Box>

      {certifications.length > 0 && (
        <Box>
          <SectionHeader
            icon={
              <InsertDriveFileOutlinedIcon
                sx={{ fontSize: 18, color: "#16A34A" }}
              />
            }
            label="Certifications"
          />
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {certifications.map((cert, i) => {
              const isLast = i === certifications.length - 1;
              return (
                <Box key={cert.id ?? i} sx={{ display: "flex", gap: "16px" }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "10px",
                        backgroundColor: "#F0FDF4",
                        border: `1px solid #BBF7D0`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <InsertDriveFileOutlinedIcon
                        sx={{ fontSize: 18, color: "#16A34A" }}
                      />
                    </Box>
                    {!isLast && (
                      <Box
                        sx={{
                          width: 1.5,
                          flex: 1,
                          minHeight: 24,
                          backgroundColor: C.border,
                          my: "6px",
                        }}
                      />
                    )}
                  </Box>
                  <Box sx={{ pb: isLast ? 0 : "24px", flex: 1, pt: "6px" }}>
                    <Typography
                      fontSize={14}
                      fontWeight={700}
                      color={C.textPrimary}
                      mb="2px"
                    >
                      {cert.name ?? cert.title ?? "Certification"}
                    </Typography>
                    {cert.issuer && (
                      <Typography fontSize={13} color={C.textSecondary}>
                        {cert.issuer}
                      </Typography>
                    )}
                    {cert.issued_date && (
                      <Typography fontSize={13} color="#9CA3AF" mt="2px">
                        {cert.issued_date}
                        {cert.expiry_date ? ` — ${cert.expiry_date}` : ""}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
}

function TimelineTab({
  candidate,
  onInterviewClick,
  onUpdateInterviewStatus,
  onRescheduleInterview,
  onUpdateInterviewResult,
  onViewFeedback,
  interviewStatusOverrides = {},
  interviewResultOverrides = {},
  interviewTimeOverrides = {},
}) {
  const currentStage = candidate.current_stage ?? "";
  const location = useLocation();
  const { candidateId } = useParams();
  const matched_candidate_id =
    location.state?.matched_candidate_id ?? candidateId;

  const { data, isLoading } = useGetCandidateStageTimelineQuery(
    matched_candidate_id,
    {
      skip: !matched_candidate_id,
    },
  );

  const entries = data?.timeline ?? [];

  const grouped = {};
  entries.forEach((entry) => {
    const g = getEntryGroup(entry);
    if (!g) return;
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(entry);
  });
  const rejectedEntry = entries.find((e) => e.type === "rejected");
  if (rejectedEntry) {
    const groupKeys = STAGE_CONFIG.map((s) => s.key);
    const groupsWithEntries = groupKeys.filter((gk) => grouped[gk]?.length);
    const lastGroupWithEntries = groupsWithEntries[groupsWithEntries.length - 1];
    if (lastGroupWithEntries) {
      grouped[lastGroupWithEntries] = [
        ...(grouped[lastGroupWithEntries] ?? []),
        rejectedEntry,
      ];
    }
  }

  const hasRejected = entries.some((e) => e.type === "rejected");

  // Badges for lifecycle (non-interview) entries, keyed by `entry.type`.
  const LIFECYCLE_BADGE_COLOR = {
    ...BADGE_COLOR,
    offer_released: "scheduled",
    offer_accepted: "completed",
    offer_declined: "failed",
    offer_revoked: "failed",
    rejected: "failed",
  };

  // Badges/labels for a single interview round's *effective* status
  // (derived from its latest event, or a locally-applied Update Status
  // override), keyed the same way as INTERVIEW_STATUS_OPTIONS values.
  const ROUND_STATUS_LABEL = {
    scheduled: "Scheduled",
    completed: "Completed",
    no_show: "No Show",
    not_conducted: "Not Conducted",
    cancelled: "Cancelled",
  };
  const ROUND_BADGE_COLOR = {
    scheduled: "scheduled",
    completed: "completed",
    no_show: "failed",
    not_conducted: "failed",
    cancelled: "failed",
  };

  const visibleStages = STAGE_CONFIG.filter((stage) => !!grouped[stage.key]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress sx={{ color: C.accent }} />
      </Box>
    );
  }

  if (!visibleStages.length) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 8,
          border: `1px solid ${C.border}`,
          borderRadius: "12px",
          backgroundColor: "#fff",
        }}
      >
        <TrendingUpIcon sx={{ fontSize: 40, color: "#D1D5DB", mb: 1.5 }} />
        <Typography fontSize={T.valueSize} color={C.textSecondary}>
          No timeline entries found.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={4}>
      <Grid sx={{ width: "100%", pr: 10 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            ml: 5,
            width: "100%",
          }}
        >
          {visibleStages.map((stage, i) => {
            const stageEntries = grouped[stage.key] ?? [];
            const isLast = i === visibleStages.length - 1;
            const state = groupState(stage.key, grouped, currentStage, hasRejected);

            // Interview rounds only ever live in the "interviewing" group.
            const interviewRounds = stageEntries
              .filter((e) => e.stage?.toLowerCase().startsWith("interview_"))
              .sort((a, b) => (a.step_number ?? 0) - (b.step_number ?? 0));
            const hasSubEntries = interviewRounds.length > 0;

            // Simple lifecycle entries for this group (matched / shortlisted /
            // selected / offer / hired) — everything that isn't a round.
            const lifecycleEntries = stageEntries.filter(
              (e) => !e.stage?.toLowerCase().startsWith("interview_") && e.type !== "rejected",
            );

            // Rejected is rendered separately, after interview rounds, since it
            // represents the terminal action taken *after* the rounds happened.
            const rejectedEntries = stageEntries.filter((e) => e.type === "rejected");

            return (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
                key={stage.key}
              >
                <Box
                  sx={{ display: "flex", gap: "16px", width: "100%" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <StageCircle state={state} size={32} />
                    {!isLast && (
                      <ConnectorLine
                        state={state}
                        minHeight={hasSubEntries ? 80 : 48}
                      />
                    )}
                  </Box>
                  <Box
                    sx={{
                      pb: isLast ? 0 : "12px",
                      width: "100%",
                      pt: "4px",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: "4px",
                        width: "100%",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 15,
                          fontWeight: 700,
                          letterSpacing: "0.2px",
                        }}
                        color={C.textPrimary}
                      >
                        {stage.label}
                      </Typography>
                    </Box>

                    {/* Simple lifecycle entries (matched / shortlisted / selected / offer / hired) */}
                    {lifecycleEntries.map((entry, ei) => (
                      <Box key={entry.timestamp ?? ei} sx={{ mt: 1 }}>
                        {SUB_LABEL[entry.type] && (
                          <StatusBadge
                            label={SUB_LABEL[entry.type]}
                            color={LIFECYCLE_BADGE_COLOR[entry.type]}
                          />
                        )}

                        <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                          <Typography
                            sx={{
                              fontSize: 11,
                              color: "#9CA3AF",
                              minWidth: 24,
                            }}
                          >
                            IST :
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 12,
                              fontWeight: 600,
                              ml: 1,
                              color: "#4B5563",
                            }}
                          >
                            {fmtDateIST(entry.timestamp)}
                          </Typography>
                        </Box>

                        {entry.by?.name && (
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography
                              sx={{
                                fontSize: 11,
                                color: "#9CA3AF",
                                minWidth: 24,
                              }}
                            >
                              By :
                            </Typography>

                            <Typography
                              sx={{
                                fontSize: 12,
                                fontWeight: 600,
                                ml: 1,
                                color: "#4B5563",
                              }}
                            >
                              {entry.by.name}
                            </Typography>
                          </Box>
                        )}

                        {entry.comments && (
                          <Typography
                            sx={{ fontSize: 12, color: "#6B7280", mt: 0.3 }}
                          >
                            "{entry.comments}"
                          </Typography>
                        )}
                      </Box>
                    ))}

                    {hasSubEntries && (
                      <Box
                        sx={{
                          mt: "8px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                          width: "100%",
                        }}
                      >
                        {interviewRounds.map((round, si) => {
                          const roundEvents = round.events ?? [];

                          const latestEvent = [...roundEvents].sort(
                            (a, b) =>
                              new Date(b.timestamp) - new Date(a.timestamp),
                          )[0];
                          const scheduledEvent =
                            roundEvents.find(
                              (e) => e.event === "interview_scheduled",
                            ) ?? roundEvents[0];

                          const effectiveStatus =
                            interviewStatusOverrides[round.interview_id] ??
                            normalizeInterviewStatus(latestEvent?.status);

                          const isOpenRound = OPEN_INTERVIEW_STAGES.includes(
                            effectiveStatus,
                          );
                          const isCompletedRound = effectiveStatus === "completed";
                          const effectiveResult =
                            interviewResultOverrides[round.interview_id] ??
                            normalizeInterviewResult(
                              latestEvent?.result ?? round.result,
                            );
                          const hasFinalResult =
                            effectiveResult === "pass" || effectiveResult === "fail";

                          const roundBadgeLabel =
                            isCompletedRound && effectiveResult
                              ? `Completed (${effectiveResult.toUpperCase()})`
                              : ROUND_STATUS_LABEL[effectiveStatus] ?? effectiveStatus;

                          const roundBadgeColor =
                            isCompletedRound && effectiveResult
                              ? effectiveResult === "pass"
                                ? "completed"
                                : "failed"
                              : ROUND_BADGE_COLOR[effectiveStatus] ?? "scheduled";

                          const timeOverride = interviewTimeOverrides[round.interview_id];
                          const effectiveInterviewTime = timeOverride?.interview_time ?? round.interview_time;
                          const effectiveDurationMinutes = timeOverride?.duration_minutes ?? round.duration_minutes;

                          const interviewEndTimeForRound = getInterviewEndTime(
                            effectiveInterviewTime,
                            effectiveDurationMinutes,
                          );

                          return (
                            <Box
                              key={round.interview_id ?? si}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "10px",
                                width: "100%",
                                mt: -1.5,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mt: "2px",
                                }}
                              >
                                <Box sx={{ mt: 1 }}>
                                  <Box sx={{ display: 'flex' }}>
                                    <Typography
                                      sx={{
                                        fontSize: 15,
                                        fontWeight: 700,
                                        color: "#111827",
                                      }}
                                    >
                                      {round.step_name ?? `Round-${round.step_number}`}
                                    </Typography>
                                    <StatusBadge
                                      label={roundBadgeLabel}
                                      color={roundBadgeColor}
                                    />
                                  </Box>
                                  <Typography
                                    sx={{
                                      fontSize: 12,
                                      color: "#6B7280",
                                      mt: 0.5,
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    IST:
                                    <Typography sx={{ ml: 1, fontSize: 12, color: "#4B5563", fontWeight: 600 }}>
                                      {fmtDateIST(round.timestamp)}
                                    </Typography>
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: 12,
                                      color: "#6B7280",
                                      mt: 0.3,
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    Interview Time: IST:
                                    <Typography sx={{ ml: 1, fontSize: 12, color: "#4B5563", fontWeight: 600 }}>
                                      {fmtDateIST(effectiveInterviewTime)}
                                    </Typography>
                                  </Typography>

                                  {round.interviewer?.name && (
                                    <Typography
                                      sx={{
                                        fontSize: 12,
                                        color: "#6B7280",
                                        mt: 0.3,
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      Interviewer:
                                      <Typography sx={{ ml: 1, fontSize: 12, color: "#4B5563", fontWeight: 600 }}>
                                        {round.interviewer.name}
                                      </Typography>
                                    </Typography>
                                  )}

                                  <Typography
                                    sx={{
                                      fontSize: 12,
                                      color: "#6B7280",
                                      mt: 0.3,
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    By:
                                    <Typography sx={{ ml: 1, fontSize: 12, color: "#4B5563", fontWeight: 600 }}>
                                      {scheduledEvent?.by?.name ?? "—"}
                                    </Typography>
                                  </Typography>

                                  {latestEvent?.comments && (
                                    <Typography
                                      sx={{ fontSize: 12, color: "#6B7280", mt: 0.3 }}
                                    >
                                      "{latestEvent.comments}"
                                    </Typography>
                                  )}
                                </Box>
                              </Box>

                              {round.interview_id && (
                                <Stack direction="row" spacing={1}>
                                  <Button
                                    startIcon={
                                      <VisibilityIcon
                                        sx={{ fontSize: "13px !important" }}
                                      />
                                    }
                                    variant="outlined"
                                    onClick={() =>
                                      onInterviewClick(round.interview_id)
                                    }
                                    sx={{
                                      borderColor: "#1976d2",
                                      color: "#1976d2",
                                      textTransform: "none",
                                      fontSize: "12px",
                                      fontWeight: 500,
                                      borderRadius: "5px",
                                      px: 2,
                                      py: 0,
                                      height: "30px",
                                      "& .MuiSvgIcon-root": {
                                        fontSize: "13px",
                                      },
                                    }}
                                  >
                                    View Details
                                  </Button>

                                  {isCompletedRound && (
                                    <>
                                      <Button
                                        startIcon={
                                          <VisibilityIcon sx={{ fontSize: "13px !important" }} />
                                        }
                                        variant="outlined"
                                        onClick={() => onViewFeedback(round.interview_id)}
                                        sx={{
                                          borderColor: "#16A34A",
                                          color: "#16A34A",
                                          textTransform: "none",
                                          fontSize: "12px",
                                          fontWeight: 500,
                                          borderRadius: "5px",
                                          px: 2,
                                          py: 0,
                                          height: "30px",
                                        }}
                                      >
                                        View Feedback
                                      </Button>

                                      {!hasFinalResult && !hasRejected && (
                                        <InterviewResultMenu
                                          currentResult={effectiveResult}
                                          onSelect={(result) =>
                                            onUpdateInterviewResult(
                                              round.interview_id,
                                              result,
                                            )
                                          }
                                        />
                                      )}
                                    </>
                                  )}

                                  {isOpenRound && (
                                    <>
                                      <Button
                                        startIcon={
                                          <EventRepeatOutlinedIcon
                                            sx={{ fontSize: "13px !important" }}
                                          />
                                        }
                                        variant="outlined"
                                        onClick={() =>
                                          onRescheduleInterview(round.interview_id)
                                        }
                                        sx={{
                                          borderColor: "#F97316",
                                          color: "#F97316",
                                          textTransform: "none",
                                          fontSize: "12px",
                                          fontWeight: 500,
                                          borderRadius: "5px",
                                          px: 2,
                                          py: 0,
                                          height: "30px",
                                          "& .MuiSvgIcon-root": {
                                            fontSize: "13px",
                                          },
                                        }}
                                      >
                                        Reschedule
                                      </Button>

                                      <InterviewStatusMenu
                                        interviewEndTime={interviewEndTimeForRound}
                                        currentStatus={effectiveStatus}
                                        onSelect={(action) =>
                                          onUpdateInterviewStatus(
                                            round.interview_id,
                                            action,
                                          )
                                        }
                                      />
                                    </>
                                  )}
                                </Stack>
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                    {/* Rejected renders last — it's the terminal action, after any rounds */}
                    {rejectedEntries.map((entry, ei) => (
                      <Box key={entry.timestamp ?? `rejected-${ei}`} sx={{ mt: 1 }}>
                        {SUB_LABEL[entry.type] && (
                          <StatusBadge
                            label={SUB_LABEL[entry.type]}
                            color={LIFECYCLE_BADGE_COLOR[entry.type]}
                          />
                        )}

                        <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                          <Typography sx={{ fontSize: 11, color: "#9CA3AF", minWidth: 24 }}>
                            IST :
                          </Typography>
                          <Typography sx={{ fontSize: 12, fontWeight: 600, ml: 1, color: "#4B5563" }}>
                            {fmtDateIST(entry.timestamp)}
                          </Typography>
                        </Box>

                        {entry.by?.name && (
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography sx={{ fontSize: 11, color: "#9CA3AF", minWidth: 24 }}>
                              By :
                            </Typography>
                            <Typography sx={{ fontSize: 12, fontWeight: 600, ml: 1, color: "#4B5563" }}>
                              {entry.by.name}
                            </Typography>
                          </Box>
                        )}

                        {entry.comments && (
                          <Typography sx={{ fontSize: 12, color: "#6B7280", mt: 0.3 }}>
                            "{entry.comments}"
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Grid>
    </Grid>
  );
}

/* ═══════════════════════════════════════════════
   INTERVIEWS TAB
═══════════════════════════════════════════════ */
function InterviewsTab({ candidate }) {
  const interviews = candidate.interviews ?? [];

  if (!interviews.length) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 8,
          border: `1px solid ${C.border}`,
          borderRadius: "12px",
          backgroundColor: "#fff",
        }}
      >
        <CalendarMonthOutlinedIcon
          sx={{ fontSize: 40, color: "#D1D5DB", mb: 1.5 }}
        />
        <Typography fontSize={T.valueSize} color={C.textSecondary}>
          No interviews scheduled yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {interviews.map((iv, i) => (
        <Box
          key={i}
          sx={{
            p: "16px",
            border: `1px solid ${C.border}`,
            borderRadius: "10px",
            backgroundColor: "#fff",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: "8px",
            }}
          >
            <Typography fontSize={15} fontWeight={700} color={C.textPrimary}>
              {iv.round_name}
            </Typography>
            <Chip
              label={iv.status}
              size="small"
              sx={{
                fontSize: 11,
                height: 22,
                textTransform: "capitalize",
                fontWeight: 600,
                backgroundColor:
                  iv.status === "scheduled" ? "#E7F8EE" : "#F3F4F6",
                color: iv.status === "scheduled" ? "#0F6E56" : "#6B7280",
                "& .MuiChip-label": { px: "8px" },
              }}
            />
          </Box>
          <Typography fontSize={14} color={C.textSecondary}>
            {new Date(iv.scheduled_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            {" · "}
            {new Date(iv.scheduled_at).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
          {iv.interviewer && (
            <Typography fontSize={14} color={C.textSecondary} mt="2px">
              <Box
                component="span"
                sx={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}
              >
                Interviewer:{" "}
              </Box>
              {iv.interviewer}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   DOCUMENTS TAB
═══════════════════════════════════════════════ */
function DocumentsTab({ candidate }) {
  if (!candidate.resume_url) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 8,
          border: `1px solid ${C.border}`,
          borderRadius: "12px",
          backgroundColor: "#fff",
        }}
      >
        <InsertDriveFileOutlinedIcon
          sx={{ fontSize: 40, color: "#D1D5DB", mb: 1.5 }}
        />
        <Typography fontSize={T.valueSize} color={C.textSecondary}>
          No documents uploaded.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: "16px",
        border: `1px solid ${C.border}`,
        borderRadius: "10px",
        backgroundColor: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        maxWidth: 500,
      }}
    >
      <Box>
        <Typography fontSize={15} fontWeight={600} color={C.textPrimary}>
          Resume
        </Typography>
        <Typography
          fontSize={13}
          color="#9CA3AF"
          sx={{ wordBreak: "break-all" }}
        >
          {candidate.resume_url.split("/").pop()}
        </Typography>
      </Box>
      <Button
        size="small"
        variant="outlined"
        href={candidate.resume_url}
        target="_blank"
        sx={{
          borderColor: C.accent,
          color: C.accent,
          textTransform: "none",
          fontWeight: 600,
          borderRadius: "8px",
          fontSize: 13,
          flexShrink: 0,
          ml: 2,
          "&:hover": { backgroundColor: C.accentSoft, borderColor: C.accent },
        }}
      >
        View
      </Button>
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */

export default function CandidateDetail() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(0);

  const matched_candidate_id =
    location.state?.matched_candidate_id ?? candidateId;
  const { data, isLoading, isError, error } =
    useGetCandidateDetailQuery(matched_candidate_id);
  const candidate = data?.data?.candidate ?? null;
  const orgId = location.state?.orgId;
  const enriched = candidate
    ? {
      ...candidate,
      matched_primary_skills: data?.data?.matched_primary_skills ?? [],
      matched_secondary_skills: data?.data?.matched_secondary_skills ?? [],
      matched_mandatory_skills: data?.data?.matched_mandatory_skills ?? [],
      skill_notes: data?.data?.skill_notes ?? {},
      score_intel: data?.data?.score_intel ?? [],
      status: data?.data?.status,
    }
    : null;

  const [customSkills, setCustomSkills] = useState([]);
  const skillOptions = [
    ...(enriched?.matched_mandatory_skills ?? []).map((s) => ({
      label: s,
      type: "mandatory",
    })),
    ...(enriched?.matched_primary_skills ?? []).map((s) => ({
      label: s,
      type: "primary",
    })),
    ...(enriched?.matched_secondary_skills ?? []).map((s) => ({
      label: s,
      type: "secondary",
    })),
  ];
  const allSkillOptions = useMemo(() => {
    const map = new Map();

    [...customSkills, ...skillOptions].forEach((skill) => {
      map.set(skill.label.toLowerCase(), skill);
    });

    return [...map.values()];
  }, [customSkills, skillOptions]);

  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [lastInterviewPayload, setLastInterviewPayload] = useState(null);
  const [interviewTimeOverrides, setInterviewTimeOverrides] = useState({});

  const [getInterviewFullDetails, { isFetching }] =
    useLazyGetInterviewFullDetailsQuery();

  const handleInterviewDetails = async (interviewId) => {
    try {
      const response = await getInterviewFullDetails(interviewId).unwrap();
      setSelectedInterview(response.data);
      setInterviewModalOpen(true);
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Failed to load interview details",
        severity: "error",
      });
    }
  };

  const handleEditFromDetails = (interviewId) => {
    setInterviewModalOpen(false);
    handleRescheduleClick(interviewId);
  };

  /* ── Shortlist / Reject / Select / Offer flow ──
     All of these reuse the same StatusConfirmModal + updateCandidateStatus
     mutation. `statusModal.action` is always the exact `new_status` value
     sent to the API. */
  const [statusModal, setStatusModal] = useState({ open: false, action: null });
  const [updateCandidateStatus, { isLoading: statusUpdating }] =
    useUpdateCandidateStatusMutation();
  const [updateInterviewRoundStatus, { isLoading: updatingInterview }] =
    useUpdateInterviewRoundStatusMutation();
  const [updateInterviewResult, { isLoading: updatingInterviewResult }] =
    useUpdateInterviewResultMutation();
  const INTERVIEW_ACTIONS = [
    "completed",
    "no_show",
    "not_conducted",
    "cancelled",
  ];

  const handleConfirmStatus = async (comments) => {
    try {
      const statusAction = statusModal.action;

      if (INTERVIEW_ACTIONS.includes(statusAction)) {
        await updateInterviewRoundStatus({
          interviewId: interviewStatusModal.interviewId,
          status: statusAction,
          // result: statusAction,
          reason: comments,
          candidateId: matched_candidate_id,
        }).unwrap();
      } else {
        await updateCandidateStatus({
          candidateId: matched_candidate_id,
          newStatus: statusAction,
          reason: comments,
        }).unwrap();
      }

      // Close modal
      setStatusModal({
        open: false,
        action: null,
      });

      // Clear interview modal state if applicable
      setInterviewStatusModal({
        open: false,
        action: null,
        interviewId: null,
      });

      setSnackbar({
        open: true,
        message: "Status updated successfully",
        severity: "success",
      });

    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err?.data?.message || "Failed to update status",
        severity: "error",
      });
    }
  };

  /* ── Interview round outcome flow (Update Status dropdown, Timeline tab) ──
     Reuses the same StatusConfirmModal used above — `interviewStatusModal.action`
     is one of: "completed" | "no_show" | "not_conducted" | "cancelled". */
  const [interviewStatusModal, setInterviewStatusModal] = useState({
    open: false,
    action: null,
    interviewId: null,
  });
  // Optimistic local overrides so the Timeline UI reflects the new outcome
  // immediately, keyed by interview_id. Cleared automatically once the
  // backend timeline query refetches with the real stage (RTK Query tag
  // invalidation on the mutation should trigger that refetch).
  const [interviewStatusOverrides, setInterviewStatusOverrides] = useState({});

  // Once a round is "completed", a Pass/Fail result can be recorded
  // against it via useUpdateInterviewResultMutation. Same optimistic-
  // override pattern as interviewStatusOverrides above, keyed by
  // interview_id, storing "pass" | "fail".
  const [interviewResultOverrides, setInterviewResultOverrides] = useState({});

  const handleOpenInterviewStatusModal = (interviewId, action) => {
    setStatusModal({
      open: true,
      action,
    });

    setInterviewStatusModal({
      open: true,
      action,
      interviewId,
    });
  };

  const handleConfirmInterviewStatus = async (comment) => {
    const { interviewId, action } = interviewStatusModal;
    if (!interviewId || !action) return;
    try {
      await updateCandidateStatus({
        candidateId: matched_candidate_id,
        newStatus: action, // "completed" | "no_show" | "not_conducted" | "cancelled"
        reason: comment || undefined,
      }).unwrap();

      setInterviewStatusOverrides((prev) => ({ ...prev, [interviewId]: action }));
      setInterviewStatusModal({ open: false, action: null, interviewId: null });
      setSnackbar({
        open: true,
        message: `Interview marked as ${STATUS_DISPLAY[action]?.label ?? action}`,
        severity: "success",
      });
    } catch (err) {
      console.error("Interview status update failed:", err);
      setSnackbar({
        open: true,
        message: err?.data?.message || "Failed to update interview status",
        severity: "error",
      });
    }
  };

  /* ── Interview result flow (Pass / Fail — Timeline tab, "completed" rounds) ──
     Wired to PUT /acc/interviews/{interviewId}/status_v1?result=pass|fail
     via useUpdateInterviewResultMutation. On success we optimistically
     store the result locally so the round's badge flips to
     "Completed (PASS)" / "Completed (FAIL)" immediately; the mutation's
     invalidatesTags (CandidateTimeline / CandidateDetail) will refetch
     the real data in the background. */
  const handleUpdateInterviewResult = async (interviewId, result) => {
    try {
      await updateInterviewResult({ interviewId, result, candidateId: matched_candidate_id }).unwrap();

      setInterviewResultOverrides((prev) => ({ ...prev, [interviewId]: result }));

      setSnackbar({
        open: true,
        message: `Interview marked as ${result === "pass" ? "Passed" : "Failed"}`,
        severity: "success",
      });
    } catch (err) {
      console.error("Interview result update failed:", err);
      setSnackbar({
        open: true,
        message: err?.data?.message || "Failed to update interview result",
        severity: "error",
      });
    }
  };

  /* ── View Feedback flow ── */
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackInterview, setFeedbackInterview] = useState(null); // full interview details (names/skill buckets)
  const [feedbackItems, setFeedbackItems] = useState(null); // raw feedback API `data` array
  const [getInterviewFeedback, { isFetching: isFetchingFeedback }] =
    useLazyGetInterviewFeedbackQuery();

  const handleViewFeedback = async (interviewId) => {
    setFeedbackModalOpen(true);
    setFeedbackInterview(null);
    setFeedbackItems(null);
    try {
      const [detailsRes, feedbackRes] = await Promise.all([
        getInterviewFullDetails(interviewId).unwrap(),
        getInterviewFeedback(interviewId).unwrap(),
      ]);
      setFeedbackInterview(detailsRes.data);
      setFeedbackItems(feedbackRes.data ?? []);
    } catch (err) {
      console.error("Failed to load interview feedback:", err);
      setFeedbackModalOpen(false);
      setSnackbar({
        open: true,
        message: "Failed to load interview feedback",
        severity: "error",
      });
    }
  };
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null); // { interviewId, loading, ...savedInterviewFields }
  const [rescheduleInterview, { isLoading: reschedulingInterview }] =
    useRescheduleInterviewMutation();
  const handleRescheduleClick = (interviewId) => {
    const savedPayload = scheduledInterviewData[interviewId];

    if (savedPayload) {
      setRescheduleModalOpen(true);
      setRescheduleTarget({ interviewId, loading: false, ...savedPayload });
      return;
    }

    setRescheduleModalOpen(true);
    setRescheduleTarget({ interviewId, loading: true });

    getInterviewFullDetails(interviewId)
      .unwrap()
      .then((response) => {
        setRescheduleTarget({ interviewId, loading: false, ...response.data });
      })
      .catch((err) => {
        console.error("Failed to fetch interview details for reschedule:", err);
        setRescheduleTarget({ interviewId, loading: false });
        setSnackbar({
          open: true,
          message: "Couldn't load saved interview details — please re-enter them.",
          severity: "info",
        });
      });
  };
  const handleConfirmReschedule = async ({ interviewId, ...payload }) => {
    try {
      await rescheduleInterview({
        interviewId,
        candidateId: matched_candidate_id,
        body: payload,
      }).unwrap();

      setScheduledInterviewData((prev) => ({
        ...prev,
        [interviewId]: payload,
      }));

      // payload.date / payload.start_time are already UTC (see basePayload
      // in ScheduleInterviewModal — start.utc().format(...)), so this
      // composes a correct UTC ISO instant for the new slot.
      setInterviewTimeOverrides((prev) => ({
        ...prev,
        [interviewId]: {
          interview_time: `${payload.date}T${payload.start_time}Z`,
          duration_minutes: payload.duration,
        },
      }));

      setRescheduleModalOpen(false);
      setRescheduleTarget(null);
      setInterviewStatusOverrides((prev) => {
        const next = { ...prev };
        delete next[interviewId];
        return next;
      });
      setInterviewResultOverrides((prev) => {
        const next = { ...prev };
        delete next[interviewId];
        return next;
      });
      setSnackbar({ open: true, message: "Interview rescheduled successfully", severity: "success" });
    } catch (err) {
      console.error("Reschedule failed:", err);
      setSnackbar({ open: true, message: err?.data?.message || "Failed to reschedule interview", severity: "error" });
    }
  };

  /* ── Derived counts / conditional tabs (computed early so they can be
     used both for the snackbar/tab-switch logic and the render below) ── */
  const certCount = enriched?.certifications?.length ?? 0;
  const hasSkillIntel =
    (enriched?.score_intel ?? []).length > 0 ||
    enriched?.skill_info?.[0]?.summary ||
    Object.keys(enriched?.skill_notes ?? {}).length > 0;

  const tabIndices = useMemo(() => {
    let idx = 0;
    const EXP = idx++;
    const EDU = idx++;
    const SKILLS = idx++;
    const CERT = certCount > 0 ? idx++ : -1;
    const INTEL = hasSkillIntel ? idx++ : -1;
    const TIMELINE = idx++;
    const INTERVIEWS = idx++;
    const DOCUMENTS = idx++;
    return { EXP, EDU, SKILLS, CERT, INTEL, TIMELINE, INTERVIEWS, DOCUMENTS };
  }, [certCount, hasSkillIntel]);

  /* ── Toast (Schedule Interview / Reschedule / Status update success/error) ── */
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  /* ── Schedule Interview flow ── */
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleInterview, { isLoading: schedulingInterview }] =
    useScheduleInterviewInCandidatesMutation();
  const [scheduledInterviewData, setScheduledInterviewData] = useState({});
  const handleScheduleInterview = async (payload) => {
    try {
      const response = await scheduleInterview(payload).unwrap();
      const newInterviewId = response?.data?.interview_id ?? response?.interview_id;
      if (newInterviewId) {
        setScheduledInterviewData((prev) => ({
          ...prev,
          [newInterviewId]: payload,
        }));
      }

      setScheduleModalOpen(false);
      setSnackbar({
        open: true,
        message: "Interview scheduled successfully",
        severity: "success",
      });
      setActiveTab(tabIndices.TIMELINE);
    } catch (err) {
      console.error("Schedule interview failed:", err);
      setSnackbar({
        open: true,
        message: err?.data?.message || "Failed to schedule interview",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    const labels = {};
    if (location.state?.orgName) labels.orgId = location.state.orgName;
    if (location.state?.jobTitle) labels.jobId = location.state.jobTitle;
    if (enriched?.full_name) labels.candidateId = enriched.full_name;
    if (Object.keys(labels).length) dispatch(setDynamicLabels(labels));
    return () => dispatch(clearDynamicLabels());
  }, [enriched?.full_name, location.state?.orgName, location.state?.jobTitle]);

  const [getResumeView] = useLazyGetResumeViewQuery();
  const viewResume = async (candidateId) => {
    try {
      const res = await getResumeView(candidateId).unwrap();

      const url = res?.resume_url;

      if (url) {
        window.open(url, "_blank");
      }
    } catch (error) {
      console.error("Resume fetch failed:", error);
    }
  };

  useEffect(() => {
    if (candidate?.full_name) {
      dispatch(setDynamicLabels({ candidateId: candidate.full_name }));
    }
  }, [candidate]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress sx={{ color: C.accent }} />
      </Box>
    );
  }

  if (isError || !enriched) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Failed to load candidate: {error?.data?.message || "Unknown error"}
      </Alert>
    );
  }

  // ── Derived counts for tab labels ──
  const expCount = enriched.employment?.length ?? 0;
  const eduCount = enriched.education?.length ?? 0;
  const skillCount = (enriched.skill_info?.[0]?.key_skills ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean).length;

  // ── Total experience string ──
  const totalExp =
    enriched.total_experience ?? enriched.employment?.[0]?.duration ?? null;

  return (
    <Box sx={{ p: 1, backgroundColor: "#fff" }}>
      {/* ── Page header card ── */}
      <Box
        sx={{
          border: `0.5px solid ${C.border}`,
          borderRadius: "14px",
          backgroundColor: "#fff",
          mb: "16px",
          overflow: "hidden",
        }}
      >
        {/* Top row: back + avatar + name/title + right meta */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px",
            p: "16px 20px 12px",
            width: "100%",
          }}
        >
          {/* Back button */}
          <Box
            onClick={() => {
              if (location.state?.orgId && location.state?.jobId == null) {
                navigate(`/account-manager/org/${location.state.orgId}`, {
                  state: { activeTab: location.state?.previousTab ?? 2 },
                });
                return;
              }
              if (location.state?.orgId && location.state?.jobId) {
                navigate(
                  `/account-manager/org/${location.state.orgId}/requisitions/${location.state.jobId}`,
                  {
                    state: {
                      activeReqTab: 1,
                      previousTab: location.state?.previousTab ?? 1,
                    },
                  },
                );
                return;
              }
              navigate(-1);
            }}
            sx={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `0.5px solid ${C.border}`,
              backgroundColor: "#F9FAFB",
              cursor: "pointer",
              flexShrink: 0,
              mt: "4px",
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 16, color: C.textSecondary }} />
          </Box>

          {/* Avatar */}
          <Avatar
            sx={{
              width: 54,
              height: 54,
              backgroundColor: C.accent,
              fontSize: 18,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {enriched.full_name
              ?.split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </Avatar>

          {/* Name + title block */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <Typography
                sx={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: C.textPrimary,
                  lineHeight: 1.2,
                }}
              >
                {enriched.full_name}
              </Typography>
              <DescriptionOutlinedIcon
                onClick={() => {
                  viewResume(enriched.id);
                }}
                sx={{
                  fontSize: 14,
                  color: "#FF5F1F",
                  ml: 0,
                  cursor: "pointer",
                }}
              />
              {enriched.status && (
                <Box
                  sx={{
                    px: "8px",
                    py: "2px",
                    borderRadius: "999px",
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    backgroundColor:
                      enriched.status === "active"
                        ? "#DCFCE7"
                        : enriched.status === "inactive"
                          ? "#F3F4F6"
                          : "#FEF3C7",
                    color:
                      enriched.status === "active"
                        ? "#16A34A"
                        : enriched.status === "inactive"
                          ? "#6B7280"
                          : "#D97706",
                  }}
                >
                  {enriched.status}
                </Box>
              )}
              <Tooltip title="View Full Profile">

                <Person2OutlinedIcon sx={{ fontSize: 16, color: "#FF5722", cursor: "pointer" }} onClick={() => {
                  navigate(`/account-manager/candidates/${candidate?.id}`)
                }} />
              </Tooltip>
            </Box>
            <Box
              sx={{
                display: "flex",
                mt: "3px",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Typography sx={{ fontSize: 12, color: C.textSecondary }}>
                {enriched.employment?.[0]?.job_title}
              </Typography>
              <Typography sx={{ fontSize: 13, color: C.textSecondary }}>
                {" . "}
              </Typography>
              <Typography sx={{ fontSize: 12, color: C.textSecondary }}>
                {enriched.employment[0].company_name}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>

              <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <EmailOutlined sx={{ fontSize: 13, color: "#9CA3AF" }} />
                <Typography sx={{ fontSize: 12, color: C.textSecondary }}>
                  {enriched.email}
                </Typography>
              </Box>
              {enriched.clin_id && (
                <Typography
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: 11,
                    color: "#000",
                    fontWeight: 500,
                    ml: 1
                  }}
                >
                  CLIN{enriched.clin_id}

                </Typography>
              )}
            </Box>
          </Box>

          {/* Right meta block — email, experience, phone */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              flexShrink: 0,
              alignItems: "flex-end",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {totalExp && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    border: `1px solid ${C.border}`,
                    borderRadius: "8px",
                    px: "10px",
                    py: "5px",
                    backgroundColor: "#FAFAFA",
                  }}
                >
                  <AccessTimeOutlined sx={{ fontSize: 13, color: "#9CA3AF" }} />
                  <Typography sx={{ fontSize: 12, color: C.textSecondary }}>
                    {totalExp}
                  </Typography>
                </Box>
              )}
              {enriched.phone && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    border: `1px solid ${C.border}`,
                    borderRadius: "8px",
                    px: "10px",
                    py: "5px",
                    backgroundColor: "#FAFAFA",
                  }}
                >
                  <PhoneOutlined sx={{ fontSize: 13, color: "#9CA3AF" }} />
                  <Typography sx={{ fontSize: 12, color: C.textSecondary }}>
                    {enriched.phone}
                  </Typography>
                </Box>
              )}
            </Box>
            {enriched.skill_info?.[0]?.skillintel_score != null && (
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  color: C.accent,
                  backgroundColor: C.accentSoft,
                  border: "0.5px solid #FFCFB3",
                  borderRadius: "999px",
                  px: "10px",
                  py: "4px",
                }}
              >
                <TrendingUpIcon sx={{ fontSize: 15, color: C.accent }} />
                <Typography
                  sx={{ fontSize: 12, fontWeight: 700, color: C.accent }}
                >
                  Skill Intel {enriched.skill_info[0].skillintel_score}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* ── Tab bar (inside header card, matching image) ── */}
      </Box>

      {/* ── Tab content ── */}
      {(() => {
        const { EXP, EDU, SKILLS, CERT, INTEL, TIMELINE, INTERVIEWS, DOCUMENTS } = tabIndices;

        return (
          <Box
            sx={{
              border: `0.5px solid ${C.border}`,
              borderRadius: "14px",
              backgroundColor: "#fff",
              p: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Tabs row + action buttons (Shortlist/Reject, Interview/Select/Reject,
                Release Offer, or Revoke/Offer Accepted/Offer Rejected) */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: "20px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                sx={{
                  ...TAB_SX,
                  mb: 0,
                  px: 0,
                  "& .MuiTabs-indicator": {
                    backgroundColor: C.accent,
                    height: 2,
                    bottom: 0,
                  },
                }}
              >
                <Tab
                  icon={<WorkOutlineOutlined sx={{ fontSize: 14 }} />}
                  iconPosition="start"
                  label={
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: "5px" }}
                    >
                      Experience{" "}
                      {expCount > 0 && (
                        <Box
                          component="span"
                          sx={{
                            fontSize: 11,
                            fontWeight: 700,
                            backgroundColor:
                              activeTab === 0 ? C.accent : "#E5E7EB",
                            color: activeTab === 0 ? "#fff" : "#6B7280",
                            borderRadius: "999px",
                            px: "6px",
                            py: "1px",
                            lineHeight: 1.6,
                          }}
                        >
                          {expCount}
                        </Box>
                      )}
                    </Box>
                  }
                />
                <Tab
                  icon={<SchoolOutlinedIcon sx={{ fontSize: 14 }} />}
                  iconPosition="start"
                  label={
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: "5px" }}
                    >
                      Education{" "}
                      {eduCount > 0 && (
                        <Box
                          component="span"
                          sx={{
                            fontSize: 11,
                            fontWeight: 700,
                            backgroundColor:
                              activeTab === 1 ? C.accent : "#E5E7EB",
                            color: activeTab === 1 ? "#fff" : "#6B7280",
                            borderRadius: "999px",
                            px: "6px",
                            py: "1px",
                            lineHeight: 1.6,
                          }}
                        >
                          {eduCount}
                        </Box>
                      )}
                    </Box>
                  }
                />
                <Tab
                  icon={<PsychologyOutlinedIcon sx={{ fontSize: 14 }} />}
                  iconPosition="start"
                  label={
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: "5px" }}
                    >
                      Skills{" "}
                      {skillCount > 0 && (
                        <Box
                          component="span"
                          sx={{
                            fontSize: 11,
                            fontWeight: 700,
                            backgroundColor:
                              activeTab === 2 ? C.accent : "#E5E7EB",
                            color: activeTab === 2 ? "#fff" : "#6B7280",
                            borderRadius: "999px",
                            px: "6px",
                            py: "1px",
                            lineHeight: 1.6,
                          }}
                        >
                          {skillCount}
                        </Box>
                      )}
                    </Box>
                  }
                />
                {certCount > 0 && (
                  <Tab
                    icon={<InsertDriveFileOutlinedIcon sx={{ fontSize: 14 }} />}
                    iconPosition="start"
                    label={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: "5px" }}
                      >
                        Certifications{" "}
                        <Box
                          component="span"
                          sx={{
                            fontSize: 11,
                            fontWeight: 700,
                            backgroundColor:
                              activeTab === 3 ? C.accent : "#E5E7EB",
                            color: activeTab === 3 ? "#fff" : "#6B7280",
                            borderRadius: "999px",
                            px: "6px",
                            py: "1px",
                            lineHeight: 1.6,
                          }}
                        >
                          {certCount}
                        </Box>
                      </Box>
                    }
                  />
                )}
                {hasSkillIntel && (
                  <Tab
                    icon={<TrendingUpIcon sx={{ fontSize: 14 }} />}
                    iconPosition="start"
                    label="Skill Intel"
                  />
                )}
                <Tab
                  icon={<TrendingUpIcon sx={{ fontSize: 14 }} />}
                  iconPosition="start"
                  label="Timeline"
                />
                {/* <Tab icon={<CalendarMonthOutlinedIcon sx={{ fontSize: 14 }} />} iconPosition="start" label="Interviews" />
              <Tab icon={<InsertDriveFileOutlinedIcon sx={{ fontSize: 14 }} />} iconPosition="start" label="Documents" /> */}
              </Tabs>

              {/* Shortlist/Reject, Interview/Select/Reject, Release Offer, or
                  Revoke/Accepted/Rejected offer buttons — driven by candidate status */}
              <CandidateActionButtons
                status={enriched.status}
                onShortlist={() =>
                  setStatusModal({ open: true, action: "shortlisted" })
                }
                onReject={() =>
                  setStatusModal({ open: true, action: "rejected" })
                }
                onInterview={() => setScheduleModalOpen(true)}
                onSelect={() =>
                  setStatusModal({ open: true, action: "selected" })
                }
                onReleaseOffer={() =>
                  setStatusModal({ open: true, action: "offer_released" })
                }
                onRevokeOffer={() =>
                  setStatusModal({ open: true, action: "offer_revoked" })
                }
                onOfferAccepted={() =>
                  setStatusModal({ open: true, action: "offer_accepted" })
                }
                onOfferRejected={() =>
                  setStatusModal({ open: true, action: "offer_rejected" })
                }
              />
            </Box>

            <Box sx={{ mt: -1 }}>
              {activeTab === EXP && <ExperienceTab candidate={enriched} />}
              {activeTab === EDU && <EducationTab candidate={enriched} />}
              {activeTab === SKILLS && (
                <SkillsTab candidate={enriched} showCerts={false} />
              )}
              {CERT !== -1 && activeTab === CERT && (
                <SkillsTab candidate={enriched} />
              )}
              {INTEL !== -1 && activeTab === INTEL && (
                <SkillIntelTab candidate={enriched} />
              )}
              {activeTab === TIMELINE && (
                <TimelineTab
                  candidate={enriched}
                  onInterviewClick={handleInterviewDetails}
                  onUpdateInterviewStatus={handleOpenInterviewStatusModal}
                  onRescheduleInterview={handleRescheduleClick}
                  onUpdateInterviewResult={handleUpdateInterviewResult}
                  onViewFeedback={handleViewFeedback}
                  interviewStatusOverrides={interviewStatusOverrides}
                  interviewResultOverrides={interviewResultOverrides}
                  interviewTimeOverrides={interviewTimeOverrides}
                />
              )}
              {/* {activeTab === INTERVIEWS && <InterviewsTab candidate={enriched} />}
            {activeTab === DOCUMENTS && <DocumentsTab candidate={enriched} />} */}
            </Box>
          </Box>
        );
      })()}

      {/* ── Interview details Dialog (redesigned) ── */}
      <InterviewDetailsModal
        open={interviewModalOpen}
        onClose={() => setInterviewModalOpen(false)}
        selectedInterview={selectedInterview}
        isFetching={isFetching}
        onEdit={handleEditFromDetails}
      />
      <InterviewFeedbackModal
        open={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        interview={feedbackInterview}
        feedbackItems={feedbackItems}
        isFetching={isFetchingFeedback}
      />
      {/* ── Shortlist / Reject / Select / Offer confirmation modal (shared) ── */}
      <StatusConfirmModal
        open={statusModal.open}
        action={statusModal.action}
        onClose={() =>
          !statusUpdating && setStatusModal({ open: false, action: null })
        }
        onConfirm={handleConfirmStatus}
        loading={statusUpdating}
      />

      {/* ── Schedule Interview modal (fresh schedule — always starts blank) ── */}
      <ScheduleInterviewModal
        open={scheduleModalOpen}
        candidate={enriched}
        allSkillOptions={allSkillOptions}
        onClose={() => !schedulingInterview && setScheduleModalOpen(false)}
        onSchedule={handleScheduleInterview}
        loading={schedulingInterview}
        orgId={orgId}
        matched_candidate_id={matched_candidate_id}
        isReschedule={false}
      />

      {/* ── Reschedule Interview modal (same UI, prefilled with the
          interview's saved values, submits through rescheduleInterview
          keyed by interviewId) ── */}
      <ScheduleInterviewModal
        open={rescheduleModalOpen}
        candidate={enriched}
        allSkillOptions={allSkillOptions}
        onClose={() => {
          if (reschedulingInterview) return;
          setRescheduleModalOpen(false);
          setRescheduleTarget(null);
        }}
        onSchedule={handleConfirmReschedule}
        loading={reschedulingInterview}
        orgId={orgId}
        matched_candidate_id={matched_candidate_id}
        isReschedule={true}
        interviewId={rescheduleTarget?.interviewId}
        initialData={rescheduleTarget}
      />

      {/* ── Snackbar (Schedule / Reschedule / Status update / Interview outcome) ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((t) => ({ ...t, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: "10px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}