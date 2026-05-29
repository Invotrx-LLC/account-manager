import {
  Avatar, Box, IconButton, Skeleton, Tab, Tabs, Tooltip, Typography,
  Dialog, DialogContent, Button, TextField, Slider, CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetCandidateDetailsQuery,
  useGetCandidateSkillInfoQuery,
  useUpdateCandidateSkillsMutation,
} from "../../redux/services/requisition/requisition";
import { useDispatch } from "react-redux";
import { setDynamicLabels } from "../../redux/slices/breadcrumbSlice";
import { toast } from "react-toastify";

/* ══════════════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════════════ */
const C = {
  accent:       "#FF5F1F",
  accentSoft:   "#FFF0E8",
  accentBorder: "#FFCFB3",
  border:       "#E8E8EC",
  borderStrong: "#D0D0DC",
  bg:           "#F7F7F9",
  white:        "#FFFFFF",
  primary:      "#0D0D14",
  secondary:    "#4A4A5E",
  tertiary:     "#8888A0",
  green:        "#059669",
  greenSoft:    "#ECFDF5",
  greenBorder:  "#A7F3D0",
  blue:         "#2563EB",
  blueSoft:     "#EFF6FF",
  blueBorder:   "#BFDBFE",
  amber:        "#D97706",
  amberSoft:    "#FFFBEB",
  amberBorder:  "#FDE68A",
  red:          "#DC2626",
  redSoft:      "#FEF2F2",
  redBorder:    "#FECACA",
  indigo:       "#4338CA",
  indigoSoft:   "#EEF2FF",
  purple:       "#7C3AED",
  purpleSoft:   "#F5F3FF",
};

