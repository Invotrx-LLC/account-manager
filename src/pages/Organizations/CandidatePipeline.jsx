import React from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { PRIMARY, C, STATUS_COLORS } from "../../theme/index";

// ─── Main funnel sequence ──────────────────────────────────────────────────
// This is the literal, ordered path a candidate walks through. "Rejected" is
// deliberately NOT in this list — a candidate can be rejected at almost any
// point, so it's shown as a separate drop-off line rather than a fixed step.
// "Offer released" sits at the end of the main flow because it's still a
// single sequential gate every offer-track candidate passes through;
// accepted/rejected/revoked are the three *possible outcomes* of that gate,
// not further steps in sequence — they're rendered as a separate trio below.
const MAIN_FLOW_STAGES = [
  { key: "matched",         label: "Matched",         Icon: GroupsOutlinedIcon,         bg: "#E3F2FD", color: "#1565C0", textDark: "#0D3C61" },
  { key: "shortlisted",     label: "Shortlisted",     Icon: FactCheckOutlinedIcon,       bg: "#EEEDFE", color: "#534AB7", textDark: "#2E2A66" },
  { key: "interviewing",    label: "Interviewing",    Icon: EventAvailableOutlinedIcon,  bg: "#FFF3E0", color: "#C77700", textDark: "#6B4100" },
  { key: "selected",        label: "Selected",        Icon: HowToRegOutlinedIcon,        bg: "#FCE4EC", color: "#AD1457", textDark: "#6B0D34" },
  { key: "offer_released",  label: "Offer released",  Icon: DescriptionOutlinedIcon,     bg: "#E3F2FD", color: "#1976D2", textDark: "#0D3C61" },
  { key: "onboarded",       label: "Onboarded",       Icon: VerifiedOutlinedIcon,        bg: "#E1F5EE", color: "#0F6E56", textDark: "#053D30" },
];

// ─── Offer outcome trio — mutually exclusive results of "offer released" ──
const OFFER_OUTCOME_STAGES = [
  { key: "offer_accepted", label: "Accepted", Icon: ThumbUpOutlinedIcon,       color: "#2E7D32" },
  { key: "offer_rejected", label: "Rejected",  Icon: ThumbDownAltOutlinedIcon, color: "#C62828" },
  { key: "offer_revoked",  label: "Revoked",   Icon: BlockOutlinedIcon,        color: "#455A64" },
];

const formatPct = (current, previous) => {
  if (!previous) return null;
  return Math.round((current / previous) * 100);
};

// ── Single main-flow stage card ─────────────────────────────────────────
const StageCard = ({ stage, count, isEmpty, onClick }) => {
  const { Icon, label, bg, color, textDark } = stage;
  const clickable = !isEmpty && count > 0;

  return (
    <Box
      onClick={clickable ? onClick : undefined}
      sx={{
        minWidth: 110,
        flex: "1 1 110px",
        bgcolor: isEmpty ? PRIMARY.bg : bg,
        border: `1px solid ${isEmpty ? PRIMARY.border : "transparent"}`,
        borderRadius: "10px",
        p: "10px 8px",
        textAlign: "center",
        cursor: clickable ? "pointer" : "default",
        opacity: isEmpty ? 0.6 : 1,
        transition: "transform 0.15s, box-shadow 0.15s",
        "&:hover": clickable
          ? { transform: "translateY(-2px)", boxShadow: `0 4px 14px ${color}30` }
          : {},
      }}
    >
      <Icon sx={{ fontSize: 18, color: isEmpty ? PRIMARY.textMuted : color }} />
      <Typography
        sx={{
          fontSize: 19,
          fontWeight: 700,
          lineHeight: 1.15,
          mt: 0.5,
          color: isEmpty ? PRIMARY.textSecondary : textDark,
        }}
      >
        {count}
      </Typography>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 500,
          mt: 0.25,
          color: isEmpty ? PRIMARY.textMuted : color,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

// ── Connector arrow + conversion % between two stages ──────────────────
const StageConnector = ({ pct }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 38,
      flexShrink: 0,
    }}
  >
    <ArrowForwardIcon sx={{ fontSize: 14, color: PRIMARY.textMuted }} />
    {pct !== null && (
      <Typography sx={{ fontSize: 10, color: PRIMARY.textMuted, fontWeight: 500 }}>
        {pct}%
      </Typography>
    )}
  </Box>
);

