// src/pages/Candidates/CandidatesPage.jsx

import React, { useState, useMemo, useRef } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Avatar, Chip,
  TextField, MenuItem, Select, FormControl, InputLabel,
  CircularProgress, Alert, Switch, Tooltip, InputAdornment,
  Button, Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { PersonOutlineOutlined } from "@mui/icons-material";

import {
  useGetImportedCandidatesQuery,
  useUpdateCandidateActiveStatusMutation,
} from "../../redux/services/requisition/requisition";
import { useNavigate } from "react-router-dom";

/* ── Design tokens ── */
const C = {
  accent: "#FF5F1F",
  accentSoft: "#FFF0E8",
  green: "#0F6E56",
  greenSoft: "#E7F8EE",
  border: "#E8E8EC",
  textPrimary: "#111118",
  textSecondary: "#5C5C70",
  textTertiary: "#9696A6",
};

const STEP = 100; // how many to add on each "Show More" click

const DOMAIN_OPTIONS = ["clinical", "regulatory", "pharmacovigilance"];

const FUNCTION_OPTIONS = [
  "biostatistics",
  "clinical_data_management",
  "clinical_operations",
  "medical_writing",
  "pharmacovigilance",
  "regulatory_affairs",
];

const SUB_FUNCTION_MAP = {
  biostatistics: ["statistical_programmer", "biostatistician", "sas_programmer"],
  clinical_data_management: ["clinical_programmer", "crf_developer", "data_manager", "database_programmer"],
  clinical_operations: ["clinical_research_associate", "clinical_trial_manager", "site_coordinator"],
  medical_writing: ["medical_writer", "regulatory_writer"],
  pharmacovigilance: ["safety_associate", "pv_specialist"],
  regulatory_affairs: ["regulatory_specialist", "submissions_manager"],
};

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function CandidatesPage() {
  /* ── Filter state ── */
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [domain, setDomain] = useState("");
  const [func, setFunc] = useState("");
  const [subFunc, setSubFunc] = useState("");
  const [activeOnly, setActiveOnly] = useState(null);

  /* ── limit grows by STEP on every "Show More" click ── */
  const [limit, setLimit] = useState(STEP); // starts at 100

  const searchTimer = useRef(null);

  /* ── Whenever filters change, reset limit back to 100 ── */
  const resetLimit = () => setLimit(STEP);

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(val);
      resetLimit();
    }, 400);
  };

  const handleDomainChange = (v) => { setDomain(v); setFunc(""); setSubFunc(""); resetLimit(); };
  const handleFuncChange = (v) => { setFunc(v); setSubFunc(""); resetLimit(); };
  const handleSubFuncChange = (v) => { setSubFunc(v); resetLimit(); };

  const clearAll = () => {
    setSearch(""); setDebouncedSearch("");
    setDomain(""); setFunc(""); setSubFunc("");
    resetLimit();
  };

  /* ── Query — limit is the only thing that changes on Show More ── */
  const queryParams = {
    limit,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(domain && { domain }),
    ...(func && { function: func }),
    ...(subFunc && { sub_function: subFunc }),
  };

  const { data, isLoading, isFetching, isError } =
    useGetImportedCandidatesQuery(queryParams);

  const allCandidates = data?.data ?? [];

  /* ── If API returned exactly `limit` records, there may be more ── */
  const hasMore = allCandidates.length === limit;

  const handleShowMore = () => {
    setLimit(prev => prev + STEP); // 100 → 200 → 300 …
  };

  /* ── Client-side active filter ── */
  const displayed = useMemo(() => {
    if (activeOnly === null) return allCandidates;
    return allCandidates.filter(c => c.is_active === activeOnly);
  }, [allCandidates, activeOnly]);

  const activeCount = allCandidates.filter(c => c.is_active).length;
  const inactiveCount = allCandidates.filter(c => !c.is_active).length;
  const hasActiveFilters = domain || func || subFunc || debouncedSearch;

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <Box sx={{ p: 1 }}>

      {/* ── Page header ── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "20px" }}>
        <Box>
          <Typography fontSize={22} fontWeight={700} color={C.textPrimary} mb="2px">
            Candidates
          </Typography>
          <Typography fontSize={13} color={C.textSecondary}>
            All imported candidates · manage visibility and status
          </Typography>
        </Box>
        <Box sx={{ px: "14px", py: "8px", borderRadius: "10px", backgroundColor: C.accentSoft, border: "1px solid #FFCFB3" }}>
          <Typography fontSize={12} fontWeight={700} color={C.accent}>
            {isFetching ? "Loading…" : `${allCandidates.length} loaded`}
          </Typography>
        </Box>
      </Box>

      {/* ════════════════════════════════════════
          FILTER PANEL
      ════════════════════════════════════════ */}
      <Box sx={{ border: `1px solid ${C.border}`, borderRadius: "12px", backgroundColor: "#fff", mb: "20px", overflow: "hidden" }}>

        {/* Row 1: Search + active pills */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: "16px", py: "12px", borderBottom: `1px solid ${C.border}`, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            sx={{ flex: 1, minWidth: 200, "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 13 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 16, color: C.textTertiary }} />
                </InputAdornment>
              ),
            }}
          />

          <Divider orientation="vertical" flexItem sx={{ mx: "4px" }} />

          <Box sx={{ display: "flex", gap: "4px" }}>
            {[
              { label: "All", value: null },
              { label: "Active", value: true },
              { label: "Inactive", value: false },
            ].map(({ label, value }) => (
              <Box key={String(value)} onClick={() => setActiveOnly(value)}
                sx={{
                  px: "10px", py: "5px", borderRadius: "7px", cursor: "pointer",
                  fontSize: 12, fontWeight: 600, border: "1px solid",
                  borderColor: activeOnly === value ? C.accent : C.border,
                  backgroundColor: activeOnly === value ? C.accentSoft : "#F9FAFB",
                  color: activeOnly === value ? C.accent : C.textSecondary,
                  transition: "all 0.15s",
                  "&:hover": { borderColor: C.accent, color: C.accent, backgroundColor: C.accentSoft },
                }}
              >
                {label}
                {value === true && activeCount > 0 && <Box component="span" sx={{ ml: "4px", fontSize: 10, opacity: 0.8 }}>({activeCount})</Box>}
                {value === false && inactiveCount > 0 && <Box component="span" sx={{ ml: "4px", fontSize: 10, opacity: 0.8 }}>({inactiveCount})</Box>}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Row 2: Domain + Function + Sub-function */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: "16px", py: "10px", flexWrap: "wrap", backgroundColor: "#FAFAFA" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <FilterListIcon sx={{ fontSize: 14, color: C.textTertiary }} />
            <Typography fontSize={11} fontWeight={600} color={C.textSecondary} sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Filters
            </Typography>
          </Box>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel sx={{ fontSize: 12 }}>Domain</InputLabel>
            <Select value={domain} label="Domain" onChange={e => handleDomainChange(e.target.value)}
              sx={{ fontSize: 12, borderRadius: "8px", backgroundColor: "#fff" }}>
              <MenuItem value="" sx={{ fontSize: 12 }}>All Domains</MenuItem>
              {DOMAIN_OPTIONS.map(d => (
                <MenuItem key={d} value={d} sx={{ fontSize: 12, textTransform: "capitalize" }}>
                  {d.replace(/_/g, " ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 190 }}>
            <InputLabel sx={{ fontSize: 12 }}>Function</InputLabel>
            <Select value={func} label="Function" onChange={e => handleFuncChange(e.target.value)}
              sx={{ fontSize: 12, borderRadius: "8px", backgroundColor: "#fff" }}>
              <MenuItem value="" sx={{ fontSize: 12 }}>All Functions</MenuItem>
              {FUNCTION_OPTIONS.map(f => (
                <MenuItem key={f} value={f} sx={{ fontSize: 12, textTransform: "capitalize" }}>
                  {f.replace(/_/g, " ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }} disabled={!func}>
            <InputLabel sx={{ fontSize: 12 }}>Sub-function</InputLabel>
            <Select value={subFunc} label="Sub-function" onChange={e => handleSubFuncChange(e.target.value)}
              sx={{ fontSize: 12, borderRadius: "8px", backgroundColor: "#fff" }}>
              <MenuItem value="" sx={{ fontSize: 12 }}>All Sub-functions</MenuItem>
              {(SUB_FUNCTION_MAP[func] ?? []).map(s => (
                <MenuItem key={s} value={s} sx={{ fontSize: 12, textTransform: "capitalize" }}>
                  {s.replace(/_/g, " ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Applied chips */}
          <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap", ml: "4px" }}>
            {domain && (
              <Chip label={domain.replace(/_/g, " ")} size="small" onDelete={() => handleDomainChange("")}
                sx={{ fontSize: 11, height: 22, textTransform: "capitalize", backgroundColor: C.accentSoft, color: C.accent, "& .MuiChip-deleteIcon": { fontSize: 14, color: C.accent } }} />
            )}
            {func && (
              <Chip label={func.replace(/_/g, " ")} size="small" onDelete={() => handleFuncChange("")}
                sx={{ fontSize: 11, height: 22, textTransform: "capitalize", backgroundColor: C.accentSoft, color: C.accent, "& .MuiChip-deleteIcon": { fontSize: 14, color: C.accent } }} />
            )}
            {subFunc && (
              <Chip label={subFunc.replace(/_/g, " ")} size="small" onDelete={() => handleSubFuncChange("")}
                sx={{ fontSize: 11, height: 22, textTransform: "capitalize", backgroundColor: C.accentSoft, color: C.accent, "& .MuiChip-deleteIcon": { fontSize: 14, color: C.accent } }} />
            )}
          </Box>

          {hasActiveFilters && (
            <Box onClick={clearAll}
              sx={{ ml: "auto", fontSize: 12, color: C.accent, cursor: "pointer", fontWeight: 600, "&:hover": { textDecoration: "underline" } }}>
              Clear all
            </Box>
          )}
        </Box>
      </Box>

      {/* ════════════════════════════════════════
          CONTENT
      ════════════════════════════════════════ */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress sx={{ color: C.accent }} />
        </Box>
      ) : isError ? (
        <Alert severity="error" sx={{ borderRadius: "10px" }}>
          Failed to load candidates. Please try again.
        </Alert>
      ) : displayed.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 10, border: `1px solid ${C.border}`, borderRadius: "12px", backgroundColor: "#fff" }}>
          <PersonOutlineOutlined sx={{ fontSize: 42, color: C.textTertiary, mb: 1.5 }} />
          <Typography fontSize={15} fontWeight={600} color={C.textPrimary}>No candidates found</Typography>
          <Typography fontSize={13} color={C.textSecondary} mt={0.5}>Try adjusting your filters or search query.</Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={2}>
            {displayed.map(candidate => (
              <Grid size={{ xs: 12, sm: 6, md: 4, xl: 3 }} key={candidate.candidate_id}>
                <CandidateCard candidate={candidate} />
              </Grid>
            ))}
          </Grid>

          {/* ── Footer ── */}
          <Box sx={{ mt: "28px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>

            <Typography fontSize={12} color={C.textSecondary}>
              Showing{" "}
              <Box component="strong" sx={{ color: C.textPrimary }}>{displayed.length}</Box>
              {" "}candidates
              {activeOnly !== null && allCandidates.length !== displayed.length && (
                <Box component="span" sx={{ color: C.textTertiary }}>
                  {" "}· {allCandidates.length} total loaded
                </Box>
              )}
            </Typography>

            {/* Show More button — only if last fetch returned a full page */}
            {hasMore && (
              <Button
                variant="outlined"
                onClick={handleShowMore}
                disabled={isFetching}
                startIcon={
                  isFetching
                    ? <CircularProgress size={14} sx={{ color: C.accent }} />
                    : <ExpandMoreIcon sx={{ fontSize: 18 }} />
                }
                sx={{
                  textTransform: "none", fontWeight: 600, fontSize: 13,
                  borderColor: C.accent, color: C.accent,
                  borderRadius: "10px", px: "28px", py: "9px",
                  "&:hover": { backgroundColor: C.accentSoft, borderColor: C.accent },
                  "&:disabled": { borderColor: C.border, color: C.textTertiary },
                }}
              >
                {isFetching
                  ? "Loading…"
                  : `Show more · next ${STEP} candidates`
                }
              </Button>
            )}

            {/* All loaded */}
            {!hasMore && allCandidates.length > 0 && (
              <Box sx={{
                display: "flex", alignItems: "center", gap: 1,
                px: "20px", py: "8px", borderRadius: "20px",
                backgroundColor: "#F9FAFB", border: `1px solid ${C.border}`,
              }}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: C.green }} />
                <Typography fontSize={12} color={C.textSecondary}>
                  All candidates loaded · {allCandidates.length} total
                </Typography>
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}

/* ══════════════════════════════════════════════
   CANDIDATE CARD
══════════════════════════════════════════════ */
function CandidateCard({ candidate }) {
  const [hovered, setHovered] = useState(false);
  const [localActive, setLocalActive] = useState(candidate.is_active);
  const [updateStatus, { isLoading: updating }] = useUpdateCandidateActiveStatusMutation();
  const navigate = useNavigate();
  const handleToggle = async (e) => {
    e.stopPropagation();
    const next = !localActive;
    setLocalActive(next);
    try {
      await updateStatus({ candidate_id: candidate.candidate_id, is_active: next }).unwrap();
    } catch {
      setLocalActive(!next);
    }
  };

  const initials = candidate.full_name
    ? candidate.full_name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  console.log("candidate.candidate_id", candidate.candidate_id)
  return (
    <Card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/account-manager/candidates/${candidate.candidate_id}`)}
      sx={{
        borderRadius: "12px",
        border: `1px solid ${hovered ? C.accent : C.border}`,
        boxShadow: hovered ? "0 0 0 3px rgba(255,95,31,0.07)" : "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
        height: "100%", display: "flex", flexDirection: "column",
        opacity: localActive ? 1 : 0.72,
      }}
    >
      <CardContent sx={{ p: "16px", flexGrow: 1, display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: "12px" }}>
          <Avatar sx={{ width: 40, height: 40, flexShrink: 0, bgcolor: localActive ? C.accent : "#9CA3AF", fontWeight: 700, fontSize: 14 }}>
            {initials}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {candidate.full_name}
            </Typography>
            <Typography sx={{ fontSize: 11, color: C.textSecondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {candidate.email}
            </Typography>
          </Box>
          <Tooltip title={localActive ? "Mark inactive" : "Mark active"} placement="top">
            <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              {updating
                ? <CircularProgress size={16} sx={{ color: C.accent }} />
                : (
                  <Switch checked={localActive} onChange={handleToggle} size="small"
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: C.accent },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: C.accent },
                    }}
                  />
                )
              }
            </Box>
          </Tooltip>
        </Box>

        <Divider sx={{ mb: "10px" }} />

        {/* Function chips */}
        <Box sx={{ display: "flex", gap: 0.6, mb: "10px", flexWrap: "wrap" }}>
          {candidate.function && (
            <Chip label={candidate.function.replace(/_/g, " ")} size="small"
              sx={{ fontSize: 10, height: 20, textTransform: "capitalize", backgroundColor: "#EEF2FF", color: "#4338CA", "& .MuiChip-label": { px: "8px" } }} />
          )}
          {candidate.sub_function && (
            <Chip label={candidate.sub_function.replace(/_/g, " ")} size="small"
              sx={{ fontSize: 10, height: 20, textTransform: "capitalize", backgroundColor: "#F3F4F6", color: C.textSecondary, "& .MuiChip-label": { px: "8px" } }} />
          )}
        </Box>

        {/* Info rows */}
        {[
          { label: "Phone", value: candidate.phone_number ?? "—" },
          { label: "Domain", value: candidate.domain ?? "—" },
        ].map(({ label, value }) => (
          <Box key={label} sx={{ display: "flex", justifyContent: "space-between", mb: "5px" }}>
            <Typography sx={{ fontSize: 11, color: C.textSecondary }}>{label}</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: C.textPrimary, textTransform: "capitalize" }}>{value}</Typography>
          </Box>
        ))}

        {/* Footer */}
        <Box sx={{ mt: "auto", pt: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box component="span" sx={{
            fontSize: 10, fontWeight: 700, px: "8px", py: "3px", borderRadius: "10px",
            backgroundColor: localActive ? C.greenSoft : "#F3F4F6",
            color: localActive ? C.green : "#6B7280",
          }}>
            {localActive ? "Active" : "Inactive"}
          </Box>

          {candidate.resume_url && (
            <Tooltip title="View resume" placement="top">
              <Box component="a"
                href={`https://your-s3-bucket.s3.amazonaws.com/${candidate.resume_url}`}
                target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                sx={{ display: "flex", alignItems: "center", gap: "4px", fontSize: 11, fontWeight: 600, color: C.accent, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
              >
                <InsertDriveFileOutlinedIcon sx={{ fontSize: 13 }} />
                Resume
              </Box>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}



