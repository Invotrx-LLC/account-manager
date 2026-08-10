import React from "react";
import { Box, Typography } from "@mui/material";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import { COLORS, STATUS_COLORS } from "../../../styles/theme";
import CandidateFunnelChart from "./charts/CandidateFunnelChart";
import CandidateStageColumnChart from "./charts/CandidateStageColumnChart";

// Helper to safely get nested values
const getNestedValue = (obj, path) => {
    return path.split(".").reduce((acc, part) => acc?.[part], obj);
};

// Get count safely from flat or nested structure. When the API returns a
// stage as an object (e.g. { total, current, ... }) instead of a plain
// number, prefer the field matching the selected Cumulative/Current toggle
// before falling back to .total/.value.
const getStageCount = (data, key, countsType) => {
    if (!data) return 0;
    const val = getNestedValue(data, key);

    if (typeof val === "number") return val;
    if (typeof val === "object" && val !== null) {
        if (countsType === "current" && val.current !== undefined) return val.current;
        return val.total ?? val.value ?? 0;
    }
    return 0;
};

// ─── Main funnel sequence ──────────────────────────────────────────────────
const MAIN_FLOW_STAGES = [
    { key: "matched", label: "Matched", Icon: GroupsOutlinedIcon, bg: STATUS_COLORS.matched.bg, color: STATUS_COLORS.matched.color },
    { key: "shortlisted", label: "Shortlisted", Icon: FactCheckOutlinedIcon, bg: STATUS_COLORS.shortlisted.bg, color: STATUS_COLORS.shortlisted.color },
    { key: "interviewing", label: "Interviewing", Icon: EventAvailableOutlinedIcon, bg: STATUS_COLORS.interviewing.bg, color: STATUS_COLORS.interviewing.color },
    { key: "selected", label: "Selected", Icon: HowToRegOutlinedIcon, bg: STATUS_COLORS.selected.bg, color: STATUS_COLORS.selected.color },
    {
        key: "offers.offer_released",
        stageKey: "offer_released",
        label: "Offer Released",
        Icon: DescriptionOutlinedIcon,
        bg: STATUS_COLORS.offer_released.bg,
        color: STATUS_COLORS.offer_released.color,
    },
    { key: "onboarded", label: "Onboarded", Icon: VerifiedOutlinedIcon, bg: STATUS_COLORS.onboarded.bg, color: STATUS_COLORS.onboarded.color },
];

const REJECTED_STAGE = {
    key: "rejected", label: "Rejected", Icon: PersonRemoveOutlinedIcon,
    bg: STATUS_COLORS.rejected.bg, color: STATUS_COLORS.rejected.color, textDark: STATUS_COLORS.rejected.color,
};

const SectionLabel = ({ children }) => (
    <Typography sx={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.04em", mb: 0.75 }}>
        {children}
    </Typography>
);

// ── Header Suffix ───────────────────────────────────────────────────────
const HEADER_SUFFIX = {
    cumulative: "Pipeline Analytics",   // Keep this as is
    current: "Current Pipeline",
};

export default function CandidatePipelineFunnel({
    data, totalCount, loading, onStageClick, countsType,
}) {
    const rejectedCount = getStageCount(data, "rejected");

    const funnelData = MAIN_FLOW_STAGES.map((stage) => ({
        key: stage.stageKey || stage.key,
        name: stage.label,
        value: getStageCount(data, stage.key, countsType),
        fill: stage.color,
    }));

    return (
        <Box sx={{ bgcolor: "#fff", borderRadius: "12px", p: 1.5, border: `1px solid ${COLORS.border}`, boxShadow: "0 2px 12px rgba(23,79,223,0.07)", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1, gap: 1, flexWrap: "wrap" }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary }}>
                    Candidate Pipeline
                    <Box component="span" sx={{ color: COLORS.textSecondary, fontWeight: 500 }}>
                        {" "}: {HEADER_SUFFIX[countsType] || HEADER_SUFFIX.cumulative}
                    </Box>
                </Typography>
                {totalCount > 0 && (
                    <Box sx={{ bgcolor: "#EEF3FF", borderRadius: "20px", px: 1.5, py: 0.4 }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 600, color: COLORS.royalBlue }}>
                            {totalCount} total candidates
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Main Flow — "Cumulative" counts strictly narrow stage-over-stage, so a
                funnel's tapering shape fits; "Current" counts are an independent
                snapshot per stage (not monotonically decreasing), so it switches to
                a column chart instead of implying a shrinkage that isn't there. */}
            <SectionLabel>Main Flow</SectionLabel>
            {countsType === "current" ? (
                <CandidateStageColumnChart
                    data={funnelData}
                    loading={loading}
                    onSegmentClick={(stageKey) => onStageClick?.(`candidate_stage_breakdown.${stageKey}`)}
                />
            ) : (
                <CandidateFunnelChart
                    data={funnelData}
                    loading={loading}
                    onSegmentClick={(stageKey) => onStageClick?.(`candidate_stage_breakdown.${stageKey}`)}
                />
            )}

            {/* Rejected — shown as its own stat box rather than a drop-off footnote */}
            {!loading && (
                <Box sx={{ pt: 1, mt: 1, borderTop: `1px solid ${COLORS.border}` }}>
                    {/* <SectionLabel>Dropped Off</SectionLabel> */}
                    <Box
                        onClick={() => rejectedCount > 0 && onStageClick?.("candidate_stage_breakdown.rejected")}
                        sx={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            bgcolor: REJECTED_STAGE.bg, border: `1px solid ${REJECTED_STAGE.color}33`,
                            borderRadius: "10px", px: 1.5, py: 1,
                            cursor: rejectedCount > 0 ? "pointer" : "default",
                            transition: "box-shadow 0.15s",
                            "&:hover": rejectedCount > 0 ? { boxShadow: `0 2px 10px ${REJECTED_STAGE.color}22` } : {},
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box sx={{ width: 26, height: 26, borderRadius: "50%", bgcolor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <PersonRemoveOutlinedIcon sx={{ fontSize: 14, color: REJECTED_STAGE.color }} />
                            </Box>
                            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: REJECTED_STAGE.textDark }}>
                                Rejected Candidates
                            </Typography>
                        </Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: REJECTED_STAGE.color }}>
                            {rejectedCount}
                        </Typography>
                    </Box>
                </Box>
            )}
        </Box>
    );
}
