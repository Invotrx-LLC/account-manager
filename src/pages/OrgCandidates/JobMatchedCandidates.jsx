// src/pages/OrgCandidates/JobMatchedCandidates.jsx
import React, { useContext, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Box, Grid, Typography, CircularProgress, Avatar, Divider } from "@mui/material";
import EmailOutlinedIcon       from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon       from "@mui/icons-material/PhoneOutlined";
import AccessTimeOutlinedIcon  from "@mui/icons-material/AccessTimeOutlined";
import WorkOutlineRoundedIcon  from "@mui/icons-material/WorkOutlineRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PeopleAltOutlinedIcon   from "@mui/icons-material/PeopleAltOutlined";

import { useGetJobMatchedCandidatesQuery } from "../../redux/services/requisition/requisition";
import { clearDynamicLabels, setDynamicLabels } from "../../redux/slices/breadcrumbSlice";
import { useDispatch } from "react-redux";
// import { BreadcrumbContext } from "../../layout/Drawer";

// ─── Design tokens ────────────────────────────────────────────
const C = {
  accent:      "#FF5F1F", accentSoft: "#FFF0E8",
  green:       "#0F6E56", greenSoft:  "#E7F8EE",
  indigo:      "#4338CA", indigoSoft: "#EEF2FF",
  amber:       "#92400E", amberSoft:  "#FEF3C7",
  border:      "#E8E8EC",
  textPrimary: "#111118", textSecondary: "#5C5C70", textTertiary: "#9696A6",
};

