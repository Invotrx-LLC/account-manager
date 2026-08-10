import React from "react";
import { Box, Typography } from "@mui/material";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, ResponsiveContainer } from "recharts";
import { COLORS } from "../../../../styles/theme";

const ColumnTooltip = ({ active, payload }) => {
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

// ── Current-pipeline snapshot as independent columns — "Current" counts are
// candidates sitting in each stage right now, not a cumulative flow, so they
// aren't monotonically decreasing (e.g. "Onboarded" can be >= "Selected").
// A funnel's implied shrinkage would misrepresent that; plain columns show
// each stage's count on its own terms instead.
const CandidateStageColumnChart = ({ data = [], onSegmentClick, loading }) => {
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

  return (
    <Box sx={{ flex: 1, minHeight: 0, height: "100%", overflow: "hidden", pb: 0.5 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 12, bottom: 4, left: 0 }} barCategoryGap="24%">
          <CartesianGrid vertical={false} stroke={COLORS.border} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10.5, fill: COLORS.textSecondary }}
            axisLine={{ stroke: COLORS.border }}
            tickLine={false}
            interval={0}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10.5, fill: COLORS.textSecondary }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip content={<ColumnTooltip />} cursor={{ fill: `${COLORS.royalBlue}0A` }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive animationDuration={700}>
            <LabelList dataKey="value" position="top" fill={COLORS.textPrimary} fontSize={11} fontWeight={600} />
            {data.map((entry) => (
              <Cell
                key={entry.key}
                fill={entry.fill}
                cursor={entry.value > 0 ? "pointer" : "default"}
                onClick={() => entry.value > 0 && onSegmentClick?.(entry.key)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default CandidateStageColumnChart;
