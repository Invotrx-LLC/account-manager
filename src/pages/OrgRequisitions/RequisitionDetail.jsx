// src/pages/OrgRequisitions/RequisitionDetail.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Button,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

// ── Safe core MUI icons (available in all MUI v5 installs) ──
import ArrowBack from "@mui/icons-material/ArrowBack";
import Business from "@mui/icons-material/Business";
import AccountTree from "@mui/icons-material/AccountTree";
import TrendingUp from "@mui/icons-material/TrendingUp";
import Group from "@mui/icons-material/Group";
import CalendarToday from "@mui/icons-material/CalendarToday";
import Person from "@mui/icons-material/Person";
import Security from "@mui/icons-material/Security";
import CheckCircle from "@mui/icons-material/CheckCircle";
import HourglassEmpty from "@mui/icons-material/HourglassEmpty";
import Cancel from "@mui/icons-material/Cancel";
import AccessTime from "@mui/icons-material/AccessTime";
import Event from "@mui/icons-material/Event";

import { useDispatch } from "react-redux";
import { setDynamicLabels } from "../../redux/slices/breadcrumbSlice";
import {
  useGetOrganisationJobsQuery,
  useGetJobMatchedCandidatesQuery,
  useGetOrganisationInterviewsQuery,
  useGetJobDetailsQuery,
  useGetJobInterviewsQuery,
} from "../../redux/services/requisition/requisition";
import ReusableMRT from "../../components/table";
import ViewToggle from "../../components/table/ViewToggle";
import SearchFilter from "../../components/searchFilter";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { toast } from "react-toastify";
import { useUploadCandidateResumeMutation } from "../../redux/services/requisition/requisition";
import { BusinessCenterOutlined, PeopleOutlineOutlined, WorkOutlined } from "@mui/icons-material";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";

import LaptopOutlinedIcon from "@mui/icons-material/LaptopOutlined";
// import WorkOutlineIcon             from "@mui/icons-material/WorkOutline";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
// import PersonOutlineOutlinedIcon   from "@mui/icons-material/PersonOutlineOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
// import PeopleOutlineIcon           from "@mui/icons-material/PeopleOutline";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

// Copy these constants from your CandidatesPage file:
const DOMAIN_OPTIONS = ["clinical"];
const FUNCTION_OPTIONS = [
  "biostatistics", "clinical_data_management"

];
const SUB_FUNCTION_MAP = {
  biostatistics: ["statistical_programmer", "biostatistician", "sas_programmer"],
  clinical_data_management: ["clinical_programmer", "crf_developer", "clinical_data_manager"],
  // clinical_operations:      ["clinical_research_associate", "clinical_trial_manager", "site_coordinator"],
  // medical_writing:          ["medical_writer", "regulatory_writer"],
  // pharmacovigilance:        ["safety_associate", "pv_specialist"],
  // regulatory_affairs:       ["regulatory_specialist", "submissions_manager"],
};
// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  accent: "#FF5F1F",
  accentSoft: "#FFF5F0",
  accentBorder: "#FFD4BC",
  bg: "#F7F7F9",
  surface: "#FFFFFF",
  surfaceAlt: "#FAFAFA",
  border: "#EBEBF0",
  borderStrong: "#D8D8E4",
  text: "#0D0D12",
  textSub: "#4A4A5E",
  textMuted: "#8888A0",
  green: "#059669", greenSoft: "#ECFDF5", greenBorder: "#6EE7B7",
  blue: "#2563EB", blueSoft: "#EFF6FF", blueBorder: "#93C5FD",
  amber: "#D97706", amberSoft: "#FFFBEB", amberBorder: "#FCD34D",
  red: "#DC2626", redSoft: "#FEF2F2", redBorder: "#FCA5A5",
  indigo: "#4F46E5", indigoSoft: "#EEF2FF", indigoBorder: "#C7D2FE",
  purple: "#7C3AED", purpleSoft: "#F5F3FF", purpleBorder: "#DDD6FE",
};

/* ═══════════════════════════════════════
   TINY HELPERS
═══════════════════════════════════════ */
function avatarColor(name = "") {
  const PALETTE = ["#FF5F1F", "#4F46E5", "#059669", "#7C3AED", "#0EA5E9", "#EC4899", "#F59E0B", "#14B8A6"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
}

function normalizeArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(s => s && s.trim());
  if (typeof v === "string") return v.split(",").map(s => s.trim()).filter(Boolean);
  return [];
}





