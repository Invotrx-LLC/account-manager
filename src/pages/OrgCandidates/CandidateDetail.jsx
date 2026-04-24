// src/pages/OrgCandidates/CandidateDetail.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box, Typography, CircularProgress, Alert,
  Tabs, Tab, Grid, Divider, Chip, Button, Avatar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import PersonOutlineIcon      from "@mui/icons-material/PersonOutline";
import TrendingUpIcon         from "@mui/icons-material/TrendingUp";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { useDispatch } from "react-redux";
import { setDynamicLabels, clearDynamicLabels } from "../../redux/slices/breadcrumbSlice";
import {
  useGetCandidateDetailQuery,
  useGetCandidateStageTimelineQuery,
} from "../../redux/services/requisition/requisition";
import { PersonOutlineOutlined } from "@mui/icons-material";

const STAGES = ["Matched", "Shortlisted", "Interviewing", "Selected", "Offer", "Hired"];

const stageColor = (stage, current) => {
  const idx    = STAGES.findIndex(s => s.toLowerCase() === stage.toLowerCase());
  const curIdx = STAGES.findIndex(s => s.toLowerCase() === current?.toLowerCase());
  if (idx < curIdx)  return "#22C55E";
  if (idx === curIdx) return "#FF5F1F";
  return "#D1D5DB";
};

