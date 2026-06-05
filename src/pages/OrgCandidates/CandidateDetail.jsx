// src/pages/OrgCandidates/CandidateDetail.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
} from "../../redux/services/requisition/requisition";
import {
  PersonOutlineOutlined,
  WorkOutlineOutlined,
  EmailOutlined,
  PhoneOutlined,
  AccessTimeOutlined,
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

const STAGE_GROUP = {
  matched: "matched",
  shortlisted: "shortlisted",
  interview_scheduled: "interviewing",
  interview_completed: "interviewing",
  interview_passed: "interviewing",
  interview_failed: "interviewing",
  selected: "selected",
  offer_released: "offer",
  offer_revoked: "offer",
  offer_accepted: "offer",
  offer_declined: "offer",
  hired: "hired",
};

const SUB_LABEL = {
  interview_scheduled: "scheduled",
  interview_completed: "completed",
  interview_passed: "passed",
  interview_failed: "failed",
  offer_released: "released",
  offer_revoked: "revoked",
  offer_accepted: "accepted",
  offer_declined: "declined",
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

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
function fmtDateIST(iso) {
  return new Date(iso).toLocaleString("en-IN", {
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

function groupState(groupKey, entries, currentStage) {
  const groupEntries = entries.filter(
    (e) => STAGE_GROUP[e.stage?.toLowerCase()] === groupKey,
  );
  if (!groupEntries.length) return "pending";

  const hasFailed = groupEntries.some((e) =>
    ["offer_revoked", "interview_failed"].includes(e.stage),
  );
  if (hasFailed) return "failed";

  const groupKeys = STAGE_CONFIG.map((s) => s.key);
  const curGroup = STAGE_GROUP[currentStage?.toLowerCase()] ?? "";
  const curIdx = groupKeys.indexOf(curGroup);
  const thisIdx = groupKeys.indexOf(groupKey);

  if (curIdx !== -1) {
    if (thisIdx < curIdx) return "completed";
    if (thisIdx === curIdx) return "current";
    return "pending";
  }

  const groupsWithEntries = groupKeys.filter((gk) =>
    entries.some((e) => STAGE_GROUP[e.stage?.toLowerCase()] === gk),
  );
  const lastGroupWithEntries = groupsWithEntries[groupsWithEntries.length - 1];
  const lastIdx = groupKeys.indexOf(lastGroupWithEntries);

  if (thisIdx < lastIdx) return "completed";
  if (thisIdx === lastIdx) return "current";
  return "pending";
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

function StatusBadge({ state }) {
  if (state === "pending") return null;
  const map = {
    completed: { label: "Completed", bg: "#E7F8EE", color: "#0F6E56" },
    current: { label: "In Progress", bg: "#FFF0E8", color: "#FF5F1F" },
    failed: { label: "Failed", bg: "#FEE2E2", color: "#DC2626" },
  };
  const s = map[state];
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: "10px",
        py: "2px",
        borderRadius: "999px",
        backgroundColor: s.bg,
        ml: "8px",
        fontSize: 11,
        fontWeight: 700,
        color: s.color,
      }}
    >
      {s.label}
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

function RadarChart({ scoreIntel, size = 400 }) {
  if (!scoreIntel?.length) return null;

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

// Usage example:
// const data = [
//   { skill: "JavaScript", candidate: 80, desired: 90 },
//   { skill: "React",      candidate: 70, desired: 85 },
//   { skill: "Node.js",    candidate: 65, desired: 75 },
//   { skill: "CSS",        candidate: 90, desired: 80 },
//   { skill: "Testing",    candidate: 55, desired: 70 },
//   { skill: "TypeScript", candidate: 60, desired: 85 },
// ];
// <RadarChart scoreIntel={data} size={400} />

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
                border: "1px solid #FFD6C7",
                borderRadius: "14px",
                backgroundColor: "#FFFAF7",
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

                  // mb: 2,
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

      {/* {Object.keys(skillNotes).length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {Object.entries(skillNotes).map(([key, note]) => {
            const noteText =
              typeof note === "object" && note !== null ? note.value : note;
            if (!noteText) return null;
            return (
              <Box key={key} sx={{ display: "flex", gap: "6px" }}>
                <Typography
                  color={C.textPrimary}
                  sx={{
                    minWidth: "fit-content",
                    fontWeight: T.labelFontWeight,
                    fontSize: 14,
                  }}
                >
                  {key} :
                </Typography>
                <Typography sx={{ fontSize: 14 }} lineHeight={1.65}>
                  {noteText}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )} */}
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
                      ml: "auto", // pushes badge to right
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

                {/* Match % */}
                {/* <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    px: "7px",
                    py: "3px",
                    borderRadius: "999px",
                    backgroundColor: badgeBg,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: barColor,
                      lineHeight: 1,
                    }}
                  >
                    {pct}%
                  </Typography>
                </Box> */}
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
        // border: `1px solid ${C.border}`,
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

/* ═══════════════════════════════════════════════
   TIMELINE TAB
═══════════════════════════════════════════════ */
function TimelineTab({ candidate, onInterviewClick }) {
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

  const entries = data?.data ?? [];
  console.log("Timeline entries:", entries);
  const grouped = {};
  entries.forEach((e) => {
    const g = STAGE_GROUP[e.stage?.toLowerCase()];
    if (!g) return;
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(e);
  });

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
            const state = groupState(stage.key, entries, currentStage);
            const firstEntry = stageEntries[0];

            const subEntries = stageEntries.filter((e) => SUB_LABEL[e.stage]);
            console.log("subEntries", subEntries);
            const hasSubEntries = subEntries.length > 0;

            const interviewEntry = stageEntries.filter(
              (entry) => entry.interview_id,
            );
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
                  key={stage.key}
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
                      width: "100%",
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
                      <StatusBadge state={state} />
                    </Box>
                    {stage.key !== "interviewing" && (
                      <>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography
                            sx={{
                              fontSize: 11,
                              fontWeight: 500,
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
                            {fmtDateIST(firstEntry.created_at)}
                          </Typography>
                        </Box>

                        {firstEntry.triggered_by && (
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography
                              sx={{
                                fontSize: 11,
                                fontWeight: 500,
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
                              {firstEntry.triggered_by}
                            </Typography>
                          </Box>
                        )}
                      </>
                    )}
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
                        {subEntries.map((sub, si) => {
                          const subState =
                            sub.stage === "offer_revoked" ||
                            sub.stage === "interview_failed"
                              ? "failed"
                              : "completed";
                          const isLastInterviewEntry =
                            sub.interview_id &&
                            si ===
                              subEntries
                                .map((e, index) => ({ ...e, index }))
                                .filter((e) => e.interview_id)
                                .slice(-1)[0]?.index;
                          return (
                            <Box
                              key={si}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "10px",
                                // border:1,
                                width: "100%",
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
                                <SubStageCircle state={subState} size={20} />
                                <Box>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: "#374151",
                                      }}
                                    >
                                      {sub.step_number
                                        ? `Round ${sub.step_number} — `
                                        : ""}
                                    </Typography>
                                    <Typography
                                      sx={{
                                        fontSize: 14,
                                        fontWeight: 500,
                                        color: "#6B7280",
                                        ml: 1,
                                      }}
                                    >
                                      {SUB_LABEL[sub.stage] ??
                                        sub.stage.replace(/_/g, " ")}
                                    </Typography>
                                  </Box>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontSize: 12,
                                        fontWeight: 500,
                                        color: "#9CA3AF",
                                      }}
                                    >
                                      IST :
                                    </Typography>

                                    <Typography
                                      sx={{
                                        fontSize: 12,
                                        fontWeight: 500,
                                        ml: 1,
                                        color: "#9CA3AF",
                                      }}
                                    >
                                      {fmtDateIST(sub.created_at)}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                              <Box>
                                {sub.interview_id && (
                                  <Button
                                    startIcon={
                                      <VisibilityIcon
                                        sx={{ fontSize: "13px !important" }}
                                      />
                                    }
                                    variant="outlined"
                                    onClick={() =>
                                      onInterviewClick(sub.interview_id)
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
                                )}
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    )}
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
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);

  const [selectedInterview, setSelectedInterview] = useState(null);

  const [getInterviewDetails, { isFetching }] =
    useLazyGetInterviewDetailsQuery();
  const handleInterviewDetails = async (interviewId) => {
    try {
      const response = await getInterviewDetails(interviewId).unwrap();

      setSelectedInterview(response.data);

      setInterviewModalOpen(true);
    } catch (error) {
      console.error(error);
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
  const certCount = enriched.certifications?.length ?? 0;
  const hasSkillIntel =
    (enriched.score_intel ?? []).length > 0 ||
    enriched.skill_info?.[0]?.summary ||
    Object.keys(enriched.skill_notes ?? {}).length > 0;

  // ── Top skills chips (matched mandatory/primary) ──
  const topSkillChips = (() => {
    const mandatory = enriched.matched_mandatory_skills ?? [];
    const primary = enriched.matched_primary_skills ?? [];
    const combined = [
      ...mandatory.map((s) => ({ label: s, type: "mandatory" })),
      ...primary.map((s) => ({ label: s, type: "primary" })),
    ];
    return combined.slice(0, 5);
  })();

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
                
                <Person2OutlinedIcon sx={{ fontSize: 16, color: "#FF5722",cursor:"pointer" }} onClick={() => {
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
             
              <Box sx={{display:"flex",alignItems:"center",gap:"5px"}}>
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
                    ml:1
                  }}
                >
                  CLIN{enriched.clin_id}
                  
                </Typography>
              )}
            </Box>

            {/* Skill match chips */}
            {/* {topSkillChips.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  mt: "8px",
                }}
              >
                {topSkillChips.map(({ label, type }) => (
                  <Chip
                    key={label}
                    label={label}
                    size="small"
                    sx={{
                      fontSize: 11,
                      height: 22,
                      fontWeight: 500,
                      backgroundColor:
                        type === "mandatory"
                          ? "#FFF0E8"
                          : type === "primary"
                            ? "#EFF6FF"
                            : "#F3F4F6",
                      color:
                        type === "mandatory"
                          ? C.accent
                          : type === "primary"
                            ? "#2563EB"
                            : "#374151",
                      border: `1px solid ${type === "mandatory" ? "#FFCFB3" : type === "primary" ? "#BFDBFE" : "#E5E7EB"}`,
                      borderRadius: "6px",
                      "& .MuiChip-label": { px: "8px" },
                    }}
                  />
                ))}
              </Box>
            )} */}
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
        // Dynamic tab index mapping (certifications and skillintel are conditional)
        let idx = 0;
        const EXP = idx++;
        const EDU = idx++;
        const SKILLS = idx++;
        const CERT = certCount > 0 ? idx++ : -1;
        const INTEL = hasSkillIntel ? idx++ : -1;
        const TIMELINE = idx++;
        const INTERVIEWS = idx++;
        const DOCUMENTS = idx++;

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
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{
                ...TAB_SX,
                mb: 0,
                px: "20px",
                // borderTop: `1px solid ${C.border}`,
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
            <Box sx={{ mt: -1 }}>
              {activeTab === EXP && <ExperienceTab candidate={enriched} />}
              {activeTab === EDU && <EducationTab candidate={enriched} />}
              {activeTab === SKILLS && (
                <SkillsTab candidate={enriched} showCerts={false} />
              )}
              {CERT !== -1 && activeTab === CERT && (
                <CertificationsTab candidate={enriched} />
              )}
              {INTEL !== -1 && activeTab === INTEL && (
                <SkillIntelTab candidate={enriched} />
              )}
              {activeTab === TIMELINE && (
                <TimelineTab
                  candidate={enriched}
                  onInterviewClick={handleInterviewDetails}
                />
              )}
              {/* {activeTab === INTERVIEWS && <InterviewsTab candidate={enriched} />}
            {activeTab === DOCUMENTS && <DocumentsTab candidate={enriched} />} */}
            </Box>
          </Box>
        );
      })()}
      <Dialog
        open={interviewModalOpen}
        onClose={() => setInterviewModalOpen(false)}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: 480,
            maxWidth: "95vw",
            minWidth: 0,
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
          },
        }}
      >
        {selectedInterview && (
          <>
            {/* HEADER */}
            <Box sx={{ px: 2.5, pt: 2.5, pb: 2, bgcolor: "background.paper" }}>
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 700,
                  mb: 1.5,
                  color: "#111827",
                }}
              >
                Interview Details
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  icon={<CalendarMonthOutlinedIcon sx={{ fontSize: 13 }} />}
                  label={selectedInterview.interview_step_name ?? "Round-1"}
                  size="small"
                  sx={{
                    bgcolor: "#FFF7ED",
                    color: "#B45309",
                    border: "1px solid #FED7AA",
                    borderRadius: "20px",
                    fontSize: 12,
                    fontWeight: 500,
                    height: 26,
                    "& .MuiChip-icon": { color: "#B45309", ml: "8px" },
                  }}
                />
                <Chip
                  icon={<PhoneOutlined sx={{ fontSize: 13 }} />}
                  label={selectedInterview.interview_step_type ?? "Telephonic"}
                  size="small"
                  sx={{
                    bgcolor: "#ECFDF5",
                    color: "#065F46",
                    border: "1px solid #A7F3D0",
                    borderRadius: "20px",
                    fontSize: 12,
                    fontWeight: 500,
                    height: 26,
                    "& .MuiChip-icon": { color: "#065F46", ml: "8px" },
                  }}
                />
                <Chip
                  label={selectedInterview.status}
                  size="small"
                  sx={{
                    bgcolor:
                      selectedInterview.status === "Cancelled"
                        ? "#FEF2F2"
                        : "#ECFDF5",
                    color:
                      selectedInterview.status === "Cancelled"
                        ? "#991B1B"
                        : "#065F46",
                    border: `1px solid ${selectedInterview.status === "Cancelled" ? "#FECACA" : "#A7F3D0"}`,
                    borderRadius: "20px",
                    fontSize: 12,
                    fontWeight: 500,
                    height: 26,
                  }}
                />
              </Stack>
            </Box>

            {/* CANDIDATE ROW */}
            <Box sx={{ px: 2.5, pb: 1.5 }}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: "#E6F1FB",
                    color: "#185FA5",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {selectedInterview.candidate_name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography
                    sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}
                  >
                    {selectedInterview.candidate_name}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
                    {selectedInterview.candidate_experience}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Divider />

            <DialogContent
              sx={{
                p: 0,
                bgcolor: "#fff",
                // ✅ THIS is the critical fix — constrain width hard
                width: 480,
                maxWidth: "95vw",
                overflowX: "hidden", // ✅ blocks horizontal expansion
                overflowY: "auto", // ✅ allows vertical scroll
              }}
            >
              {isFetching ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {/* DATE / TIME / PLATFORM */}
                  <Box
                    sx={{
                      px: 2.5,
                      py: 1.5,
                      // ✅ Hard clamp so children cannot push width
                      width: "100%",
                      boxSizing: "border-box",
                      overflow: "hidden",
                    }}
                  >
                    <Stack spacing={1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarMonthOutlinedIcon
                          sx={{ fontSize: 15, color: "#6B7280", flexShrink: 0 }}
                        />
                        <Typography sx={{ fontSize: 13, color: "#111827" }}>
                          {selectedInterview.date}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <AccessTimeOutlined
                          sx={{ fontSize: 15, color: "#6B7280", flexShrink: 0 }}
                        />
                        <Typography sx={{ fontSize: 13, color: "#111827" }}>
                          {selectedInterview.start_time} –{" "}
                          {selectedInterview.end_time} (
                          {selectedInterview.duration} Min)
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <WorkOutlineOutlined
                          sx={{ fontSize: 15, color: "#6B7280", flexShrink: 0 }}
                        />
                        <Typography sx={{ fontSize: 13, color: "#111827" }}>
                          Platform: {selectedInterview.platform}
                        </Typography>
                      </Stack>

                      {/* ✅ URL — fully contained, truncates with ellipsis */}
                      {selectedInterview.meeting_url && (
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{
                            width: "100%",
                            // ✅ These two together are the real fix
                            minWidth: 0,
                            overflow: "hidden",
                          }}
                        >
                          <InsertDriveFileOutlinedIcon
                            sx={{
                              fontSize: 15,
                              color: "#185FA5",
                              flexShrink: 0,
                            }}
                          />
                          <Box
                            component="a"
                            href={selectedInterview.meeting_url}
                            target="_blank"
                            title={selectedInterview.meeting_url}
                            sx={{
                              fontSize: 13,
                              color: "#185FA5",
                              textDecoration: "none",
                              // ✅ Block + overflow = text clips at container edge
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              // ✅ Must have minWidth:0 and flex:1 together
                              minWidth: 0,
                              flex: 1,
                              "&:hover": { textDecoration: "underline" },
                            }}
                          >
                            {selectedInterview.meeting_url}
                          </Box>
                        </Stack>
                      )}
                    </Stack>
                  </Box>

                  <Divider />

                  {/* PRIMARY INTERVIEWER */}
                  <Box sx={{ px: 2.5, py: 1.5 }}>
                    <Stack
                      direction="row"
                      spacing={0.8}
                      alignItems="center"
                      mb={1.2}
                    >
                      <PersonOutlineOutlined
                        sx={{ fontSize: 16, color: "#6B7280" }}
                      />
                      <Typography
                        sx={{ fontSize: 13, fontWeight: 600, color: "#111827" }}
                      >
                        Primary Interviewer
                      </Typography>
                    </Stack>
                    <Box spacing={1} sx={{ ml: 2.5 }}>
                      {selectedInterview.primary_interviewer?.name && (
                        <Stack direction="row" justifyContent="space-between">
                          <Typography sx={{ fontSize: 13 }}>
                            {selectedInterview.primary_interviewer.name}
                          </Typography>
                          <Typography
                            sx={{ ml: 2, fontSize: 12, color: "#6B7280" }}
                          >
                            Primary Interviewer
                          </Typography>
                        </Stack>
                      )}
                      {selectedInterview.created_by?.name && (
                        <Stack direction="row" justifyContent="space-between">
                          <Typography sx={{ fontSize: 13 }}>
                            {selectedInterview.created_by.name}
                          </Typography>
                          <Typography
                            sx={{ ml: 2, fontSize: 12, color: "#6B7280" }}
                          >
                            Created By
                          </Typography>
                        </Stack>
                      )}
                    </Box>
                  </Box>

                  <Divider />

                  {/* JOB DETAILS */}
                  <Box sx={{ px: 2.5, py: 1.5 }}>
                    <Stack
                      direction="row"
                      spacing={0.8}
                      alignItems="center"
                      mb={1.2}
                    >
                      <WorkOutlineOutlined
                        sx={{ fontSize: 16, color: "#6B7280" }}
                      />
                      <Typography
                        sx={{ fontSize: 13, fontWeight: 600, color: "#111827" }}
                      >
                        Job Details
                      </Typography>
                    </Stack>
                    <Box spacing={1} sx={{ ml: 2.5 }}>
                      {[
                        {
                          label: "Round",
                          value: selectedInterview.interview_step_name,
                        },
                        {
                          label: "Type",
                          value: selectedInterview.interview_step_type,
                        },
                        {
                          label: "Duration",
                          value: selectedInterview.duration
                            ? `${selectedInterview.duration} mins`
                            : null,
                        },
                      ].map(({ label, value }) =>
                        value ? (
                          <Stack
                            key={label}
                            direction="row"
                            justifyContent="space-between"
                          >
                            <Typography sx={{ fontSize: 13, color: "#6B7280" }}>
                              {label}
                            </Typography>
                            <Typography
                              sx={{ ml: 2, fontSize: 13, color: "#111827" }}
                            >
                              {value}
                            </Typography>
                          </Stack>
                        ) : null,
                      )}
                    </Box>
                  </Box>
                </>
              )}
            </DialogContent>

            {/* FOOTER */}
            <DialogActions
              sx={{
                px: 2.5,
                py: 1.8,
                borderTop: "1px solid #E5E7EB",
                bgcolor: "#fff",
                gap: 1,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => setInterviewModalOpen(false)}
                sx={{
                  flex: 1,
                  textTransform: "none",
                  borderRadius: "10px",
                  fontWeight: 500,
                  fontSize: 14,
                  color: "#111827",
                  borderColor: "#E5E7EB",
                }}
              >
                Close
              </Button>
              {/* <Button
                variant="contained"
                href={selectedInterview.meeting_url}
                target="_blank"
                disabled={!selectedInterview.meeting_url}
                sx={{
                  flex: 2,
                  textTransform: "none",
                  borderRadius: "10px",
                  fontWeight: 500,
                  fontSize: 14,
                  background:
                    "linear-gradient(90deg, #4F6EF7 0%, #6C8EFF 100%)",
                  boxShadow: "none",
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #3B5BE3 0%, #5A7AEF 100%)",
                    boxShadow: "none",
                  },
                }}
              >
                Reschedule
              </Button> */}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
