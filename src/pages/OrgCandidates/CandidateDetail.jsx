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
// import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useDispatch } from "react-redux";
import {
  setDynamicLabels,
  clearDynamicLabels,
} from "../../redux/slices/breadcrumbSlice";
import {
  useGetCandidateDetailQuery,
  useGetCandidateStageTimelineQuery,
} from "../../redux/services/requisition/requisition";
import { PersonOutlineOutlined, WorkOutlineOutlined } from "@mui/icons-material";

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
  pending: { bg: "#fff", border: "#D1D5DB", icon: "#D1D5DB" },
};

/* ── brand tokens ──────────────────────────────────────── */
const C = {
  accent: "#FF5F1F",
  accentSoft: "#FFF0E8",
  teal: "#00B4D8",
  tealSoft: "#E0F7FA",
  border: "#E8E8EC",
  textPrimary: "#111118",
  textSecondary: "#5C5C70",
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
  const curGroup = STAGE_GROUP[currentStage?.toLowerCase()] ?? "";
  const curIdx = groupKeys.indexOf(curGroup);
  const thisIdx = groupKeys.indexOf(groupKey);

  if (thisIdx < curIdx) return "completed";
  if (thisIdx === curIdx) return "current";
  return "pending";
}

/* ═══════════════════════════════════════════════
   SMALL SHARED COMPONENTS
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

/* ═══════════════════════════════════════════════
   ACCORDION WRAPPER (for Profile Tab)
═══════════════════════════════════════════════ */
function Accordion({ icon, title, iconColor = C.teal, defaultOpen = false, children }) {
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
          <Typography fontSize={14} fontWeight={700} color={C.textPrimary}>
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
   RADAR CHART (pure SVG — no extra dependencies)
═══════════════════════════════════════════════ */
function RadarChart({ scoreIntel, size = 300 }) {
  if (!scoreIntel?.length) return null;

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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Top legend */}
      <Box sx={{ display: "flex", gap: "20px", mb: "8px", alignSelf: "flex-end" }}>
        {[
          { dot: "#818CF8", label: "Candidate" },
          { dot: "#22C55E", label: "Desired" },
        ].map(({ dot, label }) => (
          <Box key={label} sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: dot }} />
            <Typography fontSize={11} color={C.textSecondary}>{label}</Typography>
          </Box>
        ))}
        <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Typography fontSize={11} fontWeight={700} color={C.textPrimary}>
            All Skills ({scoreIntel.length})
          </Typography>
          <FilterListIcon sx={{ fontSize: 13, color: "#9CA3AF" }} />
        </Box>
      </Box>

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid rings */}
        {Array.from({ length: levels }, (_, i) => (
          <polygon key={i} points={gridPoly(i + 1)} fill="none" stroke="#E5E7EB" strokeWidth="1" />
        ))}
        {/* Axes */}
        {scoreIntel.map((_, i) => {
          const end = polar(100, i);
          return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#E5E7EB" strokeWidth="1" />;
        })}
        {/* Desired area */}
        <path d={toPath(desiredPts)} fill="rgba(34,197,94,0.12)" stroke="#22C55E" strokeWidth="1.5" />
        {/* Candidate area */}
        <path d={toPath(candidatePts)} fill="rgba(129,140,248,0.25)" stroke="#818CF8" strokeWidth="2" />
        {/* Candidate dots */}
        {candidatePts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill="#818CF8" />
        ))}
        {/* Labels */}
        {scoreIntel.map((d, i) => {
          const labelR = R + 26;
          const lx = cx + labelR * Math.cos(angle(i));
          const ly = cy + labelR * Math.sin(angle(i));
          const anchor = Math.abs(lx - cx) < 5 ? "middle" : lx < cx ? "end" : "start";
          const label = d.skill.length > 13 ? d.skill.slice(0, 12) + "…" : d.skill;
          return (
            <text key={i} x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle"
              fontSize="10" fontWeight="600" fill={C.textSecondary}>
              {label}
            </text>
          );
        })}
        {/* Level numbers */}
        {Array.from({ length: levels }, (_, i) => {
          const r = ((i + 1) / levels) * R;
          return (
            <text key={i} x={cx + 3} y={cy - r + 4} fontSize="8" fill="#9CA3AF">
              {(i + 1) * 20}
            </text>
          );
        })}
      </svg>

      {/* Bottom legend: mandatory / secondary */}
      <Box sx={{ display: "flex", gap: "16px", mt: "4px" }}>
        {[
          { dot: C.accent, label: "Mandatory" },
          { dot: "#6B7280", label: "Secondary" },
        ].map(({ dot, label }) => (
          <Box key={label} sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: dot }} />
            <Typography fontSize={11} color={C.textSecondary} fontWeight={600}>{label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   PROFILE TAB — SKILL INFO SECTION
═══════════════════════════════════════════════ */
function SkillInfoSection({ candidate }) {
  const skillInfo = candidate?.skill_info?.[0] ?? {};
  const scoreIntel = candidate?.score_intel ?? [];
  const skillNotes = candidate?.skill_notes ?? {};
  const summary = skillInfo.summary ?? "";

  return (
    <Box>
      {/* Radar chart */}
      {scoreIntel.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: "20px" }}>
          <RadarChart scoreIntel={scoreIntel} size={300} />
        </Box>
      )}

      {/* View all skill scores link */}
      {scoreIntel.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: "12px" }}>
          <Box
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
            <Typography fontSize={12} fontWeight={600} color={C.accent}>
              View all skill scores
            </Typography>
          </Box>
        </Box>
      )}

      {/* Score table */}
      {scoreIntel.length > 0 && (
        <Box
          sx={{
            border: `1px solid ${C.border}`,
            borderRadius: "10px",
            overflow: "hidden",
            mb: "20px",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 140px 140px",
              px: "16px",
              py: "10px",
              backgroundColor: "#F9FAFB",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            {["Skill", "Candidate", "Desired"].map((h) => (
              <Typography key={h} fontSize={11} fontWeight={700} color="#9CA3AF"
                sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {h}
              </Typography>
            ))}
          </Box>

          {scoreIntel.map((s, i) => {
            const isLast = i === scoreIntel.length - 1;
            const pct = Math.round((s.candidate / s.desired) * 100);
            const barColor = pct >= 90 ? "#22C55E" : pct >= 70 ? C.accent : "#EF4444";

            return (
              <Box
                key={s.skill}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 140px 140px",
                  px: "16px",
                  py: "10px",
                  borderBottom: isLast ? "none" : "1px solid #F3F4F6",
                  alignItems: "center",
                }}
              >
                <Typography fontSize={13} fontWeight={500} color={C.textPrimary}>
                  {s.skill}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Box sx={{ flex: 1, height: 6, backgroundColor: "#F3F4F6", borderRadius: 3 }}>
                    <Box sx={{ height: "100%", width: `${s.candidate}%`, backgroundColor: barColor, borderRadius: 3 }} />
                  </Box>
                  <Typography fontSize={11} fontWeight={700} color={barColor} sx={{ minWidth: 28 }}>
                    {s.candidate}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Box sx={{ flex: 1, height: 6, backgroundColor: "#F3F4F6", borderRadius: 3 }}>
                    <Box sx={{ height: "100%", width: `${s.desired}%`, backgroundColor: "#22C55E", borderRadius: 3 }} />
                  </Box>
                  <Typography fontSize={11} fontWeight={700} color="#22C55E" sx={{ minWidth: 28 }}>
                    {s.desired}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Skills Summary */}
      {summary && (
        <Box sx={{ mb: "16px" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "8px" }}>
            <InsertDriveFileOutlinedIcon sx={{ fontSize: 16, color: C.teal }} />
            <Typography fontSize={13} fontWeight={700} color={C.textPrimary}>
              Skills Summary
            </Typography>
          </Box>
          <Typography fontSize={13} color={C.textSecondary} lineHeight={1.7}>
            {summary}
          </Typography>
        </Box>
      )}

      {/* Skill Notes (from skill_notes map) */}
      {Object.keys(skillNotes).length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {Object.entries(skillNotes).map(([key, note]) => (
            <Box key={key} sx={{ display: "flex", gap: "6px" }}>
              <Typography fontSize={13} fontWeight={700} color={C.textPrimary} sx={{ minWidth: "fit-content" }}>
                {key} :
              </Typography>
              <Typography fontSize={13} color={C.textSecondary} lineHeight={1.65}>
                {note}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* SkillIntel Score badge */}
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
          <Typography fontSize={13} fontWeight={700} color={C.accent}>
            SkillIntel Score: {skillInfo.skillintel_score}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   PROFILE TAB — SKILLS SECTION
═══════════════════════════════════════════════ */
function SkillsSection({ candidate }) {
  const keySkills = candidate?.skill_info?.[0]?.key_skills ?? "";
  const skills = keySkills
    ? keySkills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const matchedPrimary = (candidate?.matched_primary_skills ?? []).map((s) => s.toLowerCase());
  const matchedSecondary = (candidate?.matched_secondary_skills ?? []).map((s) => s.toLowerCase());
  const matchedMandatory = (candidate?.matched_mandatory_skills ?? []).map((s) => s.toLowerCase());

  const getChipStyle = (skill) => {
    const sl = skill.toLowerCase();
    if (matchedMandatory.some((m) => sl.includes(m) || m.includes(sl))) {
      return { bg: "#FFF0E8", color: C.accent, border: "#FFCFB3" };
    }
    if (matchedPrimary.some((m) => sl.includes(m) || m.includes(sl))) {
      return { bg: "#E0F2FE", color: "#0369A1", border: "#BAE6FD" };
    }
    if (matchedSecondary.some((m) => sl.includes(m) || m.includes(sl))) {
      return { bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" };
    }
    return { bg: "#F9FAFB", color: "#6B7280", border: "#E5E7EB" };
  };

  if (!skills.length) {
    return <Typography fontSize={13} color="#9CA3AF">No skills listed.</Typography>;
  }

  return (
    <Box>
      {/* Legend */}
      <Box sx={{ display: "flex", gap: "12px", mb: "14px", flexWrap: "wrap" }}>
        {[
          { label: "Mandatory Match", bg: "#FFF0E8", color: C.accent, border: "#FFCFB3" },
          { label: "Primary Match", bg: "#E0F2FE", color: "#0369A1", border: "#BAE6FD" },
          { label: "Secondary Match", bg: "#F3F4F6", color: "#374151", border: "#E5E7EB" },
        ].map((l) => (
          <Box key={l.label} sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Box sx={{ width: 10, height: 10, borderRadius: "3px", backgroundColor: l.bg, border: `1px solid ${l.border}` }} />
            <Typography fontSize={11} color={C.textSecondary}>{l.label}</Typography>
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
                fontSize: 11,
                fontWeight: 600,
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
   PROFILE TAB — EXPERIENCE SECTION
═══════════════════════════════════════════════ */
function ExperienceSection({ candidate }) {
  const employment = candidate?.employment ?? [];

  if (!employment.length) {
    return <Typography fontSize={13} color="#9CA3AF">No experience listed.</Typography>;
  }

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
            borderLeft: emp.is_current
              ? `3px solid ${C.accent}`
              : `1px solid ${C.border}`,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: "6px" }}>
            <Box>
              <Typography fontSize={14} fontWeight={700} color={C.textPrimary}>
                {emp.job_title}
              </Typography>
              <Typography fontSize={13} color={C.textSecondary} mt="2px">
                {emp.company_name}
                {emp.location ? ` · ${emp.location}, ${emp.country}` : ""}
              </Typography>
            </Box>
            {emp.is_current && (
              <Chip
                label="Current"
                size="small"
                sx={{
                  fontSize: 10, fontWeight: 700, height: 20,
                  backgroundColor: C.accentSoft, color: C.accent,
                  "& .MuiChip-label": { px: "8px" },
                }}
              />
            )}
          </Box>

          <Box sx={{ display: "flex", gap: "8px", mb: "10px", flexWrap: "wrap" }}>
            <Typography fontSize={12} color="#9CA3AF">
              {emp.joining_date ?? "—"} → {emp.is_current ? "Present" : (emp.end_date ?? "—")}
            </Typography>
            {emp.duration && (
              <Typography fontSize={12} color="#9CA3AF">· {emp.duration}</Typography>
            )}
            {(emp.total_exp_years || emp.total_exp_months) && (
              <Typography fontSize={12} color="#9CA3AF">
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
                    fontSize: 10, height: 22,
                    backgroundColor: "#F3F4F6", color: "#374151",
                    borderRadius: "5px",
                    "& .MuiChip-label": { px: "8px" },
                  }}
                />
              ))}
              {emp.skills_used.length > 12 && (
                <Typography fontSize={11} color="#9CA3AF" sx={{ alignSelf: "center" }}>
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
   PROFILE TAB — EDUCATION SECTION
═══════════════════════════════════════════════ */
function EducationSection({ candidate }) {
  const education = [...(candidate?.education ?? [])].sort(
    (a, b) => (b.end_year ?? 0) - (a.end_year ?? 0),
  );

  if (!education.length) {
    return <Typography fontSize={13} color="#9CA3AF">No education listed.</Typography>;
  }

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
          {/* Year badge */}
          <Box
            sx={{
              minWidth: 52, height: 52,
              borderRadius: "10px",
              backgroundColor: C.tealSoft,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Typography fontSize={12} fontWeight={700} color={C.teal}>
              {edu.end_year ?? "—"}
            </Typography>
          </Box>

          <Box>
            <Typography fontSize={13} fontWeight={700} color={C.textPrimary}>
              {edu.course}
            </Typography>
            <Typography fontSize={12} color={C.textSecondary} mt="2px">
              {edu.university}
            </Typography>
            {edu.specialization && (
              <Typography fontSize={11} color="#9CA3AF" mt="2px">
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
   TAB 0 — Profile  (accordion-based)
═══════════════════════════════════════════════ */
function ProfileTab({ candidate }) {
  return (
    <Box>
      <Accordion
        icon={<TrendingUpIcon sx={{ fontSize: 18 }} />}
        iconColor={C.teal}
        title="Skill Info"
        defaultOpen={true}
      >
        <SkillInfoSection candidate={candidate} />
      </Accordion>

      <Accordion
        icon={<CodeIcon sx={{ fontSize: 18 }} />}
        iconColor={C.teal}
        title="Skills"
      >
        <SkillsSection candidate={candidate} />
      </Accordion>

      <Accordion
        icon={<WorkOutlineOutlined sx={{ fontSize: 18 }} />}
        iconColor={C.teal}
        title="Experience"
      >
        <ExperienceSection candidate={candidate} />
      </Accordion>

      <Accordion
        icon={<SchoolOutlinedIcon sx={{ fontSize: 18 }} />}
        iconColor={C.teal}
        title="Education"
      >
        <EducationSection candidate={candidate} />
      </Accordion>
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   TAB 1 — Timeline  (unchanged)
═══════════════════════════════════════════════ */
function TimelineTab({ candidate, onInterviewClick }) {
  const currentStage = candidate.current_stage ?? "";

  const { data, isLoading } = useGetCandidateStageTimelineQuery(
    candidate.matched_candidate_id,
    { skip: !candidate.matched_candidate_id },
  );

  const entries = data?.data ?? [];

  const grouped = {};
  entries.forEach((e) => {
    const g = STAGE_GROUP[e.stage?.toLowerCase()];
    if (!g) return;
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(e);
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress sx={{ color: C.accent }} />
      </Box>
    );
  }

  return (
    <Grid container spacing={4}>
      {/* LEFT: Stage Timeline */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography fontSize={11} fontWeight={700} color="#9CA3AF" letterSpacing="0.08em" mb="20px"
          sx={{ textTransform: "uppercase" }}>
          Stage Timeline
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {STAGE_CONFIG.map((stage, i) => {
            const stageEntries = grouped[stage.key] ?? [];
            const isLast = i === STAGE_CONFIG.length - 1;
            const state = groupState(stage.key, entries, currentStage);
            const sc = STATE_COLORS[state];
            const firstEntry = stageEntries[0];
            const hasSubEntries = stageEntries.some((e) => SUB_LABEL[e.stage]);
            const subEntries = stageEntries.filter((e) => SUB_LABEL[e.stage]);

            return (
              <Box key={stage.key} sx={{ display: "flex", gap: "16px" }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <Box
                    sx={{
                      width: 32, height: 32, borderRadius: "50%",
                      backgroundColor: sc.bg, border: `2px solid ${sc.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: state !== "pending" ? `0 0 0 4px ${sc.bg}33` : "none",
                      mt: "2px", flexShrink: 0,
                    }}
                  >
                    <CheckIcon color={sc.icon} />
                  </Box>
                  {!isLast && (
                    <Box sx={{ width: 2, flex: 1, minHeight: hasSubEntries ? 80 : 48, backgroundColor: "#E5E7EB", my: "4px" }} />
                  )}
                </Box>

                <Box sx={{ pb: isLast ? 0 : "12px", width: "100%", pt: "4px" }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: "4px" }}>
                    <Typography fontSize={14} fontWeight={700}
                      color={state === "pending" ? "#9CA3AF" : C.textPrimary}>
                      {stage.label}
                    </Typography>
                    <StatusBadge state={state} />
                  </Box>

                  {firstEntry ? (
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography sx={{ fontSize: 13 }} color={C.textSecondary}>IST :</Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 500, ml: 1 }} color={C.textSecondary}>
                          {fmtDateIST(firstEntry.created_at)}
                        </Typography>
                      </Box>
                      {firstEntry.triggered_by && (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography sx={{ fontSize: 13 }} color={C.textSecondary}>By :</Typography>
                          <Typography sx={{ fontSize: 12, fontWeight: 500, ml: 1 }} color={C.textSecondary}>
                            {firstEntry.triggered_by}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Typography fontSize={12} color="#D1D5DB">—</Typography>
                  )}

                  {hasSubEntries && (
                    <Box sx={{ mt: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                      {subEntries.map((sub, si) => {
                        const subState =
                          sub.stage === "offer_revoked" || sub.stage === "interview_failed"
                            ? "failed" : "completed";
                        const subSc = STATE_COLORS[subState];
                        return (
                          <Box key={si} sx={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                            <Box
                              sx={{
                                width: 20, height: 20, borderRadius: "50%", mt: "2px", flexShrink: 0,
                                backgroundColor: subSc.bg, border: `2px solid ${subSc.border}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}
                            >
                              <CheckIcon color={subSc.icon} />
                            </Box>
                            <Box>
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Typography sx={{ fontSize: 13 }}>
                                  {sub.step_number ? `Round ${sub.step_number} — ` : ""}
                                </Typography>
                                <Typography sx={{ fontSize: 12, fontWeight: 500 }} color={C.textSecondary}>
                                  {SUB_LABEL[sub.stage] ?? sub.stage.replace(/_/g, " ")}
                                </Typography>
                              </Box>
                              <Box sx={{ display: "flex", alignItems: "center", fontSize: 12 }}>
                                <Typography sx={{ fontSize: 13 }} color="#9CA3AF">IST :</Typography>
                                <Typography sx={{ fontSize: 12, ml: 1 }} color="#9CA3AF">
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

      {/* RIGHT: Profile summary + upcoming interview */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography fontSize={11} fontWeight={700} color="#9CA3AF" letterSpacing="0.08em" mb="20px"
          sx={{ textTransform: "uppercase" }}>
          Profile
        </Typography>

        <Box sx={{ border: `1px solid ${C.border}`, borderRadius: "12px", overflow: "hidden", backgroundColor: "#fff" }}>
          {[
            { label: "Experience", value: candidate.total_experience },
            { label: "Email", value: candidate.email },
            { label: "Phone", value: candidate.phone_number },
            { label: "Current stage", value: candidate.current_stage?.replace(/_/g, " ") },
          ].map(({ label, value }, idx, arr) => (
            <Box
              key={label}
              sx={{
                display: "flex", justifyContent: "space-between",
                px: "16px", py: "12px",
                borderBottom: idx < arr.length - 1 ? "1px solid #F3F4F6" : "none",
              }}
            >
              <Typography fontSize={13} color={C.textSecondary}>{label}</Typography>
              <Typography fontSize={13} fontWeight={500} color={C.textPrimary}
                sx={{ textTransform: "capitalize" }}>
                {value ?? "—"}
              </Typography>
            </Box>
          ))}
        </Box>

        {candidate.upcoming_interview && (
          <Box sx={{ mt: "16px", p: "14px", border: `1px solid ${C.border}`, borderRadius: "10px", backgroundColor: "#fff" }}>
            <Typography fontSize={12} fontWeight={700} color={C.textPrimary} mb="4px">
              {candidate.upcoming_interview.round_name}
            </Typography>
            <Typography fontSize={11} color={C.textSecondary} mb="10px">
              {fmtDateIST(candidate.upcoming_interview.scheduled_at)}
              {" · "}
              <span style={{ textTransform: "capitalize" }}>{candidate.upcoming_interview.status}</span>
            </Typography>
            <Box onClick={onInterviewClick} sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer" }}>
              <Typography fontSize={11} fontWeight={700} color={C.accent}
                sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Open interview
              </Typography>
              <Typography fontSize={13} color={C.accent}>→</Typography>
            </Box>
          </Box>
        )}
      </Grid>
    </Grid>
  );
}

/* ═══════════════════════════════════════════════
   TAB 2 — Interviews  (unchanged)
═══════════════════════════════════════════════ */
function InterviewsTab({ candidate }) {
  const interviews = candidate.interviews ?? [];

  if (!interviews.length) {
    return (
      <Box sx={{ textAlign: "center", py: 8, border: `1px solid ${C.border}`, borderRadius: "12px", backgroundColor: "#fff" }}>
        <CalendarMonthOutlinedIcon sx={{ fontSize: 40, color: "#D1D5DB", mb: 1.5 }} />
        <Typography fontSize={14} color={C.textSecondary}>No interviews scheduled yet.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {interviews.map((iv, i) => (
        <Box key={i} sx={{ p: "16px", border: `1px solid ${C.border}`, borderRadius: "10px", backgroundColor: "#fff" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "8px" }}>
            <Typography fontSize={13} fontWeight={700} color={C.textPrimary}>{iv.round_name}</Typography>
            <Chip label={iv.status} size="small"
              sx={{
                fontSize: 10, height: 20, textTransform: "capitalize", fontWeight: 600,
                backgroundColor: iv.status === "scheduled" ? "#E7F8EE" : "#F3F4F6",
                color: iv.status === "scheduled" ? "#0F6E56" : "#6B7280",
                "& .MuiChip-label": { px: "8px" },
              }}
            />
          </Box>
          <Typography fontSize={11} color={C.textSecondary}>
            {new Date(iv.scheduled_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            {" · "}
            {new Date(iv.scheduled_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </Typography>
          {iv.interviewer && (
            <Typography fontSize={11} color={C.textSecondary} mt="2px">Interviewer: {iv.interviewer}</Typography>
          )}
        </Box>
      ))}
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   TAB 3 — Documents  (unchanged)
═══════════════════════════════════════════════ */
function DocumentsTab({ candidate }) {
  if (!candidate.resume_url) {
    return (
      <Box sx={{ textAlign: "center", py: 8, border: `1px solid ${C.border}`, borderRadius: "12px", backgroundColor: "#fff" }}>
        <InsertDriveFileOutlinedIcon sx={{ fontSize: 40, color: "#D1D5DB", mb: 1.5 }} />
        <Typography fontSize={14} color={C.textSecondary}>No documents uploaded.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      p: "16px", border: `1px solid ${C.border}`, borderRadius: "10px", backgroundColor: "#fff",
      display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 500,
    }}>
      <Box>
        <Typography fontSize={13} fontWeight={600} color={C.textPrimary}>Resume</Typography>
        <Typography fontSize={11} color="#9CA3AF" sx={{ wordBreak: "break-all" }}>
          {candidate.resume_url.split("/").pop()}
        </Typography>
      </Box>
      <Button size="small" variant="outlined" href={candidate.resume_url} target="_blank"
        sx={{
          borderColor: C.accent, color: C.accent, textTransform: "none", fontWeight: 600,
          borderRadius: "8px", fontSize: 12, flexShrink: 0, ml: 2,
          "&:hover": { backgroundColor: C.accentSoft, borderColor: C.accent },
        }}>
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

  console.log("Candidate Details Data:", data?.data);
  const candidate = data?.data?.candidate ?? null;

  // Attach matched skills & score_intel onto candidate for convenience
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

  useEffect(() => {
    const labels = {};
    if (location.state?.orgName) labels.orgId = location.state.orgName;
    if (location.state?.jobTitle) labels.jobId = location.state.jobTitle;
    if (enriched?.full_name) labels.candidateId = enriched.full_name;
    if (Object.keys(labels).length) dispatch(setDynamicLabels(labels));
    return () => dispatch(clearDynamicLabels());
  }, [enriched?.full_name, location.state?.orgName, location.state?.jobTitle]);

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
      {/* Back + Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: "4px" }}>
        <Box
          onClick={() => navigate(-1)}
          sx={{ cursor: "pointer", display: "flex", alignItems: "center", color: "#6B7280", "&:hover": { color: "#111827" } }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} />
        </Box>
        <Typography fontSize={20} fontWeight={700} color={C.textPrimary}>
          {enriched.full_name}
        </Typography>
      </Box>

      <Typography fontSize={12} color="#9CA3AF" mb="16px">
        ID: {enriched.clin_id}
        {enriched.skillintel_score != null && ` · SkillIntel Score ${enriched.skill_info?.[0]?.skillintel_score}`}
      </Typography>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={TAB_SX}>
        <Tab icon={<PersonOutlineOutlined sx={{ fontSize: 15 }} />} iconPosition="start" label="Profile" />
        <Tab icon={<TrendingUpIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="Timeline" />
        <Tab icon={<CalendarMonthOutlinedIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="Interviews" />
        <Tab icon={<InsertDriveFileOutlinedIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="Documents" />
      </Tabs>

      {/* Tab Panels */}
      {activeTab === 0 && <ProfileTab candidate={enriched} />}
      {activeTab === 1 && <TimelineTab candidate={enriched} onInterviewClick={() => setActiveTab(2)} />}
      {activeTab === 2 && <InterviewsTab candidate={enriched} />}
      {activeTab === 3 && <DocumentsTab candidate={enriched} />}
    </Box>
  );
}