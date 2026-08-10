import { styled } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import { Box, Card, Chip } from "@mui/material";
import { COLORS } from "../../../styles/theme";

// ── Layout container ───────────────────────────────────────────────────────
// Fixed to the visible viewport (minus the 52px top AppBar + 8px <main> padding
// from Sidebar.jsx) so the dashboard body fits one screen with no vertical scroll.
export const DashboardContainer = styled(Box)({
  width: "100%",
  height: "calc(100vh - 60px)",
  boxSizing: "border-box",
  backgroundColor: COLORS.bgPage,
  maxWidth: "100%",
  // fontFamily: "Poppins, sans-serif",
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
});

export const Header = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "20px",
  // fontFamily: "Poppins, sans-serif",
});

// ── Stat card — matches reference image style ──────────────────────────────
export const StatCard = styled(Card)(({ accent = COLORS.royalBlue }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 14px",
  backgroundColor: COLORS.bgCard,
  borderRadius: "12px",
  border: `1px solid ${COLORS.border}`,
  boxShadow: "0 2px 12px rgba(23,79,223,0.07)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "4px",
    height: "100%",
    backgroundColor: accent,
    borderRadius: "12px 0 0 12px",
  },
}));

// ── Badge chip for +/-% change ─────────────────────────────────────────────
export const ChangeBadge = styled(Box)(({ positive }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 2,
  padding: "2px 8px",
  borderRadius: "20px",
  fontSize: 11,
  fontWeight: 600,
  backgroundColor: positive ? "#E8F5E9" : "#FFEBEE",
  color: positive ? COLORS.success : COLORS.error,
}));

// ── Section card (Active / Closed Requisitions) ────────────────────────────
export const SectionCard = styled(Card)({
  backgroundColor: COLORS.bgCard,
  borderRadius: "12px",
  padding: "16px",
  border: `1px solid ${COLORS.border}`,
  boxShadow: "0 2px 12px rgba(23,79,223,0.07)",
  height: "340px",
  display: "flex",
  flexDirection: "column",
});

// ── Individual job row ─────────────────────────────────────────────────────
export const JobItem = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 0",
  borderBottom: `1px solid ${COLORS.border}`,
  // fontFamily: "Poppins, sans-serif",
  "&:last-child": { borderBottom: "none" },
});

// ── Status chip ────────────────────────────────────────────────────────────
export const StatusChip = styled(Chip)(({ color }) => ({
  backgroundColor: color === "#FF1050"
    ? "#FFF0F3"
    : color === "#00BBD4"
    ? "#E0F9FC"
    : "#F3F4F6",
  color: color,
  border: `1px solid ${color}33`,
  width: "80px",
  height: "24px",
  fontSize: "11px",
  fontWeight: 600,
  // fontFamily: "Poppins, sans-serif",
}));

// ── Chart wrapper card ─────────────────────────────────────────────────────
export const ChartContainer = styled(Card)({
  padding: "16px",
  backgroundColor: COLORS.bgCard,
  borderRadius: "12px",
  border: `1px solid ${COLORS.border}`,
  boxShadow: "0 2px 12px rgba(23,79,223,0.07)",
  // fontFamily: "Poppins, sans-serif",
});

// ── makeStyles for misc classes ────────────────────────────────────────────
export const getDashboardStyles = makeStyles(() => ({
  dashboard: {
    // fontFamily: "Poppins, sans-serif",
    position: "relative",
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    // fontFamily: "Poppins, sans-serif",
  },

  title: {
    fontSize: "24px",
    fontWeight: "600",
    color: COLORS.textPrimary,
    // fontFamily: "Poppins, sans-serif",
  },

  charts: {
    marginTop: "16px",
    // fontFamily: "Poppins, sans-serif",
  },

  dialogControls: {
    display: "flex",
    gap: "16px",
    marginBottom: "16px",
    // fontFamily: "Poppins, sans-serif",
  },

  searchInput: {
    flex: 1,
    // fontFamily: "Poppins, sans-serif",
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      backgroundColor: COLORS.bgPage,
      "& fieldset": { borderColor: COLORS.border },
      "&:hover fieldset": { borderColor: COLORS.skyBlue },
      "&.Mui-focused fieldset": { borderColor: COLORS.royalBlue },
    },
  },

  sortSelect: {
    minWidth: 150,
    // // fontFamily: "Poppins, sans-serif",
  },

  candidateList: {
    overflowY: "auto",
    // // fontFamily: "Poppins, sans-serif",
    flex: 1,
    maxHeight: "240px",
    "&::-webkit-scrollbar": { width: "4px" },
    "&::-webkit-scrollbar-track": {
      background: "#f1f1f1",
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: COLORS.skyBlue,
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: COLORS.royalBlue,
    },
    scrollbarWidth: "thin",
    scrollbarColor: `${COLORS.skyBlue} #f1f1f1`,
  },
}));
