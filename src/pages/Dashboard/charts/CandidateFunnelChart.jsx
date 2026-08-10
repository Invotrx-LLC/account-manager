import React from "react";
import { Box, Typography } from "@mui/material";
import { FunnelChart, Funnel, Cell, LabelList, Tooltip, ResponsiveContainer } from "recharts";
import { COLORS } from "../../../../styles/theme";

const FunnelTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value, fill } = payload[0].payload;
  return (
    <Box sx={{ bgcolor: COLORS.navyBlue, color: "#fff", px: 1.2, py: 0.8, borderRadius: "8px", fontSize: 12, whiteSpace: "nowrap" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: "2px", bgcolor: fill, flexShrink: 0 }} />
        <Box component="span">{name}: <b>{value}</b></Box>
      </Box>
    </Box>
  );
};

// ── Candidate pipeline as a real funnel — click a segment to drill in ─────
const CandidateFunnelChart = ({ data = [], onSegmentClick, loading }) => {
  if (loading) {
    return <Box sx={{ flex: 1, minHeight: 200, borderRadius: "10px", bgcolor: COLORS.bgPage }} />;
  }

  const hasData = data.some((d) => d.value > 0);
  if (!hasData) {
    return (
      <Box sx={{ flex: 1, minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography sx={{ fontSize: 12, color: COLORS.textMuted }}>No pipeline data yet</Typography>
      </Box>
    );
  }

  // Real pipeline counts aren't strictly decreasing (e.g. "Offers" or
  // "Onboarded" can be >= "Selected", since not every offer/onboard traces
  // back through a "selected" marking) — recharts' Funnel assumes a
  // monotonically shrinking series and renders anything that isn't as a
  // flat, untapered rectangle. `sizeValue` drives the trapezoid width (never
  // widening past the narrowest stage so far) while the true count still
  // shows via the "value"-keyed labels/tooltip below.
  let runningMin = Infinity;
  const shapeData = data.map((d) => {
    runningMin = Math.min(runningMin, d.value);
    return { ...d, sizeValue: runningMin };
  });

  return (
    <Box sx={{ flex: 1, minHeight: 0, height: "100%", overflow: "hidden", pb: 0.5 }}>
      <ResponsiveContainer width="100%" height="100%" margin={1}>
        <FunnelChart margin={{ top: 2, right: 30, bottom: 18, left: 20 }}>
          <Tooltip content={<FunnelTooltip />} />
          <Funnel dataKey="sizeValue" data={shapeData} isAnimationActive animationDuration={700} lastShapeType="rectangle">
            <LabelList position="right" dataKey="name" stroke="none" fill={COLORS.textPrimary} fontSize={11} fontWeight={600} offset={12} />
            <LabelList position="left" dataKey="value" stroke="none" fill={COLORS.textSecondary} fontSize={10.5} offset={12} />
            {data.map((entry) => (
              <Cell
                key={entry.key}
                fill={entry.fill}
                cursor={entry.value > 0 ? "pointer" : "default"}
                onClick={() => entry.value > 0 && onSegmentClick?.(entry.key)}
              />
            ))}
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default CandidateFunnelChart;