export default function RequisitionDetail() {
  const { orgId, jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [tab, setTab] = useState(location.state?.activeReqTab ?? 0);

  // ── List query (still needed for breadcrumb + fallback) ──
  const { data: jobsData, isLoading: jobsLoading } =
    useGetOrganisationJobsQuery({ orgId, status: "all" });

  // ── Detail query — rich data for Overview tab ──
  const { data: detailData, isLoading: detailLoading } =
    useGetJobDetailsQuery(jobId);

  const job =
    location.state?.job ??
    jobsData?.data?.find((j) => (j.job_id ?? j.id) === jobId);
  const jobDetail = detailData?.data ?? null;
  const orgName = location.state?.orgName ?? null;

  useEffect(() => {
    const labels = {};
    if (orgName) labels.orgId = orgName;
    if (job?.job_title) labels.jobId = job.job_title;
    if (Object.keys(labels).length) dispatch(setDynamicLabels(labels));
  }, [orgName, job?.job_title]);

  const isLoading = jobsLoading || detailLoading;

  if (isLoading || !job) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress sx={{ color: C.accent }} />
      </Box>
    );
  }

  const TAB_SX = {
    borderBottom: "1px solid #E5E7EB",
    mb: "24px",
    "& .MuiTab-root": {
      textTransform: "none",
      fontSize: 13,
      fontWeight: 500,
      color: "#6B7280",
      minWidth: "auto",
      px: "4px",
      mr: "24px",
    },
    "& .Mui-selected": { color: `${C.accent} !important`, fontWeight: 600 },
    "& .MuiTabs-indicator": { backgroundColor: C.accent },
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
  const chip = statusChip(job.status ?? jobDetail?.status);
return (
  <Box sx={{ p: 1 }}>
    {/* ── Header with background ── */}
    <Box
      sx={{
        background: "linear-gradient(135deg, #FFF7F4 0%, #FFF0E8 60%, #FEF3EE 100%)",
        border: "1px solid #F9C4AE",
        borderRadius: "12px",
        px: "16px",
        py: "14px",
        mb: "5px",
      }}
    >
      {/* Title row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          mb: "6px",
        }}
      >
        <ArrowBack
          sx={{
            fontSize: 28,
            color: C.text,
            padding: "5px",
            borderRadius: "8px",
            transition: "all 0.2s ease",
            "&:hover": {
              color: C.accent,
              backgroundColor: "rgba(232,72,12,0.12)",
              cursor: "pointer",
              transform: "translateX(-2px)",
            },
          }}
          onClick={() =>
            navigate(`/account-manager/org/${orgId}`, {
              state: { activeTab: location.state?.previousTab ?? 1 },
            })
          }
        />

        <Typography sx={{ fontSize: "18px", fontWeight: 700, color: C.textPrimary }}>
          {jobDetail?.jobTitle ?? job.job_title}
        </Typography>

        {/* Status chip */}
        <Box
          component="span"
          sx={{
            fontSize: 11,
            fontWeight: 700,
            px: "10px",
            py: "3px",
            borderRadius: "6px",
            backgroundColor: chip.bg,
            color: chip.color,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            border: `1px solid ${chip.border ?? chip.bg}`,
          }}
        >
          {jobDetail?.status ?? job.status}
        </Box>

        {/* Priority chip */}
        {jobDetail?.rolePriority && (
          <Box
            component="span"
            sx={{
              fontSize: 11,
              fontWeight: 700,
              px: "10px",
              py: "3px",
              borderRadius: "6px",
              backgroundColor:
                jobDetail.rolePriority?.toLowerCase() === "high"
                  ? "#FEE2E2"
                  : "#FEF3C7",
              color:
                jobDetail.rolePriority?.toLowerCase() === "high"
                  ? C.red
                  : C.amber,
              border: `1px solid ${
                jobDetail.rolePriority?.toLowerCase() === "high"
                  ? "#FECACA"
                  : "#FDE68A"
              }`,
            }}
          >
            {jobDetail.rolePriority} Priority
          </Box>
        )}
      </Box>

      {/* Subtitle row */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "6px", ml: "36px",color: C.textSecondary }}>
        {[
          jobDetail?.positionId ?? job.job_position_id,
          jobDetail?.jobType ?? job.job_type,
          jobDetail?.workMode,
        ]
          .filter(Boolean)
          .map((item, i, arr) => (
            <React.Fragment key={i}>
              <Typography sx={{ fontSize: 12, color: C.textSecondary, fontWeight: 400 }}>
                {item}
              </Typography>
              {i < arr.length - 1 && (
                <Box
                  sx={{
                    width: 3,
                    height: 3,
                    borderRadius: "50%",
                    backgroundColor: "#D1D5DB",
                    flexShrink: 0,
                  }}
                />
              )}
            </React.Fragment>
          ))}
      </Box>
    </Box>

    {/* Tabs */}
    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={TAB_SX}>
      <Tab label="Overview" />
      <Tab label="Candidates" />
      <Tab label="Interviews" />
      <Tab label="Activity" />
    </Tabs>

    {/* Tab panels — unchanged */}
    {tab === 0 && <ReqOverviewTab job={job} jobDetail={jobDetail} />}
    {tab === 1 && (
      <ReqCandidatesTab
        jobId={jobId}
        orgId={orgId}
        navigate={navigate}
        orgName={orgName}
        jobTitle={jobDetail?.jobTitle ?? job.job_title}
      />
    )}
    {tab === 2 && (
      <ReqInterviewsTab
        orgId={orgId}
        jobId={jobId}
        jobPositionId={jobDetail?.positionId ?? job.job_position_id}
      />
    )}
    {tab === 3 && (
      <Box
        sx={{
          textAlign: "center",
          py: 10,
          border: `1px solid ${C.border}`,
          borderRadius: "12px",
          backgroundColor: "#fff",
        }}
      >
        <Typography fontSize={15} fontWeight={600} color={C.textPrimary}>
          Activity
        </Typography>
        <Typography fontSize={13} color={C.textSecondary} mt={0.5}>
          Activity log coming soon.
        </Typography>
      </Box>
    )}
  </Box>
);
}