const T = {
  label:    { fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.tertiary },
  value:    { fontSize: 14, fontWeight: 600, color: C.primary },
  valueMd:  { fontSize: 15, fontWeight: 700, color: C.primary },
  valueLg:  { fontSize: 20, fontWeight: 700, color: C.primary, lineHeight: 1.2 },
  meta:     { fontSize: 11, fontWeight: 500, color: C.secondary },
  caption:  { fontSize: 10, fontWeight: 500, color: C.tertiary },
  tabLabel: { fontSize: 13, fontWeight: 600 },
  sectionHd:{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.tertiary },
  badge:    { fontSize: 10, fontWeight: 700, letterSpacing: "0.04em" },
};

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
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
function fmtDateFull(d) {
  if (!d) return null;
  try { return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return d; }
}
function slug(s = "") {
  return s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
function getNoteText(note) {
  if (note == null) return "";
  if (typeof note === "object") return String(note.value ?? "");
  return String(note);
}
function safeNum(v) {
  if (v == null) return 0;
  if (typeof v === "object") return Number(v.value ?? 0);
  return Number(v);
}

/* Score → visual tier */
function tier(v) {
  const n = typeof v === "number" ? v : safeNum(v);
  if (n >= 0.8) return { label: "Strong",   color: C.green,  soft: C.greenSoft,  border: C.greenBorder,  track: "#10B981" };
  if (n >= 0.5) return { label: "Moderate", color: C.amber,  soft: C.amberSoft,  border: C.amberBorder,  track: "#F59E0B" };
  if (n >= 0.2) return { label: "Partial",  color: C.accent, soft: C.accentSoft, border: C.accentBorder, track: C.accent  };
  return               { label: "Low",      color: C.red,    soft: C.redSoft,    border: C.redBorder,     track: C.red     };
}

/* ══════════════════════════════════════════════════════════
   SHARED PRIMITIVES
══════════════════════════════════════════════════════════ */
function TabPanel({ value, index, children }) {
  return value === index ? <Box>{children}</Box> : null;
}

function SectionHeading({ children, count }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: "16px" }}>
      <Typography sx={T.sectionHd}>{children}</Typography>
      {count != null && (
        <Box sx={{ ...T.badge, px: "6px", py: "1px", borderRadius: "5px", backgroundColor: C.accentSoft, color: C.accent }}>
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

/* ══════════════════════════════════════════════════════════
   INFO TILE SLIDER
══════════════════════════════════════════════════════════ */
function InfoTileSlider({ children, mb }) {
  const trackRef  = useRef(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);
  const drag      = useRef({ active: false, startX: 0, scrollLeft: 0 });

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

  const onMouseDown = e => { drag.current = { active: true, startX: e.pageX - trackRef.current.offsetLeft, scrollLeft: trackRef.current.scrollLeft }; trackRef.current.style.cursor = "grabbing"; trackRef.current.style.userSelect = "none"; };
  const onMouseMove = e => { if (!drag.current.active) return; trackRef.current.scrollLeft = drag.current.scrollLeft - (e.pageX - trackRef.current.offsetLeft - drag.current.startX) * 1.2; };
  const stopDrag    = () => { drag.current.active = false; if (trackRef.current) { trackRef.current.style.cursor = "grab"; trackRef.current.style.userSelect = ""; } };
  const onTouchStart= e => { drag.current = { active: true, startX: e.touches[0].pageX, scrollLeft: trackRef.current.scrollLeft }; };
  const onTouchMove = e => { if (!drag.current.active) return; trackRef.current.scrollLeft = drag.current.scrollLeft + (drag.current.startX - e.touches[0].pageX) * 1.2; };

  const NavBtn = ({ dir }) => (
    <IconButton size="small" onClick={() => trackRef.current?.scrollBy({ left: dir * 400, behavior: "smooth" })}
      sx={{ position: "absolute", top: "50%", transform: "translateY(-50%)", ...(dir === -1 ? { left: 0 } : { right: 0 }), zIndex: 2, width: 28, height: 28, backgroundColor: C.white, border: `1px solid ${C.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", color: C.secondary, transition: "all 0.15s", "&:hover": { backgroundColor: C.accentSoft, borderColor: C.accent, color: C.accent }, opacity: (dir === -1 ? canLeft : canRight) ? 1 : 0, pointerEvents: (dir === -1 ? canLeft : canRight) ? "auto" : "none" }}>
      {dir === -1 ? <ArrowBackIosNewIcon sx={{ fontSize: 12 }} /> : <ArrowForwardIosIcon sx={{ fontSize: 12 }} />}
    </IconButton>
  );

  return (
    <Box sx={{ position: "relative", mb }}>
      {canLeft  && <Box sx={{ position: "absolute", left:  0, top: 0, bottom: 0, width: 48, zIndex: 1, background: `linear-gradient(to right, ${C.bg}, transparent)`, pointerEvents: "none" }} />}
      {canRight && <Box sx={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 48, zIndex: 1, background: `linear-gradient(to left,  ${C.bg}, transparent)`, pointerEvents: "none" }} />}
      <NavBtn dir={-1} /><NavBtn dir={1} />
      <Box ref={trackRef} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={stopDrag} onMouseLeave={stopDrag} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={stopDrag}
        sx={{ display: "flex", gap: "10px", overflowX: "auto", cursor: "grab", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" }, px: "4px", py: "4px" }}>
        {children}
      </Box>
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════
   EXPERIENCE / EDUCATION / CERT CARDS
══════════════════════════════════════════════════════════ */
function ExperienceCard({ job, isLast }) {
  const skills = job.skills_used || [];
  const [expanded, setExpanded] = useState(false);
  const SHOW = 8;
  const visible = expanded ? skills : skills.slice(0, SHOW);
  return (
    <Box sx={{ display: "flex", gap: 2, position: "relative" }}>
      {!isLast && <Box sx={{ position: "absolute", left: 15, top: 36, bottom: -8, width: 2, backgroundColor: C.border, zIndex: 0 }} />}
      <Box sx={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, zIndex: 1, backgroundColor: job.is_current ? C.accent : "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: job.is_current ? `0 0 0 4px ${C.accentSoft}` : "none", mt: "2px" }}>
        <BusinessOutlinedIcon sx={{ fontSize: 15, color: job.is_current ? "#fff" : C.secondary }} />
      </Box>
      <Box sx={{ flex: 1, mb: isLast ? 0 : "16px", border: `1px solid ${job.is_current ? C.accentBorder : C.border}`, borderRadius: "12px", p: "16px", backgroundColor: job.is_current ? "#FFFAF7" : C.white }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap", mb: "12px" }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: "2px" }}>
              <Typography sx={T.valueMd}>{job.job_title || "—"}</Typography>
              {job.is_current && <Box sx={{ ...T.badge, px: "7px", py: "2px", borderRadius: "5px", backgroundColor: C.accentSoft, color: C.accent }}>CURRENT</Box>}
            </Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: C.accent, mb: "6px" }}>{job.company_name !== "Not specified" ? job.company_name : "—"}</Typography>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              {job.location && <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}><LocationOnOutlinedIcon sx={{ fontSize: 11, color: C.tertiary }} /><Typography sx={T.meta}>{job.location}</Typography></Box>}
              {job.country  && <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}><PublicOutlinedIcon sx={{ fontSize: 11, color: C.tertiary }} /><Typography sx={T.meta}>{job.country}</Typography></Box>}
            </Box>
          </Box>
          <Box sx={{ textAlign: "right", flexShrink: 0 }}>
            <Box sx={{ fontSize: 12, fontWeight: 600, px: "8px", py: "3px", borderRadius: "6px", border: `1px solid ${C.border}`, color: C.secondary, backgroundColor: "#F9FAFB", whiteSpace: "nowrap" }}>{fmtDate(job.joining_date)} — {fmtDate(job.end_date)}</Box>
            {job.duration && <Typography sx={{ ...T.caption, mt: "4px" }}>{job.duration}</Typography>}
          </Box>
        </Box>
        {job.key_responsibilities && (
          <Box sx={{ p: "12px 14px", borderRadius: "8px", backgroundColor: "#F9FAFB", border: `1px solid ${C.border}`, mb: "12px" }}>
            <Typography sx={{ ...T.label, mb: "5px" }}>Responsibilities</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 400, color: C.secondary, lineHeight: 1.75 }}>{job.key_responsibilities}</Typography>
          </Box>
        )}
        {skills.length > 0 && (
          <Box>
            <Typography sx={{ ...T.label, mb: "7px" }}>Skills used</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {visible.map((sk, i) => <Box key={i} sx={{ fontSize: 11, fontWeight: 500, px: "8px", py: "3px", borderRadius: "6px", border: `1px solid ${C.border}`, color: C.indigo, backgroundColor: C.indigoSoft }}>{sk}</Box>)}
              {skills.length > SHOW && <Box onClick={() => setExpanded(e => !e)} sx={{ fontSize: 11, fontWeight: 600, px: "8px", py: "3px", borderRadius: "6px", border: `1px solid ${C.accent}`, color: C.accent, backgroundColor: C.accentSoft, cursor: "pointer" }}>{expanded ? "Show less" : `+${skills.length - SHOW} more`}</Box>}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

function EducationCard({ edu }) {
  return (
    <Box sx={{ display: "flex", gap: 1.5, p: "16px", borderRadius: "12px", border: `1px solid ${C.border}`, backgroundColor: C.white }}>
      <Box sx={{ width: 40, height: 40, borderRadius: "10px", flexShrink: 0, backgroundColor: C.greenSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <SchoolOutlinedIcon sx={{ fontSize: 20, color: C.green }} />
      </Box>
      <Box>
        <Typography sx={{ ...T.value, mb: "3px" }}>{edu.course || "—"}</Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: C.green, mb: "8px" }}>{edu.university || "—"}</Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {edu.end_year && <Box sx={{ ...T.badge, px: "7px", py: "2px", borderRadius: "5px", backgroundColor: C.greenSoft, color: C.green, border: "1px solid #BBF7D0" }}>Graduated {edu.end_year}</Box>}
          {edu.specialization && <Box sx={{ ...T.badge, px: "7px", py: "2px", borderRadius: "5px", backgroundColor: C.amberSoft, color: C.amber, border: `1px solid ${C.amberBorder}` }}>{edu.specialization}</Box>}
        </Box>
      </Box>
    </Box>
  );
}

function CertCard({ cert }) {
  return (
    <Box sx={{ display: "flex", gap: 1.5, p: "16px", borderRadius: "12px", border: `1px solid ${C.border}`, backgroundColor: C.white }}>
      <Box sx={{ width: 40, height: 40, borderRadius: "10px", flexShrink: 0, backgroundColor: C.purpleSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <VerifiedOutlinedIcon sx={{ fontSize: 20, color: C.purple }} />
      </Box>
      <Box>
        <Typography sx={{ ...T.value, mb: "3px" }}>{cert.certifications || "—"}</Typography>
        {cert.certification_issued_by && <Typography sx={{ fontSize: 13, fontWeight: 600, color: C.purple, mb: "8px" }}>{cert.certification_issued_by}</Typography>}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {cert.certificate_issue_date  && <Box sx={{ ...T.badge, px: "7px", py: "2px", borderRadius: "5px", backgroundColor: C.purpleSoft, color: C.purple, border: "1px solid #EDE9FE" }}>Issued {fmtDate(cert.certificate_issue_date)}</Box>}
          {cert.certificate_expire_date && <Box sx={{ ...T.badge, px: "7px", py: "2px", borderRadius: "5px", backgroundColor: "#FFF7ED", color: "#C2410C", border: "1px solid #FED7AA" }}>Expires {fmtDate(cert.certificate_expire_date)}</Box>}
        </Box>
      </Box>
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════
   SKILL INFO — CIRCULAR SCORE RING
══════════════════════════════════════════════════════════ */
function ScoreRing({ value, size = 56 }) {
  const pct  = Math.round(value * 100);
  const t    = tier(value);
  const r    = (size - 9) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={t.soft} strokeWidth={7} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={t.track} strokeWidth={7}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s cubic-bezier(.4,0,.2,1)" }} />
      </svg>
      <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Typography sx={{ fontSize: size < 52 ? 10 : 12, fontWeight: 800, color: t.color, lineHeight: 1 }}>{pct}%</Typography>
      </Box>
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════
   SKILL INFO — EDIT DIALOG
══════════════════════════════════════════════════════════ */
function SkillEditDialog({ open, onClose, skillKey, item, onSave, saving }) {
  const origVal  = safeNum(item?.original_llm_value ?? item?.value);
  const origNote = getNoteText(item?.original_llm_notes ?? item?.notes);
  const currVal  = item?.updated_value != null ? safeNum(item.updated_value) : origVal;
  const currNote = item?.updated_notes != null ? getNoteText(item.updated_notes) : origNote;

  const [val,   setVal]   = useState(currVal);
  const [notes, setNotes] = useState(currNote);

  useEffect(() => {
    if (open) { setVal(currVal); setNotes(currNote); }
  }, [open, skillKey]);

  const t   = tier(val);
  const pct = Math.round(val * 100);

  const QUICK = [
    { label: "No evidence", v: 0,    },
    { label: "Low",         v: 0.15, },
    { label: "Partial",     v: 0.4,  },
    { label: "Moderate",    v: 0.6,  },
    { label: "Strong",      v: 0.8,  },
    { label: "Full",        v: 1.0,  },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: "20px", overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.15)" } }}>

      {/* ── Dialog Header ── */}
      <Box sx={{ px: "24px", pt: "22px", pb: "18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 800, color: C.primary, letterSpacing: "-0.02em" }}>Override Skill Score</Typography>
          <Typography sx={{ fontSize: 12, color: C.tertiary, mt: "3px" }}>{slug(skillKey ?? "")}</Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ mt: "-2px", color: C.tertiary, "&:hover": { color: C.primary } }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: "24px", py: "22px", display: "flex", flexDirection: "column", gap: "22px" }}>

        {/* Score control */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "14px" }}>
            <Typography sx={{ ...T.label }}>New Score</Typography>
            <Box sx={{ px: "14px", py: "5px", borderRadius: "99px", backgroundColor: t.soft, border: `1px solid ${t.border}` }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: t.color }}>{pct}% · {t.label}</Typography>
            </Box>
          </Box>
          {/* Animated fill bar */}
          <Box sx={{ height: 10, borderRadius: "99px", backgroundColor: C.border, mb: "12px", overflow: "hidden" }}>
            <Box sx={{ height: "100%", width: `${pct}%`, borderRadius: "99px", backgroundColor: t.track, transition: "width 0.12s ease" }} />
          </Box>
          <Slider value={val} onChange={(_, v) => setVal(v)} min={0} max={1} step={0.01}
            sx={{ color: t.track, "& .MuiSlider-thumb": { width: 20, height: 20, boxShadow: `0 0 0 5px ${t.soft}` }, "& .MuiSlider-rail": { backgroundColor: C.border, height: 6 }, "& .MuiSlider-track": { height: 6 } }} />
          {/* Quick-set pills */}
          <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap", mt: "12px" }}>
            {QUICK.map(({ label, v }) => {
              const active = Math.abs(val - v) < 0.02;
              const qt     = tier(v);
              return (
                <Box key={label} onClick={() => setVal(v)} sx={{ fontSize: 11, fontWeight: 600, px: "12px", py: "5px", borderRadius: "99px", cursor: "pointer", border: `1.5px solid ${active ? qt.color : C.border}`, backgroundColor: active ? qt.soft : C.white, color: active ? qt.color : C.tertiary, transition: "all 0.12s", "&:hover": { borderColor: qt.color, color: qt.color, backgroundColor: qt.soft } }}>
                  {label}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Original AI reference */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px", p: "12px 14px", borderRadius: "12px", backgroundColor: C.blueSoft, border: `1px solid ${C.blueBorder}` }}>
          <AutoAwesomeOutlinedIcon sx={{ fontSize: 15, color: C.blue, flexShrink: 0 }} />
          <Typography sx={{ fontSize: 12, color: C.secondary }}>
            AI extracted score:&nbsp;
            <Box component="span" sx={{ fontWeight: 700, color: tier(origVal).color }}>
              {Math.round(origVal * 100)}% · {tier(origVal).label}
            </Box>
          </Typography>
        </Box>

        {/* Notes */}
        <Box>
          <Typography sx={{ ...T.label, mb: "10px" }}>Reviewer Notes</Typography>
          <TextField fullWidth multiline rows={4} value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Describe the evidence or reasoning for this override…"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", fontSize: 13, backgroundColor: C.white, "& fieldset": { borderColor: C.border }, "&:hover fieldset": { borderColor: C.borderStrong }, "&.Mui-focused fieldset": { borderColor: C.blue, borderWidth: "1.5px" } } }} />
          {origNote && (
            <Box sx={{ mt: "10px", p: "12px 14px", borderRadius: "10px", backgroundColor: "#FAFAFA", border: `1px solid ${C.border}` }}>
              <Typography sx={{ ...T.label, color: C.tertiary, mb: "4px" }}>AI note (reference)</Typography>
              <Typography sx={{ fontSize: 12, color: C.secondary, lineHeight: 1.6 }}>{origNote}</Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      {/* Footer */}
      <Box sx={{ px: "24px", py: "16px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <Button onClick={onClose} sx={{ textTransform: "none", fontWeight: 500, fontSize: 13, color: C.secondary, border: `1px solid ${C.border}`, borderRadius: "10px", px: "18px" }}>Cancel</Button>
        <Button variant="contained" disabled={saving} onClick={() => onSave({ skillKey, value: val, notes })}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveOutlinedIcon sx={{ fontSize: 15 }} />}
          sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, borderRadius: "10px", px: "22px", backgroundColor: C.primary, boxShadow: "none", "&:hover": { backgroundColor: "#222", boxShadow: "none" }, "&:disabled": { opacity: 0.5 } }}>
          {saving ? "Saving…" : "Save Override"}
        </Button>
      </Box>
    </Dialog>
  );
}

/* ══════════════════════════════════════════════════════════
   SKILL INFO — SINGLE ROW
══════════════════════════════════════════════════════════ */
function SkillRow({ skillKey, item, onEdit }) {
  const [open, setOpen] = useState(false);

  const origVal  = safeNum(item?.original_llm_value ?? item?.value);
  const currVal  = item?.updated_value != null ? safeNum(item.updated_value) : origVal;
  const origNote = getNoteText(item?.original_llm_notes ?? item?.notes);
  const currNote = item?.updated_notes != null ? getNoteText(item.updated_notes) : origNote;

const isOverridden =
  !!item?.value_updated_at ||
  !!item?.notes_updated_at ||
  !!item?.value_updated_by ||
  !!item?.notes_updated_by; 
  const scoreChanged = isOverridden && Math.abs(currVal - origVal) > 0.01;
  const origT        = tier(origVal);
  const currT        = tier(currVal);

  return (
    <Box sx={{
      borderRadius: "14px",
      border: `1px solid ${isOverridden ? C.blueBorder : C.border}`,
      backgroundColor: C.white,
      overflow: "hidden",
      transition: "box-shadow 0.2s, border-color 0.2s",
      "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.06)", borderColor: isOverridden ? C.blue : C.borderStrong },
    }}>
      {/* ── Top row ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "16px", p: "12px 16px", cursor: "pointer", backgroundColor: isOverridden ? "#F8FAFF" : C.white }}
        onClick={() => setOpen(o => !o)}>

        {/* Score ring */}
        <ScoreRing value={currVal} size={52} />

        {/* Name + meta */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.primary }}>{slug(skillKey)}</Typography>
            {isOverridden && (
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: "3px", px: "7px", py: "2px", borderRadius: "99px", backgroundColor: C.blueSoft, border: `1px solid ${C.blueBorder}` }}>
                <VerifiedOutlinedIcon sx={{ fontSize: 9, color: C.blue }} />
                <Typography sx={{ fontSize: 9, fontWeight: 700, color: C.blue, letterSpacing: "0.04em", textTransform: "uppercase" }}>Reviewed</Typography>
              </Box>
            )}
            {scoreChanged && (
              <Box sx={{ px: "7px", py: "2px", borderRadius: "99px", backgroundColor: origT.soft, border: `1px solid ${origT.border}` }}>
                <Typography sx={{ fontSize: 9, fontWeight: 700, color: origT.color }}>{Math.round(origVal * 100)}% → {Math.round(currVal * 100)}%</Typography>
              </Box>
            )}
          </Box>
        {isOverridden && item.value_updated_by && (
  <Typography sx={{ fontSize: 10, color: C.tertiary, mt: "3px" }}>
    Reviewed by {
      typeof item.value_updated_by === "object"
        ? item.value_updated_by?.name
        : item.value_updated_by
    }
    {" · "}
    {fmtDateFull(item.value_updated_at)}
  </Typography>
)}
        </Box>

        {/* Dual progress bars — AI vs Override */}
        <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", gap: "5px", minWidth: 160, flexShrink: 0 }}>
          {/* AI bar */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Typography sx={{ fontSize: 9, fontWeight: 700, color: C.tertiary, textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 28 }}>AI</Typography>
            <Box sx={{ flex: 1, height: 5, borderRadius: "99px", backgroundColor: C.border, overflow: "hidden" }}>
              <Box sx={{ height: "100%", width: `${Math.round(origVal * 100)}%`, borderRadius: "99px", backgroundColor: origT.track }} />
            </Box>
            <Box sx={{ px: "6px", py: "1px", borderRadius: "4px", backgroundColor: origT.soft, minWidth: 34, textAlign: "center" }}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: origT.color }}>{Math.round(origVal * 100)}%</Typography>
            </Box>
          </Box>
          {/* Override bar */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Typography sx={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 28, color: isOverridden ? C.blue : C.tertiary }}>MNL</Typography>
            <Box sx={{ flex: 1, height: 5, borderRadius: "99px", backgroundColor: C.border, overflow: "hidden" }}>
              <Box sx={{ height: "100%", width: `${isOverridden ? Math.round(currVal * 100) : 0}%`, borderRadius: "99px", backgroundColor: isOverridden ? currT.track : C.border, transition: "width 0.4s ease" }} />
            </Box>
            <Box sx={{ px: "6px", py: "1px", borderRadius: "4px", minWidth: 34, textAlign: "center", backgroundColor: isOverridden ? currT.soft : "#F3F4F6" }}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: isOverridden ? currT.color : C.tertiary }}>
                {isOverridden ? `${Math.round(currVal * 100)}%` : "—"}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
          <Tooltip title="Edit override" placement="left">
            <IconButton size="small" onClick={e => { e.stopPropagation(); onEdit(skillKey); }}
              sx={{ width: 30, height: 30, borderRadius: "8px", border: `1px solid ${C.border}`, color: C.tertiary, "&:hover": { backgroundColor: C.accentSoft, borderColor: C.accent, color: C.accent } }}>
              <EditOutlinedIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
          <Box sx={{ color: C.tertiary, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "flex" }}>
            <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
          </Box>
        </Box>
      </Box>

      {/* ── Expanded notes panel ── */}
      {open && (
        <Box sx={{ borderTop: `1px solid ${C.border}`, display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {/* AI Skill Notes */}
          <Box sx={{ p: "14px 16px", borderRight: `1px solid ${C.border}`, backgroundColor: "#FAFAFA" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mb: "8px" }}>
              <AutoAwesomeOutlinedIcon sx={{ fontSize: 12, color: C.blue }} />
              <Typography sx={{ fontSize: 9, fontWeight: 700, color: C.blue, textTransform: "uppercase", letterSpacing: "0.08em" }}>AI Skill Notes</Typography>
            </Box>
            <Typography sx={{ fontSize: 12, color: C.secondary, lineHeight: 1.7 }}>
              {origNote || <Box component="span" sx={{ color: C.tertiary, fontStyle: "italic" }}>No AI notes available.</Box>}
            </Typography>
          </Box>
          {/* Reviewer Notes */}
          <Box sx={{ p: "14px 16px", backgroundColor: isOverridden ? C.blueSoft : "#FAFAFA" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mb: "8px" }}>
              <VerifiedOutlinedIcon sx={{ fontSize: 12, color: isOverridden ? C.blue : C.tertiary }} />
              <Typography sx={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: isOverridden ? C.blue : C.tertiary }}>
                Reviewer Notes
              </Typography>
            </Box>
            {isOverridden && currNote ? (
              <>
                <Typography sx={{ fontSize: 12, color: C.secondary, lineHeight: 1.7 }}>{currNote}</Typography>
                {item.notes_updated_by && (
                  <Typography sx={{ fontSize: 10, color: C.tertiary, mt: "6px" }}>
                    by {item.notes_updated_by} · {fmtDateFull(item.notes_updated_at)}
                  </Typography>
                )}
              </>
            ) : (
              <Typography sx={{ fontSize: 12, color: C.tertiary, fontStyle: "italic", lineHeight: 1.7 }}>
                Not overridden — using AI Skill Notes.
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════
   SKILL INFO — STAT CARD
══════════════════════════════════════════════════════════ */
function StatCard({ label, value, sub, color, bg, border }) {
  return (
    <Box sx={{ p: "18px 20px", borderRadius: "16px", backgroundColor: bg ?? "#FAFAFA", border: `1px solid ${border ?? C.border}` }}>
      <Typography sx={{ ...T.label, color: color ?? C.tertiary, mb: "6px" }}>{label}</Typography>
      <Typography sx={{ fontSize: 30, fontWeight: 800, color: color ?? C.primary, lineHeight: 1, letterSpacing: "-0.03em" }}>{value}</Typography>
      {sub && <Typography sx={{ ...T.caption, mt: "5px" }}>{sub}</Typography>}
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════
   SKILL INFO — SKILL GROUP
══════════════════════════════════════════════════════════ */
function SkillGroupSection({ title, icon, items, emptyText, onEdit }) {
  return (
    <Box sx={{ mb: "28px" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "12px" }}>
        <Typography sx={{ fontSize: 14 }}>{icon}</Typography>
        <Typography sx={{ ...T.sectionHd }}>{title}</Typography>
        <Box sx={{ flex: 1, height: 1, backgroundColor: C.border }} />
        <Box sx={{ px: "8px", py: "2px", borderRadius: "99px", backgroundColor: "#F3F4F6", border: `1px solid ${C.border}` }}>
          <Typography sx={{ fontSize: 10, fontWeight: 700, color: C.tertiary }}>{items.length}</Typography>
        </Box>
      </Box>
      {items.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {items.map(([key, item]) => (
            <SkillRow key={key} skillKey={key} item={item} onEdit={onEdit} />
          ))}
        </Box>
      ) : (
        <Box sx={{ py: "24px", textAlign: "center", borderRadius: "12px", border: `1px dashed ${C.border}`, backgroundColor: "#FAFAFA" }}>
          <Typography sx={{ fontSize: 12, color: C.tertiary }}>{emptyText}</Typography>
        </Box>
      )}
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════
   SKILL INFO TAB  ← main component
══════════════════════════════════════════════════════════ */
function SkillInfoTab({ skillInfoData, skillLoading, candidateId }) {
  const [editKey, setEditKey] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [filterTier, setFilterTier] = useState("all");

  const [updateSkills] = useUpdateCandidateSkillsMutation();
  const { refetch }    = useGetCandidateSkillInfoQuery(candidateId, { skip: !candidateId });

  /* ── Loading ── */
  if (skillLoading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", py: 2 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px", mb: "6px" }}>
          {[1,2,3,4].map(i => <Skeleton key={i} height={96} sx={{ borderRadius: "16px", transform: "none" }} />)}
        </Box>
        {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} height={76} sx={{ borderRadius: "14px", transform: "none" }} />)}
      </Box>
    );
  }

  if (!skillInfoData) {
    return (
      <Box sx={{ py: 8, textAlign: "center", borderRadius: "14px", border: `1px dashed ${C.border}` }}>
        <Typography sx={{ fontSize: 14, color: C.tertiary }}>No skill data available yet.</Typography>
      </Box>
    );
  }

  /* ── Normalise API shape ──
     v2: { skills: { key: { original_llm_value, updated_value, ... } } }
     v1: { original_data: { key: { value, notes } }, skill_overrides, notes_overrides }
  ── */
  const isV2      = !!skillInfoData?.skills;
  const rawSkills = isV2 ? skillInfoData.skills : (skillInfoData?.original_data ?? {});
  const skillOvr  = isV2 ? {} : (skillInfoData?.skill_overrides  ?? {});
  const noteOvr   = isV2 ? {} : (skillInfoData?.notes_overrides  ?? {});

  const EXCLUDE = ["edc_system_expertise", "therapeutic_area_expertise"];

  const normalise = (key, raw) => {
    if (isV2) {
      return {
        original_llm_value: safeNum(raw?.original_llm_value),
        updated_value:      raw?.updated_value  != null ? safeNum(raw.updated_value)  : null,
        original_llm_notes: getNoteText(raw?.original_llm_notes ?? raw?.notes),
        updated_notes:      raw?.updated_notes  != null ? getNoteText(raw.updated_notes) : null,
        value_updated_at:   raw?.value_updated_at ?? null,
        value_updated_by:   raw?.value_updated_by ?? null,
        notes_updated_at:   raw?.notes_updated_at ?? null,
        notes_updated_by:   raw?.notes_updated_by ?? null,
      };
    }
    /* v1 */
    const ov  = skillOvr[key];
    const nov = noteOvr[key];
    return {
      original_llm_value: safeNum(raw?.value ?? raw),
      updated_value:      ov  ? safeNum(ov)  : null,
      original_llm_notes: getNoteText(raw?.notes),
      updated_notes:      nov ? getNoteText(nov) : null,
      value_updated_at:   ov?.updated_at  ?? null,
      value_updated_by:   ov?.updated_by  ?? null,
      notes_updated_at:   nov?.updated_at ?? null,
      notes_updated_by:   nov?.updated_by ?? null,
    };
  };

  const allEntries = Object.entries(rawSkills)
    .filter(([k, v]) => !EXCLUDE.includes(k) && typeof safeNum(isV2 ? v?.original_llm_value : v?.value ?? v) === "number")
    .map(([k, v]) => [k, normalise(k, v)])
    .sort((a, b) => {
      const va = a[1].updated_value ?? a[1].original_llm_value;
      const vb = b[1].updated_value ?? b[1].original_llm_value;
      return vb - va;
    });

  const getScore = ([, v]) => v.updated_value ?? v.original_llm_value;

  const strong   = allEntries.filter(e => getScore(e) >= 0.8);
  const moderate = allEntries.filter(e => { const s = getScore(e); return s >= 0.5 && s < 0.8; });
  const partial  = allEntries.filter(e => { const s = getScore(e); return s >= 0.2 && s < 0.5; });
  const low      = allEntries.filter(e => getScore(e) < 0.2);

  const filtered = filterTier === "all"     ? allEntries
    : filterTier === "strong"   ? strong
    : filterTier === "moderate" ? moderate
    : filterTier === "partial"  ? partial
    : low;

  const overriddenCount = allEntries.filter(([, v]) => v.value_updated_at || v.updated_value != null).length;
  const avgAI = allEntries.length
    ? Math.round(allEntries.reduce((s, [, v]) => s + v.original_llm_value, 0) / allEntries.length * 100) : 0;

  /* Tags */
  const rawData   = skillInfoData?.original_data ?? {};
  const edcList   = Array.isArray(rawData.edc_system_expertise?.value)
    ? rawData.edc_system_expertise.value.filter(s => s && s !== "Not known") : [];
  const taList    = Array.isArray(rawData.therapeutic_area_expertise?.value)
    ? rawData.therapeutic_area_expertise.value.filter(s => s && s !== "Not known") : [];

  /* Save handler */
const handleSave = async ({ skillKey, value, notes }) => {
  setSaving(true);

  try {
    const body = isV2
      ? {
          skills: {
            [skillKey]: {
              updated_value: value,
              updated_notes: notes,
            },
          },
        }
      : {
          skill_overrides: {
            [skillKey]: value,
          },
          notes_overrides: {
            [skillKey]: notes,
          },
        };

    await updateSkills({
      candidateId,
      body,
    }).unwrap();

    toast.success(`${slug(skillKey)} updated`);

    setEditKey(null);

    refetch();

  } catch (err) {
    toast.error(
      err?.data?.message ?? "Failed to update skill"
    );
  } finally {
    setSaving(false);
  }
};

  const editItem = editKey ? (allEntries.find(([k]) => k === editKey)?.[1] ?? null) : null;

  /* ── Render ── */
  return (
    <Box>

      {/* ══ HEADER ══ */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: "24px", gap: 2, flexWrap: "wrap" }}>
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: C.primary, letterSpacing: "-0.03em", lineHeight: 1.2 }}>Skill Assessment</Typography>
          <Typography sx={{ ...T.meta, mt: "5px" }}>
            {skillInfoData?.sub_function ? `${slug(skillInfoData.sub_function)} · ` : ""}
            {allEntries.length} competencies evaluated
            {overriddenCount > 0 && ` · ${overriddenCount} manually reviewed`}
          </Typography>
        </Box>
        {/* Tier summary pills */}
        <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {[
            { v: strong.length,   t: tier(0.9), label: "Strong"   },
            { v: moderate.length, t: tier(0.6), label: "Moderate" },
            { v: partial.length,  t: tier(0.35),label: "Partial"  },
            { v: low.length,      t: tier(0.05),label: "Low"      },
          ].filter(({ v }) => v > 0).map(({ v, t, label }) => (
            <Box key={label} sx={{ px: "12px", py: "5px", borderRadius: "99px", backgroundColor: t.soft, border: `1px solid ${t.border}` }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: t.color }}>{v} {label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ══ STAT CARDS ══ */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4,1fr)" }, gap: "10px", mb: "24px" }}>
        <StatCard label="AI Avg Score"  value={`${avgAI}%`}       sub="from resume extraction"     color={tier(avgAI/100).color} bg={tier(avgAI/100).soft} border={tier(avgAI/100).border} />
        <StatCard label="Strong Skills" value={strong.length}      sub="score ≥ 80%"                color={C.green}  bg={C.greenSoft}  border={C.greenBorder}  />
        <StatCard label="Moderate"      value={moderate.length}    sub="score 50–79%"               color={C.amber}  bg={C.amberSoft}  border={C.amberBorder}  />
        <StatCard label="Reviewed"      value={overriddenCount}    sub={`of ${allEntries.length} manually overridden`} color={C.blue} bg={C.blueSoft} border={C.blueBorder} />
      </Box>

      {/* ══ EXPERTISE TAGS ══ */}
   {(edcList.length > 0 || taList.length > 0) && (
  <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap", mb: "24px" }}>
    
    {edcList.map((s, index) => (
      <Box
        key={s?.id || index}
        sx={{
          px: "12px",
          py: "5px",
          borderRadius: "8px",
          backgroundColor: C.blueSoft,
          border: `1px solid ${C.blueBorder}`,
        }}
      >
        <Typography
          sx={{ fontSize: 11, fontWeight: 600, color: C.blue }}
        >
          EDC · {typeof s === "object" ? s.name : s}
        </Typography>
      </Box>
    ))}

    {taList.map((s, index) => (
      <Box
        key={s?.id || index}
        sx={{
          px: "12px",
          py: "5px",
          borderRadius: "8px",
          backgroundColor: "#F9FAFB",
          border: `1px solid ${C.border}`,
        }}
      >
        <Typography
          sx={{ fontSize: 11, fontWeight: 600, color: C.secondary }}
        >
          TA · {typeof s === "object" ? s.name : s}
        </Typography>
      </Box>
    ))}
    
  </Box>
)}

      {/* ══ FILTER BAR ══ */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "20px", flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "5px", mr: "4px" }}>
          <TuneOutlinedIcon sx={{ fontSize: 14, color: C.tertiary }} />
          <Typography sx={{ ...T.label }}>Filter</Typography>
        </Box>
        {[
          { key: "all",      label: "All Skills",    count: allEntries.length },
          { key: "strong",   label: "Strong",         count: strong.length,   t: tier(0.9) },
          { key: "moderate", label: "Moderate",       count: moderate.length, t: tier(0.6) },
          { key: "partial",  label: "Partial",        count: partial.length,  t: tier(0.35)},
          { key: "low",      label: "Low / None",     count: low.length,      t: tier(0.05)},
        ].map(({ key, label, count, t: ft }) => {
          const active = filterTier === key;
          const col    = ft?.color ?? C.secondary;
          const bg     = ft?.soft  ?? "#F3F4F6";
          const bd     = ft?.border ?? C.border;
          return (
            <Box key={key} onClick={() => setFilterTier(key)} sx={{
              display: "flex", alignItems: "center", gap: "6px",
              px: "12px", py: "5px", borderRadius: "99px", cursor: "pointer",
              border: `1.5px solid ${active ? (ft ? col : C.primary) : C.border}`,
              backgroundColor: active ? (ft ? bg : C.primary) : C.white,
              color: active ? (ft ? col : C.white) : C.tertiary,
              transition: "all 0.12s",
              "&:hover": { borderColor: ft ? col : C.primary, backgroundColor: ft ? bg : C.primary, color: ft ? col : C.white },
            }}>
              <Typography sx={{ fontSize: 11, fontWeight: 600 }}>{label}</Typography>
              <Box sx={{ px: "5px", py: "1px", borderRadius: "99px", backgroundColor: active ? "rgba(255,255,255,0.3)" : "#F3F4F6", minWidth: 18, textAlign: "center" }}>
                <Typography sx={{ fontSize: 9, fontWeight: 700, color: active ? "inherit" : C.tertiary }}>{count}</Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* ══ SKILL ROWS ══ */}
      {filterTier === "all" ? (
        <>
          <SkillGroupSection title="Strong Evidence"    icon="🟢" items={strong}   emptyText="No strong skills."   onEdit={setEditKey} />
          <SkillGroupSection title="Moderate Evidence"  icon="🟡" items={moderate} emptyText="No moderate skills." onEdit={setEditKey} />
          <SkillGroupSection title="Partial Evidence"   icon="🟠" items={partial}  emptyText="No partial skills."  onEdit={setEditKey} />
          <SkillGroupSection title="Low / No Evidence"  icon="🔴" items={low}      emptyText="No low skills."      onEdit={setEditKey} />
        </>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.length > 0
            ? filtered.map(([key, item]) => <SkillRow key={key} skillKey={key} item={item} onEdit={setEditKey} />)
            : <Box sx={{ py: 6, textAlign: "center", borderRadius: "12px", border: `1px dashed ${C.border}` }}><Typography sx={{ fontSize: 12, color: C.tertiary }}>No skills in this category.</Typography></Box>
          }
        </Box>
      )}

      {/* ══ EDIT DIALOG ══ */}
      <SkillEditDialog
        open={!!editKey}
        onClose={() => !saving && setEditKey(null)}
        skillKey={editKey}
        item={editItem}
        onSave={handleSave}
        saving={saving}
      />
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function CandidateDetailPage() {
  const { candidateId } = useParams();
  const navigate        = useNavigate();
  const dispatch        = useDispatch();
  const [tab, setTab]   = useState(0);

  const { data, isLoading, isError } = useGetCandidateDetailsQuery(candidateId, { skip: !candidateId });
  const { data: skillInfoData, isLoading: skillLoading } = useGetCandidateSkillInfoQuery(candidateId, { skip: !candidateId });

  const c               = data?.data || {};
  const name            = c.full_name || "";
  const email           = c.email || "";
  const phone           = c.phone_number || "";
  const domain          = c.domain || "";
  const fn              = c.function || "";
  const subFn           = c.sub_function || "";
  const employment      = c.employment || [];
  const education       = c.education || [];
  const certifications  = c.certifications || [];
  const personal        = c.personal_details || {};

  const currentJob  = employment.find(e => e.is_current) || employment[0] || {};
  const currentRole = currentJob.job_title || "";
  const currentComp = currentJob.company_name !== "Not specified" ? (currentJob.company_name || "") : "";
  const relocate    = personal.willing_to_relocate;
  const totalExp    = currentJob.total_exp_years != null ? `${currentJob.total_exp_years}y ${currentJob.total_exp_months ?? 0}m` : "";
  const allSkills   = [...new Set(employment.flatMap(e => e.skills_used || []))];
  const bg          = avatarBg(name);

  const TABS = [
    { label: "Experience",    count: employment.length    },
    { label: "Education",     count: education.length     },
    { label: "Skills",        count: allSkills.length     },
    { label: "Certifications",count: certifications.length},
    { label: "Skill Info"                                  },
  ];

  useEffect(() => {
    if (c.full_name) dispatch(setDynamicLabels({ candidateId: c.full_name }));
    return () => dispatch(setDynamicLabels({ candidateId: null }));
  }, [c.full_name, dispatch]);

  if (isLoading) return <PageSkeleton />;
  if (isError) return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <Box sx={{ textAlign: "center" }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#EF4444", mb: 1 }}>Failed to load candidate</Typography>
        <Typography sx={{ ...T.meta, color: C.tertiary }}>Please try again later.</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ backgroundColor: C.bg, minHeight: "100vh", p: "20px 20px 40px" }}>

      {/* ── Breadcrumb ── */}
      {/* <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: "20px" }}> */}
      
        {/* <Typography sx={{ fontSize: 12, color: C.tertiary, cursor: "pointer", "&:hover": { color: C.accent } }} onClick={() => navigate(-1)}>Candidates</Typography>
        <Typography sx={{ fontSize: 12, color: C.border }}>/</Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: C.primary }}>{name || "Candidate"}</Typography>
      </Box> */}

      {/* ── Hero card ── */}
   {/* ── Back button — standalone above hero ── */}


{/* ── Hero card ── */}
{/* ── Hero card ── */}
<Box sx={{ borderRadius: "16px", overflow: "hidden", border: `1px solid ${C.border}`, backgroundColor: C.white, mb: "16px" }}>
  <Box sx={{ height: 72 }} />
  <Box sx={{ px: "24px", pb: "20px", mt: "-50px" }}>
    <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>

      {/* Avatar row — arrow + avatar + identity */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>

        {/* ← Back arrow aligned to avatar center */}
        <IconButton
          size="small"
          onClick={() => navigate(-1)}
          sx={{
            mt: "0px",           // pushes down to clear the banner overlap
            flexShrink: 0,
            border: `1px solid ${C.border}`,
            borderRadius: "8px",
            backgroundColor: C.white,
            color: C.secondary,
            "&:hover": {
              backgroundColor: C.accentSoft,
              borderColor: C.accent,
              color: C.accent,
            },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 16 }} />
        </IconButton>

        <Avatar sx={{ width: 72, height: 72, fontSize: 22, fontWeight: 700, backgroundColor: bg, border: "3px solid #fff", flexShrink: 0 }}>
          {getInitials(name)}
        </Avatar>

        <Box sx={{ pb: "4px" }}>
          <Typography sx={T.valueLg}>{fmt(name)}</Typography>
          {(currentRole || currentComp) && (
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: C.secondary, mt: "2px" }}>
              {currentRole}{currentComp ? ` · ${currentComp}` : ""}
            </Typography>
          )}
          <Box sx={{ display: "flex", gap: "6px", mt: "8px", flexWrap: "wrap" }}>
            {domain   && <Box sx={{ ...T.badge, px: "8px", py: "2px", borderRadius: "5px", backgroundColor: C.indigoSoft, color: C.indigo,  border: "1px solid #E0E7FF" }}>{slug(domain)}</Box>}
            {fn       && <Box sx={{ ...T.badge, px: "8px", py: "2px", borderRadius: "5px", backgroundColor: C.greenSoft,  color: C.green,  border: `1px solid ${C.greenBorder}` }}>{slug(fn)}</Box>}
            {subFn    && <Box sx={{ ...T.badge, px: "8px", py: "2px", borderRadius: "5px", backgroundColor: C.amberSoft,  color: C.amber,  border: `1px solid ${C.amberBorder}` }}>{slug(subFn)}</Box>}
            {relocate === true && <Box sx={{ ...T.badge, px: "8px", py: "2px", borderRadius: "5px", backgroundColor: C.greenSoft, color: C.green, border: `1px solid ${C.greenBorder}` }}>Open to relocate</Box>}
          </Box>
        </Box>
      </Box>

      {/* Contact + exp — unchanged */}
      <Box sx={{ display: "flex", gap: 1, pb: "4px", flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {email && (
            <Box component="a" href={`mailto:${email}`} sx={{ display: "flex", alignItems: "center", gap: "6px", fontSize: 12, fontWeight: 600, px: "14px", py: "7px", borderRadius: "8px", border: `1px solid ${C.border}`, backgroundColor: C.white, color: C.secondary, textDecoration: "none", "&:hover": { borderColor: C.accent, color: C.accent, backgroundColor: C.accentSoft } }}>
              <EmailOutlinedIcon sx={{ fontSize: 14 }} />
              <Typography component="span" sx={{ fontSize: 12, fontWeight: 600 }}>{email}</Typography>
            </Box>
          )}
          {phone && (
            <Box component="a" href={`tel:${phone}`} sx={{ display: "flex", alignItems: "center", gap: "6px", fontSize: 12, fontWeight: 600, px: "14px", py: "7px", borderRadius: "8px", border: `1px solid ${C.border}`, backgroundColor: C.white, color: C.secondary, textDecoration: "none", "&:hover": { borderColor: C.accent, color: C.accent, backgroundColor: C.accentSoft } }}>
              <PhoneOutlinedIcon sx={{ fontSize: 14 }} />
              <Typography component="span" sx={{ fontSize: 12, fontWeight: 600 }}>{phone}</Typography>
            </Box>
          )}
        </Box>
        {totalExp && (
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px", fontSize: 12, fontWeight: 600, px: "14px", py: "7px", borderRadius: "8px", border: `1px solid ${C.border}`, backgroundColor: C.white, color: C.secondary }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 14 }} />
            <Typography component="span" sx={{ fontSize: 12, fontWeight: 600 }}>{totalExp}</Typography>
          </Box>
        )}
      </Box>

    </Box>
  </Box>
</Box>

      {/* ── Tabs card ── */}
      <Box sx={{ borderRadius: "16px", border: `1px solid ${C.border}`, backgroundColor: C.white, overflow: "hidden" }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: "16px", borderBottom: `1px solid ${C.border}`, minHeight: 46, "& .MuiTab-root": { textTransform: "none", ...T.tabLabel, minHeight: 46, px: "14px", color: C.tertiary }, "& .Mui-selected": { color: C.accent }, "& .MuiTabs-indicator": { backgroundColor: C.accent, height: 2, borderRadius: "1px 1px 0 0" } }}>
          {TABS.map((t, i) => (
            <Tab key={i} label={
              <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span>{t.label}</span>
                {t.count > 0 && <Box sx={{ fontSize: 10, fontWeight: 700, px: "5px", py: "1px", borderRadius: "4px", backgroundColor: tab === i ? C.accentSoft : "#F3F4F6", color: tab === i ? C.accent : C.tertiary }}>{t.count}</Box>}
              </Box>
            } />
          ))}
        </Tabs>

        <Box sx={{ p: "24px" }}>
          <TabPanel value={tab} index={0}>
            {employment.length > 0 ? <Box sx={{ display: "flex", flexDirection: "column" }}>{employment.map((job, i) => <ExperienceCard key={job.id || i} job={job} isLast={i === employment.length - 1} />)}</Box> : <Empty label="No employment data available." />}
          </TabPanel>

          <TabPanel value={tab} index={1}>
            {education.length > 0 ? <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>{education.map((edu, i) => <EducationCard key={edu.id || i} edu={edu} />)}</Box> : <Empty label="No education data available." />}
          </TabPanel>

          <TabPanel value={tab} index={2}>
            {allSkills.length > 0 ? (
              <Box>
                <SectionHeading count={allSkills.length}>All skills</SectionHeading>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {allSkills.map((sk, i) => <Box key={i} sx={{ fontSize: 12, fontWeight: 500, px: "10px", py: "5px", borderRadius: "7px", border: `1px solid ${C.border}`, color: C.indigo, backgroundColor: C.indigoSoft, transition: "all 0.12s", "&:hover": { borderColor: C.indigo, transform: "translateY(-1px)" } }}>{sk}</Box>)}
                </Box>
              </Box>
            ) : <Empty label="No skills data available." />}
          </TabPanel>

          <TabPanel value={tab} index={3}>
            {certifications.length > 0 ? <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>{certifications.map((cert, i) => <CertCard key={cert.id || i} cert={cert} />)}</Box> : <Empty label="No certifications available." />}
          </TabPanel>

          <TabPanel value={tab} index={4}>
            <SkillInfoTab skillInfoData={skillInfoData} skillLoading={skillLoading} candidateId={candidateId} />
          </TabPanel>
        </Box>
      </Box>
    </Box>
  );
}