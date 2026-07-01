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