/* ═══════════════════════════════════════
   MAIN: ReqOverviewTab
═══════════════════════════════════════ */
/* ── Shared card shell ── */
const CARD = {
  backgroundColor: "#fff",
  border: `0.5px solid ${C.border}`,
  borderRadius: "10px",
  p: "20px 22px",
};

const CARD_TITLE = {
  fontSize: 14, fontWeight: 600, color: C.textPrimary,
  mb: "16px", pb: "12px",
  borderBottom: `0.5px solid ${C.border}`,
};

/* ── Field: label above value ── */
function Field({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <Box sx={{ mb: "16px", "&:last-child": { mb: 0 } }}>
      <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: C.textMuted, mb: "3px" }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 500, color: value === "Not specified" || value === "N/A" ? C.textMuted : C.textPrimary }}>
        {value}
      </Typography>
    </Box>
  );
}

/* ── Skill chip ── */
function SkillChip({ label, variant = "secondary" }) {
  const styles = {
    mandatory: {
      bg: "#FFF1F1",
      color: "#B42318",
      border: "#F7B5B5",
    },

    primary: {
      bg: "#EEF4FF",
      color: "#1849A9",
      border: "#B2CCFF",
    },

    secondary: {
      bg: "#F8F9FB",
      color: "#344054",
      border: "#E4E7EC",
    },
  };

  const s = styles[variant] ?? styles.secondary;

  return (
    <Box
      sx={{
        fontSize: 13,
        fontWeight: 600,
        px: "12px",
        py: "6px",
        borderRadius: "8px",
        border: `1px solid ${s.border}`,
        backgroundColor: s.bg,
        color: s.color,
        display: "inline-flex",
        alignItems: "center",
        lineHeight: 1.2,
        transition: "all 0.2s ease",

        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        },
      }}
    >
      {label}
    </Box>
  );
}

/* ── Skill group ── */
function SkillGroup({ label, skills, variant }) {
  if (!skills?.length) return null;

  return (
    <Box
      sx={{
        mb: "18px",
        "&:last-child": { mb: 0 },
      }}
    >
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#667085",
          mb: "10px",
        }}
      >
        {label}
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        {skills.map((s) => (
          <SkillChip
            key={s}
            label={s}
            variant={variant}
          />
        ))}
      </Box>
    </Box>
  );
}

/* ══════════════════════════════════════════
   ReqOverviewTab
══════════════════════════════════════════ */
export function ReqOverviewTab({ job = {}, jobDetail = null }) {
  const primarySkills   = normalizeArray(jobDetail?.primary);
  const secondarySkills = normalizeArray(jobDetail?.secondary);
  const mandatorySkills = normalizeArray(jobDetail?.mandatory);
  const edcTools        = normalizeArray(jobDetail?.edc_tools);
  const collaborators   = jobDetail?.collaborators ?? [];
  const approvals       = job?.approvals ?? [];

  const fallbackSkills    = normalizeArray(job?.skills);
  const hasFallback       = !jobDetail && fallbackSkills.length > 0;
  const fallbackPrimary   = hasFallback ? fallbackSkills.slice(0, Math.ceil(fallbackSkills.length / 2)) : [];
  const fallbackSecondary = hasFallback ? fallbackSkills.slice(Math.ceil(fallbackSkills.length / 2)) : [];

  const hasSkills = mandatorySkills.length > 0 || primarySkills.length > 0 || secondarySkills.length > 0 || hasFallback;
  const hasDesc   = !!(jobDetail?.summary_final ?? jobDetail?.summary_initial ?? jobDetail?.jobDescription);
  const descText  = jobDetail?.summary_final ?? jobDetail?.summary_initial ?? jobDetail?.jobDescription ?? "";

  const expValue = (jobDetail?.min_years ?? job?.min_years) != null
    ? `${jobDetail?.min_years ?? job?.min_years} – ${jobDetail?.max_years ?? job?.max_years} years`
    : null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>

      {/* ── Row 1: Basic Info + Experience & Positions / Team ── */}
  {/* ── Row 1 ── */}
<Grid container spacing="14px" sx={{ alignItems: "stretch" }}>

  {/* Basic Information — left */}
{/* Basic Information — left */}
<Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex" }}>
  <Box sx={{ ...CARD, flex: 1 }}>
    
    <Typography sx={CARD_TITLE}>
      Basic Information
    </Typography>

    <Box
      sx={{
        display: "grid",
        textTransform: "capitalize",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1fr 1fr",
        },
        gap: "14px",
        mt: 2,
      }}
    >
      <Field
        label="Function"
        value={jobDetail?.function ?? job?.function}
      />

      <Field
        label="Sub-function"
        value={jobDetail?.subFunction ?? job?.sub_function}
      />

      <Field
        label="Work mode"
        value={jobDetail?.workMode}
      />

      <Field
        label="Job type"
        value={jobDetail?.jobType ?? job?.job_type}
      />

      <Field
        label="Domain"
        value={jobDetail?.domain ?? job?.domain}
      />

      <Field
        label="Country"
        value={jobDetail?.country ?? job?.country}
      />

      {/* <Field
        label="Therapeutic area"
        value={jobDetail?.therapeutic_area}
      /> */}

      <Field
        label="EDC tools"
        value={edcTools.length ? edcTools.join(", ") : null}
      />

      <Field
        label="Job location"
        value={
          jobDetail?.jobLocation ??
          job?.location ??
          "Not specified"
        }
      />
    </Box>
  </Box>
