import { createTheme } from "@mui/material/styles";

export const C = {

    accent: "#6C63FF",
    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#EF4444",
};

export const PRIMARY = {
    fontFamily: "Helvetica",
    primary: "#E54E10",
    bg: "#F9FAFB",
    textMuted: "#9CA3AF",
    textPrimary: "#1F242F",
    textSecondary: "#6B7280",
    label: {
        fontSize: 12,
        fontWeight: 500,
        color: "#6B7280",
    },
    dropDown: {
        fontSize: 5,
    },

    value: {
        fontSize: 14,
        fontWeight: 600,
        color: "#111827",
    },

    heading: {
        fontSize: 18,
        fontWeight: 700,
        color: "#111827",
    },

    subHeading: {
        fontSize: 14,
        fontWeight: 600,
        color: "#374151",
    },

    tableHeader: {
        fontSize: 12,
        fontWeight: 700,
        color: "#6B7280",
        textTransform: "uppercase",
    },

    chip: {
        fontSize: 11,
        fontWeight: 600,
    },
};
const hexToRgba = (hex, alpha) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
export const COLORS = {
  // Hiring Manager Colors
  navyBlue: "#1F242F",
//   royalBlue: "#174FDF",
  royalBlue: "#FF5722",
  skyBlue: "#1750dff6",
  accentCyan: "#00BBD4",

  primaryLight: "#EEF4FF",
  primaryBorder: "#C7D2FE",

  successLight: "#E8F5E9",
  warningBorder: "#FFE0B2",

  shadow: "rgba(23,79,223,0.08)",

  success: "#4CAF50",
  warning: "#FF9800",
  warningLight: "#FFF3E0",
  error: "#F44336",
  errorLight: "#FFEBEE",
  info: "#2196F3",
  infoLight: "#E3F2FD",

  bgPage: "#F4F6FB",
  bgCard: "#FFFFFF",
  border: "#E8ECF4",
  textPrimary: "#1F242F",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",

  // Dashboard pipeline and interview statuses. These are intentionally
  // distinct so status charts, chips, and legends are easy to scan.
  dashboard: {
    matched: "#2563EB",
    shortlisted: "#8B5CF6",
    interviewing: "#F59E0B",
    selected: "#14B8A6",
    onboarded: "#16A34A",
    scheduled: "#EC4899",
    rescheduled: "#06B6D4",
    completed: "#059669",
    cancelled: "#64748B",
  },

  // Candidate Colors
  candidatePrimary: "#2B6F71",
  candidatePrimaryLight: "#D8ECEC",
  candidateBgPage: "#E9EAF0",
  candidateBgCard: "#FFFFFF",
  candidateTextPrimary: "#1F242F",
  candidateTextSecondary: "#9C9C9C",
  candidateTextMuted: "#B5B5B5",
  candidateBorder: "#DDE1EA",
  candidateShadow: "rgba(43,111,113,0.08)",
};
const withTint = (color) => ({ color, bg: hexToRgba(color, 0.14) });

export const Dashboard_STATUS_COLORS = {
  matched: { ...withTint("#94A3B8"), label: "Matched", description: "Initial stage / Neutral" },
  shortlisted: { ...withTint("#2563EB"), label: "Shortlisted", description: "Candidate has been positively identified" },
  interviewing: { ...withTint("#7C3AED"), label: "Interview", description: "Active evaluation stage" },
  selected: { ...withTint("#16A34A"), label: "Selected", description: "Successfully cleared interviews" },
  offer_released: { ...withTint("#D97706"), label: "Offer Released", description: "Waiting on candidate response" },
  offer_accepted: { ...withTint("#059669"), label: "Offer Accepted", description: "Positive confirmation" },
  offer_revoked: { ...withTint("#C2410C"), label: "Offer Revoked", description: "Offer withdrawn by employer" },
  offer_rejected: { ...withTint("#EA580C"), label: "Offer Rejected", description: "Candidate declined the offer" },
  onboarded: { ...withTint("#15803D"), label: "Onboarded", description: "Final successful state" },
  rejected: { ...withTint("#DC2626"), label: "Rejected", description: "" },
};
export const INTERVIEW_ROUND_STATUS_COLORS = {
  scheduled: { ...withTint("#2563EB"), label: "Scheduled", description: "Planned" },
  completed: { ...withTint("#16A34A"), label: "Completed", description: "Successfully conducted" },
  rescheduled: { ...withTint("#D97706"), label: "Rescheduled", description: "Schedule changed" },
  cancelled: { ...withTint("#6B7280"), label: "Cancelled", description: "Neutral cancellation" },
  "no show": { ...withTint("#DC2626"), label: "No Show", description: "Candidate/interviewer absent" },
  "not conducted": { color: "#757575", bg: "#F5F5F5", label: "Not Conducted", description: "" },
};
export const STATUS_COLORS = {

    shortlisted: "#2563EB",
    interviewing: "#7C3AED",
    pending: "#F59E0B",
    onboarded: "#10B981",
    selected: "#059669",
    offerReleased: "#0891B2",
    offerAccepted: "#0D9488",
    waitlisted: "#EA580C",
    revoked: "#DC2626",
    rejected: "#E11D48",
    screening: "#4F46E5",
    assessment: "#8B5CF6",
    backgroundCheck: "#0284C7",
    hold: "#EAB308",
    archived: "#6B7280",
    withdrawn: "#64748B",
};
const theme = createTheme({
    palette: {
        primary: {
            main: C.accent,
        },
    },
});

export default theme;