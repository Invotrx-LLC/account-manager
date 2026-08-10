import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { Sparklines, SparklinesLine, SparklinesSpots } from "react-sparklines";
import { COLORS } from "../../../../styles/theme";

// react-sparklines v1 ships an `onMouseMove` propType but never wires it up —
// there's no built-in hover/tooltip support, so we lay our own even-width hit
// zones (one per data point) over the chart and position a small tooltip from
// the hovered index. Simpler and more reliable than reverse-engineering the
// library's internal point-spacing math.
const formatDateLabel = (label) => {
  if (typeof label === "string" && /^\d{4}-\d{2}$/.test(label)) {
    const [year, month] = label.split("-");
    return new Date(year, month - 1).toLocaleString("default", { month: "short", year: "numeric" });
  }
  return label ?? "";
};

const Sparkline = ({ values = [], labels = [], color = COLORS.royalBlue, uid, width = 96, height = 46 }) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!values.length) return <Box sx={{ width, height }} />;

  const hovered = hoverIndex != null ? { value: values[hoverIndex], label: formatDateLabel(labels[hoverIndex]) } : null;
  const hoverPct = hoverIndex != null ? ((hoverIndex + 0.5) / values.length) * 100 : 0;

  return (
    <Box sx={{ position: "relative", width, height }}>
      <Sparklines data={values} width={width} height={height} margin={4}>
        <SparklinesLine color={color} style={{ fill: color, fillOpacity: 0.18, strokeWidth: 2 }} />
        <SparklinesSpots size={2.5} style={{ fill: color }} spotColors={{ "-1": color }} />
      </Sparklines>

      {/* Invisible per-point hover zones */}
      <Box sx={{ position: "absolute", inset: 0, display: "flex" }}>
        {values.map((_, i) => (
          <Box
            key={i}
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex((prev) => (prev === i ? null : prev))}
            sx={{ flex: 1, height: "100%", cursor: "default" }}
          />
        ))}
      </Box>

      {hovered && (
        <Box
          sx={{
            // Anchored inside the sparkline's own box (not above it) since the
            // parent StatCard uses overflow:hidden for its accent-bar corner
            // radius — anything positioned outside these bounds gets clipped.
            position: "absolute",
            top: 1,
            left: `${hoverPct}%`,
            transform: hoverPct > 75 ? "translate(-90%, 0)" : hoverPct < 25 ? "translate(-10%, 0)" : "translate(-50%, 0)",
            bgcolor: COLORS.navyBlue,
            color: "#fff",
            px: 1,
            py: 0.5,
            borderRadius: "6px",
            fontSize: 10.5,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 5,
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
          }}
        >
          {hovered.label && <Typography sx={{ fontSize: { xs: 9.5, xl: 11 }, opacity: 0.8, lineHeight: 1.2 }}>{hovered.label}</Typography>}
          <Typography sx={{ fontSize: { xs: 11.5, xl: 13 }, fontWeight: 700, lineHeight: 1.2 }}>{hovered.value}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Sparkline;
