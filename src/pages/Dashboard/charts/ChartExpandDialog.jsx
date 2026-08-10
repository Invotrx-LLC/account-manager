import React from "react";
import { Dialog, DialogContent, IconButton, Typography, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { COLORS } from "../../../../styles/theme";

// ── Shared "view large" dialog shell — chart-specific toggle passed as `controls` ──
const ChartExpandDialog = ({ open, onClose, title, controls, children }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "16px" } }}>
    <Box sx={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      px: 2.5, py: 1.75, borderBottom: `1px solid ${COLORS.border}`,
    }}>
      <Typography sx={{ fontSize: 19, fontWeight: 700, color: COLORS.textPrimary }}>{title}</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {controls}
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ border: `1px solid ${COLORS.border}`, borderRadius: "8px", width: 30, height: 30 }}
        >
          <CloseIcon sx={{ fontSize: 15 }} />
        </IconButton>
      </Box>
    </Box>
    <DialogContent sx={{ height: 360, display: "flex", flexDirection: "column", pt: 2 }}>
      {children}
    </DialogContent>
  </Dialog>
);

export default ChartExpandDialog;