function initials(name = "") {
  return name.trim().split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function scoreStyle(s) {
  if (s >= 90) return { bg: C.greenSoft,  color: C.green,  label: "Excellent" };
  if (s >= 70) return { bg: C.accentSoft, color: C.accent, label: "Good"      };
  return             { bg: C.amberSoft,  color: C.amber,  label: "Fair"      };
}

function stageChip(stage = "") {
  const key = stage.toLowerCase().replace(/_/g, " ");
  const MAP = {
    matched:             { bg: C.indigoSoft, color: C.indigo  },
    shortlisted:         { bg: C.amberSoft,  color: C.amber   },
    interviewing:        { bg: C.accentSoft, color: C.accent  },
    "interview scheduled":{ bg: C.accentSoft,color: C.accent  },
    "interview completed":{ bg: C.greenSoft, color: C.green   },
    selected:            { bg: C.greenSoft,  color: C.green   },
    hired:               { bg: C.greenSoft,  color: C.green   },
    rejected:            { bg: "#FEE2E2",    color: "#B91C1C" },
    "offer revoked":     { bg: "#FEE2E2",    color: "#B91C1C" },
  };
  return MAP[key] ?? { bg: "#F3F4F6", color: "#6B7280" };
}

// ─────────────────────────────────────────────────────────────
// Stat box
// ─────────────────────────────────────────────────────────────
function StatBox({ value, label, bg, color }) {
  return (
    <Box sx={{
      backgroundColor: bg, border: `1px solid ${color}22`,
      borderRadius: "10px", px: "16px", py: "12px",
    }}>
      <Typography sx={{ fontSize: 24, fontWeight: 800, color, lineHeight: 1 }}>{value}</Typography>
      <Typography sx={{ fontSize: 11, color: C.textSecondary, mt: "3px" }}>{label}</Typography>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────
// Candidate Card
// ─────────────────────────────────────────────────────────────
function CandidateCard({ candidate, onClick }) {
  const [hovered, setHovered] = React.useState(false);
  const score = candidate.match_score ?? 0;
  const sc    = scoreStyle(score);
  const stage = stageChip(candidate.current_stage);
  const avail = candidate.availability === 0 ? "Immediate" : `${candidate.availability} days`;

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      sx={{
        backgroundColor: "#fff",
        border:        `1.5px solid ${hovered ? C.accent : C.border}`,
        borderRadius:  "14px",
        p:             "18px",
        cursor:        "pointer",
        height:        "100%",
        display:       "flex",
        flexDirection: "column",
        gap:           "14px",
        transition:    "border-color 0.15s, box-shadow 0.15s, transform 0.15s",
        boxShadow:     hovered
          ? "0 0 0 4px rgba(255,95,31,0.08), 0 4px 16px rgba(0,0,0,0.08)"
          : "0 1px 4px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-2px)" : "none",
      }}
    >
      {/* Avatar + Name + Stage */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <Avatar sx={{
          width: 44, height: 44, borderRadius: "11px",
          backgroundColor: hovered ? C.accent : C.accentSoft,
          color: hovered ? "#fff" : C.accent,
          fontSize: 15, fontWeight: 700, flexShrink: 0,
          transition: "background-color 0.15s, color 0.15s",
        }}>
          {initials(candidate.full_name)}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{
            fontSize: 14, fontWeight: 700, color: C.textPrimary,
            lineHeight: 1.25, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {candidate.full_name}
          </Typography>
          <Typography sx={{ fontSize: 11, color: C.textTertiary, mt: "2px", fontFamily: "monospace" }}>
            {candidate.clin_id}
          </Typography>
        </Box>

        {/* Stage pill */}
        <Box component="span" sx={{
          fontSize: 9, fontWeight: 700, px: "7px", py: "3px",
          borderRadius: "20px", backgroundColor: stage.bg, color: stage.color,
          textTransform: "uppercase", letterSpacing: "0.05em",
          whiteSpace: "nowrap", flexShrink: 0,
        }}>
          {(candidate.current_stage ?? "").replace(/_/g, " ")}
        </Box>
      </Box>

      {/* Match score */}
      <Box sx={{
        backgroundColor: sc.bg, borderRadius: "10px",
        px: "14px", py: "10px", border: `1px solid ${sc.color}22`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Box>
          <Typography sx={{ fontSize: 10, fontWeight: 700, color: sc.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Match Score
          </Typography>
          <Typography sx={{ fontSize: 11, color: C.textSecondary, mt: "1px" }}>{sc.label}</Typography>
        </Box>
        <Typography sx={{ fontSize: 26, fontWeight: 800, color: sc.color, lineHeight: 1 }}>
          {score}<Box component="span" sx={{ fontSize: 14, fontWeight: 600 }}>%</Box>
        </Typography>
      </Box>

      <Divider sx={{ borderColor: C.border }} />

      {/* Info rows */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
        {[
          { Icon: WorkOutlineRoundedIcon, value: candidate.total_experience },
          { Icon: EmailOutlinedIcon,      value: candidate.email,        truncate: true },
          { Icon: PhoneOutlinedIcon,      value: candidate.phone_number  },
          { Icon: AccessTimeOutlinedIcon, value: `Available: ${avail}`   },
        ].map(({ Icon, value, truncate }, i) => (
          <Box key={i} sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Icon sx={{ fontSize: 13, color: C.textTertiary, flexShrink: 0 }} />
            <Typography sx={{
              fontSize: 12, color: C.textSecondary,
              ...(truncate ? { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } : {}),
            }}>
              {value ?? "—"}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* CTA */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "4px", mt: "auto", pt: "2px" }}>
        <Typography sx={{
          fontSize: 10.5, fontWeight: 700,
          color: hovered ? C.accent : C.textTertiary,
          textTransform: "uppercase", letterSpacing: "0.06em",
          transition: "color 0.15s",
        }}>
          View Profile &amp; Timeline
        </Typography>
        <ArrowForwardRoundedIcon sx={{
          fontSize: 12, color: hovered ? C.accent : C.textTertiary,
          transition: "color 0.15s, transform 0.15s",
          transform: hovered ? "translateX(4px)" : "none",
        }} />
      </Box>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <Box sx={{ textAlign: "center", py: 12, backgroundColor: "#fff", border: `1px solid ${C.border}`, borderRadius: "12px" }}>
      <PeopleAltOutlinedIcon sx={{ fontSize: 44, color: C.textTertiary, mb: 1.5 }} />
      <Typography sx={{ fontSize: 15, fontWeight: 600, color: C.textPrimary }}>No matched candidates</Typography>
      <Typography sx={{ fontSize: 13, color: C.textSecondary, mt: 0.5 }}>No candidates have been matched to this requisition yet.</Typography>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
export default function JobMatchedCandidates() {
  const { jobId, orgId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
//   const { setDynamicLabels } = useContext(BreadcrumbContext);

  const { data, isLoading, isError } = useGetJobMatchedCandidatesQuery(jobId);
  const candidates = data?.data ?? [];

  const orgName  = location.state?.orgName  ?? data?.organisation_name ?? null;
  const jobTitle = location.state?.jobTitle ?? data?.job_title         ?? null;

const dispatch = useDispatch();

useEffect(() => {
  const labels = {};

  if (orgName)  labels.orgId = orgName;
  if (jobTitle) labels.jobId = jobTitle;

  if (Object.keys(labels).length) {
    dispatch(setDynamicLabels(labels));
  }

  return () => {
    dispatch(clearDynamicLabels());
  };
}, [orgName, jobTitle, dispatch]);

  // Summary stats
  const perfect   = candidates.filter(c => c.match_score === 100).length;
  const immediate = candidates.filter(c => c.availability === 0).length;
  const avgScore  = candidates.length
    ? Math.round(candidates.reduce((s, c) => s + (c.match_score ?? 0), 0) / candidates.length)
    : 0;

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress sx={{ color: C.accent }} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 3, backgroundColor: "#FEE2E2", borderRadius: "10px", border: "1px solid #FECACA" }}>
        <Typography sx={{ fontSize: 13, color: "#B91C1C" }}>Failed to load candidates. Please try again.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2.5, flexWrap: "wrap", gap: 1.5 }}>
        <Box>
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, lineHeight: 1.2 }}>
            Matched Candidates
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: 13, color: C.textSecondary }}>
              {candidates.length} candidate{candidates.length !== 1 ? "s" : ""} matched
            </Typography>
            {jobTitle && (
              <Box component="span" sx={{
                fontSize: 10.5, fontWeight: 600, px: "8px", py: "2px",
                borderRadius: "20px", backgroundColor: C.accentSoft,
                color: C.accent, fontFamily: "monospace",
              }}>
                {jobTitle}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Stats */}
      {candidates.length > 0 && (
        <Grid container spacing={1.5} sx={{ mb: 3 }}>
          <Grid item size={{xs:6,sm:3}}>
            <StatBox value={candidates.length} label="Total Matched"      bg="#F0F4FF"    color={C.indigo} />
          </Grid>
          <Grid item size={{xs:6,sm:3}}>
            <StatBox value={perfect}           label="Perfect Match"      bg={C.greenSoft} color={C.green}  />
          </Grid>
          <Grid item size={{xs:6,sm:3}}>
            <StatBox value={immediate}         label="Immediate Joiners"  bg={C.accentSoft} color={C.accent} />
          </Grid>
          <Grid item size={{xs:6,sm:3}}>
            <StatBox value={`${avgScore}%`}    label="Avg Match Score"    bg={C.amberSoft} color={C.amber}  />
          </Grid>
        </Grid>
      )}

      {/* Cards */}
      {candidates.length === 0 ? (
        <EmptyState />
      ) : (
        <Grid container spacing={2}>
          {candidates.map((c) => (
            <Grid item size={{xs:12,sm:6,md:4}} key={c.matched_candidate_id} sx={{ display: "flex" }}>
              <CandidateCard
                candidate={c}
                onClick={() =>
                  // ✅ Uses matched_candidate_id to match your App.js route:
                  // org/:orgId/requisitions/:jobId/candidates/:candidateId
                  navigate(
                    `/account-manager/org/${orgId}/requisitions/${jobId}/candidates/${c.matched_candidate_id}`,
                    { state: { orgName, jobTitle } }
                  )
                }
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}