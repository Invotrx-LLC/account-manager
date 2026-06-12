import React from "react";
import { Box, Typography, Button, Chip } from "@mui/material";
// import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";
import { CheckCircleOutlineOutlined } from "@mui/icons-material";
import { PRIMARY } from "../../../theme";
import { useGetMatchingCandidatesMutation } from "../../../redux/services/createRequesition/createRequesition";

const SummaryPage = ({
  summary,
  jobDetailsId,
  setActiveStep,
  orgEmpId
}) => {
  const navigate = useNavigate();

const [getMatchingCandidates, { isLoading }] =
  useGetMatchingCandidatesMutation();
  const handleAgree = async () => {
  try {
    const response = await getMatchingCandidates({
      jobId: jobDetailsId,
      orgEmpId,
    }).unwrap();

    console.log("MATCHED RESPONSE", response);

    navigate("/account-manager/matched-candidates", {
      state: {
        job_details_id: jobDetailsId,
        candidates: response?.data || [],
      },
    });
  } catch (err) {
    console.error(err);
  }
};

  return (
    <Box
      sx={{
        maxWidth: 1000,
        mx: "auto",
        p: 3,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: "16px",
          p: 3,
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 2,
          }}
        >
          <CheckCircleOutlineOutlined
            sx={{
              color: "#16A34A",
              fontSize: 32,
            }}
          />

          <Box>
            <Typography
              sx={{
                fontSize: 24,
                fontWeight: 700,
                color: "#111827",
              }}
            >
              Requisition Summary
            </Typography>

            <Typography
              sx={{
                fontSize: 14,
                color: "#6B7280",
              }}
            >
              Review the generated summary before proceeding
            </Typography>
          </Box>
        </Box>

        <Chip
          label={`Job ID: ${jobDetailsId}`}
          sx={{
            backgroundColor: "#EEF2FF",
            color: "#1D4ED8",
            fontWeight: 600,
          }}
        />
      </Box>

      {/* Summary Card */}
      <Box
        sx={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: "16px",
          p: 4,
          mb: 3,
          boxShadow: "0px 2px 10px rgba(0,0,0,0.04)",
        }}
      >
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 600,
            mb: 2,
            color: "#111827",
          }}
        >
          AI Generated Summary
        </Typography>

        <Box
          sx={{
            backgroundColor: "#F9FAFB",
            border: "1px solid #E5E7EB",
            borderRadius: "12px",
            p: 3,
            minHeight: 250,
          }}
        >
          <Typography
            sx={{
              whiteSpace: "pre-wrap",
              lineHeight: 1.8,
              color: "#374151",
              fontSize: 15,
            }}
          >
            {summary || "No summary generated."}
          </Typography>
        </Box>
      </Box>

      {/* Actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<EditOutlinedIcon />}
          onClick={() => setActiveStep(1)}
          sx={{
            minWidth: 180,
            height: 46,
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Edit Job Details
        </Button>

        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={handleAgree}
          sx={{
            minWidth: 220,
            height: 46,
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 600,
            backgroundColor: PRIMARY.primary,
          }}
        >
          Agree & Continue
        </Button>
      </Box>
    </Box>
  );
};

export default SummaryPage;