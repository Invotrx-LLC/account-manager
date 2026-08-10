import React, { useState } from "react";
import { Box, Typography, IconButton, useTheme, useMediaQuery } from "@mui/material";
import OpenInFullOutlinedIcon from "@mui/icons-material/OpenInFullOutlined";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ChartExpandDialog from "./ChartExpandDialog";
import { COLORS } from "../../../theme/index.js";

const BarTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value, color } = payload[0].payload;
  return (
    <Box sx={{ bgcolor: COLORS.navyBlue, color: "#fff", px: 1.2, py: 0.8, borderRadius: "8px", fontSize: { xs: 12, xl: 14 }, whiteSpace: "nowrap" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: "2px", bgcolor: color, flexShrink: 0 }} />
        <Box component="span">{name}: <b>{value}</b></Box>
      </Box>
    </Box>
  );
};

const BarView = ({ data, tickFontSize, large, isDesktop }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 0 }} barCategoryGap={large ? "22%" : isDesktop ? "20%" : "28%"}>
      <CartesianGrid horizontal={false} stroke={COLORS.border} />
      <XAxis
        type="number"
        allowDecimals={false}
        tick={{ fontSize: tickFontSize, fill: COLORS.textSecondary }}
        axisLine={{ stroke: COLORS.border }}
        tickLine={false}
      />
      <YAxis
        type="category"
        dataKey="name"
        width={large ? 110 : isDesktop ? 96 : 78}
        interval={0}
        tick={{ fontSize: tickFontSize, fill: COLORS.textSecondary }}
        axisLine={false}
        tickLine={false}
      />
      <Tooltip content={<BarTooltip />} cursor={{ fill: `${COLORS.royalBlue}0A` }} />
      <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={large ? 32 : isDesktop ? 24 : 16}>
        {data.map((d) => <Cell key={d.name} fill={d.color} />)}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

// ── Single-snapshot horizontal bar chart — used when a trend response
// collapses to one bucket (e.g. the "All time" period filter), where a
// month-over-month line/vertical-bar chart would just render one point.
// Keeps the same per-category colour coding as the trend charts it replaces. ──
const HorizontalBarChart = ({ title, data = [] }) => {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("xl"));
  const tickFontSize = isDesktop ? 12 : 9.5;
  const isEmpty = data.every((d) => !d.value);

  return (
    <>
      <Box sx={{
        bgcolor: "#fff", p: 1.5, borderRadius: "12px", border: `1px solid ${COLORS.border}`,
        boxShadow: "0 2px 12px rgba(23,79,223,0.07)", height: "100%", display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 0.5 }}>
          <Typography sx={{ fontWeight: 600, fontSize: { xs: 12.5, xl: 16 }, color: COLORS.textPrimary }}>{title}</Typography>
          <IconButton
            size="small"
            onClick={() => setExpanded(true)}
            sx={{ width: 24, height: 24, color: COLORS.textMuted, "&:hover": { color: COLORS.royalBlue, bgcolor: "#EEF2FF" } }}
          >
            <OpenInFullOutlinedIcon sx={{ fontSize: 13.5 }} />
          </IconButton>
        </Box>
        {isEmpty ? (
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography sx={{ fontSize: { xs: 11.5, xl: 13.5 }, color: COLORS.textMuted }}>No data yet</Typography>
          </Box>
        ) : (
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <BarView data={data} tickFontSize={tickFontSize} isDesktop={isDesktop} />
          </Box>
        )}
      </Box>

      <ChartExpandDialog open={expanded} onClose={() => setExpanded(false)} title={title}>
        <BarView data={data} tickFontSize={14} large />
      </ChartExpandDialog>
    </>
  );
};

export default HorizontalBarChart;
