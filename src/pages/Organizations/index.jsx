// src/pages/Organizations/index.jsx
//
// Example showing how to pass dynamicLabels to <Breadcrumbs />
// when you're on a nested route like:
//   /account-manager/organization/:orgId/requisitions/:jobId
//
// The Breadcrumbs component in DrawerLayout renders automatically for
// top-level routes.  For routes with dynamic segments, render Breadcrumbs
// directly inside the page and pass dynamicLabels.

import React from "react";
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import LayersIcon from "@mui/icons-material/Layers";
import { useNavigate } from "react-router-dom";

import { useGetMyOrganisationsQuery } from "../../redux/services/requisition/requisition";
import Breadcrumbs from "../../components/Breadcrumbs";

/* ─────────────────────────────────────────────────────────── */

export default function AmOrganizations() {
  const { data, isLoading, isError, error } = useGetMyOrganisationsQuery();
  const orgs = data?.data ?? [];

  return (
    <Box sx={{ minHeight: "100vh", p: 1 }}>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography fontSize={22} fontWeight={600}>
            Organizations
          </Typography>
          <Typography fontSize={13} color="#9CA3AF">
            Manage your assigned organizations and drill into requisitions
          </Typography>
        </Box>
        <Chip
          icon={<CalendarMonthOutlined />}
          label="01 Jan 2026 - 07 Jan 2026"
          sx={{ backgroundColor: "#FFFFFF", fontWeight: 500 }}
        />
      </Box>

      {isLoading && (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress sx={{ color: "#FF5F1F" }} />
        </Box>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load organisations: {error?.data?.message ?? error?.status}
        </Alert>
      )}

      {!isLoading && !isError && (
        <Grid container spacing={3} sx={{mt:2}}>
          {orgs.map((org) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }} key={org.id}>
              <CompanyCard org={org} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────── */

function CompanyCard({ org }) {
  const navigate = useNavigate();

  const metrics = [
    { label: "Jobs",        value: org.total_jobs                ?? 0 },
    { label: "Hires",       value: org.total_hires               ?? 0 },
    { label: "Shortlisted", value: org.total_shortlisted         ?? 0 },
    { label: "Selected",    value: org.total_selected            ?? 0 },
    { label: "Interviews",  value: org.total_interviews_scheduled ?? 0 },
    { label: "Success",     value: `${org.success_rate ?? 0}%`   },
  ];

  // Pick a deterministic accent color per org based on name initial
  const ACCENTS = [
    { bg: "#EEF2FF", icon: "#6366F1" },
    { bg: "#E0F2FE", icon: "#0284C7" },
    { bg: "#F0FDF4", icon: "#16A34A" },
    { bg: "#FFF7ED", icon: "#EA580C" },
    { bg: "#FDF4FF", icon: "#A21CAF" },
    { bg: "#F0FDFA", icon: "#0D9488" },
  ];
  const accent = ACCENTS[(org.organisation_name?.charCodeAt(0) ?? 0) % ACCENTS.length];

  return (
    <Card
      sx={{
        borderRadius: "16px",
        border: "1px solid #E8E8EC",
        boxShadow: "none",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "border-color 0.15s",
        "&:hover": { borderColor: "#FF5F1F40" },
      }}
    >
      {/* ── Top accent strip ── */}
      <Box sx={{ height: 4, backgroundColor: accent.icon, opacity: 0.7 }} />

      <Box sx={{ p: "20px", display: "flex", flexDirection: "column", flex: 1 }}>

        {/* ── Header ── */}
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: "12px", mb: "16px" }}>
          <Box sx={{
            width: 42, height: 42, borderRadius: "10px",
            backgroundColor: accent.bg, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Typography fontSize={16} fontWeight={700} color={accent.icon}>
              {org.organisation_name?.charAt(0).toUpperCase()}
            </Typography>
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              fontSize={14} fontWeight={700} color="#111118"
              sx={{ lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {org.organisation_name}
            </Typography>
            <Typography fontSize={11} color="#9CA3AF" mt="2px">
              {org.clin_org_id}
            </Typography>
          </Box>
          {/* Industry badge */}
          {org.industry && (
            <Chip
              label={org.industry}
              size="small"
              sx={{
                ml: "auto", flexShrink: 0, fontSize: 10, height: 20,
                backgroundColor: "#F3F4F6", color: "#6B7280", fontWeight: 500,
                "& .MuiChip-label": { px: "8px" },
              }}
            />
          )}
        </Box>

        {/* ── Location + timezone row ── */}
        <Box sx={{ display: "flex", gap: "6px", mb: "16px", flexWrap: "wrap" }}>
          {org.country && (
            <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#D1D5DB" }} />
              <Typography fontSize={11} color="#9CA3AF">{org.country}</Typography>
            </Box>
          )}
          {org.time_zone && (
            <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#D1D5DB" }} />
              <Typography fontSize={11} color="#9CA3AF">{org.time_zone}</Typography>
            </Box>
          )}
        </Box>

        {/* ── Metrics grid ── */}
        <Box sx={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gap: "8px", mb: "20px",
        }}>
          {metrics.map(({ label, value }) => (
            <Box key={label} sx={{
              backgroundColor: "#F9FAFB", borderRadius: "8px",
              p: "10px 8px", textAlign: "center",
            }}>
              <Typography fontSize={15} fontWeight={700} color="#111118" lineHeight={1}>
                {value}
              </Typography>
              <Typography fontSize={10} color="#9CA3AF" mt="3px" sx={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* ── CTA ── */}
        <Box mt="auto">
          <Button
            fullWidth
            disableElevation
            onClick={() =>
              navigate(`/account-manager/org/${org.id}`, {
                state: { org, orgName: org.organisation_name },
              })
            }
            sx={{
              backgroundColor: "#FF5F1F", color: "#fff",
              borderRadius: "10px", py: "10px",
              fontWeight: 600, fontSize: 13,
              textTransform: "none",
              "&:hover": { backgroundColor: "#E54E10" },
            }}
          >
            See Full Details
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
function InfoRow({ label, value }) {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.6}>
      <Typography fontSize={13} color="#6B7280">{label}</Typography>
      <Typography fontSize={13} fontWeight={500}>{value}</Typography>
    </Box>
  );
}