const C = {
  accent:        "#FF5F1F",
  accentSoft:    "#FFF0E8",
  border:        "#E8E8EC",
  textPrimary:   "#111118",
  textSecondary: "#5C5C70",
};

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
export default function CandidateDetail() {
  const { candidateId } = useParams();
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();
  const [activeTab, setActiveTab] = useState(0);



// Use matched_candidate_id from location.state, fallback to candidateId
const matched_candidate_id = location.state?.matched_candidate_id ?? candidateId;

const { data, isLoading, isError, error } = useGetCandidateDetailQuery(matched_candidate_id);


  const candidate = data?.data ?? null;
console.log("candidate",candidate)
  // ✅ Set breadcrumb labels — merge with existing orgId + jobId
  useEffect(() => {
    const labels = {};
    if (location.state?.orgName)  labels.orgId       = location.state.orgName;
    if (location.state?.jobTitle) labels.jobId       = location.state.jobTitle;
    if (candidate?.full_name)     labels.candidateId = candidate.full_name;
    if (Object.keys(labels).length) dispatch(setDynamicLabels(labels));
    return () => dispatch(clearDynamicLabels()); // clear on unmount
  }, [candidate?.full_name, location.state?.orgName, location.state?.jobTitle]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress sx={{ color: C.accent }} />
      </Box>
    );
  }

  if (isError || !candidate) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Failed to load candidate: {error?.data?.message || "Unknown error"}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 1 }}>

      {/* ── Back + Header ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: "4px" }}>
        <Box
          onClick={() => navigate(-1)}
          sx={{ cursor: "pointer", display: "flex", alignItems: "center", color: "#6B7280", "&:hover": { color: "#111827" } }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} />
        </Box>
        <Typography fontSize={20} fontWeight={700} color={C.textPrimary}>
          {candidate.full_name}
        </Typography>
      </Box>
      <Typography fontSize={12} color="#9CA3AF" mb="16px">
        ID: {candidate.clin_id} · Match Score {candidate.match_score}%
      </Typography>

      {/* ── Tabs ── */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={TAB_SX}
      >
        <Tab icon={<PersonOutlineOutlined sx={{ fontSize: 15 }} />}      iconPosition="start" label="Profile"    />
        <Tab icon={<TrendingUpIcon sx={{ fontSize: 15 }} />}         iconPosition="start" label="Timeline"   />
        <Tab icon={<CalendarMonthOutlinedIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="Interviews" />
        <Tab icon={<InsertDriveFileOutlinedIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="Documents" />
      </Tabs>

      {/* ── Tab Panels ── */}
      {activeTab === 0 && <ProfileTab candidate={candidate} />}
      {activeTab === 1 && <TimelineTab candidate={candidate} onInterviewClick={() => setActiveTab(2)} />}
      {activeTab === 2 && <InterviewsTab candidate={candidate} />}
      {activeTab === 3 && <DocumentsTab candidate={candidate} />}
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   TAB 0 — Profile
═══════════════════════════════════════════════ */
function ProfileTab({ candidate }) {
  const rows = [
    { label: "Full Name",      value: candidate.full_name        },
    { label: "Experience",     value: candidate.total_experience },
    { label: "Email",          value: candidate.email            },
    { label: "Phone",          value: candidate.phone_number     },
    { label: "Current Stage",  value: candidate.current_stage    },
    { label: "Availability",   value: candidate.availability === 0 ? "Immediate" : `${candidate.availability} days` },
    { label: "Match Score",    value: `${candidate.match_score}%` },
  ];

  return (
    <Box>
      {/* <Typography fontSize={11} fontWeight={700} color="#9CA3AF"
        letterSpacing="0.08em" mb="16px" sx={{ textTransform: "uppercase" }}>
        Profile
      </Typography> */}

      {/* Avatar + name hero */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: "24px", p: "16px", border: `1px solid ${C.border}`, borderRadius: "12px", backgroundColor: "#fff" }}>
        <Avatar sx={{ width: 56, height: 56, bgcolor: C.accent, fontWeight: 700, fontSize: 22, flexShrink: 0 }}>
          {candidate.full_name?.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Typography fontSize={16} fontWeight={700} color={C.textPrimary}>{candidate.full_name}</Typography>
          <Typography fontSize={12} color={C.textSecondary}>{candidate.clin_id}</Typography>
          <Chip
            label={`${candidate.match_score}% Match`}
            size="small"
            sx={{
              mt: "4px", fontSize: 11, fontWeight: 700, height: 22,
              backgroundColor: candidate.match_score >= 80 ? "#E7F8EE" : "#FFF8E1",
              color: candidate.match_score >= 80 ? "#0F6E56" : "#B45309",
              "& .MuiChip-label": { px: "8px" },
            }}
          />
        </Box>
      </Box>

      {/* Details table */}
      <Box sx={{ maxWidth: 640, border: `1px solid ${C.border}`, borderRadius: "12px", overflow: "hidden", backgroundColor: "#fff" }}>
        {rows.map(({ label, value }, idx) => (
          <Box
            key={label}
            sx={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              px: "16px", py: "12px",
              borderBottom: idx < rows.length - 1 ? `1px solid #F3F4F6` : "none",
            }}
          >
            <Typography fontSize={13} color={C.textSecondary}>{label}</Typography>
            <Typography fontSize={13} fontWeight={500} color={C.textPrimary} sx={{ textTransform: "capitalize" }}>
              {value ?? "—"}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   TAB 1 — Timeline
═══════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════
   Stage config — order matters
═══════════════════════════════════════════════ */
const STAGE_CONFIG = [
  { key: "matched",     label: "Matched"      },
  { key: "shortlisted", label: "Shortlisted"  },
  { key: "interviewing",label: "Interviewing" },  // virtual group
  { key: "selected",    label: "Selected"     },
  { key: "offer",       label: "Offer"        },  // virtual group
  { key: "hired",       label: "Hired"        },
];

// Maps raw API stage keys → which top-level group they belong to
const STAGE_GROUP = {
  matched:              "matched",
  shortlisted:          "shortlisted",
  interview_scheduled:  "interviewing",
  interview_completed:  "interviewing",
  interview_passed:     "interviewing",
  interview_failed:     "interviewing",
  selected:             "selected",
  offer_released:       "offer",
  offer_revoked:        "offer",
  offer_accepted:       "offer",
  offer_declined:       "offer",
  hired:                "hired",
};

const SUB_LABEL = {
  interview_scheduled:  "scheduled",
  interview_completed:  "completed",
  interview_passed:     "passed",
  interview_failed:     "failed",
  offer_released:       "released",
  offer_revoked:        "revoked",
  offer_accepted:       "accepted",
  offer_declined:       "declined",
};

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

/* Dot color logic */
function dotColor(groupKey, entries, currentStage) {
  const groupEntries = entries.filter(e => STAGE_GROUP[e.stage] === groupKey);
  if (!groupEntries.length) return "#D1D5DB"; // pending

  const hasRevoked  = groupEntries.some(e => e.stage === "offer_revoked");
  const hasFailed   = groupEntries.some(e => e.stage === "interview_failed");

  if (hasRevoked || hasFailed) return "#EF4444";

  const groupKeys = STAGE_CONFIG.map(s => s.key);
  const curGroup  = STAGE_GROUP[currentStage?.toLowerCase()] ?? "";
  const curIdx    = groupKeys.indexOf(curGroup);
  const thisIdx   = groupKeys.indexOf(groupKey);

  if (thisIdx < curIdx)  return "#22C55E";   // past
  if (thisIdx === curIdx) return "#FF5F1F";  // current
  return "#D1D5DB";                           // future
}

function subDotColor(stage) {
  if (stage === "offer_revoked" || stage === "interview_failed") return "#EF4444";
  if (stage === "interview_passed" || stage === "offer_accepted") return "#22C55E";
  return "#22C55E";
}

/* ═══════════════════════════════════════════════
   TimelineTab
═══════════════════════════════════════════════ */
function TimelineTab({ candidate, onInterviewClick }) {
  const currentStage = candidate.current_stage ?? "";

  const { data, isLoading } = useGetCandidateStageTimelineQuery(
    candidate.matched_candidate_id,
    { skip: !candidate.matched_candidate_id }
  );

  const entries = data?.data ?? [];

  // Group entries by top-level stage key
  const grouped = {};
  entries.forEach(e => {
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

      {/* ── Left: Stage timeline ── */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography fontSize={11} fontWeight={700} color="#9CA3AF"
          letterSpacing="0.08em" mb="16px" sx={{ textTransform: "uppercase" }}>
          Stage Timeline
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {STAGE_CONFIG.map((stage, i) => {
            const stageEntries = grouped[stage.key] ?? [];
            const isLast       = i === STAGE_CONFIG.length - 1;
            const color        = dotColor(stage.key, entries, currentStage);
            const isCurrent    = STAGE_GROUP[currentStage?.toLowerCase()] === stage.key;

            // Sub-entries (interview rounds, offer sub-stages)
            const hasSubEntries = stageEntries.length > 1 ||
              stageEntries.some(e => SUB_LABEL[e.stage]);

            const firstEntry = stageEntries[0];

            return (
              <Box key={stage.key} sx={{ display: "flex", gap: "16px" }}>

                {/* Dot + connector */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Box sx={{
                    width: 10, height: 10, borderRadius: "50%",
                    backgroundColor: color, mt: "4px", flexShrink: 0,
                    boxShadow: isCurrent ? `0 0 0 3px ${color}33` : "none",
                  }} />
                  {!isLast && (
                    <Box sx={{
                      width: 2, flex: 1,
                      minHeight: hasSubEntries ? 80 : 32,
                      backgroundColor: "#E5E7EB", my: "2px",
                    }} />
                  )}
                </Box>

                {/* Content */}
                <Box sx={{ pb: isLast ? 0 : "8px", width: "100%" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography fontSize={13} fontWeight={600}
                      color={stageEntries.length ? C.textPrimary : "#9CA3AF"}>
                      {stage.label}
                    </Typography>
                    {isCurrent && (
                      <Chip label="current" size="small" sx={{
                        height: 18, fontSize: 10, fontWeight: 700,
                        backgroundColor: `${C.accent}18`, color: C.accent,
                        "& .MuiChip-label": { px: "6px" },
                      }} />
                    )}
                  </Box>

                  {firstEntry ? (
                    <Typography fontSize={11} color={C.textSecondary} mb="4px">
                      {fmtDate(firstEntry.created_at)}
                      {firstEntry.triggered_by && ` · ${firstEntry.triggered_by}`}
                    </Typography>
                  ) : (
                    <Typography fontSize={11} color="#D1D5DB" mb="4px">—</Typography>
                  )}

                  {/* Sub-entries */}
                  {hasSubEntries && stageEntries.map((sub, si) => (
                    <Box key={si} sx={{ display: "flex", alignItems: "flex-start", gap: "8px", mb: "4px" }}>
                      <Box sx={{
                        width: 7, height: 7, borderRadius: "50%", mt: "4px", flexShrink: 0,
                        backgroundColor: subDotColor(sub.stage),
                      }} />
                      <Box>
                        <Typography fontSize={11} color={C.textSecondary} sx={{ textTransform: "capitalize" }}>
                          {sub.step_number ? `Round ${sub.step_number} ` : ""}
                          {SUB_LABEL[sub.stage] ?? sub.stage.replace(/_/g, " ")}
                        </Typography>
                        <Typography fontSize={10} color="#9CA3AF">
                          {fmtDate(sub.created_at)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Grid>

      {/* ── Right: Profile + upcoming interview ── */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography fontSize={11} fontWeight={700} color="#9CA3AF"
          letterSpacing="0.08em" mb="16px" sx={{ textTransform: "uppercase" }}>
          Profile
        </Typography>

        <Box sx={{ border: `1px solid ${C.border}`, borderRadius: "12px", overflow: "hidden", backgroundColor: "#fff" }}>
          {[
            { label: "Experience",    value: candidate.total_experience },
            { label: "Email",         value: candidate.email            },
            { label: "Phone",         value: candidate.phone_number     },
            { label: "Current stage", value: candidate.current_stage?.replace(/_/g, " ") },
          ].map(({ label, value }, idx, arr) => (
            <Box key={label} sx={{
              display: "flex", justifyContent: "space-between", px: "16px", py: "12px",
              borderBottom: idx < arr.length - 1 ? "1px solid #F3F4F6" : "none",
            }}>
              <Typography fontSize={13} color={C.textSecondary}>{label}</Typography>
              <Typography fontSize={13} fontWeight={500} color={C.textPrimary}
                sx={{ textTransform: "capitalize" }}>
                {value ?? "—"}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Upcoming interview card */}
        {candidate.upcoming_interview && (
          <Box sx={{ mt: "16px", p: "14px", border: `1px solid ${C.border}`, borderRadius: "10px", backgroundColor: "#fff" }}>
            <Typography fontSize={12} fontWeight={700} color={C.textPrimary} mb="4px">
              {candidate.upcoming_interview.round_name}
            </Typography>
            <Typography fontSize={11} color={C.textSecondary} mb="10px">
              {fmtDate(candidate.upcoming_interview.scheduled_at)}
              {" · "}
              {new Date(candidate.upcoming_interview.scheduled_at)
                .toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              {" · "}
              <span style={{ textTransform: "capitalize" }}>
                {candidate.upcoming_interview.status}
              </span>
            </Typography>
            <Box onClick={onInterviewClick}
              sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer" }}>
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
   TAB 2 — Interviews
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
            <Chip
              label={iv.status}
              size="small"
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
   TAB 3 — Documents
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
    <Box sx={{ p: "16px", border: `1px solid ${C.border}`, borderRadius: "10px", backgroundColor: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 500 }}>
      <Box>
        <Typography fontSize={13} fontWeight={600} color={C.textPrimary}>Resume</Typography>
        <Typography fontSize={11} color="#9CA3AF" sx={{ wordBreak: "break-all" }}>
          {candidate.resume_url.split("/").pop()}
        </Typography>
      </Box>
      <Button
        size="small"
        variant="outlined"
        href={candidate.resume_url}
        target="_blank"
        sx={{
          borderColor: C.accent, color: C.accent, textTransform: "none",
          fontWeight: 600, borderRadius: "8px", fontSize: 12, flexShrink: 0, ml: 2,
          "&:hover": { backgroundColor: C.accentSoft, borderColor: C.accent },
        }}
      >
        View
      </Button>
    </Box>
  );
}