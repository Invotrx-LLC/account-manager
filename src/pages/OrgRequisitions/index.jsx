// src/pages/OrgRequisitions/index.jsx

import React, { useEffect } from "react"; // ❌ remove useContext
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useDispatch } from "react-redux"; // 👈
import {
  setDynamicLabels,
  clearDynamicLabels,
} from "../../redux/slices/breadcrumbSlice"; // 👈

import { useGetOrganisationJobsQuery } from "../../redux/services/requisition/requisition";

/* ─── Design tokens ── */
const C = {
  accent: "#FF5F1F",
  accentSoft: "#FFF0E8",
  green: "#0F6E56",
  greenSoft: "#E7F8EE",
  indigo: "#4338CA",
  indigoSoft: "#EEF2FF",
  amber: "#92400E",
  amberSoft: "#FEF3C7",
  border: "#E8E8EC",
  bgCard: "#F7F7F8",
  textPrimary: "#111118",
  textSecondary: "#5C5C70",
  textTertiary: "#9696A6",
};

const STATUS_CHIP = {
  open: { bg: C.greenSoft, color: C.green },
  active: { bg: C.greenSoft, color: C.green },
  closed: { bg: "#F3F4F6", color: "#6B7280" },
  filled: { bg: C.indigoSoft, color: C.indigo },
  on_hold: { bg: C.amberSoft, color: C.amber },
};
const statusChip = (s = "") =>
  STATUS_CHIP[s.toLowerCase().replace(/\s+/g, "_")] ?? {
    bg: "#F3F4F6",
    color: "#6B7280",
  };

/* ─── Main page ── */
export default function OrgRequisitions() {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const dispatch = useDispatch(); // 👈

  const { data, isLoading, isError, error } = useGetOrganisationJobsQuery({
    orgId,
    status: "all",
  });

  const jobs = data?.data ?? [];
  const orgName = data?.organisation_name ?? null;

  useEffect(() => {
    if (orgName) dispatch(setDynamicLabels({ orgId: orgName })); // 👈
    return () => dispatch(clearDynamicLabels()); // 👈 cleanup on unmount
  }, [orgName]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress sx={{ color: C.accent }} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ m: 2, borderRadius: "10px" }}>
        Failed to load requisitions:{" "}
        {error?.data?.message ?? error?.status ?? "Something went wrong"}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2.5,
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 700,
              color: C.textPrimary,
              lineHeight: 1.2,
            }}
          >
            {orgName ? `${orgName} — Requisitions` : "Requisitions"}
          </Typography>
          <Typography sx={{ fontSize: 13, color: C.textSecondary, mt: 0.5 }}>
            {jobs.length} job requisition{jobs.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
        <Chip
          icon={
            <CalendarMonthOutlinedIcon sx={{ fontSize: "16px !important" }} />
          }
          label="01 Jan 2026 – 07 Jan 2026"
          sx={{
            backgroundColor: "#fff",
            fontWeight: 500,
            border: `1px solid ${C.border}`,
          }}
        />
      </Box>

      {jobs.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 10,
            backgroundColor: "#fff",
            border: `1px solid ${C.border}`,
            borderRadius: "12px",
          }}
        >
          <WorkOutlineRoundedIcon
            sx={{ fontSize: 42, color: C.textTertiary, mb: 1.5 }}
          />
          <Typography
            sx={{ fontSize: 15, fontWeight: 600, color: C.textPrimary }}
          >
            No requisitions found
          </Typography>
          <Typography sx={{ fontSize: 13, color: C.textSecondary, mt: 0.5 }}>
            No job requisitions are currently listed for this organization.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={1.5}>
          {jobs.map((job) => {
            const id = job.job_id ?? job.id;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, xl: 3 }} key={id}>
                <RequisitionCard
                  job={job}
                  onOpen={() =>
                    navigate(
                      `/account-manager/org/${orgId}/requisitions/${id}`,
                      { state: { job, orgName } },
                    )
                  }
                />
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}

