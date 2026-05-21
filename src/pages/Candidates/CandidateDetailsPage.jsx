import {
  Avatar, Box, IconButton, Skeleton, Tab, Tabs, Typography,
} from "@mui/material";
import ArrowBackIcon             from "@mui/icons-material/ArrowBack";
import ArrowBackIosNewIcon       from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon       from "@mui/icons-material/ArrowForwardIos";
import EmailOutlinedIcon         from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon         from "@mui/icons-material/PhoneOutlined";
import WorkOutlinedIcon          from "@mui/icons-material/WorkOutlined";
import LocationOnOutlinedIcon    from "@mui/icons-material/LocationOnOutlined";
import SchoolOutlinedIcon        from "@mui/icons-material/SchoolOutlined";
import BusinessOutlinedIcon      from "@mui/icons-material/BusinessOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import VerifiedOutlinedIcon      from "@mui/icons-material/VerifiedOutlined";
import PublicOutlinedIcon        from "@mui/icons-material/PublicOutlined";
import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetCandidateDetailsQuery } from "../../redux/services/requisition/requisition";
import { useDispatch } from "react-redux";
import { setDynamicLabels } from "../../redux/slices/breadcrumbSlice";

/* ─────────────────────────── Design Tokens ─────────────────────────── */
const C = {
  accent:     "#FF5F1F",
  accentSoft: "#FFF0E8",
  border:     "#E8E8EC",
  bg:         "#F7F7F9",
  white:      "#FFFFFF",
  primary:    "#111118",
  secondary:  "#5C5C70",
  tertiary:   "#9696A6",
  green:      "#0F6E56",
  greenSoft:  "#E7F8EE",
  indigo:     "#4338CA",
  indigoSoft: "#EEF2FF",
  amber:      "#92400E",
  amberSoft:  "#FEF3C7",
  purple:     "#7C3AED",
  purpleSoft: "#F5F3FF",
};

/* Typography scale — all label/value pairs use these */
const T = {
  label:      { fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.tertiary },
  value:      { fontSize: 14, fontWeight: 600, color: C.primary },
  valueSm:    { fontSize: 13, fontWeight: 600, color: C.primary },
  valueMd:    { fontSize: 15, fontWeight: 700, color: C.primary },
  valueLg:    { fontSize: 20, fontWeight: 700, color: C.primary, lineHeight: 1.2 },
  meta:       { fontSize: 11, fontWeight: 500, color: C.secondary },
  caption:    { fontSize: 10, fontWeight: 500, color: C.tertiary },
  tabLabel:   { fontSize: 13, fontWeight: 600 },
  sectionHd:  { fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.tertiary },
  badge:      { fontSize: 10, fontWeight: 700, letterSpacing: "0.04em" },
  badgeMd:    { fontSize: 11, fontWeight: 600 },
};

/* ─────────────────────────── Helpers ─────────────────────────── */
function getInitials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
}
const AVATAR_BG = ["#FF5F1F","#4338CA","#0F6E56","#7C3AED","#0EA5E9","#EC4899","#F59E0B","#14B8A6"];
function avatarBg(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_BG[Math.abs(h) % AVATAR_BG.length];
}
function fmt(v) { return v || "—"; }
function fmtDate(d) {
  if (!d || d === "present") return "Present";
  try { return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" }); }
  catch { return d; }
}
function slugToLabel(s = "") {
  return s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

/* ─────────────────────────── Sub-components ─────────────────────────── */

function TabPanel({ value, index, children }) {
  return value === index ? <Box>{children}</Box> : null;
}

function SectionHeading({ children, count }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: "16px" }}>
      <Typography sx={T.sectionHd}>{children}</Typography>
      {count != null && (
        <Box sx={{
          ...T.badge, px: "6px", py: "1px",
          borderRadius: "5px", backgroundColor: C.accentSoft, color: C.accent,
        }}>
          {count}
        </Box>
      )}
    </Box>
  );
}

