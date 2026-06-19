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
import { useNavigate } from "react-router-dom";

import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import WorkIcon from "@mui/icons-material/Work";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import { PersonOutlineOutlined } from "@mui/icons-material";

const truncate = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  minWidth: 0,
  flex: 1,
};

const CandidateCard = ({ candidate, handleClick, index = 0, orgId }) => {
  const navigate = useNavigate();

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

  const formatExperience = (val) => (!val ? "-" : val);

  const statusColors = {
    matched: "#64748B",
    shortlisted: "#22C55E",
    rejected: "#EF4444",
    interviewing: "#F59E0B",
    selected: "#10B981",
    onboarded: "#3B82F6",
    pending: "#8B5CF6",
    revoked: "#DC2626",
    waitlisted: "#F97316",
  };

  const status = candidate?.status?.toLowerCase() || "matched";
  const showOpenRequisition = status !== "matched";

  const InfoRow = ({ icon, value, tooltipTitle }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%", overflow: "hidden" }}>
      <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center", color: "#9CA3AF" }}>
        {icon}
      </Box>
      <Tooltip title={tooltipTitle ?? value ?? ""} placement="top" arrow disableHoverListener={!value}>
        <Typography sx={{ ...truncate, fontSize: 13, color: "#374151" }}>
          {value || "-"}
        </Typography>
      </Tooltip>
    </Box>
  );

  return (
    <Card
      sx={{
        width: "100%",
        borderRadius: 3,
        border: "1px solid #E5E7EB",
        background,
        overflow: "visible",
        position: "relative",
        boxShadow: "none",
        transition: "box-shadow 0.2s ease",
        "&:hover": {
          boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
        },
      }}
    >
      {/* Status Badge — small pill, top-left, like reference */}
      {candidate?.status && (
        <Chip
          label={candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
          size="small"
          sx={{
            position: "absolute",
            top: -10,
            left: 14,
            background: statusColors[status] || "#64748B",
            color: "#fff",
            fontWeight: 600,
            fontSize: 11,
            borderRadius: "999px",
            height: 22,
            "& .MuiChip-label": { px: 1.2 },
            zIndex: 2,
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
            top: 10,
            right: 10,
            background: "#16A34A",
            color: "#fff",
            fontWeight: 600,
            fontSize: 11,
            height: 20,
            zIndex: 2,
          }}
        />
      )}

      <CardContent sx={{ pt: 3.5, px: 2.25, pb: 2.25 }}>
        {/* Profile */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 1 }}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: "#F3F4F6", mb: 1 }}>
            <PersonOutlineOutlined sx={{ fontSize: 26, color: "#6B7280" }} />
          </Avatar>

          <Tooltip title={`CLIN${candidate?.clin_id}`} placement="top" arrow>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 16,
                color: "#1E3A8A",
                maxWidth: "100%",
                ...truncate,
                flex: "unset",
                textAlign: "center",
              }}
            >
              CLIN{candidate?.clin_id}
            </Typography>
          </Tooltip>
        </Box>

        {/* SkillIntel Bar — slim, navy fill like reference (not big orange) */}
        <Box mb={1.5}>
          <Box sx={{ position: "relative" }}>
            <LinearProgress
              variant="determinate"
              value={candidate?.match_score || 0}
              sx={{
                height: 16,
                borderRadius: 999,
                backgroundColor: "#E5E7EB",
                "& .MuiLinearProgress-bar": {
                  background: "linear-gradient(90deg, #F59E0B 0%, #FF5722 100%)",
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
                color: "#fff",
                fontWeight: 600,
                fontSize: 10,
                pointerEvents: "none",
              }}
            >
              SkillIntel {candidate?.match_score || 0}%
            </Typography>
          </Box>
        </Box>

        {/* Candidate Details */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 ,mt:1}}>
          <InfoRow
            icon={<CalendarTodayIcon sx={{ fontSize: 15 }} />}
            value={candidate?.designation || "-"}
          />
          <InfoRow
            icon={<WorkIcon sx={{ fontSize: 15 }} />}
            value={formatExperience(candidate?.total_experience)}
          />
          <InfoRow
            icon={<AccessTimeIcon sx={{ fontSize: 15 }} />}
            value={formatAvailability(candidate?.availability)}
          />
          <InfoRow
            icon={<LocationOnIcon sx={{ fontSize: 15 }} />}
            value={candidate?.location || "Not specified"}
          />
        </Box>

        {/* Skills */}
        {candidate?.skills?.length > 0 && (
          <Box mt={1.5} sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {candidate.skills.slice(0, 3).map((skill) => (
              <Tooltip key={skill} title={skill} placement="top" arrow>
                <Chip
                  label={skill}
                  size="small"
                  variant="outlined"
                  sx={{
                    maxWidth: 90,
                    height: 22,
                    fontSize: 11,
                    "& .MuiChip-label": {
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "block",
                      px: 0.8,
                    },
                  }}
                />
              </Tooltip>
            ))}
            {candidate.skills.length > 3 && (
              <Tooltip
                title={candidate.skills.slice(3).join(", ")}
                placement="top"
                arrow
              >
                <Chip
                  label={`+${candidate.skills.length - 3} more`}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: 11,
                    background: "#F3F4F6",
                    color: "#6B7280",
                    fontWeight: 600,
                    cursor: "default",
                  }}
                />
              </Tooltip>
            )}
          </Box>
        )}

        {/* Actions */}
        <Box sx={{ mt: 1.5 }}>
          {showOpenRequisition && (
            <Button
              fullWidth
              variant="text"
              size="small"
              startIcon={<PersonAddAltIcon sx={{ fontSize: 16 }} />}
              onClick={() =>
                navigate(`/account-manager/org/${orgId}`, {
                  state: {
                    editMode: true,
                    requisitionId: candidate?.job_details_id,
                  },
                })
              }
              sx={{
                color: "#FF5722",
                fontWeight: 600,
                fontSize: 12,
                textTransform: "none",
                mb: 1,
                "&:hover": { background: "rgba(255,87,34,0.06)" },
              }}
            >
              Open Requisition
            </Button>
          )}

          <Button
            fullWidth
            variant="contained"
            size="small"
            onClick={handleClick}
            sx={{
              textTransform: "none",
              borderRadius: 1.5,
              background: "#FF5722",
              fontWeight: 600,
              fontSize: 13,
              py: 0.9,
              boxShadow: "none",
              "&:hover": { background: "#E64A19", boxShadow: "none" },
            }}
          >
            View Profile
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CandidateCard;