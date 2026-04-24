// src/pages/RequisitionDetail/ReqCandidatesTab.jsx

import React from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import { useGetMatchedCandidatesQuery } from "../../redux/services/requisition/requisition";
import { useNavigate } from "react-router-dom";

export default function ReqCandidatesTab({ jobId, orgId }) {
  const navigate = useNavigate();

  const { data, isLoading, isError, error } =
    useGetMatchedCandidatesQuery(jobId);

  const candidates = data?.data || [];

  if (isLoading) {
    return (
      <Box textAlign="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        {error?.data?.message || "Failed to load candidates"}
      </Alert>
    );
  }

  if (candidates.length === 0) {
    return (
      <Box textAlign="center" py={6}>
        <Typography>No matched candidates found</Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {candidates.map((c) => (
        <Box
          key={c.candidate_id}
          sx={{
            p: 2,
            border: "1px solid #E5E7EB",
            borderRadius: "10px",
            cursor: "pointer",
          }}
          onClick={() =>
            navigate(`/account-manager/candidate/${c.candidate_id}`, {
              state: {
                orgName: "",
                jobTitle: "",
              },
            })
          }
        >
          <Typography fontWeight={600}>{c.full_name}</Typography>
          <Typography fontSize={12} color="#6B7280">
            {c.email}
          </Typography>
          <Typography fontSize={12}>
            Experience: {c.total_experience}
          </Typography>
          <Typography fontSize={12}>
            Match Score: {c.match_score}%
          </Typography>
        </Box>
      ))}
    </Box>
  );
}