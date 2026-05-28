// src/pages/Organizations/OrgCandidates.jsx

import React, { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom"; // 👈 add useLocation
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Button,
  Divider,
} from "@mui/material";
import { useDispatch } from "react-redux"; // 👈 add
import { setDynamicLabels } from "../../redux/slices/breadcrumbSlice"; // 👈 add

import { useGetJobMatchedCandidatesQuery } from "../../redux/services/requisition/requisition";

export default function OrgCandidates() {
  const { orgId, jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // 👈 add
  const dispatch = useDispatch(); // 👈 add

  const { data, isLoading, isError, error } =
    useGetJobMatchedCandidatesQuery(jobId);

  const candidates = data?.data ?? [];

  // ✅ Read from router state first (passed from OrgRequisitions navigate call)
  const jobTitle = location.state?.jobTitle ?? candidates[0]?.job_title ?? null;
  const orgName =
    location.state?.orgName ?? candidates[0]?.organisation_name ?? null;

  useEffect(() => {
    const labels = {};
    if (orgName) labels.orgId = orgName;
    if (jobTitle) labels.jobId = jobTitle;
    if (Object.keys(labels).length) dispatch(setDynamicLabels(labels)); // 👈 no cleanup — preserve for candidate page
  }, [orgName, jobTitle]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: "#FF5F1F" }} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Failed to load candidates: {error?.data?.message || "Unknown error"}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 1, backgroundColor: "#fff" }}>
      {/* ── Header ── */}
      <Typography variant="h5" fontWeight={600} mb={0.5}>
        Matched Candidates
      </Typography>
      {jobTitle && (
        <Typography fontSize={13} color="#9CA3AF" mb={3}>
          {jobTitle} · {candidates.length} candidate
          {candidates.length !== 1 ? "s" : ""} matched
        </Typography>
      )}

      {/* ── Fallback or Grid ── */}
      {candidates.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <Typography fontSize={14} color="#9CA3AF">
            No matched candidates found for this job.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2.5} mt={2}>
          {candidates.map((candidate) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 3 }}
              key={candidate.matched_candidate_id}
            >
              <CandidateCard
                candidate={candidate}
                onView={() =>
                  navigate(
                    `/account-manager/candidate/${candidate.candidate_id}`, // ✅ use candidate_id not matched_candidate_id
                    {
                      state: {
                        jobTitle,
                        orgName,
                        previousTab: 2,
                      },
                    },
                  )
                }
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

/* ─── Candidate Card ─────────────────────────────────────────── */
function CandidateCard({ candidate, onView }) {
  const [hovered, setHovered] = React.useState(false);

  const matchColor =
    candidate.match_score >= 80
      ? { bg: "#E7F8EE", color: "#0F6E56" }
      : candidate.match_score >= 60
        ? { bg: "#FFF8E1", color: "#B45309" }
        : { bg: "#FEE2E2", color: "#B91C1C" };

  const availabilityLabel =
    candidate.availability === 0
      ? "Immediate"
      : `${candidate.availability} days`;

  return (
    <Card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        height: "100%",
        borderRadius: "12px",
        border: `1px solid ${hovered ? "#FF5F1F" : "#E5E7EB"}`,
        boxShadow: hovered ? "0 0 0 3px rgba(255,95,31,0.07)" : "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
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
        {/* ── Row 1: Avatar + Name + Match Score ── */}
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: "12px" }}
        >
          <Avatar
            sx={{
              width: 42,
              height: 42,
              fontWeight: 700,
              fontSize: 16,
              bgcolor: "#FF5F1F",
              flexShrink: 0,
            }}
          >
            {candidate.full_name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                color: "#111827",
                lineHeight: 1.3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {candidate.full_name}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>
              {candidate.clin_id}
            </Typography>
          </Box>
          <Chip
            label={`${candidate.match_score}%`}
            size="small"
            sx={{
              fontSize: 11,
              fontWeight: 700,
              height: 24,
              backgroundColor: matchColor.bg,
              color: matchColor.color,
              flexShrink: 0,
              "& .MuiChip-label": { px: "8px" },
            }}
          />
        </Box>

        <Divider sx={{ mb: "12px" }} />

        {/* ── Row 2: Stage + Availability ── */}
        <Grid container spacing={1} sx={{ mb: "12px" }}>
          <Grid size={{ xs: 6 }}>
            <Box
              sx={{ backgroundColor: "#F9FAFB", borderRadius: "8px", p: "8px" }}
            >
              <Typography sx={{ fontSize: 10, color: "#6B7280", mb: "2px" }}>
                Stage
              </Typography>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#111827",
                  textTransform: "capitalize",
                }}
              >
                {candidate.current_stage}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Box
              sx={{ backgroundColor: "#F9FAFB", borderRadius: "8px", p: "8px" }}
            >
              <Typography sx={{ fontSize: 10, color: "#6B7280", mb: "2px" }}>
                Availability
              </Typography>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: candidate.availability === 0 ? "#0F6E56" : "#111827",
                }}
              >
                {availabilityLabel}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* ── Row 3–5: Experience, Email, Phone ── */}
        {[
          { label: "Experience", value: candidate.total_experience },
          { label: "Email", value: candidate.email },
          { label: "Phone", value: candidate.phone_number },
        ].map(({ label, value }) => (
          <Box
            key={label}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: "6px",
            }}
          >
            <Typography sx={{ fontSize: 11, color: "#6B7280" }}>
              {label}
            </Typography>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: label === "Experience" ? 600 : 500,
                color: "#111827",
                maxWidth: "60%",
                textAlign: "right",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {value}
            </Typography>
          </Box>
        ))}

        {/* ── Footer: View Button ── */}
        <Box sx={{ mt: "auto", pt: "6px" }}>
          <Button
            variant="outlined"
            fullWidth
            size="small"
            onClick={onView}
            sx={{
              borderColor: "#FF5F1F",
              color: "#FF5F1F",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              fontSize: 12,
              "&:hover": { backgroundColor: "#FFF0E8", borderColor: "#FF5F1F" },
            }}
          >
            View Profile &amp; Timeline
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
