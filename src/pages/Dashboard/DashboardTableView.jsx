import React from "react";
import {
  Box, Typography, Table, TableHead, TableBody, TableRow, TableCell,
} from "@mui/material";
import { COLORS } from "../../../styles/theme";

const cardSx = {
  bgcolor: "#fff", borderRadius: "12px", border: `1px solid ${COLORS.border}`,
  boxShadow: "0 2px 12px rgba(23,79,223,0.07)", overflow: "hidden",
  display: "flex", flexDirection: "column",
};

const headCellSx = {
  fontWeight: 700, fontSize: 11, color: COLORS.textSecondary, bgcolor: "#F8F9FB",
  borderBottom: `1px solid ${COLORS.border}`, whiteSpace: "nowrap",
};

const Dot = ({ color }) => (
  <Box sx={{ width: 8, height: 8, borderRadius: "2px", bgcolor: color, flexShrink: 0 }} />
);

// ── One card per status/section, each with its own small table — the table-
// view analogue of the individual chart cards in the chart layout. ─────────
const SectionCard = ({ title, columns, rows, renderRow }) => (
  <Box sx={cardSx}>
    <Box sx={{ px: 2, py: 1.25, borderBottom: `1px solid ${COLORS.border}` }}>
      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: COLORS.textPrimary }}>{title}</Typography>
    </Box>
    <Table size="small">
      <TableHead>
        <TableRow>
          {columns.map((c) => (
            <TableCell key={c.key} align={c.align || "left"} sx={{ ...headCellSx, ...(c.key === "total" ? { color: COLORS.royalBlue } : {}) }}>
              {c.label}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map(renderRow)}
      </TableBody>
    </Table>
  </Box>
);

// ── Table view — each status/metric gets its own card+table (mirroring the
// chart layout's one-card-per-chart structure), laid out in a wrapping grid.
// No internal maxHeight/scroll boxes here — this whole area scrolls as one
// continuous region instead of being chopped into nested scrollbars. ───────
const DashboardTableView = ({ monthlyColumns = [], monthlySections = [], snapshotSections = [] }) => {
  const monthlyColumnDefs = [
    { key: "metric", label: "Metric" },
    ...monthlyColumns.map((c) => ({ key: c, label: c, align: "right" })),
    { key: "total", label: "Total", align: "right" },
  ];
  const snapshotColumnDefs = [
    { key: "metric", label: "Metric" },
    { key: "count", label: "Count", align: "right" },
    { key: "share", label: "Share", align: "right" },
  ];

  return (
    <Box sx={{
      flex: 1, minWidth: 0, minHeight: 0, overflowY: "auto", overflowX: "hidden",
      display: "grid", alignContent: "start", gap: 1.5,
      gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" },
    }}>
      {monthlySections.map((section) => (
        <SectionCard
          key={section.title}
          title={section.title}
          columns={monthlyColumnDefs}
          rows={section.rows}
          renderRow={(row) => (
            <TableRow key={row.label} hover sx={{ "&:hover": { bgcolor: "#F8F9FF" } }}>
              <TableCell sx={{ fontSize: 12.5, fontWeight: 600, color: COLORS.textPrimary, borderBottom: `1px solid ${COLORS.border}` }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Dot color={row.color} />
                  {row.label}
                </Box>
              </TableCell>
              {row.values.map((v, i) => (
                <TableCell key={i} align="right" sx={{ fontSize: 12.5, color: COLORS.textSecondary, borderBottom: `1px solid ${COLORS.border}` }}>{v}</TableCell>
              ))}
              <TableCell align="right" sx={{ fontSize: 12.5, fontWeight: 700, color: COLORS.textPrimary, borderBottom: `1px solid ${COLORS.border}` }}>{row.total}</TableCell>
            </TableRow>
          )}
        />
      ))}

      {snapshotSections.map((section) => {
        const sectionTotal = section.rows.reduce((sum, r) => sum + r.value, 0);
        return (
          <SectionCard
            key={section.title}
            title={section.title}
            columns={snapshotColumnDefs}
            rows={section.rows}
            renderRow={(row) => (
              <TableRow key={row.label} hover sx={{ "&:hover": { bgcolor: "#F8F9FF" } }}>
                <TableCell sx={{ fontSize: 12.5, fontWeight: 600, color: COLORS.textPrimary, borderBottom: `1px solid ${COLORS.border}` }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Dot color={row.color} />
                    {row.label}
                  </Box>
                </TableCell>
                <TableCell align="right" sx={{ fontSize: 12.5, fontWeight: 700, color: COLORS.textPrimary, borderBottom: `1px solid ${COLORS.border}` }}>{row.value}</TableCell>
                <TableCell align="right" sx={{ fontSize: 12.5, color: COLORS.textSecondary, borderBottom: `1px solid ${COLORS.border}` }}>
                  {sectionTotal ? Math.round((row.value / sectionTotal) * 100) : 0}%
                </TableCell>
              </TableRow>
            )}
          />
        );
      })}
    </Box>
  );
};

export default DashboardTableView;
