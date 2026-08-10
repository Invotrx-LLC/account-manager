import React, { useState } from "react";
import { Box, Typography, IconButton, useTheme, useMediaQuery } from "@mui/material";
import OpenInFullOutlinedIcon from "@mui/icons-material/OpenInFullOutlined";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Sparkline from "./Sparkline";
import ChartExpandDialog from "./ChartExpandDialog";
import { COLORS } from "../../../theme/index.js";

const DonutTooltip = ({ active, payload, total }) => {
  if (!active || !payload?.length) return null;
  const { name, value, color } = payload[0].payload;
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <Box sx={{ bgcolor: COLORS.navyBlue, color: "#fff", px: 1.2, py: 0.8, borderRadius: "8px", fontSize: { xs: 12, xl: 14 }, whiteSpace: "nowrap" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: "2px", bgcolor: color, flexShrink: 0 }} />
        <Box component="span">{name}: <b>{value}</b> ({pct}%)</Box>
      </Box>
    </Box>
  );
};

const CategoryBarTrend = ({ data, tickFontSize, large, isDesktop }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} margin={{ top: 8, right: 4, bottom: 2, left: -20 }}>
      <CartesianGrid vertical={false} stroke="#EDF1F7" strokeDasharray="3 3" />
      <XAxis dataKey="name" tick={{ fontSize: tickFontSize, fill: COLORS.textSecondary }} tickLine={false} axisLine={false} interval={0} />
      <YAxis allowDecimals={false} tick={{ fontSize: tickFontSize, fill: COLORS.textSecondary }} tickLine={false} axisLine={false} width={26} />
      <Tooltip content={<DonutTooltip total={data.reduce((sum, item) => sum + item.value, 0)} />} />
      <Bar dataKey="value" radius={[5, 5, 0, 0]} maxBarSize={large ? 44 : isDesktop ? 36 : 28}>
        {data.map((item) => <Cell key={item.name} fill={item.color} />)}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

const LegendList = ({ data, total, large }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: large ? 1.4 : 0.6, minWidth: 0, flex: 1 }}>
    {data.map((d) => (
      <Box key={d.name} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, minWidth: 0 }}>
          <Box sx={{ width: large ? 11 : 8, height: large ? 11 : 8, borderRadius: "2px", bgcolor: d.color, flexShrink: 0 }} />
          <Typography noWrap sx={{ fontSize: large ? 17 : { xs: 11, xl: 14 }, color: COLORS.textSecondary }}>{d.name}</Typography>
        </Box>
        <Typography sx={{ fontSize: large ? 18 : { xs: 11.5, xl: 14.5 }, fontWeight: 700, color: COLORS.textPrimary, flexShrink: 0 }}>
          {d.value}{" "}
          <Box component="span" sx={{ fontSize: large ? 13 : { xs: 9.5, xl: 11.5 }, fontWeight: 500, color: COLORS.textMuted }}>
            ({total ? Math.round((d.value / total) * 100) : 0}%)
          </Box>
        </Typography>
      </Box>
    ))}
  </Box>
);

const DonutView = ({ data, total, large, isDesktop }) => (
  <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: large ? 3 : 1.5, minHeight: 0 }}>
    <Box sx={{ position: "relative", width: "44%", minWidth: large ? 140 : isDesktop ? 112 : 88, height: "100%", flexShrink: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data} dataKey="value" nameKey="name"
            innerRadius="62%" outerRadius="92%" paddingAngle={2}
            isAnimationActive animationDuration={700}
          >
            {data.map((d) => <Cell key={d.name} fill={d.color} stroke="#fff" strokeWidth={2} />)}
          </Pie>
          <Tooltip content={<DonutTooltip total={total} />} />
        </PieChart>
      </ResponsiveContainer>
      <Box sx={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        textAlign: "center", pointerEvents: "none",
      }}>
        <Typography sx={{ fontSize: large ? 36 : { xs: 17, xl: 23 }, fontWeight: 700, color: COLORS.textPrimary, lineHeight: 1 }}>
          {total}
        </Typography>
        <Typography sx={{ fontSize: large ? 14 : { xs: 9, xl: 11 }, color: COLORS.textSecondary }}>total</Typography>
      </Box>
    </Box>
    <LegendList data={data} total={total} large={large} />
  </Box>
);