function Empty({ label }) {
  return (
    <Box sx={{ py: 6, textAlign: "center" }}>
      <Typography sx={{ ...T.meta, color: C.tertiary }}>{label}</Typography>
    </Box>
  );
}

function PageSkeleton() {
  return (
    <Box sx={{ p: 3 }}>
      <Skeleton width={120} height={32} sx={{ mb: 3 }} />
      <Skeleton variant="rectangular" height={140} sx={{ borderRadius: "14px", mb: 2 }} />
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1.5, mb: 2 }}>
        {[1,2,3,4,5,6].map(i => <Skeleton key={i} height={72} sx={{ borderRadius: "10px" }} />)}
      </Box>
      <Skeleton variant="rectangular" height={380} sx={{ borderRadius: "14px" }} />
    </Box>
  );
}

/* ── Info tile slider wrapper — drag-scrollable + arrow nav ── */
function InfoTileSlider({ children, mb }) {
  const trackRef  = useRef(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);

  // drag state
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 });

  const TILE_W   = 200; // approx tile width + gap
  const SCROLL_BY = TILE_W * 2;

  const syncArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    syncArrows();
    const ro = new ResizeObserver(syncArrows);
    ro.observe(el);
    el.addEventListener("scroll", syncArrows, { passive: true });
    return () => { ro.disconnect(); el.removeEventListener("scroll", syncArrows); };
  }, [syncArrows]);

  /* mouse drag */
  const onMouseDown = (e) => {
    drag.current = { active: true, startX: e.pageX - trackRef.current.offsetLeft, scrollLeft: trackRef.current.scrollLeft };
    trackRef.current.style.cursor = "grabbing";
    trackRef.current.style.userSelect = "none";
  };
  const onMouseMove = (e) => {
    if (!drag.current.active) return;
    const x    = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - drag.current.startX) * 1.2;
    trackRef.current.scrollLeft = drag.current.scrollLeft - walk;
  };
  const stopDrag = () => {
    drag.current.active = false;
    if (trackRef.current) {
      trackRef.current.style.cursor = "grab";
      trackRef.current.style.userSelect = "";
    }
  };

  /* touch drag */
  const onTouchStart = (e) => {
    drag.current = { active: true, startX: e.touches[0].pageX, scrollLeft: trackRef.current.scrollLeft };
  };
  const onTouchMove = (e) => {
    if (!drag.current.active) return;
    const walk = (drag.current.startX - e.touches[0].pageX) * 1.2;
    trackRef.current.scrollLeft = drag.current.scrollLeft + walk;
  };

  const scrollTo = (dir) => {
    trackRef.current?.scrollBy({ left: dir * SCROLL_BY, behavior: "smooth" });
  };

  const NavBtn = ({ dir }) => (
    <IconButton
      size="small"
      onClick={() => scrollTo(dir)}
      sx={{
        position: "absolute", top: "50%", transform: "translateY(-50%)",
        ...(dir === -1 ? { left: 0 } : { right: 0 }),
        zIndex: 2,
        width: 28, height: 28,
        backgroundColor: C.white,
        border: `1px solid ${C.border}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        color: C.secondary,
        transition: "all 0.15s",
        "&:hover": { backgroundColor: C.accentSoft, borderColor: C.accent, color: C.accent },
        opacity: (dir === -1 ? canLeft : canRight) ? 1 : 0,
        pointerEvents: (dir === -1 ? canLeft : canRight) ? "auto" : "none",
      }}
    >
      {dir === -1
        ? <ArrowBackIosNewIcon sx={{ fontSize: 12 }} />
        : <ArrowForwardIosIcon sx={{ fontSize: 12 }} />}
    </IconButton>
  );

  return (
    <Box sx={{ position: "relative", mb }}>
      {/* fade edges */}
      {canLeft && (
        <Box sx={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 48, zIndex: 1,
          background: `linear-gradient(to right, ${C.bg} 0%, transparent 100%)`,
          pointerEvents: "none",
        }} />
      )}
      {canRight && (
        <Box sx={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: 48, zIndex: 1,
          background: `linear-gradient(to left, ${C.bg} 0%, transparent 100%)`,
          pointerEvents: "none",
        }} />
      )}

      <NavBtn dir={-1} />
      <NavBtn dir={1} />

      {/* scrollable track */}
      <Box
        ref={trackRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={stopDrag}
        sx={{
          display: "flex",
          gap: "10px",
          overflowX: "auto",
          cursor: "grab",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          px: "4px",
          py: "4px",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

/* ── Info tile: label is 10px uppercase, value is 14px ── */
function InfoTile({ icon, label, value }) {
  return (
    <Box sx={{
      display: "flex", alignItems: "center", gap: 1.5,
      p: "14px 16px", borderRadius: "12px",
      border: `1px solid ${C.border}`, backgroundColor: C.white,
      minWidth: 180, flexShrink: 0,
    }}>
      <Box sx={{
        width: 36, height: 36, borderRadius: "9px", flexShrink: 0,
        backgroundColor: C.accentSoft,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        {/* LABEL — 10px uppercase */}
        <Typography sx={{ ...T.label, mb: "3px" }}>{label}</Typography>
        {/* VALUE — 14px semibold */}
        <Typography sx={{ ...T.value, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {fmt(value)}
        </Typography>
      </Box>
    </Box>
  );
}

/* ── Experience card ── */
function ExperienceCard({ job, isLast }) {
  const skills = job.skills_used || [];
  const [expanded, setExpanded] = useState(false);
  const SHOW = 8;
  const visible = expanded ? skills : skills.slice(0, SHOW);

  return (
    <Box sx={{ display: "flex", gap: 2, position: "relative" }}>
      {!isLast && (
        <Box sx={{
          position: "absolute", left: 15, top: 36, bottom: -8,
          width: 2, backgroundColor: C.border, zIndex: 0,
        }} />
      )}
      <Box sx={{
        width: 32, height: 32, borderRadius: "50%", flexShrink: 0, zIndex: 1,
        backgroundColor: job.is_current ? C.accent : "#E5E7EB",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: job.is_current ? `0 0 0 4px ${C.accentSoft}` : "none",
        mt: "2px",
      }}>
        <BusinessOutlinedIcon sx={{ fontSize: 15, color: job.is_current ? "#fff" : C.secondary }} />
      </Box>

      <Box sx={{
        flex: 1, mb: isLast ? 0 : "16px",
        border: `1px solid ${job.is_current ? "#FFCFB3" : C.border}`,
        borderRadius: "12px", p: "16px",
        backgroundColor: job.is_current ? "#FFFAF7" : C.white,
      }}>
        {/* Header row */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap", mb: "12px" }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: "2px" }}>
              {/* Job title — 15px */}
              <Typography sx={T.valueMd}>{job.job_title || "—"}</Typography>
              {job.is_current && (
                <Box sx={{
                  ...T.badge, px: "7px", py: "2px",
                  borderRadius: "5px", backgroundColor: C.accentSoft, color: C.accent,
                }}>
                  CURRENT
                </Box>
              )}
            </Box>
            {/* Company — 13px accent */}
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: C.accent, mb: "6px" }}>
              {job.company_name !== "Not specified" ? job.company_name : "—"}
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              {job.location && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                  <LocationOnOutlinedIcon sx={{ fontSize: 11, color: C.tertiary }} />
                  {/* Meta text — 11px */}
                  <Typography sx={T.meta}>{job.location}</Typography>
                </Box>
              )}
              {job.country && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                  <PublicOutlinedIcon sx={{ fontSize: 11, color: C.tertiary }} />
                  <Typography sx={T.meta}>{job.country}</Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ textAlign: "right", flexShrink: 0 }}>
            {/* Date range — 12px */}
            <Box sx={{
              fontSize: 12, fontWeight: 600, px: "8px", py: "3px",
              borderRadius: "6px", border: `1px solid ${C.border}`,
              color: C.secondary, backgroundColor: "#F9FAFB", whiteSpace: "nowrap",
            }}>
              {fmtDate(job.joining_date)} — {fmtDate(job.end_date)}
            </Box>
            {/* Duration — 10px caption */}
            {job.duration && (
              <Typography sx={{ ...T.caption, mt: "4px" }}>{job.duration}</Typography>
            )}
          </Box>
        </Box>

        {/* Responsibilities */}
        {job.key_responsibilities && (
          <Box sx={{
            p: "12px 14px", borderRadius: "8px",
            backgroundColor: "#F9FAFB", border: `1px solid ${C.border}`, mb: "12px",
          }}>
            {/* Section label — 10px uppercase */}
            <Typography sx={{ ...T.label, mb: "5px" }}>Responsibilities</Typography>
            {/* Body text — 13px */}
            <Typography sx={{ fontSize: 13, fontWeight: 400, color: C.secondary, lineHeight: 1.75 }}>
              {job.key_responsibilities}
            </Typography>
          </Box>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <Box>
            {/* Section label — 10px uppercase */}
            <Typography sx={{ ...T.label, mb: "7px" }}>Skills used</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {visible.map((skill, i) => (
                <Box key={i} sx={{
                  /* Skill chip — 11px */
                  fontSize: 11, fontWeight: 500, px: "8px", py: "3px",
                  borderRadius: "6px", border: `1px solid ${C.border}`,
                  color: C.indigo, backgroundColor: C.indigoSoft,
                }}>
                  {skill}
                </Box>
              ))}
              {skills.length > SHOW && (
                <Box onClick={() => setExpanded(e => !e)} sx={{
                  fontSize: 11, fontWeight: 600, px: "8px", py: "3px",
                  borderRadius: "6px", border: `1px solid ${C.accent}`,
                  color: C.accent, backgroundColor: C.accentSoft, cursor: "pointer",
                }}>
                  {expanded ? "Show less" : `+${skills.length - SHOW} more`}
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

/* ── Education card ── */
function EducationCard({ edu }) {
  return (
    <Box sx={{
      display: "flex", gap: 1.5, p: "16px",
      borderRadius: "12px", border: `1px solid ${C.border}`,
      backgroundColor: C.white,
    }}>
      <Box sx={{
        width: 40, height: 40, borderRadius: "10px", flexShrink: 0,
        backgroundColor: C.greenSoft,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <SchoolOutlinedIcon sx={{ fontSize: 20, color: C.green }} />
      </Box>
      <Box>
        {/* Course — 14px primary */}
        <Typography sx={{ ...T.value, mb: "3px" }}>{edu.course || "—"}</Typography>
        {/* University — 13px green */}
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: C.green, mb: "8px" }}>
          {edu.university || "—"}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {edu.end_year && (
            <Box sx={{
              ...T.badge, px: "7px", py: "2px",
              borderRadius: "5px", backgroundColor: C.greenSoft, color: C.green,
              border: `1px solid #BBF7D0`,
            }}>
              Graduated {edu.end_year}
            </Box>
          )}
          {edu.specialization && (
            <Box sx={{
              ...T.badge, px: "7px", py: "2px",
              borderRadius: "5px", backgroundColor: C.amberSoft, color: C.amber,
              border: `1px solid #FDE68A`,
            }}>
              {edu.specialization}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

/* ── Certification card ── */
function CertCard({ cert }) {
  return (
    <Box sx={{
      display: "flex", gap: 1.5, p: "16px",
      borderRadius: "12px", border: `1px solid ${C.border}`,
      backgroundColor: C.white,
    }}>
      <Box sx={{
        width: 40, height: 40, borderRadius: "10px", flexShrink: 0,
        backgroundColor: C.purpleSoft,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <VerifiedOutlinedIcon sx={{ fontSize: 20, color: C.purple }} />
      </Box>
      <Box>
        {/* Cert name — 14px primary */}
        <Typography sx={{ ...T.value, mb: "3px" }}>{cert.certifications || "—"}</Typography>
        {/* Issuer — 13px purple */}
        {cert.certification_issued_by && (
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: C.purple, mb: "8px" }}>
            {cert.certification_issued_by}
          </Typography>
        )}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {cert.certificate_issue_date && (
            <Box sx={{
              ...T.badge, px: "7px", py: "2px",
              borderRadius: "5px", backgroundColor: C.purpleSoft, color: C.purple,
              border: `1px solid #EDE9FE`,
            }}>
              Issued {fmtDate(cert.certificate_issue_date)}
            </Box>
          )}
          {cert.certificate_expire_date && (
            <Box sx={{
              ...T.badge, px: "7px", py: "2px",
              borderRadius: "5px", backgroundColor: "#FFF7ED", color: "#C2410C",
              border: `1px solid #FED7AA`,
            }}>
              Expires {fmtDate(cert.certificate_expire_date)}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function CandidateDetailPage() {
  const { candidateId } = useParams();
  const navigate        = useNavigate();
  const [tab, setTab]   = useState(0);

  const { data, isLoading, isError } = useGetCandidateDetailsQuery(candidateId, {
    skip: !candidateId,
  });

  const c = data?.data || {};

  const name           = c.full_name          || "";
  const email          = c.email              || "";
  const phone          = c.phone_number       || "";
  const domain         = c.domain             || "";
  const fn             = c.function           || "";
  const subFn          = c.sub_function       || "";
  const employment     = c.employment         || [];
  const education      = c.education          || [];
  const certifications = c.certifications     || [];
  const personal       = c.personal_details   || {};

  const currentJob      = employment.find(e => e.is_current) || employment[0] || {};
  const currentRole     = currentJob.job_title     || "";
  const currentComp     = currentJob.company_name !== "Not specified" ? (currentJob.company_name || "") : "";
  const currentLocation = currentJob.location      || "";
  const country         = personal.country         || "";
  const relocate        = personal.willing_to_relocate;

  const totalExp = currentJob.total_exp_years != null
    ? `${currentJob.total_exp_years}y ${currentJob.total_exp_months ?? 0}m`
    : "";

  const allSkills = [...new Set(employment.flatMap(e => e.skills_used || []))];
  const bg        = avatarBg(name);

  const TABS = [
    { label: "Experience",     count: employment.length     },
    { label: "Education",      count: education.length      },
    { label: "Skills",         count: allSkills.length      },
    { label: "Certifications", count: certifications.length },
  ];
    const dispatch        = useDispatch(); 
 useEffect(() => {
    if (c.full_name) {
      dispatch(setDynamicLabels({ candidateId: c.full_name }));  // ← add
    }
    // Clean up when leaving the page so stale name doesn't bleed into other routes
    return () => {
      dispatch(setDynamicLabels({ candidateId: null }));          // ← cleanup
    };
  }, [c.full_name, dispatch]);
  if (isLoading) return <PageSkeleton />;

  if (isError) return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <Box sx={{ textAlign: "center" }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#EF4444", mb: 1 }}>
          Failed to load candidate
        </Typography>
        <Typography sx={{ ...T.meta, color: C.tertiary }}>Please try again later.</Typography>
      </Box>
    </Box>
  );
  

  return (
    <Box sx={{ backgroundColor: C.bg, minHeight: "100vh", p: "20px 20px 40px" }}>

      {/* ── Breadcrumb / Back ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: "20px" }}>
        <IconButton size="small" onClick={() => navigate(-1)} sx={{
          border: `1px solid ${C.border}`, borderRadius: "8px",
          backgroundColor: C.white, color: C.secondary,
          "&:hover": { backgroundColor: C.accentSoft, borderColor: C.accent, color: C.accent },
        }}>
          <ArrowBackIcon sx={{ fontSize: 16 }} />
        </IconButton>
        {/* Breadcrumb — 12px */}
        <Typography sx={{ fontSize: 12, color: C.tertiary, cursor: "pointer", "&:hover": { color: C.accent } }}
          onClick={() => navigate(-1)}>
          Candidates
        </Typography>
        <Typography sx={{ fontSize: 12, color: C.border }}>/</Typography>
        {/* Current page — 12px semibold */}
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: C.primary }}>
          {name || "Candidate"}
        </Typography>
      </Box>

      {/* ── Hero card ── */}
      <Box sx={{
        borderRadius: "16px", overflow: "hidden",
        border: `1px solid ${C.border}`, backgroundColor: C.white, mb: "16px",
      }}>
        <Box sx={{ height: 72, backgroundColor: "#FFF", opacity: 0.15 }} />

        <Box sx={{ px: "24px", pb: "20px", mt: "-50px" }}>
          <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>

            {/* Avatar + identity */}
            <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
              <Avatar sx={{
                width: 72, height: 72, fontSize: 22, fontWeight: 700,
                backgroundColor: bg, border: "3px solid #fff", flexShrink: 0,
              }}>
                {getInitials(name)}
              </Avatar>
              <Box sx={{ pb: "4px" }}>
                {/* Full name — 20px, biggest on page */}
                <Typography sx={T.valueLg}>{fmt(name)}</Typography>
                {/* Role · Company — 12px secondary */}
                {(currentRole || currentComp) && (
                  <Typography sx={{ fontSize: 12, fontWeight: 500, color: C.secondary, mt: "2px" }}>
                    {currentRole}{currentComp ? ` · ${currentComp}` : ""}
                  </Typography>
                )}
                {/* Domain / function badges */}
                <Box sx={{ display: "flex", gap: "6px", mt: "8px", flexWrap: "wrap" }}>
                  {domain && (
                    <Box sx={{ ...T.badge, px: "8px", py: "2px", borderRadius: "5px", backgroundColor: C.indigoSoft, color: C.indigo, border: "1px solid #E0E7FF" }}>
                      {slugToLabel(domain)}
                    </Box>
                  )}
                  {fn && (
                    <Box sx={{ ...T.badge, px: "8px", py: "2px", borderRadius: "5px", backgroundColor: C.greenSoft, color: C.green, border: "1px solid #BBF7D0" }}>
                      {slugToLabel(fn)}
                    </Box>
                  )}
                  {subFn && (
                    <Box sx={{ ...T.badge, px: "8px", py: "2px", borderRadius: "5px", backgroundColor: C.amberSoft, color: C.amber, border: "1px solid #FDE68A" }}>
                      {slugToLabel(subFn)}
                    </Box>
                  )}
                  {relocate === true && (
                    <Box sx={{ ...T.badge, px: "8px", py: "2px", borderRadius: "5px", backgroundColor: C.greenSoft, color: C.green, border: "1px solid #BBF7D0" }}>
                      Open to relocate
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Contact buttons */}
            <Box sx={{ display: "flex", gap: 1, pb: "4px" }}>
              <Box>
                {email && (
                <Box component="a" href={`mailto:${email}`} sx={{
                  display: "flex", alignItems: "center", gap: "6px",
                  fontSize: 12, fontWeight: 600, px: "14px", py: "7px",
                  borderRadius: "8px", border: `1px solid ${C.border}`,
                  backgroundColor: C.white, color: C.secondary, textDecoration: "none",
                  "&:hover": { borderColor: C.accent, color: C.accent, backgroundColor: C.accentSoft },
                }}>
                  <EmailOutlinedIcon sx={{ fontSize: 14 }} />
                  <p>{email}</p>
                </Box>
              )}
              {phone && (
                <Box component="a" href={`tel:${phone}`} sx={{
                  mt:1,
                  display: "flex", alignItems: "center", gap: "6px",
                  fontSize: 12, fontWeight: 600, px: "14px", py: "7px",
                  borderRadius: "8px", border: `1px solid ${C.border}`,
                  backgroundColor: C.white, color: C.secondary, textDecoration: "none",
                  "&:hover": { borderColor: C.accent, color: C.accent, backgroundColor: C.accentSoft },
                }}>
                  <PhoneOutlinedIcon sx={{ fontSize: 14 }} />
                  <p>{phone}</p>
                </Box>
              )}
              </Box>
              <Box>
                {totalExp && (
                <Box component="a" href={`tel:${phone}`} sx={{
                  display: "flex", alignItems: "center", gap: "6px",
                  fontSize: 12, fontWeight: 600, px: "14px", py: "7px",
                  borderRadius: "8px", border: `1px solid ${C.border}`,
                  backgroundColor: C.white, color: C.secondary, textDecoration: "none",
                  "&:hover": { borderColor: C.accent, color: C.accent, backgroundColor: C.accentSoft },
                }}>
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 14 }} />
                  <p>{totalExp}</p>
                </Box>
              )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      {/* ── Tabs card ── */}
      <Box sx={{
        borderRadius: "16px", border: `1px solid ${C.border}`,
        backgroundColor: C.white, overflow: "hidden",
      }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            px: "16px",
            borderBottom: `1px solid ${C.border}`,
            minHeight: 46,
            "& .MuiTab-root": {
              textTransform: "none",
              ...T.tabLabel,
              minHeight: 46,
              px: "14px",
              color: C.tertiary,
            },
            "& .Mui-selected": { color: C.accent },
            "& .MuiTabs-indicator": { backgroundColor: C.accent, height: 2, borderRadius: "1px 1px 0 0" },
          }}
        >
          {TABS.map((t, i) => (
            <Tab key={i} label={
              <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                {/* Tab label — 13px */}
                <span>{t.label}</span>
                {t.count > 0 && (
                  <Box sx={{
                    fontSize: 10, fontWeight: 700, px: "5px", py: "1px",
                    borderRadius: "4px",
                    backgroundColor: tab === i ? C.accentSoft : "#F3F4F6",
                    color: tab === i ? C.accent : C.tertiary,
                  }}>
                    {t.count}
                  </Box>
                )}
              </Box>
            } />
          ))}
        </Tabs>

        <Box sx={{ p: "24px" }}>

          {/* ── Tab 0: Experience ── */}
          <TabPanel value={tab} index={0}>
            {employment.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                {employment.map((job, i) => (
                  <ExperienceCard key={job.id || i} job={job} isLast={i === employment.length - 1} />
                ))}
              </Box>
            ) : <Empty label="No employment data available." />}
          </TabPanel>

          {/* ── Tab 1: Education ── */}
          <TabPanel value={tab} index={1}>
            {education.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {education.map((edu, i) => <EducationCard key={edu.id || i} edu={edu} />)}
              </Box>
            ) : <Empty label="No education data available." />}
          </TabPanel>

          {/* ── Tab 2: Skills ── */}
          <TabPanel value={tab} index={2}>
            {allSkills.length > 0 ? (
              <Box>
                <SectionHeading count={allSkills.length}>All skills</SectionHeading>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {allSkills.map((skill, i) => (
                    <Box key={i} sx={{
                      /* Skill pill — 12px */
                      fontSize: 12, fontWeight: 500, px: "10px", py: "5px",
                      borderRadius: "7px", border: `1px solid ${C.border}`,
                      color: C.indigo, backgroundColor: C.indigoSoft,
                      transition: "all 0.12s",
                      "&:hover": { borderColor: C.indigo, transform: "translateY(-1px)" },
                    }}>
                      {skill}
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : <Empty label="No skills data available." />}
          </TabPanel>

          {/* ── Tab 3: Certifications ── */}
          <TabPanel value={tab} index={3}>
            {certifications.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {certifications.map((cert, i) => <CertCard key={cert.id || i} cert={cert} />)}
              </Box>
            ) : <Empty label="No certifications available." />}
          </TabPanel>

        </Box>
      </Box>
    </Box>
  );
}