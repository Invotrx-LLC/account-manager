import React from "react";
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  Chip,
  Alert,
} from "@mui/material";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import LayersIcon from "@mui/icons-material/Layers";

/* ---------------- MOCK DATA ---------------- */
const companies = [
  "Calendly",
  "Postman",
  "SpaceX",
  "Productboard",
  "Canva",
  "Spotify",
  "Segment",
  "Razorpay",
  "Carta",
];

/* ================= MAIN COMPONENT ================= */

export default function AmRequisitions() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: 1,
      }}
    >
      {/* ================= HEADER ================= */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box>
          <Typography fontSize={22} fontWeight={600}>
            Welcome, Shashikumar
          </Typography>
          <Typography fontSize={13} color="#9CA3AF">
            Here's the latest on your team's hires, shifts, and top performers
          </Typography>
        </Box>

        <Chip
          icon={<CalendarMonthOutlined />}
          label="01 Jan 2026 - 07 Jan 2026"
          sx={{
            backgroundColor: "#FFFFFF",
            fontWeight: 500,
          }}
        />
      </Box>

      {/* ================= ALERT ================= */}
      {/* <Alert
        icon={false}
        sx={{
          mb: 3,
          backgroundColor: "#FFF4EC",
          color: "#D9480F",
          borderRadius: 2,
          fontWeight: 500,
        }}
      >
        Alert: 3 clinical programmers serving notice — post replacements on Ri8fit
        now
      </Alert> */}

      {/* ================= CARDS GRID ================= */}
      <Grid container spacing={3}>
        {companies.map((company) => (
          <Grid item size={{ xs: 12, sm: 6, md: 4 }} key={company}>
            <CompanyCard company={company} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

/* ================= COMPANY CARD ================= */

function CompanyCard({ company }) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        padding: 2.5,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            backgroundColor: "#E7F5FF",
            display: "flex", // 🔥 center icon
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <LayersIcon sx={{ color: "#0BB3E6", fontSize: 22 }} />
        </Box>

        <Typography fontWeight={600}>{company}</Typography>
      </Box>

      <Box sx={{ borderTop: "1px solid #E5E7EB", mb: 2 }} />

      {/* Core Company Profile */}
      <Typography fontWeight={600} fontSize={14} mb={1}>
        Core Company Profile
      </Typography>

      <InfoRow label="Company name" value="Calendly Pvt Ltd" />
      <InfoRow label="Location" value="Bangalore" />
      <InfoRow label="Website" value="http://www.calendly.com" />
      <InfoRow label="Industry" value="IT Solutions" />
      <InfoRow label="Timezone" value="IST" />

      {/* Metrics */}
      <Typography fontWeight={600} fontSize={14} mt={2} mb={1}>
        Essential Hiring Metrics
      </Typography>

      <InfoRow label="Total hires made" value="87" />
      <InfoRow label="Hiring success rate" value="87%" />
      <InfoRow label="Active employer companies" value="87" />

      {/* Action */}
      <Box mt="auto">
        <Button
          fullWidth
          disableElevation
          sx={{
            mt: 2,
            backgroundColor: "#FF6B35",
            color: "#FFFFFF",
            borderRadius: 2,
            py: 1.2,
            fontWeight: 600,
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#FF6B35",
            },
          }}
        >
          See Full Details
        </Button>
      </Box>
    </Card>
  );
}

/* ================= INFO ROW ================= */

function InfoRow({ label, value }) {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mb={0.6}
    >
      <Typography fontSize={13} color="#6B7280">
        {label}
      </Typography>
      <Typography fontSize={13} fontWeight={500}>
        {value}
      </Typography>
    </Box>
  );
}
