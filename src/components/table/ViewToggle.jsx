// src/components/ViewToggle.jsx
// Reusable grid/list toggle button pair

import { Box, IconButton, Tooltip } from "@mui/material";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";

/**
 * Props:
 *   view       – "grid" | "list"
 *   onChange   – (newView: string) => void
 *   accent     – optional accent color (default #FF5F1F)
 */
export default function ViewToggle({ view, onChange, accent = "#FF5F1F" }) {
  const btn = (val, Icon, tip) => (
    <Tooltip title={tip} arrow>
      <IconButton
        size="small"
        onClick={() => onChange(val)}
        sx={{
          borderRadius: "8px",
          width: 32,
          height: 32,
          backgroundColor: view === val ? accent : "transparent",
          color: view === val ? "#fff" : "#9CA3AF",
          "&:hover": {
            backgroundColor: view === val ? accent : "#F3F4F6",
          },
          transition: "all 0.15s",
        }}
      >
        <Icon sx={{ fontSize: 18 }} />
      </IconButton>
    </Tooltip>
  );

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        border: "1px solid #E5E7EB",
        borderRadius: "10px",
        p: "3px",
        backgroundColor: "#F9FAFB",
      }}
    >
      {btn("grid", GridViewIcon, "Grid view")}
      {btn("list", ViewListIcon, "List view")}
    </Box>
  );
}