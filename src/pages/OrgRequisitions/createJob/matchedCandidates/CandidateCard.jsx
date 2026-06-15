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

// Shared truncation style — apply to any Typography that can overflow
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

  // ─── Info row helper ────────────────────────────────────────────────────────
  // Wraps icon + truncated text; tooltip shows full value on hover
  const InfoRow = ({ icon, value, tooltipTitle }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, width: "100%", overflow: "hidden" }}>
      <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center", color: "#6B7280" }}>
        {icon}
      </Box>
      <Tooltip title={tooltipTitle ?? value ?? ""} placement="top" arrow disableHoverListener={!value}>
        <Typography sx={{ ...truncate, fontSize: 14, color: "#374151" }}>
          {value || "-"}
        </Typography>
      </Tooltip>
    </Box>
  );

  return (
    <Card
      sx={{
        width: "100%",
        borderRadius: 4,
        border: "1px solid #E5E7EB",
        background,
        overflow: "visible",
        position: "relative",
        transition: "all 0.25s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
        },
      }}
    >
      {/* Status Badge */}
      {candidate?.status && (
        <Chip
          label={candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
          size="small"
          sx={{
            position: "absolute",
            top: -12,
            left: 16,
            background: statusColors[status] || "#64748B",
            color: "#fff",
            fontWeight: 700,
            borderRadius: "8px 8px 8px 0",
            height: 28,
            px: 0.5,
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
            top: 12,
            right: 12,
            background: "#16A34A",
            color: "#fff",
            fontWeight: 700,
            zIndex: 2,
          }}
        />
      )}

      <CardContent sx={{ pt: 4 }}>
        {/* ── Profile ── */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: "#F3F4F6", mb: 1 }}>
            <PersonOutlineOutlined sx={{ fontSize: 36, color: "#6B7280" }} />
          </Avatar>

          {/* CLIN ID — truncated if somehow very long */}
          <Tooltip title={`CLIN${candidate?.clin_id}`} placement="top" arrow>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 20,
                color: "#1E3A8A",
                maxWidth: "100%",
                ...truncate,
                flex: "unset",        // override flex:1 from truncate for centered block
                textAlign: "center",
              }}
            >
              CLIN{candidate?.clin_id}
            </Typography>
          </Tooltip>
        </Box>

        {/* ── SkillIntel Bar ── */}
        <Box mb={2}>
          <Box sx={{ position: "relative" }}>
            <LinearProgress
              variant="determinate"
              value={candidate?.match_score || 0}
              sx={{
                height: 22,
                borderRadius: 999,
                backgroundColor: "#E5E7EB",
                "& .MuiLinearProgress-bar": {
                  // background: "linear-gradient(90deg,#0F4C8A 0%,#FF5722 100%)",
                  background:
  "linear-gradient(90deg, #F59E0B 0%, #FF5722 100%)",
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
                fontWeight: 700,
                fontSize: 12,
                pointerEvents: "none",
              }}
            >
              SkillIntel {candidate?.match_score || 0}%
            </Typography>
          </Box>
        </Box>

        {/* ── Candidate Details ── */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 ,mt:1}}>
          <InfoRow
            icon={<CalendarTodayIcon fontSize="small" />}
            value={candidate?.designation || "-"}
          />
          <InfoRow
            icon={<WorkIcon fontSize="small" />}
            value={formatExperience(candidate?.total_experience)}
          />
          <InfoRow
            icon={<AccessTimeIcon fontSize="small" />}
            value={formatAvailability(candidate?.availability)}
          />
          <InfoRow
            icon={<LocationOnIcon fontSize="small" />}
            value={candidate?.location || "Not specified"}
          />
        </Box>

        {/* ── Skills ── */}
        {candidate?.skills?.length > 0 && (
          <Box mt={2} sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {candidate.skills.slice(0, 3).map((skill) => (
              <Tooltip key={skill} title={skill} placement="top" arrow>
                <Chip
                  label={skill}
                  size="small"
                  variant="outlined"
                  sx={{
                    maxWidth: 100,
                    "& .MuiChip-label": {
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "block",
                    },
                  }}
                />
              </Tooltip>
            ))}
            {/* +N more chip if skills > 3 */}
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

        {/* ── Actions ── */}
        <Box sx={{ mt: 1 }}>
          {/* Reserve space so cards stay same height */}
          <Box
            sx={{
              minHeight: 42,
              mb: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {showOpenRequisition && (
              <Button
                fullWidth
                variant="text"
                startIcon={<PersonAddAltIcon />}
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
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": { background: "rgba(255,87,34,0.06)" },
                }}
              >
                Open Requisition
              </Button>
            )}
          </Box>

          <Button
            fullWidth
            variant="contained"
            onClick={handleClick}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              background: "#FF5722",
              fontWeight: 700,
              py: 1.2,
              boxShadow: "0 4px 12px rgba(255,87,34,0.25)",
              "&:hover": { background: "#E64A19" },
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