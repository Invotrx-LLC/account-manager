// src/pages/Organizations/components/CompanyCard.jsx
import React from "react";
import { Card, Box, Typography, Button } from "@mui/material";
import LayersIcon from "@mui/icons-material/Layers";

function InfoRow({ label, value, highlight = false }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 1,
        borderBottom: "1px solid #f5f5f5",
        "&:last-child": { borderBottom: "none" },
      }}
    >
      <Typography sx={{ fontSize: 14, color: "#64748B" }}>{label}</Typography>
      <Typography 
        sx={{ 
          fontSize: 14, 
          fontWeight: highlight ? 700 : 600,
          color: highlight ? "#ff5722" : "#111" 
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default function CompanyCard({ organisation, onViewDetails }) {
  const { organisation_name, clin_org_id, country, industry } = organisation;

  return (
    <Card
      sx={{
        borderRadius: 3,
        p: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            backgroundColor: "#E7F5FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LayersIcon sx={{ color: "#0BB3E6", fontSize: 24 }} />
        </Box>
        <Typography sx={{ fontWeight: 600, fontSize: 16 }}>
          {organisation_name}
        </Typography>
      </Box>

      <Box sx={{ borderTop: "1px solid #E5E7EB", mb: 2 }} />

      <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>
        Core Company Profile
      </Typography>

      <InfoRow label="Company name" value={organisation_name} />
      <InfoRow label="Clin Org ID" value={clin_org_id} />
      <InfoRow label="Location" value={country || "India"} />
      <InfoRow label="Industry" value={industry || "Technology"} />
      <InfoRow label="Timezone" value="IST" />

      <Typography sx={{ fontWeight: 600, fontSize: 14, mt: 3, mb: 1 }}>
        Essential Hiring Metrics
      </Typography>

      <InfoRow label="Total hires made" value="87" />
      <InfoRow label="Hiring success rate" value="87%" highlight />
      <InfoRow label="Active Jobs" value="4" />

      <Box sx={{ mt: "auto", pt: 2 }}>
        <Button
          fullWidth
          onClick={onViewDetails}
          sx={{
            backgroundColor: "#FF6B35",
            color: "#fff",
            py: 1.3,
            fontWeight: 600,
            "&:hover": { backgroundColor: "#e85a2a" },
          }}
        >
          View Requisitions & Details
        </Button>
      </Box>
    </Card>
  );
}