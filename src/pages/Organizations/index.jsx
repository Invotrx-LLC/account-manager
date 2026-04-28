// src/pages/Organizations/index.jsx

import React from "react";
import {
  Box, Typography, Card, Grid, Button,
  Chip, CircularProgress, Alert, Divider,
} from "@mui/material";
import LayersIcon from "@mui/icons-material/Layers";
import { useNavigate } from "react-router-dom";
import { useGetMyOrganisationsQuery } from "../../redux/services/requisition/requisition";

// ─── Design tokens ────────────────────────────────────────────
const C = {
  accent:      "#FF5F1F",
  accentHover: "#E54E10",
  border:      "#E8E8EC",
  textPrimary: "#111118",
  textSecondary: "#5C5C70",
  textTertiary:  "#9696A6",
};

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
export default function AmOrganizations() {
  const { data, isLoading, isError, error } = useGetMyOrganisationsQuery();
  const orgs = data?.data ?? [];

  return (
    <Box sx={{ p: 1 }}>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 22, fontWeight: 700, color: C.textPrimary }}>
          Organizations
        </Typography>
        <Typography sx={{ fontSize: 13, color: C.textTertiary, mt: "4px" }}>
          Manage your assigned organizations and drill into requisitions
        </Typography>
      </Box>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress sx={{ color: C.accent }} />
        </Box>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: "10px" }}>
          Failed to load organisations: {error?.data?.message ?? error?.status}
        </Alert>
      )}

      {!isLoading && !isError && (
        <Grid container spacing={3}>
          {orgs.map((org) => (
            <Grid
              key={org.id}
              size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }}
            >
              <CompanyCard org={org} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────
// Company Card — matches the screenshot layout exactly
// ─────────────────────────────────────────────────────────────
function CompanyCard({ org }) {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        borderRadius: "16px",
        border: `1px solid ${C.border}`,
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "border-color 0.15s, box-shadow 0.15s",
        "&:hover": {
          borderColor: `${C.accent}60`,
          boxShadow: `0 0 0 3px ${C.accent}0D, 0 2px 12px rgba(0,0,0,0.08)`,
        },
      }}
    >
      <Box sx={{ p: "20px 20px 0 20px" }}>

        {/* ── Org header: icon + name ── */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "12px", mb: "18px" }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: "10px",
            backgroundColor: "#E7F5FF", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <LayersIcon sx={{ color: "#0BB3E6", fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{
              fontSize: 15, fontWeight: 700, color: C.textPrimary, lineHeight: 1.25,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {org.organisation_name}
            </Typography>
            <Typography sx={{ fontSize: 11, color: C.textTertiary, mt: "1px" }}>
              {org.clin_org_id}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: C.border, mb: "16px" }} />

        {/* ── Core Company Profile ── */}
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, mb: "10px" }}>
          Core Company Profile
        </Typography>

        <InfoRow label="Company name" value={org.organisation_name} />
        <InfoRow label="Location"     value={org.country      ?? "—"} />
        <InfoRow label="Website"      value={org.website_url  ?? "—"} isLink />
        <InfoRow label="Industry"     value={org.industry     ?? "—"} />
        <InfoRow label="Timezone"     value={org.time_zone    ?? "—"} />

        <Divider sx={{ borderColor: C.border, my: "16px" }} />

        {/* ── Essential Hiring Metrics ── */}
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, mb: "10px" }}>
          Essential Hiring Metrics
        </Typography>

        <InfoRow label="Total hires made"        value={org.total_hires               ?? 0} />
        <InfoRow label="Hiring success rate"      value={`${org.success_rate ?? 0}%`}       />
        <InfoRow label="Active employer companies" value={org.total_jobs               ?? 0} />

      </Box>

      {/* ── CTA Button ── */}
      <Box sx={{ p: "16px 20px 20px 20px", mt: "auto" }}>
        <Button
          fullWidth
          disableElevation
          onClick={() =>
            navigate(`/account-manager/org/${org.id}`, {
              state: { orgName: org.organisation_name },
            })
          }
          sx={{
            backgroundColor: C.accent,
            color: "#fff",
            borderRadius: "10px",
            py: "11px",
            fontWeight: 600,
            fontSize: 13,
            textTransform: "none",
            "&:hover": { backgroundColor: C.accentHover },
          }}
        >
          See Full Details
        </Button>
      </Box>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// InfoRow — matches screenshot label/value layout
// ─────────────────────────────────────────────────────────────
function InfoRow({ label, value, isLink }) {
  return (
    <Box sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      mb: "8px",
    }}>
      <Typography sx={{ fontSize: 13, color: C.textSecondary, flexShrink: 0, mr: 1 }}>
        {label}
      </Typography>
      <Typography sx={{
        fontSize: 13,
        fontWeight: 600,
        color: isLink ? "#3B82F6" : C.textPrimary,
        textAlign: "right",
        maxWidth: "60%",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        textDecoration: isLink ? "none" : "none",
      }}>
        {value}
      </Typography>
    </Box>
  );
}
 