// ── "line" mode — one spark chart across categories + a legend, since these
// widgets only ever get a single snapshot per category (no monthly history) ──
const CategorySparkTrend = ({ data, total, large, isDesktop }) => {
  const width = large ? 140 : isDesktop ? 150 : 90;
  const height = large ? 60 : isDesktop ? 56 : 40;
  return (
  <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: large ? 3 : 1.5, minHeight: 0 }}>
    <Box sx={{ flexShrink: 0, textAlign: "center" }}>
      <Typography sx={{ fontSize: large ? 40 : { xs: 20, xl: 28 }, fontWeight: 800, color: COLORS.textPrimary, lineHeight: 1 }}>{total}</Typography>
      <Box sx={{ width, height, mt: 0.5 }}>
        <Sparkline
          values={data.map((d) => d.value)}
          labels={data.map((d) => d.name)}
          color={COLORS.royalBlue}
          uid="category-spark"
          width={width}
          height={height}
        />
      </Box>
    </Box>
    <LegendList data={data} total={total} large={large} />
  </Box>
  );
};

const ToggleGroup = ({ chartType, onChange, large, types = ["donut", "bar", "line"] }) => (
  <Box sx={{ display: "flex", p: "2px", borderRadius: 1.5, bgcolor: "#F1F5F9" }}>
    {types.map((type) => (
      <Box
        key={type}
        onClick={() => onChange(type)}
        sx={{
          px: large ? 1.1 : 0.55, py: large ? 0.4 : 0.2, borderRadius: 1, cursor: "pointer",
          fontSize: large ? 14 : { xs: 9, xl: 11 }, fontWeight: 700, textTransform: "capitalize",
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

// ── Reusable donut — used for Candidate Experience & Offer Analysis. A view
// button opens the same chart, bigger, in a dialog with its own toggle. ─────
const DonutChart = ({ title, data = [], chartTypes = ["donut", "bar", "line"] }) => {
  const [chartType, setChartType] = useState("donut");
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("xl"));
  const tickFontSize = isDesktop ? 12 : 9.5;
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);
  const isEmpty = total === 0;

  const renderBody = (large) => {
    if (isEmpty) {
      return (
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography sx={{ fontSize: large ? 16 : { xs: 11.5, xl: 13.5 }, color: COLORS.textMuted }}>No data yet</Typography>
        </Box>
      );
    }
    if (chartType === "bar") {
      return <Box sx={{ flex: 1, minHeight: 0 }}><CategoryBarTrend data={data} tickFontSize={large ? 15 : tickFontSize} large={large} isDesktop={isDesktop} /></Box>;
    }
    if (chartType === "line") {
      return <CategorySparkTrend data={data} total={total} large={large} isDesktop={isDesktop} />;
    }
    return <DonutView data={data} total={total} large={large} isDesktop={isDesktop} />;
  };

  return (
    <>
      <Box sx={{
        bgcolor: "#fff", borderRadius: "12px", p: 1.5, border: `1px solid ${COLORS.border}`,
        boxShadow: "0 2px 12px rgba(23,79,223,0.07)", height: "100%", display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 0.5 }}>
          <Typography sx={{ fontWeight: 600, fontSize: { xs: 12.5, xl: 16 }, color: COLORS.textPrimary }}>{title}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <ToggleGroup chartType={chartType} onChange={setChartType} types={chartTypes} />
            <IconButton size="small" onClick={() => setExpanded(true)} sx={{ width: 24, height: 24, color: COLORS.textMuted, "&:hover": { color: COLORS.royalBlue, bgcolor: "#EEF2FF" } }}>
              <OpenInFullOutlinedIcon sx={{ fontSize: 13.5 }} />
            </IconButton>
          </Box>
        </Box>
        {renderBody(false)}
      </Box>

      <ChartExpandDialog
        open={expanded}
        onClose={() => setExpanded(false)}
        title={title}
        controls={<ToggleGroup chartType={chartType} onChange={setChartType} large types={chartTypes} />}
      >
        {renderBody(true)}
      </ChartExpandDialog>
    </>
  );
};

export default DonutChart;
