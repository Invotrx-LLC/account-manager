import React from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Typography,
  Chip,
  Tooltip,
} from "@mui/material";

import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import WorkIcon from "@mui/icons-material/Work";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
// import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import { PersonOutlineOutlined } from "@mui/icons-material";

const CandidateCard = ({ candidate, handleClick, index = 0 }) => {
  console.log("Candidate Data", candidate);
  const gradients = [
    "linear-gradient(135deg,#F8FBFF,#EEF5FF)",
    "linear-gradient(135deg,#F0FDFA,#ECFDF5)",
    "linear-gradient(135deg,#FDF4FF,#FAF5FF)",
    "linear-gradient(135deg,#FFF7ED,#FFFBEB)",
    "linear-gradient(135deg,#F5F3FF,#EEF2FF)",
  ];

  const background = gradients[index % gradients.length];

  const formatAvailability = (val) => {
    if (!val && val !== 0) return "-";
    if (val === 0) return "Immediately available";
    return `Available in ${val} days`;
  };

  const formatExperience = (val) => {
    if (!val) return "-";
    return val;
  };

  return (
    <Card
      sx={{
        width: "100%",
        borderRadius: 4,
        border: "1px solid #E5E7EB",
        background,
        overflow: "visible",
        position: "relative",
        transition: "0.25s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
        },
      }}
    >
      {/* Status Badge */}
      {candidate?.status && (
        <Chip
          label={candidate.status}
          size="small"
          sx={{
            position: "absolute",
            top: -12,
            left: 16,
            textTransform: "capitalize",
            background:
              candidate.status === "matched"
                ? "#F59E0B"
                : candidate.status === "shortlisted"
                  ? "#10B981"
                  : "#EF4444",
            color: "#fff",
            fontWeight: 600,
            borderRadius: "8px 8px 8px 0",
            height: 26,
          }}
        />
      )}

      {/* New Badge */}
      {candidate?.is_new && (
        <Chip
          label="NEW"
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "#16A34A",
            color: "#fff",
            fontWeight: 700,
          }}
        />
      )}

      <CardContent sx={{ pt: 3 }}>
        {/* Profile — Centered */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: "#E5E7EB",
              mb: 1,
            }}
          >
            <PersonOutlineOutlined sx={{ fontSize: 36, color: "#6B7280" }} />
          </Avatar>

          <Typography sx={{ fontWeight: 700, fontSize: 18, color: "#1D4ED8" }}>
            CLIN{candidate?.clin_id}
          </Typography>
        </Box>

        {/* Skillintel Score Bar */}
        <Box mb={2.5}>
          <Box sx={{ position: "relative" }}>
            <LinearProgress
              variant="determinate"
              value={candidate?.match_score || 0}
              sx={{
                height: 22,
                borderRadius: 999,
                backgroundColor: "#FF5722",
                "& .MuiLinearProgress-bar": {
                  background: "linear-gradient(90deg, #FF5722 0%, #FF9800 100%)",
                  borderRadius: 999,
                },
              }}
            />
            <Typography
              sx={{
                position: "absolute",
                width: "100%",
                top: "50%",
                transform: "translateY(-50%)",
                textAlign: "center",
                fontSize: 12,
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1,
              }}
            >
              Skillintel {candidate?.match_score || 0}%
            </Typography>
          </Box>
        </Box>

        {/* Details */}
        <Box display="flex" flexDirection="column" gap={1.5}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, mt: 1 }}>
            <CalendarTodayIcon fontSize="small" sx={{ color: "#6B7280" }} />
            <Tooltip title={candidate?.designation || ""}>
              <Typography
                // fontSize={14}
                noWrap
                sx={{ maxWidth: 200, fontSize: 14 }}
              >
                {candidate?.designation || "-"}
              </Typography>
            </Tooltip>
          </Box>
          {console.log("candidate...", candidate)}
          <Box sx={{ display: 'flex', gap: 1, alignItems: "center", mb: 1 }}>
            <WorkIcon fontSize="small" sx={{ color: "#6B7280" }} />
            <Typography sx={{ ml: 1, maxWidth: 200, fontSize: 14 }}>
              {formatExperience(candidate?.
                total_experience)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: "center", mb: 1 }}>
            <AccessTimeIcon fontSize="small" sx={{ color: "#6B7280" }} />
            <Typography sx={{ ml: 1, maxWidth: 200, fontSize: 14 }}>
              {formatAvailability(candidate?.availability)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: "center", mb: 1 }}>
            <LocationOnIcon fontSize="small" sx={{ color: "#6B7280" }} />
            <Typography sx={{ ml: 1, maxWidth: 200, fontSize: 14 }}>
              {candidate?.location || "Not specified"}
            </Typography>
          </Box>
        </Box>

        {/* Skills */}
        {candidate?.skills?.length > 0 && (
          <Box mt={2} sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {candidate.skills.slice(0, 4).map((skill) => (
              <Chip key={skill} label={skill} size="small" variant="outlined" />
            ))}
          </Box>
        )}

        {/* Action */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleClick}
          sx={{
            mt: 3,
            textTransform: "none",
            borderRadius: 2,
            background: "#FF5722",
            fontWeight: 600,
            "&:hover": { background: "#FF5722" },
          }}
        >
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
};

export default CandidateCard;