</Grid>
  {/* Right column — Experience + Team + Approvals */}
  <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex" }}>
    <Box sx={{ display: "flex", flexDirection: "column", gap: "14px", flex: 1 }}>

   <Box sx={CARD}>
  <Typography sx={CARD_TITLE}>
    Experience &amp; Positions
  </Typography>

  <Box
    sx={{
      display: "flex",
      gap: "16px",
      flexWrap: "wrap",
      mt: 2,
    }}
  >
    <Box sx={{ flex: 1, minWidth: "180px" }}>
      <Field
        label="Minimum years"
        value={jobDetail?.min_years ?? job?.min_years}
      />
    </Box>

    <Box sx={{ flex: 1, minWidth: "180px" }}>
      <Field
        label="Maximum years"
        value={jobDetail?.max_years ?? job?.max_years}
      />
    </Box>

    <Box sx={{ flex: 1, minWidth: "180px" }}>
      <Field
        label="Open positions"
        value={jobDetail?.openPositions ?? job?.no_of_positions}
      />
    </Box>
  </Box>
</Box>
   {/* Ownership & Team */}
{(jobDetail?.creator ||
  jobDetail?.approver ||
  collaborators.length > 0) && (
  <Box sx={{ ...CARD, flex: 1 }}>
    
    <Typography sx={CARD_TITLE}>
      Ownership &amp; Team
    </Typography>

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1fr 1fr",
        },
        gap: "14px",
        mt: 2,
      }}
    >
      <Field
        label="Created by"
        value={jobDetail?.creator?.name}
      />

      <Field
        label="Approver"
        value={jobDetail?.approver?.name}
      />

      <Field
        label="Collaborators"
        value={
          collaborators.length > 0
            ? collaborators.map((c) => c.name).join(", ")
            : "N/A"
        }
      />
    </Box>
  </Box>
)}
      {/* Approvals */}
      {approvals.length > 0 && (
        <Box sx={CARD}>
          <Typography sx={CARD_TITLE}>Approvals</Typography>
          {approvals.map(({ stage, status }, i) => {
            const COLOR = {
              approved: { color: C.green, bg: C.greenSoft, border: C.greenBorder },
              pending:  { color: C.amber, bg: C.amberSoft, border: C.amberBorder },
              rejected: { color: C.red,   bg: C.redSoft,   border: C.redBorder   },
            };
            const ac = COLOR[status?.toLowerCase()] ?? { color: C.textMuted, bg: "#F3F4F6", border: C.border };
            return (
              <Box key={stage} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: i < approvals.length - 1 ? "12px" : 0 }}>
                <Typography sx={{ fontSize: 13, color: C.textSub }}>{stage}</Typography>
                <Box sx={{ px: "10px", py: "3px", borderRadius: "20px", backgroundColor: ac.bg, border: `0.5px solid ${ac.border}` }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: ac.color, textTransform: "capitalize" }}>{status}</Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

    </Box>
  </Grid>
</Grid>
      {/* ── Row 2: Required Skills ── */}
      {hasSkills && (
        <Box sx={CARD}>
          <Typography sx={CARD_TITLE}>Required Skills</Typography>
          <Grid container spacing="20px">
            <Grid size={{ xs: 12, md: 6 }}>
              <SkillGroup label="Mandatory skills" skills={mandatorySkills}                                        variant="mandatory" />
              <SkillGroup label="Primary skills"   skills={primarySkills.length   ? primarySkills   : fallbackPrimary}   variant="primary"   />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <SkillGroup label="Secondary skills" skills={secondarySkills.length ? secondarySkills : fallbackSecondary} variant="secondary" />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* ── Row 3: Job Description ── */}
      {hasDesc && (
        <Box sx={CARD}>
          <Typography sx={CARD_TITLE}>Job Description</Typography>
          <Typography sx={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.8 }}>
            {descText}
          </Typography>
        </Box>
      )}

    </Box>
  );
}

// ─── Tab 1: Candidates ────────────────────────────────────────────────────────
// ─── Add Candidate Dialog ─────────────────────────────────────────────────────
function AddCandidateToJobDialog({ open, onClose, jobId, onSuccess }) {
  const [form, setForm] = useState({
    domain: "", function: "", sub_function: "", availability: "", resume: null,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadCandidateResume] = useUploadCandidateResumeMutation();

  const handleClose = () => {
    setForm({ domain: "", function: "", sub_function: "", availability: "", resume: null });
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.resume) { toast.error("Resume is required"); return; }
    if (!form.availability?.trim()) { toast.error("Availability is required"); return; }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("job_id", jobId);
      fd.append("availability", form.availability);
      fd.append("domain", form.domain);
      fd.append("function", form.function);
      fd.append("sub_function", form.sub_function);
      fd.append("resume", form.resume);

      await uploadCandidateResume(fd).unwrap();
      toast.success("Candidate added successfully");
      onSuccess?.();
      handleClose();
    } catch (err) {
      toast.error(err?.data?.detail?.[0]?.msg || err?.data?.message || "Failed to upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}
    >
      <DialogTitle
        sx={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontWeight: 700, fontSize: 18, color: C.textPrimary, pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Box sx={{
            width: 34, height: 34, borderRadius: "9px",
            backgroundColor: "#FFF0E8",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Person sx={{ fontSize: 18, color: C.accent }} />
          </Box>
          Add Candidate
        </Box>
        <IconButton size="small" onClick={handleClose} sx={{ color: "#9CA3AF" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "14px", mt: 1 }}>

          {/* Domain */}
          <FormControl fullWidth size="small">
            <InputLabel sx={{ fontSize: 13 }}>Domain</InputLabel>
            <Select
              value={form.domain}
              label="Domain"
              onChange={(e) => setForm({ ...form, domain: e.target.value })}
              sx={{ borderRadius: "10px", fontSize: 13 }}
            >
              {DOMAIN_OPTIONS.map((d) => (
                <MenuItem key={d} value={d} sx={{ fontSize: 13, textTransform: "capitalize" }}>
                  {d.replace(/_/g, " ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Function */}
          <FormControl fullWidth size="small">
            <InputLabel sx={{ fontSize: 13 }}>Function</InputLabel>
            <Select
              value={form.function}
              label="Function"
              onChange={(e) => setForm({ ...form, function: e.target.value, sub_function: "" })}
              sx={{ borderRadius: "10px", fontSize: 13 }}
            >
              {FUNCTION_OPTIONS.map((f) => (
                <MenuItem key={f} value={f} sx={{ fontSize: 13, textTransform: "capitalize" }}>
                  {f.replace(/_/g, " ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Sub-function */}
          <FormControl fullWidth size="small" disabled={!form.function}>
            <InputLabel sx={{ fontSize: 13 }}>Sub-function</InputLabel>
            <Select
              value={form.sub_function}
              label="Sub-function"
              onChange={(e) => setForm({ ...form, sub_function: e.target.value })}
              sx={{ borderRadius: "10px", fontSize: 13 }}
            >
              {(SUB_FUNCTION_MAP[form.function] ?? []).map((s) => (
                <MenuItem key={s} value={s} sx={{ fontSize: 13, textTransform: "capitalize" }}>
                  {s.replace(/_/g, " ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Availability */}
          <TextField
            label="Availability (days)"
            required
            fullWidth
            size="small"
            value={form.availability}
            onChange={(e) => setForm({ ...form, availability: e.target.value })}
            placeholder="e.g. 30"
            InputProps={{ sx: { borderRadius: "10px", fontSize: 13 } }}
            InputLabelProps={{ sx: { fontSize: 13 } }}
          />

          {/* Resume upload */}
          <Box
            sx={{
              border: `2px dashed ${form.resume ? C.accent : "#E5E7EB"}`,
              borderRadius: "14px",
              py: "28px",
              px: 2,
              textAlign: "center",
              backgroundColor: form.resume ? "#FFF0E8" : "#FAFAFA",
              transition: "all 0.2s",
              cursor: "pointer",
            }}
          >
            <Button
              component="label"
              disableRipple
              sx={{
                display: "flex", flexDirection: "column", gap: "6px",
                width: "100%", textTransform: "none", color: C.textPrimary,
                "&:hover": { backgroundColor: "transparent" },
              }}
            >
              <CloudUploadOutlinedIcon sx={{ fontSize: 36, color: form.resume ? C.accent : "#9CA3AF" }} />
              {form.resume ? (
                <>
                  <Typography fontSize={13} fontWeight={700} color={C.accent}>
                    {form.resume.name}
                  </Typography>
                  <Typography fontSize={11} color={C.textSecondary}>
                    Click to replace
                  </Typography>
                </>
              ) : (
                <>
                  <Typography fontSize={13} fontWeight={600} color={C.textPrimary}>
                    Browse Resume
                  </Typography>
                  <Typography fontSize={11} color={C.textSecondary}>
                    PDF, DOC, DOCX supported
                  </Typography>
                </>
              )}
              <input
                hidden
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setForm({ ...form, resume: e.target.files[0] })}
              />
            </Button>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: "20px", pb: "20px", gap: "8px" }}>
        <Button
          onClick={handleClose}
          sx={{ textTransform: "none", fontSize: 13, color: C.textSecondary, borderRadius: "10px", px: "16px" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={uploading}
          onClick={handleSubmit}
          startIcon={uploading ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : null}
          sx={{
            textTransform: "none", fontSize: 13, fontWeight: 600,
            borderRadius: "10px", backgroundColor: C.accent,
            px: "24px", boxShadow: "none",
            "&:hover": { backgroundColor: "#E5541B", boxShadow: "none" },
            "&:disabled": { backgroundColor: "#FFCFB3", color: "#fff" },
          }}
        >
          {uploading ? "Uploading…" : "Add Candidate"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Tab 1: Candidates ────────────────────────────────────────────────────────
function ReqCandidatesTab({ jobId, orgId, navigate, orgName, jobTitle }) {
  const [stageFilter, setStageFilter] = useState("all");
  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } =
    useGetJobMatchedCandidatesQuery(jobId);

  const all = data?.data ?? [];

  const stages = React.useMemo(
    () => [...new Set(all.map((c) => c.current_stage))],
    [all],
  );

  const filtered =
    stageFilter === "all"
      ? all
      : all.filter((c) => c.current_stage === stageFilter);

  const searchedCandidates = filtered.filter((candidate) => {
    const value = search.toLowerCase();
    return (
      candidate.full_name?.toLowerCase().includes(value) ||
      candidate.email?.toLowerCase().includes(value) ||
      candidate.phone_number?.toLowerCase().includes(value) ||
      candidate.current_stage?.toLowerCase().includes(value) ||
      String(candidate.match_score)?.toLowerCase().includes(value)
    );
  });

  const candidateColumns = React.useMemo(
    () => [
      {
        accessorKey: "full_name",
        header: "Candidate",
        size: 250,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: C.accent, fontSize: 13, fontWeight: 700 }}>
              {row.original.full_name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 14 }} fontWeight={600} color={C.textPrimary} noWrap>
                {row.original.full_name}
              </Typography>
              <Typography sx={{ fontSize: 12 }} color={C.textSecondary} noWrap>
                {row.original.email}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        accessorKey: "current_stage",
        header: "Stage",
        size: 140,
        Cell: ({ cell }) => (
          <Box component="span" sx={{
            fontSize: 11, fontWeight: 700, px: "8px", py: "3px",
            borderRadius: "8px", backgroundColor: C.indigoSoft,
            color: C.indigo, textTransform: "capitalize",
          }}>
            {cell.getValue()}
          </Box>
        ),
      },
      {
        accessorKey: "match_score",
        header: "Match %",
        size: 100,
        Cell: ({ cell }) => {
          const value = cell.getValue();
          const color = value >= 80 ? C.green : value >= 60 ? C.amber : C.red;
          return (
            <Typography sx={{ fontSize: 12 }} fontWeight={700} color={color}>
              {value}%
            </Typography>
          );
        },
      },
      {
        accessorKey: "availability",
        header: "Availability",
        size: 120,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: 12 }}>
            {cell.getValue() === 0 ? "Immediate" : `${cell.getValue()} days`}
          </Typography>
        ),
      },
      {
        accessorKey: "total_experience",
        header: "Experience",
        size: 120,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: 12 }}>{cell.getValue()}</Typography>
        ),
      },
      {
        accessorKey: "phone_number",
        header: "Phone",
        size: 150,
        Cell: ({ cell }) => (
          <Typography sx={{ fontSize: 12 }}>{cell.getValue()}</Typography>
        ),
      },
    ],
    [],
  );

  if (isLoading)
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress sx={{ color: C.accent }} />
      </Box>
    );

  if (isError)
    return (
      <Alert severity="error">
        Failed to load candidates: {error?.data?.message}
      </Alert>
    );

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: "20px", mt: -2, flexWrap: "wrap" }}>

        {/* Count badge */}
        <Box sx={{
          display: "inline-flex", alignItems: "center", gap: 1,
          px: 1.8, borderRadius: "8px",
          background: "rgba(255, 95, 31, 0.08)",
          border: "1px solid rgba(255, 95, 31, 0.2)",
          transition: "0.3s ease",
          "&:hover": { background: "rgba(255, 95, 31, 0.14)", transform: "translateY(-1px)" },
        }}>
          <Box sx={{
            minWidth: 28, height: 28, borderRadius: "8px",
            background: "#FF5F1F", display: "flex", alignItems: "center",
            justifyContent: "center", px: 1,
            boxShadow: "0 4px 12px rgba(255,95,31,0.35)",
          }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
              {searchedCandidates.length}
            </Typography>
          </Box>
          <Box sx={{ padding: 1, borderRadius: 0 }}>
            <Typography sx={{ fontSize: 10, fontWeight: 600, color: "#FF5F1F", textTransform: "uppercase", letterSpacing: 1, lineHeight: 1 }}>
              Total
            </Typography>
            <Typography sx={{ fontSize: 10, fontWeight: 600, color: C.textPrimary, lineHeight: 1 }}>
              Candidate{searchedCandidates.length !== 1 ? "s" : ""}
            </Typography>
          </Box>
        </Box>

        {/* Stage Filter */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel sx={{ fontSize: 12 }}>Filter by stage</InputLabel>
          <Select
            value={stageFilter}
            label="Filter by stage"
            onChange={(e) => setStageFilter(e.target.value)}
            sx={{ fontSize: 12, borderRadius: "8px" }}
          >
            <MenuItem value="all">All Stages</MenuItem>
            {stages.map((s) => (
              <MenuItem key={s} value={s} sx={{ textTransform: "capitalize" }}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Right side */}
        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 2 }}>
          <SearchFilter
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates..."
          />
          <ViewToggle view={view} onChange={setView} />

          {/* ── Add Candidate button ── */}
          <Button
            variant="contained"
            onClick={() => setAddDialogOpen(true)}
            sx={{
              textTransform: "none", fontSize: 12, fontWeight: 600,
              borderRadius: "8px", px: "14px", height: 36,
              backgroundColor: C.accent, boxShadow: "none", whiteSpace: "nowrap",
              "&:hover": { backgroundColor: "#E5541B", boxShadow: "none" },
            }}
          >
            + Add Candidate
          </Button>
        </Box>
      </Box>

      {/* Empty State */}
      {searchedCandidates.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography fontSize={13} color={C.textSecondary}>
            No candidates match the filters.
          </Typography>
        </Box>
      ) : view === "grid" ? (
        <Grid container spacing={2.5}>
          {searchedCandidates.map((candidate) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, xl: 3 }} key={candidate.matched_candidate_id}>
              <CandidateCard
                candidate={candidate}
                onView={() =>
                  navigate(`/account-manager/candidate/${candidate.matched_candidate_id}`, {
                    state: { orgName, jobTitle, previousTab: 1, orgId, jobId },
                  })
                }
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <ReusableMRT
          data={searchedCandidates}
          columnData={candidateColumns}
          enableRowActions={false}
          enableRowSelection={false}
          enableGlobalFilter={false}
          height="calc(100vh - 268px)"
          onRowClick={(row) =>
            navigate(`/account-manager/candidate/${row.matched_candidate_id}`, {
              state: { orgName, jobTitle, previousTab: 1, orgId, jobId },
            })
          }
        />
      )}

      {/* ── Add Candidate Dialog ── */}
      <AddCandidateToJobDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        jobId={jobId}
        onSuccess={refetch}
      />
    </Box>
  );
}

// ─── Tab 2: Interviews ────────────────────────────────────────────────────────
function ReqInterviewsTab({ orgId, jobPositionId, jobId }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const { data, isLoading, isError } = useGetJobInterviewsQuery(jobId);
  const all = (data?.data ?? []).filter(
    (iv) => iv.job_position_id === jobPositionId,
  );

  const interviewStatuses = [
    { key: "scheduled", value: "Scheduled" },
    { key: "completed", value: "Completed" },
    { key: "cancelled", value: "Cancelled" },
    { key: "rescheduled", value: "Rescheduled" },
    { key: "no_show", value: "No Show" },
    { key: "not_conducted", value: "Not Conducted" },
  ];

  const filtered =
    statusFilter === "all"
      ? all
      : all.filter((iv) => (iv.status ?? "scheduled") === statusFilter);

  if (isLoading)
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress sx={{ color: C.accent }} />
      </Box>
    );
  if (isError)
    return <Alert severity="error">Failed to load interviews.</Alert>;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: "20px",
          flexWrap: "wrap",
        }}
      >
        <Typography fontSize={13} color={C.textSecondary}>
          {filtered.length} interview{filtered.length !== 1 ? "s" : ""}
        </Typography>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel sx={{ fontSize: 12 }}>Filter by status</InputLabel>
          <Select
            value={statusFilter}
            label="Filter by status"
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ fontSize: 12, borderRadius: "8px" }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            {interviewStatuses.map(({ key, value }) => (
              <MenuItem key={key} value={key}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {filtered.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography fontSize={13} color={C.textSecondary}>
            No interviews found for this requisition.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((iv) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, xl: 3 }} key={iv.interview_id}>
              <ReqInterviewCard interview={iv} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

function ReqInterviewCard({ interview }) {
  const typeColor =
    interview.interview_type?.toLowerCase() === "technical"
      ? { bg: C.indigoSoft, color: C.indigo }
      : { bg: C.amberSoft, color: C.amber };

  const formattedDate = interview.interview_date
    ? new Date(interview.interview_date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "—";

  return (
    <Card
      sx={{
        borderRadius: "12px",
        border: `1px solid ${C.border}`,
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
            mb: "10px",
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
            <Event sx={{ color: C.accent, fontSize: 18 }} />
          </Box>
          <Box
            component="span"
            sx={{
              fontSize: 10,
              fontWeight: 700,
              px: "8px",
              py: "3px",
              borderRadius: "10px",
              backgroundColor: typeColor.bg,
              color: typeColor.color,
              textTransform: "capitalize",
              letterSpacing: "0.05em",
            }}
          >
            {interview.interview_type}
          </Box>
        </Box>

        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: C.textPrimary,
            mb: "2px",
          }}
        >
          {interview.interview_step_name}
        </Typography>
        <Typography sx={{ fontSize: 11, color: C.textSecondary, mb: "10px" }}>
          Step {interview.interview_step_number}
        </Typography>

        <Divider sx={{ mb: "10px" }} />

        <Box
          sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: "6px" }}
        >
          <CalendarToday sx={{ fontSize: 13, color: C.textSecondary }} />
          <Typography
            sx={{ fontSize: 11, color: C.textPrimary, fontWeight: 500 }}
          >
            {formattedDate}
          </Typography>
        </Box>
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: "6px" }}
        >
          <AccessTime sx={{ fontSize: 13, color: C.textSecondary }} />
          <Typography
            sx={{ fontSize: 11, color: C.textPrimary, fontWeight: 500 }}
          >
            {interview.start_time} – {interview.end_time} · {interview.duration}{" "}
            min
          </Typography>
        </Box>

        {interview.created_by && (
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: 11, color: C.textSecondary }}>
              Created by
            </Typography>
            <Typography
              sx={{ fontSize: 11, fontWeight: 500, color: C.textPrimary }}
            >
              {interview.created_by}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ─── CandidateCard ────────────────────────────────────────────────────────────
function CandidateCard({ candidate, onView }) {
  const [hovered, setHovered] = React.useState(false);
  const matchColor =
    candidate.match_score >= 80
      ? { bg: "#E7F8EE", color: "#0F6E56" }
      : candidate.match_score >= 60
        ? { bg: "#FFF8E1", color: "#B45309" }
        : { bg: "#FEE2E2", color: "#B91C1C" };

  return (
    <Card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        height: "100%",
        borderRadius: "12px",
        border: `1px solid ${hovered ? C.accent : C.border}`,
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
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: "12px" }}
        >
          <Avatar
            sx={{
              width: 42,
              height: 42,
              fontWeight: 700,
              fontSize: 16,
              bgcolor: C.accent,
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
                color: C.textPrimary,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {candidate.full_name}
            </Typography>
            <Typography sx={{ fontSize: 11, color: C.textSecondary }}>
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

        <Grid container spacing={1} sx={{ mb: "12px" }}>
          <Grid size={{ xs: 6 }}>
            <Box
              sx={{ backgroundColor: "#F9FAFB", borderRadius: "8px", p: "8px" }}
            >
              <Typography
                sx={{ fontSize: 10, color: C.textSecondary, mb: "2px" }}
              >
                Stage
              </Typography>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.textPrimary,
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
              <Typography
                sx={{ fontSize: 10, color: C.textSecondary, mb: "2px" }}
              >
                Availability
              </Typography>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: candidate.availability === 0 ? C.green : C.textPrimary,
                }}
              >
                {candidate.availability === 0
                  ? "Immediate"
                  : `${candidate.availability} days`}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {[
          { label: "Experience", value: candidate.total_experience },
          { label: "Email", value: candidate.email },
          { label: "Phone", value: candidate.phone_number },
        ].map(({ label, value }) => (
          <Box
            key={label}
            sx={{ display: "flex", justifyContent: "space-between", mb: "6px" }}
          >
            <Typography sx={{ fontSize: 11, color: C.textSecondary }}>
              {label}
            </Typography>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 500,
                color: C.textPrimary,
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

        <Box sx={{ mt: "auto" }}>
          <Button
            variant="outlined"
            fullWidth
            size="small"
            onClick={onView}
            sx={{
              borderColor: C.accent,
              color: C.accent,
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              fontSize: 12,
              "&:hover": {
                backgroundColor: C.accentSoft,
                borderColor: C.accent,
              },
            }}
          >
            View Profile &amp; Timeline
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