/* ─── RequisitionCard — unchanged, keep your existing one ── */
export function RequisitionCard({ job, onOpen }) {
  const [hovered, setHovered] = React.useState(false);

  const title = job.job_title ?? "Untitled";
  const jobId = job.job_position_id ?? job.job_id ?? "—";
  const empType = job.job_type ?? "Full Time";
  const func = job.function ?? null;
  const subFunc = job.sub_function ?? null;
  const minYrs = job.min_years ?? null;
  const maxYrs = job.max_years ?? null;
  const positions = job.no_of_positions ?? null;
  const closingDate = job.closing_date
    ? new Date(job.closing_date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;
  const createdBy = job.created_by ?? null;
  const approver = job.job_approver ?? null;
  const skills = job.skills ? job.skills.split(",").map((s) => s.trim()) : [];
  const status = job.status ?? "open";
  const chip = statusChip(status);

  return (
    <Card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
      sx={{
        borderRadius: "12px",
        border: `1px solid ${hovered ? C.accent : C.border}`,
        boxShadow: hovered ? "0 0 0 3px rgba(255,95,31,0.07)" : "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
        cursor: "pointer",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        sx={{
          p: "16px",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: "12px",
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "8px",
              backgroundColor: C.accentSoft,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WorkOutlineRoundedIcon sx={{ color: C.accent, fontSize: 18 }} />
          </Box>
          <Box
            component="span"
            sx={{
              fontSize: 10,
              fontWeight: 700,
              px: "8px",
              py: "3px",
              borderRadius: "10px",
              backgroundColor: chip.bg,
              color: chip.color,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {status}
          </Box>
        </Box>

        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: C.textPrimary,
            mb: "2px",
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>
        <Typography sx={{ fontSize: 11, color: C.textSecondary, mb: "10px" }}>
          {jobId} · {empType}
        </Typography>

        <Divider sx={{ mb: "10px" }} />

        {(func || subFunc) && (
          <Box sx={{ display: "flex", gap: 0.6, mb: "10px", flexWrap: "wrap" }}>
            {[func, subFunc].filter(Boolean).map((label) => (
              <Chip
                key={label}
                label={label}
                size="small"
                sx={{
                  fontSize: 10,
                  height: 20,
                  textTransform: "capitalize",
                  backgroundColor: "#F3F4F6",
                  color: C.textSecondary,
                  "& .MuiChip-label": { px: "8px" },
                }}
              />
            ))}
          </Box>
        )}

        <Grid container spacing={1} sx={{ mb: "10px" }}>
          {minYrs !== null && maxYrs !== null && (
            <Grid size={{ xs: 6 }}>
              <Box
                sx={{
                  backgroundColor: "#F9FAFB",
                  borderRadius: "8px",
                  p: "8px",
                }}
              >
                <Typography
                  sx={{ fontSize: 10, color: C.textSecondary, mb: "1px" }}
                >
                  Experience
                </Typography>
                <Typography
                  sx={{ fontSize: 12, fontWeight: 700, color: C.textPrimary }}
                >
                  {minYrs}–{maxYrs} yrs
                </Typography>
              </Box>
            </Grid>
          )}
          {positions && (
            <Grid size={{ xs: 6 }}>
              <Box
                sx={{
                  backgroundColor: "#F9FAFB",
                  borderRadius: "8px",
                  p: "8px",
                }}
              >
                <Typography
                  sx={{ fontSize: 10, color: C.textSecondary, mb: "1px" }}
                >
                  Positions
                </Typography>
                <Typography
                  sx={{ fontSize: 12, fontWeight: 700, color: C.textPrimary }}
                >
                  {positions}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        {closingDate && (
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: "6px" }}
          >
            <Typography sx={{ fontSize: 11, color: C.textSecondary }}>
              Closing date
            </Typography>
            <Typography
              sx={{ fontSize: 11, fontWeight: 600, color: C.textPrimary }}
            >
              {closingDate}
            </Typography>
          </Box>
        )}
        {createdBy && (
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: "6px" }}
          >
            <Typography sx={{ fontSize: 11, color: C.textSecondary }}>
              Created by
            </Typography>
            <Typography
              sx={{ fontSize: 11, fontWeight: 600, color: C.textPrimary }}
            >
              {createdBy}
            </Typography>
          </Box>
        )}
        {approver && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: "10px",
            }}
          >
            <Typography sx={{ fontSize: 11, color: C.textSecondary }}>
              Approver
            </Typography>
            <Typography
              sx={{ fontSize: 11, fontWeight: 600, color: C.textPrimary }}
            >
              {approver}
            </Typography>
          </Box>
        )}

        {skills.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: "10px" }}>
            {skills.slice(0, 4).map((skill) => (
              <Chip
                key={skill}
                label={skill}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: 10,
                  height: 20,
                  textTransform: "capitalize",
                  borderColor: C.border,
                  color: C.textSecondary,
                  "& .MuiChip-label": { px: "7px" },
                }}
              />
            ))}
            {skills.length > 4 && (
              <Chip
                label={`+${skills.length - 4} more`}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: 10,
                  height: 20,
                  borderColor: C.border,
                  color: C.textSecondary,
                  "& .MuiChip-label": { px: "7px" },
                }}
              />
            )}
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.4,
            mt: "auto",
            pt: "8px",
          }}
        >
          <Typography
            sx={{
              fontSize: 10.5,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: hovered ? C.accent : C.textTertiary,
              transition: "color 0.15s",
            }}
          >
            See full details
          </Typography>
          <ArrowForwardIcon
            sx={{
              fontSize: 11,
              color: hovered ? C.accent : C.textTertiary,
              transition: "color 0.15s, transform 0.15s",
              transform: hovered ? "translateX(3px)" : "none",
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
