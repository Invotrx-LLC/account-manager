// src/pages/OrgCandidates/CandidateDetail.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Grid,
  Divider,
  Chip,
  Button,
  Avatar,
  Collapse,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import CodeIcon from "@mui/icons-material/Code";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useDispatch } from "react-redux";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import {
  setDynamicLabels,
  clearDynamicLabels,
} from "../../redux/slices/breadcrumbSlice";
import {
  useGetCandidateDetailQuery,
  useGetCandidateStageTimelineQuery,
} from "../../redux/services/requisition/requisition";
import {
  PersonOutlineOutlined,
  WorkOutlineOutlined,
} from "@mui/icons-material";

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

/**
 * STATE_COLORS
 * ─────────────────────────────────────────────────────
 * completed → green   (#22C55E)
 * current   → orange  (#FF5F1F)  — the brand accent
 * failed    → red     (#EF4444)
 * pending   → grey outline only (no fill)
 *
 * Each entry: { bg, border, icon }
 *   bg     = circle fill
 *   border = circle stroke / ring
 *   icon   = checkmark stroke color
 */
const STATE_COLORS = {
  completed: { bg: "#22C55E", border: "#22C55E", icon: "#fff" },
  current:   { bg: "#FF5F1F", border: "#FF5F1F", icon: "#fff" },
  failed:    { bg: "#EF4444", border: "#EF4444", icon: "#fff" },
  pending:   { bg: "#F9FAFB", border: "#D1D5DB", icon: "#D1D5DB" },
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

/* ── Typography scale ── */
const T = {
  labelFontWeight: 600,
  labelSize: 14,
  valueSize: 13,
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

  // Try currentStage from API first
  const curGroup = STAGE_GROUP[currentStage?.toLowerCase()] ?? "";
  const curIdx = groupKeys.indexOf(curGroup);
  const thisIdx = groupKeys.indexOf(groupKey);

  if (curIdx !== -1) {
    // API gave us a valid current stage
    if (thisIdx < curIdx) return "completed";
    if (thisIdx === curIdx) return "current";
    return "pending";
  }

  // Fallback: derive current stage from the timeline entries themselves.
  // The "current" group is the one with the highest index that has entries.
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
   SMALL SHARED COMPONENTS
═══════════════════════════════════════════════ */

/** Checkmark SVG — stroke colour driven by caller */
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

/**
 * StageCircle
 * ─────────────────────────────────────────────
 * Renders the coloured dot for a timeline stage.
 *
 * state: "completed" | "current" | "failed" | "pending"
 *
 * Visual spec:
 *   completed → solid green fill, white tick, subtle green glow ring
 *   current   → solid orange fill, white tick, subtle orange glow ring
 *   failed    → solid red fill, white X mark, subtle red glow ring
 *   pending   → white/light-grey fill, grey border, grey tick (dimmed)
 */
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
        /* smooth colour transition when stage updates */
        transition: "background-color 0.3s, border-color 0.3s, box-shadow 0.3s",
      }}
    >
      {state === "failed" ? (
        /* X mark for failed stages */
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

/**
 * SubStageCircle
 * ─────────────────────────────────────────────
 * Smaller version for sub-entries (interview rounds, offer events).
 */
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
    current:   { label: "In Progress", bg: "#FFF0E8", color: "#FF5F1F" },
    failed:    { label: "Failed",      bg: "#FEE2E2", color: "#DC2626" },
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

/* ── Connector line between stages ── */
function ConnectorLine({ state, minHeight }) {
  /* Use the completed colour for lines that belong to done stages */
  const lineColor =
    state === "completed" ? "#22C55E"
    : state === "current"  ? "#FF5F1F"
    : state === "failed"   ? "#EF4444"
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
   ACCORDION WRAPPER
═══════════════════════════════════════════════ */
function Accordion({
  icon,
  title,
  iconColor = C.teal,
  defaultOpen = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Box
      sx={{
        border: `1px solid ${C.border}`,
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: "#fff",
        mb: "12px",
      }}
    >
      <Box
        onClick={() => setOpen((p) => !p)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: "20px",
          py: "16px",
          cursor: "pointer",
          userSelect: "none",
          "&:hover": { backgroundColor: "#FAFAFA" },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Box sx={{ color: iconColor, display: "flex", alignItems: "center" }}>
            {icon}
          </Box>
          <Typography fontSize={T.labelSize} fontWeight={700} color={C.textPrimary}>
            {title}
          </Typography>
        </Box>
        {open ? (
          <ExpandLessIcon sx={{ fontSize: 20, color: "#9CA3AF" }} />
        ) : (
          <ExpandMoreIcon sx={{ fontSize: 20, color: "#9CA3AF" }} />
        )}
      </Box>

      <Collapse in={open}>
        <Box
          sx={{
            px: "20px",
            pb: "20px",
            borderTop: `1px solid ${C.border}`,
            pt: "16px",
          }}
        >
          {children}
        </Box>
      </Collapse>
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   RADAR CHART
═══════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════
   RADAR CHART
═══════════════════════════════════════════════ */
function RadarChart({ scoreIntel, size = 500 }) {
  if (!scoreIntel?.length) return null;

  const [hoveredIndex, setHoveredIndex] = useState(null);

  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.34;
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

  const hovered = hoveredIndex !== null ? scoreIntel[hoveredIndex] : null;
  const hoveredPt = hoveredIndex !== null ? candidatePts[hoveredIndex] : null;

  // tooltip position — keep it inside the SVG box
  const getTooltipPos = (pt) => {
    if (!pt) return { x: 0, y: 0 };
    let tx = pt.x + 12;
    let ty = pt.y - 36;
    if (tx + 140 > size) tx = pt.x - 152;
    if (ty < 4) ty = pt.y + 12;
    return { x: tx, y: ty };
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* ── top legend row ── */}
      <Box sx={{ display: "flex", gap: "20px", mb: "8px", alignSelf: "flex-end" }}>
        {[
          { dot: "#818CF8", label: "Candidate" },
          { dot: "#22C55E", label: "Desired" },
        ].map(({ dot, label }) => (
          <Box key={label} sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: dot }} />
            <Typography fontSize={T.valueSize} color={C.textSecondary}>{label}</Typography>
          </Box>
        ))}
        {/* <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Typography fontSize={T.valueSize} fontWeight={700} color={C.textPrimary}>
            All Skills ({scoreIntel.length})
          </Typography>
          <FilterListIcon sx={{ fontSize: 13, color: "#9CA3AF" }} />
        </Box> */}
      </Box>

      {/* ── SVG ── */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: "visible" }}
      >
        {/* grid polygons */}
        {Array.from({ length: levels }, (_, i) => (
          <polygon
            key={i}
            points={gridPoly(i + 1)}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="1"
          />
        ))}

        {/* axis lines */}
        {scoreIntel.map((_, i) => {
          const end = polar(100, i);
          return (
            <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y}
              stroke="#E5E7EB" strokeWidth="1" />
          );
        })}

        {/* desired area */}
        <path d={toPath(desiredPts)} fill="rgba(34,197,94,0.12)"
          stroke="#22C55E" strokeWidth="1.5" />

        {/* candidate area */}
        <path d={toPath(candidatePts)} fill="rgba(129,140,248,0.25)"
          stroke="#818CF8" strokeWidth="2" />

        {/* skill labels */}
        {scoreIntel.map((d, i) => {
          const labelR = R + 26;
          const lx = cx + labelR * Math.cos(angle(i));
          const ly = cy + labelR * Math.sin(angle(i));
          const anchor = Math.abs(lx - cx) < 5 ? "middle" : lx < cx ? "end" : "start";
          const label = d.skill.length > 13 ? d.skill.slice(0, 12) + "…" : d.skill;
          const isHovered = hoveredIndex === i;

          return (
            <text
              key={i}
              x={lx}
              y={ly}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize={isHovered ? "11" : "10"}
              fontWeight={isHovered ? "700" : "600"}
              fill={isHovered ? "#818CF8" : C.textSecondary}
              style={{ cursor: "default", transition: "all 0.15s" }}
            >
              {label}
            </text>
          );
        })}

        {/* grid level labels */}
        {Array.from({ length: levels }, (_, i) => {
          const r = ((i + 1) / levels) * R;
          return (
            <text key={i} x={cx + 3} y={cy - r + 4} fontSize="8" fill="#9CA3AF">
              {(i + 1) * 20}
            </text>
          );
        })}

        {/* candidate dots — hover target */}
        {candidatePts.map((p, i) => (
          <g key={i}>
            {/* invisible larger hit area */}
            <circle
              cx={p.x} cy={p.y} r={14}
              fill="transparent"
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
            {/* visible dot */}
            <circle
              cx={p.x} cy={p.y}
              r={hoveredIndex === i ? 6 : 4}
              fill={hoveredIndex === i ? "#6366F1" : "#818CF8"}
              stroke={hoveredIndex === i ? "#fff" : "none"}
              strokeWidth="2"
              style={{
                transition: "r 0.15s, fill 0.15s",
                pointerEvents: "none",
              }}
            />
          </g>
        ))}

        {/* tooltip box — rendered last so it's on top */}
        {hovered && hoveredPt && (() => {
          const { x: tx, y: ty } = getTooltipPos(hoveredPt);
          const boxW = 148;
          const boxH = 58;

          return (
            <g style={{ pointerEvents: "none" }}>
              {/* drop shadow filter */}
              <defs>
                <filter id="tt-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3"
                    floodColor="rgba(0,0,0,0.15)" />
                </filter>
              </defs>

              {/* background card */}
              <rect
                x={tx} y={ty}
                width={boxW} height={boxH}
                rx="8" ry="8"
                fill="#1E293B"
                filter="url(#tt-shadow)"
              />

              {/* skill name */}
              <text x={tx + 10} y={ty + 16}
                fontSize="11" fontWeight="700" fill="#F1F5F9">
                {hovered.skill}
              </text>

              {/* candidate score row */}
              <circle cx={tx + 10} cy={ty + 30} r="4" fill="#818CF8" />
              <text x={tx + 18} y={ty + 34}
                fontSize="10" fill="#94A3B8">
                Candidate:
              </text>
              <text x={tx + 78} y={ty + 34}
                fontSize="10" fontWeight="700" fill="#818CF8">
                {Math.round(hovered.candidate)}%
              </text>

              {/* desired score row */}
              <circle cx={tx + 10} cy={ty + 46} r="4" fill="#22C55E" />
              <text x={tx + 18} y={ty + 50}
                fontSize="10" fill="#94A3B8">
                Desired:
              </text>
              <text x={tx + 78} y={ty + 50}
                fontSize="10" fontWeight="700" fill="#22C55E">
                {Math.round(hovered.desired)}%
              </text>
            </g>
          );
        })()}
      </svg>

      {/* ── bottom legend ── */}
      <Box sx={{ display: "flex", gap: "16px", mt: "4px" }}>
        {[
          { dot: C.accent, label: "Mandatory" },
          { dot: "#6B7280", label: "Secondary" },
        ].map(({ dot, label }) => (
          <Box key={label} sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: dot }} />
            <Typography fontSize={T.valueSize} color={C.textSecondary} fontWeight={600}>
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

 

/* ═══════════════════════════════════════════════
   SKILL INFO SECTION
═══════════════════════════════════════════════ */
function SkillInfoSection({ candidate }) {
  const skillInfo = candidate?.skill_info?.[0] ?? {};
  const scoreIntel = candidate?.score_intel ?? [];
  const skillNotes = candidate?.skill_notes ?? {};
  const summary = skillInfo.summary ?? "";
  const [skillScoresOpen, setSkillScoresOpen] = React.useState(false);

  return (
    <Box>
      {scoreIntel.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: "20px", width: "100%" }}>
          <RadarChart scoreIntel={scoreIntel} size={400} />
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
            <Typography fontSize={T.valueSize} fontWeight={600} color={C.accent}>
              View all skill scores
            </Typography>
          </Box>
        </Box>
      )}

      {summary && (
        <Box sx={{ mb: "16px" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "8px" }}>
            <InsertDriveFileOutlinedIcon sx={{ fontSize: 16, color: C.teal }} />
            <Typography fontSize={T.labelSize} fontWeight={700} color={C.textPrimary}>
              Skills Summary
            </Typography>
          </Box>
          <Typography sx={{ fontSize: T.valueSize }} lineHeight={1.7}>{summary}</Typography>
        </Box>
      )}

      {Object.keys(skillNotes).length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {Object.entries(skillNotes).map(([key, note]) => {
            // note may be a plain string or an object like { value, updated_at, ... }
            const noteText = typeof note === "object" && note !== null ? note.value : note;
            if (!noteText) return null;
            return (
              <Box key={key} sx={{ display: "flex", gap: "6px" }}>
                <Typography
                  color={C.textPrimary}
                  sx={{ minWidth: "fit-content", fontWeight: T.labelFontWeight, fontSize: T.labelSize }}
                >
                  {key} :
                </Typography>
                <Typography sx={{ fontSize: T.valueSize }} lineHeight={1.65}>{noteText}</Typography>
              </Box>
            );
          })}
        </Box>
      )}

      {skillInfo.skillintel_score != null && (
        <Box
          sx={{
            mt: "16px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: C.accentSoft,
            border: "1px solid #FFCFB3",
            borderRadius: "10px",
            px: "14px",
            py: "8px",
          }}
        >
          <TrendingUpIcon sx={{ fontSize: 16, color: C.accent }} />
          <Typography fontSize={T.labelSize} fontWeight={700} color={C.accent}>
            SkillIntel Score:{" "}
            <Box component="span" sx={{ fontSize: T.valueSize, fontWeight: 600 }}>
              {skillInfo.skillintel_score}
            </Box>
          </Typography>
        </Box>
      )}

      {/* Skill Scores Dialog */}
      <Dialog
        open={skillScoresOpen}
        onClose={() => setSkillScoresOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden" } }}
      >
        <DialogTitle
          sx={{
            px: "20px",
            py: "14px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                backgroundColor: C.accentSoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingUpIcon sx={{ fontSize: 16, color: C.accent }} />
            </Box>
            <Box>
              <Typography fontSize={T.labelSize} fontWeight={700} color={C.textPrimary}>
                All Skill Scores
              </Typography>
              <Typography fontSize={T.valueSize} color={C.textSecondary}>
                {scoreIntel.length} skill{scoreIntel.length !== 1 ? "s" : ""} evaluated
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={() => setSkillScoresOpen(false)}
            sx={{ color: "#9CA3AF", "&:hover": { backgroundColor: "#F3F4F6" } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Box
          sx={{
            px: "20px",
            py: "10px",
            borderBottom: `1px solid ${C.border}`,
            backgroundColor: "#FAFAFA",
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          {[
            { dot: "#22C55E", label: "≥ 90% — Strong match" },
            { dot: C.accent, label: "≥ 70% — Good match" },
            { dot: "#EF4444", label: "< 70% — Gap" },
          ].map(({ dot, label }) => (
            <Box key={label} sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: dot }} />
              <Typography fontSize={T.valueSize} color={C.textSecondary}>{label}</Typography>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 90px 90px 64px",
            px: "20px",
            py: "8px",
            backgroundColor: "#F9FAFB",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          {["Skill", "Candidate", "Desired", "Match"].map((h) => (
            <Typography
              key={h}
              fontSize={T.labelSize}
              fontWeight={700}
              color="#9CA3AF"
              sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}
            >
              {h}
            </Typography>
          ))}
        </Box>

        <DialogContent sx={{ p: 0, maxHeight: 420, overflowY: "auto" }}>
          {scoreIntel.map((s, i) => {
            const pct = s.desired > 0 ? Math.round((s.candidate / s.desired) * 100) : 0;
            const barColor = pct >= 90 ? "#22C55E" : pct >= 70 ? C.accent : "#EF4444";
            const isLast = i === scoreIntel.length - 1;
            return (
              <Box
                key={s.skill}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 90px 90px 64px",
                  px: "20px",
                  py: "11px",
                  alignItems: "center",
                  borderBottom: isLast ? "none" : `1px solid #F3F4F6`,
                  backgroundColor: i % 2 === 0 ? "#fff" : "#FAFAFA",
                }}
              >
                <Typography
                  fontSize={T.labelSize}
                  fontWeight={500}
                  color={C.textPrimary}
                  sx={{ pr: "8px", lineHeight: 1.3 }}
                >
                  {s.skill}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: "6px", pr: "8px" }}>
                  <Box sx={{ flex: 1, height: 5, backgroundColor: "#F3F4F6", borderRadius: 3 }}>
                    <Box
                      sx={{
                        height: "100%",
                        width: `${Math.min(s.candidate, 100)}%`,
                        backgroundColor: barColor,
                        borderRadius: 3,
                      }}
                    />
                  </Box>
                  <Typography fontSize={T.valueSize} fontWeight={700} color={barColor}
                    sx={{ minWidth: 24, textAlign: "right" }}>
                    {s.candidate}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: "6px", pr: "8px" }}>
                  <Box sx={{ flex: 1, height: 5, backgroundColor: "#F3F4F6", borderRadius: 3 }}>
                    <Box
                      sx={{
                        height: "100%",
                        width: `${Math.min(s.desired, 100)}%`,
                        backgroundColor: "#22C55E",
                        borderRadius: 3,
                      }}
                    />
                  </Box>
                  <Typography fontSize={T.valueSize} fontWeight={700} color="#22C55E"
                    sx={{ minWidth: 24, textAlign: "right" }}>
                    {s.desired}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    px: "8px",
                    py: "2px",
                    borderRadius: "20px",
                    backgroundColor: `${barColor}18`,
                    border: `1px solid ${barColor}40`,
                  }}
                >
                  <Typography fontSize={T.valueSize} fontWeight={700} color={barColor}>
                    {pct}%
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </DialogContent>

        <Box
          sx={{
            px: "20px",
            py: "12px",
            borderTop: `1px solid ${C.border}`,
            backgroundColor: "#FAFAFA",
            display: "flex",
            gap: "20px",
          }}
        >
          {[
            {
              label: "Strong",
              color: "#22C55E",
              count: scoreIntel.filter((s) => s.desired > 0 && s.candidate / s.desired >= 0.9).length,
            },
            {
              label: "Good",
              color: C.accent,
              count: scoreIntel.filter(
                (s) => s.desired > 0 && s.candidate / s.desired >= 0.7 && s.candidate / s.desired < 0.9,
              ).length,
            },
            {
              label: "Gap",
              color: "#EF4444",
              count: scoreIntel.filter((s) => s.desired > 0 && s.candidate / s.desired < 0.7).length,
            },
          ].map(({ label, color, count }) => (
            <Box key={label} sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Typography fontSize={T.labelSize} fontWeight={800} color={color}>{count}</Typography>
              <Typography fontSize={T.valueSize} color={C.textSecondary}>{label}</Typography>
            </Box>
          ))}
        </Box>
      </Dialog>
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   SKILLS SECTION
═══════════════════════════════════════════════ */
function SkillsSection({ candidate }) {
  const keySkills = candidate?.skill_info?.[0]?.key_skills ?? "";
  const skills = keySkills
    ? keySkills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const matchedPrimary   = (candidate?.matched_primary_skills ?? []).map((s) => s.toLowerCase());
  const matchedSecondary = (candidate?.matched_secondary_skills ?? []).map((s) => s.toLowerCase());
  const matchedMandatory = (candidate?.matched_mandatory_skills ?? []).map((s) => s.toLowerCase());

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
    return <Typography sx={{ fontSize: T.valueSize, color: "#9CA3AF" }}>No skills listed.</Typography>;

  return (
    <Box>
      <Box sx={{ display: "flex", gap: "12px", mb: "14px", flexWrap: "wrap" }}>
        {[
          { label: "Mandatory Match", bg: "#FFF0E8", color: C.accent,   border: "#FFCFB3" },
          { label: "Primary Match",   bg: "#E0F2FE", color: "#0369A1", border: "#BAE6FD" },
          { label: "Secondary Match", bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" },
        ].map((l) => (
          <Box key={l.label} sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Box sx={{ width: 10, height: 10, borderRadius: "3px", backgroundColor: l.bg, border: `1px solid ${l.border}` }} />
            <Typography sx={{ fontSize: T.valueSize }}>{l.label}</Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {skills.map((skill) => {
          const style = getChipStyle(skill);
          return (
            <Chip
              key={skill}
              label={skill}
              size="small"
              sx={{
                fontSize: 10,
                height: 26,
                backgroundColor: style.bg,
                color: style.color,
                border: `1px solid ${style.border}`,
                borderRadius: "6px",
                "& .MuiChip-label": { px: "10px" },
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   EXPERIENCE SECTION
═══════════════════════════════════════════════ */
function ExperienceSection({ candidate }) {
  const employment = candidate?.employment ?? [];

  if (!employment.length)
    return <Typography sx={{ fontSize: T.valueSize, color: "#9CA3AF" }}>No experience listed.</Typography>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {employment.map((emp, i) => (
        <Box
          key={emp.id ?? i}
          sx={{
            p: "16px",
            border: `1px solid ${C.border}`,
            borderRadius: "10px",
            backgroundColor: emp.is_current ? "#FFFBF8" : "#fff",
            borderLeft: emp.is_current ? `3px solid ${C.accent}` : `1px solid ${C.border}`,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: "6px" }}>
            <Box>
              <Typography sx={{ fontSize: T.labelSize, fontWeight: 600 }} color={C.textPrimary}>
                {emp.job_title}
              </Typography>
              <Typography sx={{ fontSize: 12 }} mt="2px">
                {emp.company_name}
                {emp.location ? ` · ${emp.location}, ${emp.country}` : ""}
              </Typography>
            </Box>
            {emp.is_current && (
              <Chip
                label="Current"
                size="small"
                sx={{
                  fontSize: 10,
                  fontWeight: 700,
                  height: 20,
                  backgroundColor: C.accentSoft,
                  color: C.accent,
                  "& .MuiChip-label": { px: "8px" },
                }}
              />
            )}
          </Box>
          <Box sx={{ display: "flex", gap: "8px", mb: "10px", flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: T.valueSize }}>
              {emp.joining_date ?? "—"} → {emp.is_current ? "Present" : (emp.end_date ?? "—")}
            </Typography>
            {emp.duration && (
              <Typography sx={{ fontSize: T.valueSize, color: "#9CA3AF" }}>· {emp.duration}</Typography>
            )}
            {(emp.total_exp_years || emp.total_exp_months) && (
              <Typography sx={{ fontSize: T.valueSize, color: "#9CA3AF" }}>
                · {emp.total_exp_years}y {emp.total_exp_months}m
              </Typography>
            )}
          </Box>
          {emp.skills_used?.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {emp.skills_used.slice(0, 12).map((sk) => (
                <Chip
                  key={sk}
                  label={sk}
                  size="small"
                  sx={{
                    fontSize: 10,
                    height: 22,
                    backgroundColor: "#F3F4F6",
                    color: "#374151",
                    borderRadius: "5px",
                    "& .MuiChip-label": { px: "8px" },
                  }}
                />
              ))}
              {emp.skills_used.length > 12 && (
                <Typography sx={{ fontSize: T.valueSize, color: "#9CA3AF", alignSelf: "center" }}>
                  +{emp.skills_used.length - 12} more
                </Typography>
              )}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   EDUCATION SECTION
═══════════════════════════════════════════════ */
function EducationSection({ candidate }) {
  const education = [...(candidate?.education ?? [])].sort(
    (a, b) => (b.end_year ?? 0) - (a.end_year ?? 0),
  );

  if (!education.length)
    return <Typography fontSize={T.valueSize} color="#9CA3AF">No education listed.</Typography>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {education.map((edu, i) => (
        <Box
          key={edu.id ?? i}
          sx={{
            display: "flex",
            gap: "14px",
            p: "14px",
            border: `1px solid ${C.border}`,
            borderRadius: "10px",
            backgroundColor: "#fff",
          }}
        >
          <Box
            sx={{
              minWidth: 52,
              height: 52,
              borderRadius: "10px",
              backgroundColor: C.tealSoft,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Typography sx={{ fontSize: T.labelSize }} color={C.teal}>{edu.end_year ?? "—"}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: T.labelSize, fontWeight: 700, color: C.textPrimary }}>
              {edu.course}
            </Typography>
            <Typography sx={{ fontSize: T.valueSize, color: C.textSecondary, mt: "2px" }}>
              {edu.university}
            </Typography>
            {edu.specialization && (
              <Typography sx={{ fontSize: T.valueSize, color: "#9CA3AF", mt: "2px" }}>
                {edu.specialization}
              </Typography>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   PROFILE TAB
═══════════════════════════════════════════════ */
function ProfileTab({ candidate }) {
  return (
    <Box>
      <Accordion icon={<TrendingUpIcon sx={{ fontSize: 18 }} />} iconColor={C.teal} title="Skill Info" defaultOpen={true}>
        <SkillInfoSection candidate={candidate} />
      </Accordion>
      <Accordion icon={<CodeIcon sx={{ fontSize: 18 }} />} iconColor={C.teal} title="Skills">
        <SkillsSection candidate={candidate} />
      </Accordion>
      <Accordion icon={<WorkOutlineOutlined sx={{ fontSize: 18 }} />} iconColor={C.teal} title="Experience">
        <ExperienceSection candidate={candidate} />
      </Accordion>
      <Accordion icon={<SchoolOutlinedIcon sx={{ fontSize: 18 }} />} iconColor={C.teal} title="Education">
        <EducationSection candidate={candidate} />
      </Accordion>
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   TIMELINE TAB  ← main changes here
═══════════════════════════════════════════════ */
function TimelineTab({ candidate, onInterviewClick }) {
  const currentStage = candidate.current_stage ?? "";
  const location = useLocation();
  const { candidateId } = useParams();

  const matched_candidate_id = location.state?.matched_candidate_id ?? candidateId;

  const { data, isLoading } = useGetCandidateStageTimelineQuery(
    matched_candidate_id,
    { skip: !matched_candidate_id },
  );

  const entries = data?.data ?? [];

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

  /* ── Legend for the timeline circles ── */
  const CIRCLE_LEGEND = [
    { state: "completed", label: "Completed",   color: "#22C55E" },
    { state: "current",   label: "In Progress", color: "#FF5F1F" },
    { state: "failed",    label: "Failed",       color: "#EF4444" },
    { state: "pending",   label: "Pending",      color: "#D1D5DB" },
  ];

  return (
    <Grid container spacing={4}>
      {/* LEFT: Stage Timeline */}
      <Grid size={{ xs: 12, md: 6 }}>
        {/* Heading + legend row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
            mb: "20px",
          }}
        >
          <Typography
            fontSize={T.labelSize}
            fontWeight={700}
            color="#9CA3AF"
            letterSpacing="0.08em"
            sx={{ textTransform: "uppercase" }}
          >
            Stage Timeline
          </Typography>

          {/* Circle colour legend */}
          <Box sx={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            {CIRCLE_LEGEND.map(({ state, label, color }) => (
              <Box key={state} sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: state === "pending" ? "#F9FAFB" : color,
                    border: `2px solid ${color}`,
                  }}
                />
                <Typography fontSize={11} color={C.textSecondary}>{label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {visibleStages.map((stage, i) => {
            const stageEntries  = grouped[stage.key] ?? [];
            const isLast        = i === visibleStages.length - 1;
            const state         = groupState(stage.key, entries, currentStage);
            const firstEntry    = stageEntries[0];
            const subEntries    = stageEntries.filter((e) => SUB_LABEL[e.stage]);
            const hasSubEntries = subEntries.length > 0;

            return (
              <Box key={stage.key} sx={{ display: "flex", gap: "16px" }}>
                {/* Connector column */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  {/* ── Coloured stage circle ── */}
                  <StageCircle state={state} size={32} />

                  {!isLast && (
                    <ConnectorLine state={state} minHeight={hasSubEntries ? 80 : 48} />
                  )}
                </Box>

                {/* Content column */}
                <Box sx={{ pb: isLast ? 0 : "12px", width: "100%", pt: "4px" }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: "4px" }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }} color={C.textPrimary}>
                      {stage.label}
                    </Typography>
                    <StatusBadge state={state} />
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography sx={{ fontSize: 12 }} color={C.textSecondary}>IST :</Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, ml: 1 }} color={C.textSecondary}>
                      {fmtDateIST(firstEntry.created_at)}
                    </Typography>
                  </Box>
                  {firstEntry.triggered_by && (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography sx={{ fontSize: T.labelSize }} color={C.textSecondary}>By :</Typography>
                      <Typography sx={{ fontSize: T.valueSize, fontWeight: 500, ml: 1 }} color={C.textSecondary}>
                        {firstEntry.triggered_by}
                      </Typography>
                    </Box>
                  )}

                  {/* Sub-entries (rounds / offer events) */}
                  {hasSubEntries && (
                    <Box sx={{ mt: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                      {subEntries.map((sub, si) => {
                        const subState =
                          sub.stage === "offer_revoked" || sub.stage === "interview_failed"
                            ? "failed"
                            : "completed";
                        return (
                          <Box key={si} sx={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                            {/* ── Coloured sub-stage circle ── */}
                            <SubStageCircle state={subState} size={20} />

                            <Box>
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Typography sx={{ fontSize: T.labelSize }}>
                                  {sub.step_number ? `Round ${sub.step_number} — ` : ""}
                                </Typography>
                                <Typography sx={{ fontSize: T.valueSize, fontWeight: 500 }} color={C.textSecondary}>
                                  {SUB_LABEL[sub.stage] ?? sub.stage.replace(/_/g, " ")}
                                </Typography>
                              </Box>
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Typography sx={{ fontSize: T.labelSize }} color="#9CA3AF">IST :</Typography>
                                <Typography sx={{ fontSize: T.valueSize, ml: 1 }} color="#9CA3AF">
                                  {fmtDateIST(sub.created_at)}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Grid>

      {/* RIGHT: Profile summary */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography
          fontSize={T.labelSize}
          fontWeight={700}
          color="#9CA3AF"
          letterSpacing="0.08em"
          mb="20px"
          sx={{ textTransform: "uppercase" }}
        >
          Profile
        </Typography>

        <Box sx={{ border: `1px solid ${C.border}`, borderRadius: "12px", overflow: "hidden", backgroundColor: "#fff" }}>
          {[
            { label: "Experience",    value: candidate.total_experience },
            { label: "Email",         value: candidate.email },
            { label: "Phone",         value: candidate.phone_number },
            { label: "Current stage", value: candidate.current_stage?.replace(/_/g, " ") },
          ].map(({ label, value }, idx, arr) => (
            <Box
              key={label}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                px: "16px",
                py: "12px",
                borderBottom: idx < arr.length - 1 ? "1px solid #F3F4F6" : "none",
              }}
            >
              <Typography fontSize={T.labelSize} color={C.textSecondary}>{label}</Typography>
              <Typography
                fontSize={T.valueSize}
                fontWeight={500}
                color={C.textPrimary}
                sx={{ textTransform: "capitalize" }}
              >
                {value ?? "—"}
              </Typography>
            </Box>
          ))}
        </Box>

        {candidate.upcoming_interview && (
          <Box
            sx={{
              mt: "16px",
              p: "14px",
              border: `1px solid ${C.border}`,
              borderRadius: "10px",
              backgroundColor: "#fff",
            }}
          >
            <Typography fontSize={T.labelSize} fontWeight={700} color={C.textPrimary} mb="4px">
              {candidate.upcoming_interview.round_name}
            </Typography>
            <Typography fontSize={T.valueSize} color={C.textSecondary} mb="10px">
              {fmtDateIST(candidate.upcoming_interview.scheduled_at)}
              {" · "}
              <span style={{ textTransform: "capitalize" }}>{candidate.upcoming_interview.status}</span>
            </Typography>
            <Box
              onClick={onInterviewClick}
              sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer" }}
            >
              <Typography
                fontSize={T.valueSize}
                fontWeight={700}
                color={C.accent}
                sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
              >
                Open interview
              </Typography>
              <Typography fontSize={T.labelSize} color={C.accent}>→</Typography>
            </Box>
          </Box>
        )}
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
        <CalendarMonthOutlinedIcon sx={{ fontSize: 40, color: "#D1D5DB", mb: 1.5 }} />
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
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "8px" }}>
            <Typography fontSize={T.labelSize} fontWeight={700} color={C.textPrimary}>
              {iv.round_name}
            </Typography>
            <Chip
              label={iv.status}
              size="small"
              sx={{
                fontSize: 10,
                height: 20,
                textTransform: "capitalize",
                fontWeight: 600,
                backgroundColor: iv.status === "scheduled" ? "#E7F8EE" : "#F3F4F6",
                color: iv.status === "scheduled" ? "#0F6E56" : "#6B7280",
                "& .MuiChip-label": { px: "8px" },
              }}
            />
          </Box>
          <Typography fontSize={T.valueSize} color={C.textSecondary}>
            {new Date(iv.scheduled_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            {" · "}
            {new Date(iv.scheduled_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </Typography>
          {iv.interviewer && (
            <Typography fontSize={T.valueSize} color={C.textSecondary} mt="2px">
              <Box component="span" sx={{ fontSize: T.labelSize, fontWeight: 600, color: C.textPrimary }}>
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
        <InsertDriveFileOutlinedIcon sx={{ fontSize: 40, color: "#D1D5DB", mb: 1.5 }} />
        <Typography fontSize={T.valueSize} color={C.textSecondary}>No documents uploaded.</Typography>
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
        <Typography fontSize={T.labelSize} fontWeight={600} color={C.textPrimary}>Resume</Typography>
        <Typography fontSize={T.valueSize} color="#9CA3AF" sx={{ wordBreak: "break-all" }}>
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
          fontSize: T.valueSize,
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

  const matched_candidate_id = location.state?.matched_candidate_id ?? candidateId;
  const { data, isLoading, isError, error } = useGetCandidateDetailQuery(matched_candidate_id);

  const candidate = data?.data?.candidate ?? null;

  const enriched = candidate
    ? {
        ...candidate,
        matched_primary_skills:   data?.data?.matched_primary_skills   ?? [],
        matched_secondary_skills: data?.data?.matched_secondary_skills ?? [],
        matched_mandatory_skills: data?.data?.matched_mandatory_skills ?? [],
        skill_notes:  data?.data?.skill_notes  ?? {},
        score_intel:  data?.data?.score_intel  ?? [],
        status:       data?.data?.status,
      }
    : null;

  useEffect(() => {
    const labels = {};
    if (location.state?.orgName)  labels.orgId       = location.state.orgName;
    if (location.state?.jobTitle) labels.jobId        = location.state.jobTitle;
    if (enriched?.full_name)      labels.candidateId  = enriched.full_name;
    if (Object.keys(labels).length) dispatch(setDynamicLabels(labels));
    return () => dispatch(clearDynamicLabels());
  }, [enriched?.full_name, location.state?.orgName, location.state?.jobTitle]);

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

  return (
    <Box sx={{ p: 1, backgroundColor: "#fff" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: "4px" }}>
        <Box
          onClick={() => {
            if (location.state?.orgId && location.state?.previousTab === 2) {
              navigate(`/account-manager/org/${location.state.orgId}`, { state: { activeTab: 2 } });
              return;
            }
            if (location.state?.orgId && location.state?.jobId) {
              navigate(
                `/account-manager/org/${location.state.orgId}/requisitions/${location.state.jobId}`,
                { state: { activeReqTab: 1 } },
              );
              return;
            }
            navigate(-1);
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} />
        </Box>
        <Typography fontSize={20} fontWeight={700} color={C.textPrimary}>
          {enriched.full_name}
        </Typography>
      </Box>

      <Typography sx={{ fontSize: T.valueSize, color: "#9CA3AF", ml: 3 }} mb="16px">
        ID: CLIN{enriched.clin_id}
        {enriched.skillintel_score != null &&
          ` · SkillIntel Score ${enriched.skill_info?.[0]?.skillintel_score}`}
      </Typography>

      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={TAB_SX}>
        <Tab icon={<PersonOutlineOutlined sx={{ fontSize: 15 }} />}         iconPosition="start" label="Profile" />
        <Tab icon={<TrendingUpIcon sx={{ fontSize: 15 }} />}                iconPosition="start" label="Timeline" />
        <Tab icon={<CalendarMonthOutlinedIcon sx={{ fontSize: 15 }} />}     iconPosition="start" label="Interviews" />
        <Tab icon={<InsertDriveFileOutlinedIcon sx={{ fontSize: 15 }} />}   iconPosition="start" label="Documents" />
      </Tabs>

      {activeTab === 0 && <ProfileTab candidate={enriched} />}
      {activeTab === 1 && <TimelineTab candidate={enriched} onInterviewClick={() => setActiveTab(2)} />}
      {activeTab === 2 && <InterviewsTab candidate={enriched} />}
      {activeTab === 3 && <DocumentsTab candidate={enriched} />}
    </Box>
  );
}