// ── Small offer-outcome tile ──────────────────────────────────────────────
const OutcomeTile = ({ stage, count, onClick }) => {
  const { Icon, label, color } = stage;
  const isEmpty = count === 0;
  const clickable = !isEmpty;

  return (
    <Box
      onClick={clickable ? onClick : undefined}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1.5,
        py: 1.25,
        bgcolor: isEmpty ? PRIMARY.bg : `${color}10`,
        border: `1px solid ${isEmpty ? PRIMARY.border : "transparent"}`,
        borderRadius: "8px",
        cursor: clickable ? "pointer" : "default",
        opacity: isEmpty ? 0.6 : 1,
        transition: "background-color 0.15s",
        "&:hover": clickable ? { bgcolor: `${color}1A` } : {},
      }}
    >
      <Icon sx={{ fontSize: 16, color: isEmpty ? PRIMARY.textMuted : color }} />
      <Box>
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: isEmpty ? PRIMARY.textSecondary : color, lineHeight: 1.1 }}>
          {count}
        </Typography>
        <Typography sx={{ fontSize: 11, color: isEmpty ? PRIMARY.textMuted : PRIMARY.textSecondary }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

// ── Section label (small caps eyebrow above each row) ───────────────────
const SectionLabel = ({ children }) => (
  <Typography
    sx={{
      fontSize: 11,
      fontWeight: 600,
      color: PRIMARY.textMuted,
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      mb: 1,
    }}
  >
    {children}
  </Typography>
);

export default function CandidatePipelineFunnel({ data = {}, totalCount = 0, loading = false, onStageClick }) {
  const rejectedCount = data?.rejected || 0;

  // Only show the offer-outcomes row if there's any offer activity at all —
  // no point showing three empty tiles for orgs that haven't reached that
  // stage yet, it'd just be dead weight under the main flow.
  const hasOfferActivity =
    (data?.offer_released || 0) > 0 ||
    (data?.offer_accepted || 0) > 0 ||
    (data?.offer_rejected || 0) > 0 ||
    (data?.offer_revoked || 0) > 0;

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        borderRadius: "12px",
        p: 2,
        border: `1px solid ${PRIMARY.border}`,
        boxShadow: "0 2px 12px rgba(23,79,223,0.07)",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: PRIMARY.textPrimary }}>
          Candidate Pipeline
        </Typography>
        {totalCount > 0 && (
          <Box sx={{ bgcolor: "#EEF3FF", borderRadius: "20px", px: 1.5, py: 0.4 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: PRIMARY.textPrimary }}>
              {totalCount} total candidates
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Main flow ── */}
      <SectionLabel>Main flow</SectionLabel>
      <Box
        sx={{
          display: "flex",
          alignItems: "stretch",
          gap: 0,
          overflowX: "auto",
          pb: 0.5,
          mb: 2,
          "&::-webkit-scrollbar": { height: 4 },
          "&::-webkit-scrollbar-thumb": { background: PRIMARY.border, borderRadius: 4 },
        }}
      >
        {MAIN_FLOW_STAGES.map((stage, idx) => {
          const count = data?.[stage.key] || 0;
          const prevCount = idx > 0 ? data?.[MAIN_FLOW_STAGES[idx - 1].key] || 0 : null;
          const pct = idx > 0 ? formatPct(count, prevCount) : null;
          const isEmpty = count === 0;

          return (
            <React.Fragment key={stage.key}>
              {idx > 0 && <StageConnector pct={pct} />}
              {loading ? (
                <Box sx={{ minWidth: 110, flex: "1 1 110px", bgcolor: PRIMARY.bg, borderRadius: "10px", height: 84 }} />
              ) : (
                <StageCard
                  stage={stage}
                  count={count}
                  isEmpty={isEmpty}
                  onClick={() => onStageClick?.(stage.key)}
                />
              )}
            </React.Fragment>
          );
        })}
      </Box>

      {/* ── Offer outcomes (only rendered if there's any offer activity) ── */}
      {!loading && hasOfferActivity && (
        <>
          <SectionLabel>Offer outcomes</SectionLabel>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 1.25,
              mb: 2,
            }}
          >
            {OFFER_OUTCOME_STAGES.map((stage) => (
              <OutcomeTile
                key={stage.key}
                stage={stage}
                count={data?.[stage.key] || 0}
                onClick={() => onStageClick?.(stage.key)}
              />
            ))}
          </Box>
        </>
      )}

      {/* ── Drop-off line — rejected candidates, shown separately ── */}
      {!loading && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            pt: 1.5,
            borderTop: `1px solid ${PRIMARY.border}`,
          }}
        >
          <PersonRemoveOutlinedIcon sx={{ fontSize: 16, color: "#C62828" }} />
          <Typography sx={{ fontSize: 12, color: PRIMARY.textSecondary }}>
            {rejectedCount} candidate{rejectedCount !== 1 ? "s" : ""} rejected along the way
          </Typography>
          {rejectedCount > 0 && (
            <Tooltip title="View rejected candidates">
              <Typography
                onClick={() => onStageClick?.("rejected")}
                sx={{
                  ml: "auto",
                  fontSize: 12,
                  color: PRIMARY.textPrimary    ,
                  cursor: "pointer",
                  fontWeight: 500,
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                View →
              </Typography>
            </Tooltip>
          )}
        </Box>
      )}
    </Box>
  );
}