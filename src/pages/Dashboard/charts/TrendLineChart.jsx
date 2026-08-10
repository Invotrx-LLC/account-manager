import React, { useState } from "react";
import { Box, Typography, IconButton, useTheme, useMediaQuery } from "@mui/material";
import OpenInFullOutlinedIcon from "@mui/icons-material/OpenInFullOutlined";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Sparkline from "./Sparkline";
import ChartExpandDialog from "./ChartExpandDialog";
import { COLORS } from "../../../../styles/theme";

// Some brand colors (e.g. COLORS.skyBlue) are already 8-digit #RRGGBBAA hex —
// naively appending another alpha suffix produces an invalid 10-digit hex
// that the browser silently drops, so strip any existing alpha first.
const withAlpha = (hex, alpha) => `${hex.length === 9 ? hex.slice(0, 7) : hex}${alpha}`;

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: COLORS.navyBlue, color: "#fff", px: 1.4, py: 1, borderRadius: "8px", fontSize: { xs: 12, xl: 14 }, minWidth: 100 }}>
      <Box sx={{ fontWeight: 700, mb: 0.5 }}>{label}</Box>
      {payload.map((p) => (
        <Box key={p.dataKey} sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 0.3 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: p.color, flexShrink: 0 }} />
          <Box component="span">{p.name}: <b>{p.value}</b></Box>
        </Box>
      ))}
    </Box>
  );
};

// ── "line" mode — one spark-chart row per series, instead of a full axis chart ──
const SparkRows = ({ data, series, xKey, large, isDesktop }) => {
  const labels = data.map((row) => row[xKey]);
  const sparkSize = large ? { width: 130, height: 46 } : { width: isDesktop ? 140 : 84, height: isDesktop ? 40 : 30 };
  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 0, gap: large ? 1.5 : 0.5 }}>
      {series.map((s) => {
        const values = data.map((row) => row[s.key] || 0);
        return (
          <Box
            key={s.key}
            sx={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: large ? 2 : 1.5, minHeight: 0,
              px: large ? 2 : 1.5, py: large ? 1.25 : 1,
              borderRadius: large ? "10px" : "8px",
              border: `1px solid ${withAlpha(s.color, "33")}`,
            }}
          >
            <Typography noWrap sx={{ width: large ? 100 : { xs: 62, xl: 82 }, flexShrink: 0, fontSize: large ? 15 : { xs: 10.5, xl: 13.5 }, color: COLORS.textSecondary }}>{s.label}</Typography>
            <Typography sx={{ flex: 1, textAlign: "center", fontSize: large ? 22 : { xs: 13, xl: 16 }, fontWeight: 700, color: COLORS.textPrimary, lineHeight: 1.1 }}>
              {values.reduce((sum, v) => sum + v, 0)}
            </Typography>
            <Box sx={{ width: sparkSize.width, height: sparkSize.height, flexShrink: 0, pl: large ? 1 : 0.75 }}>
              <Sparkline values={values} labels={labels} color={s.color} uid={s.key} width={sparkSize.width} height={sparkSize.height} />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

const ToggleGroup = ({ chartType, onChange, large }) => (
  <Box sx={{ display: "flex", p: "2px", borderRadius: 1.5, bgcolor: "#F1F5F9" }}>
    {["line", "bar"].map((type) => (
      <Box
        key={type}
        onClick={() => onChange(type)}
        sx={{
          px: large ? 1.2 : 0.7, py: large ? 0.4 : 0.2, borderRadius: 1, cursor: "pointer",
          fontSize: large ? 14 : { xs: 9.5, xl: 11.5 }, fontWeight: 700, textTransform: "capitalize",
          bgcolor: chartType === type ? "#fff" : "transparent",
          color: chartType === type ? COLORS.royalBlue : COLORS.textMuted,
          boxShadow: chartType === type ? "0 1px 3px rgba(15,23,42,.12)" : "none",
        }}
      >
        {type}
      </Box>
    ))}
  </Box>
);

const BarView = ({ data, series, xKey, tickFontSize, legendFontSize }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
      <CartesianGrid vertical={false} stroke={COLORS.border} />
      <XAxis dataKey={xKey} tick={{ fontSize: tickFontSize, fill: COLORS.textSecondary }} axisLine={{ stroke: COLORS.border }} tickLine={false} />
      <YAxis allowDecimals={false} tick={{ fontSize: tickFontSize, fill: COLORS.textSecondary }} axisLine={false} tickLine={false} width={30} />
      <Tooltip content={<ChartTooltip />} cursor={{ fill: `${COLORS.royalBlue}0A` }} />
      <Legend wrapperStyle={{ fontSize: legendFontSize }} iconType="circle" iconSize={7} />
      {series.map((s) => (
        <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[3, 3, 0, 0]} maxBarSize={18} />
      ))}
    </BarChart>
  </ResponsiveContainer>
);

// ── Reusable multi-series chart used for Pipeline Trend — "line" is a spark-row
// list, "bar" is the full axis/legend chart. A view button opens the same chart,
// bigger, in a dialog with its own (shared-state) toggle. ────────────────────
const TrendLineChart = ({ title, data = [], series = [], xKey = "label" }) => {
  const [chartType, setChartType] = useState("line");
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("xl"));
  const tickFontSize = isDesktop ? 13 : 10.5;
  const legendFontSize = isDesktop ? 13 : 10.5;

  return (
    <>
      <Box sx={{
        bgcolor: "#fff", p: 1.5, borderRadius: "12px", border: `1px solid ${COLORS.border}`,
        boxShadow: "0 2px 12px rgba(23,79,223,0.07)", height: "100%", display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 0.5 }}>
          <Typography sx={{ fontWeight: 600, fontSize: { xs: 12.5, xl: 16 }, color: COLORS.textPrimary }}>{title}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <ToggleGroup chartType={chartType} onChange={setChartType} />
            <IconButton size="small" onClick={() => setExpanded(true)} sx={{ width: 24, height: 24, color: COLORS.textMuted, "&:hover": { color: COLORS.royalBlue, bgcolor: "#EEF2FF" } }}>
              <OpenInFullOutlinedIcon sx={{ fontSize: 13.5 }} />
            </IconButton>
          </Box>
        </Box>
        {chartType === "line" ? (
          <SparkRows data={data} series={series} xKey={xKey} isDesktop={isDesktop} />
        ) : (
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <BarView data={data} series={series} xKey={xKey} tickFontSize={tickFontSize} legendFontSize={legendFontSize} />
          </Box>
        )}
      </Box>

      <ChartExpandDialog
        open={expanded}
        onClose={() => setExpanded(false)}
        title={title}
        controls={<ToggleGroup chartType={chartType} onChange={setChartType} large />}
      >
        {chartType === "line" ? (
          <SparkRows data={data} series={series} xKey={xKey} large />
        ) : (
          <BarView data={data} series={series} xKey={xKey} tickFontSize={14} legendFontSize={14} />
        )}
      </ChartExpandDialog>
    </>
  );
};

export default TrendLineChart;
