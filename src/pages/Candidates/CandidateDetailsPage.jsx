import {
  Avatar, Box, Chip, IconButton, Skeleton, Tab, Tabs, Typography, Divider,
} from "@mui/material";
import ArrowBackIcon            from "@mui/icons-material/ArrowBack";
import EmailOutlinedIcon        from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon        from "@mui/icons-material/PhoneOutlined";
import WorkOutlinedIcon         from "@mui/icons-material/WorkOutlined";
import LocationOnOutlinedIcon   from "@mui/icons-material/LocationOnOutlined";
import SchoolOutlinedIcon       from "@mui/icons-material/SchoolOutlined";
import BusinessOutlinedIcon     from "@mui/icons-material/BusinessOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import VerifiedOutlinedIcon     from "@mui/icons-material/VerifiedOutlined";
import PublicOutlinedIcon       from "@mui/icons-material/PublicOutlined";
import PsychologyOutlinedIcon   from "@mui/icons-material/PsychologyOutlined";
import OpenInFullIcon           from "@mui/icons-material/OpenInFull";
import { useState }             from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetCandidateDetailsQuery } from "../../redux/services/requisition/requisition";

/* ── Tokens ── */
const C = {
  accent:      "#FF5F1F",
  accentSoft:  "#FFF0E8",
  border:      "#E8E8EC",
  bg:          "#F7F7F9",
  white:       "#FFFFFF",
  primary:     "#111118",
  secondary:   "#5C5C70",
  tertiary:    "#9696A6",
  green:       "#0F6E56",
  greenSoft:   "#E7F8EE",
  indigo:      "#4338CA",
  indigoSoft:  "#EEF2FF",
  amber:       "#92400E",
  amberSoft:   "#FEF3C7",
  purple:      "#7C3AED",
  purpleSoft:  "#F5F3FF",
};

/* ── helpers ── */
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

/* ── Tab Panel ── */
function TabPanel({ value, index, children }) {
  return value === index ? <Box>{children}</Box> : null;
}

/* ── Section heading ── */
function SectionHeading({ children, count }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: "16px" }}>
      <Typography fontSize={11} fontWeight={700} color={C.tertiary}
        sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {children}
      </Typography>
      {count != null && (
        <Box sx={{
          fontSize: 10, fontWeight: 700, px: "6px", py: "1px",
          borderRadius: "5px", backgroundColor: C.accentSoft, color: C.accent,
        }}>
          {count}
        </Box>
      )}
    </Box>
  );
}

/* ── Empty state ── */
function Empty({ label }) {
  return (
    <Box sx={{ py: 6, textAlign: "center" }}>
      <Typography fontSize={13} color={C.tertiary}>{label}</Typography>
    </Box>
  );
}

/* ── Page Skeleton ── */
function PageSkeleton() {
  return (
    <Box sx={{ p: 3 }}>
      <Skeleton width={120} height={32} sx={{ mb: 3 }} />
      <Skeleton variant="rectangular" height={140} sx={{ borderRadius: "14px", mb: 2 }} />
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1.5, mb: 2 }}>
        {[1,2,3,4,5,6].map(i => <Skeleton key={i} height={64} sx={{ borderRadius: "10px" }} />)}
      </Box>
      <Skeleton variant="rectangular" height={380} sx={{ borderRadius: "14px" }} />
    </Box>
  );
}

/* ── Info tile (small grid item) ── */
function InfoTile({ icon, label, value }) {
  return (
    <Box sx={{
      display: "flex", alignItems: "center", gap: 1.5,
      p: "12px 14px", borderRadius: "10px",
      border: `1px solid ${C.border}`, backgroundColor: C.white,
    }}>
      <Box sx={{
        width: 32, height: 32, borderRadius: "8px", flexShrink: 0,
        backgroundColor: C.accentSoft,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography fontSize={10} fontWeight={700} color={C.tertiary}
          sx={{ textTransform: "uppercase", letterSpacing: "0.06em", mb: "1px" }}>
          {label}
        </Typography>
        <Typography fontSize={12} fontWeight={600} color={C.primary}
          sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
      {/* Timeline connector */}
      {!isLast && (
        <Box sx={{
          position: "absolute", left: 15, top: 36, bottom: -8,
          width: 2, backgroundColor: C.border, zIndex: 0,
        }} />
      )}

      {/* Dot */}
      <Box sx={{
        width: 32, height: 32, borderRadius: "50%", flexShrink: 0, zIndex: 1,
        backgroundColor: job.is_current ? C.accent : "#E5E7EB",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: job.is_current ? `0 0 0 4px ${C.accentSoft}` : "none",
        mt: "2px",
      }}>
        <BusinessOutlinedIcon sx={{ fontSize: 15, color: job.is_current ? "#fff" : C.secondary }} />
      </Box>

      {/* Card */}
      <Box sx={{
        flex: 1, mb: isLast ? 0 : "16px",
        border: `1px solid ${job.is_current ? "#FFCFB3" : C.border}`,
        borderRadius: "12px", p: "16px",
        backgroundColor: job.is_current ? "#FFFAF7" : C.white,
      }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap", mb: "10px" }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: "2px" }}>
              <Typography fontSize={14} fontWeight={700} color={C.primary}>
                {job.job_title || "—"}
              </Typography>
              {job.is_current && (
                <Box sx={{
                  fontSize: 9, fontWeight: 700, px: "6px", py: "2px",
                  borderRadius: "5px", backgroundColor: C.accentSoft, color: C.accent,
                  textTransform: "uppercase", letterSpacing: "0.05em",
                }}>
                  Current
                </Box>
              )}
            </Box>
            <Typography fontSize={12} fontWeight={600} color={C.accent} mb="4px">
              {job.company_name !== "Not specified" ? job.company_name : "—"}
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              {job.location && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                  <LocationOnOutlinedIcon sx={{ fontSize: 11, color: C.tertiary }} />
                  <Typography fontSize={11} color={C.secondary}>{job.location}</Typography>
                </Box>
              )}
              {job.country && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                  <PublicOutlinedIcon sx={{ fontSize: 11, color: C.tertiary }} />
                  <Typography fontSize={11} color={C.secondary}>{job.country}</Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ textAlign: "right", flexShrink: 0 }}>
            <Box sx={{
              fontSize: 11, fontWeight: 600, px: "8px", py: "3px",
              borderRadius: "6px", border: `1px solid ${C.border}`,
              color: C.secondary, backgroundColor: "#F9FAFB", whiteSpace: "nowrap",
            }}>
              {fmtDate(job.joining_date)} — {fmtDate(job.end_date)}
            </Box>
            {job.duration && (
              <Typography fontSize={10} color={C.tertiary} mt="4px">{job.duration}</Typography>
            )}
          </Box>
        </Box>

        {/* Responsibilities */}
        {job.key_responsibilities && (
          <Box sx={{
            p: "10px 12px", borderRadius: "8px",
            backgroundColor: "#F9FAFB", border: `1px solid ${C.border}`, mb: "10px",
          }}>
            <Typography fontSize={10} fontWeight={700} color={C.tertiary}
              sx={{ textTransform: "uppercase", letterSpacing: "0.06em", mb: "4px" }}>
              Responsibilities
            </Typography>
            <Typography fontSize={12} color={C.secondary} lineHeight={1.7}>
              {job.key_responsibilities}
            </Typography>
          </Box>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <Box>
            <Typography fontSize={10} fontWeight={700} color={C.tertiary}
              sx={{ textTransform: "uppercase", letterSpacing: "0.06em", mb: "6px" }}>
              Skills used
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {visible.map((skill, i) => (
                <Box key={i} sx={{
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
                  color: C.accent, backgroundColor: C.accentSoft,
                  cursor: "pointer",
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
      display: "flex", gap: 1.5, p: "14px 16px",
      borderRadius: "12px", border: `1px solid ${C.border}`,
      backgroundColor: C.white,
    }}>
      <Box sx={{
        width: 36, height: 36, borderRadius: "9px", flexShrink: 0,
        backgroundColor: C.greenSoft,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <SchoolOutlinedIcon sx={{ fontSize: 18, color: C.green }} />
      </Box>
      <Box>
        <Typography fontSize={13} fontWeight={700} color={C.primary} mb="2px">
          {edu.course || "—"}
        </Typography>
        <Typography fontSize={12} fontWeight={600} color={C.green} mb="6px">
          {edu.university || "—"}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {edu.end_year && (
            <Box sx={{
              fontSize: 10, fontWeight: 600, px: "7px", py: "2px",
              borderRadius: "5px", backgroundColor: C.greenSoft, color: C.green,
              border: `1px solid #BBF7D0`,
            }}>
              Graduated {edu.end_year}
            </Box>
          )}
          {edu.specialization && (
            <Box sx={{
              fontSize: 10, fontWeight: 600, px: "7px", py: "2px",
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
      display: "flex", gap: 1.5, p: "14px 16px",
      borderRadius: "12px", border: `1px solid ${C.border}`,
      backgroundColor: C.white,
    }}>
      <Box sx={{
        width: 36, height: 36, borderRadius: "9px", flexShrink: 0,
        backgroundColor: C.purpleSoft,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <VerifiedOutlinedIcon sx={{ fontSize: 18, color: C.purple }} />
      </Box>
      <Box>
        <Typography fontSize={13} fontWeight={700} color={C.primary} mb="2px">
          {cert.certifications || "—"}
        </Typography>
        {cert.certification_issued_by && (
          <Typography fontSize={12} fontWeight={600} color={C.purple} mb="6px">
            {cert.certification_issued_by}
          </Typography>
        )}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {cert.certificate_issue_date && (
            <Box sx={{
              fontSize: 10, fontWeight: 600, px: "7px", py: "2px",
              borderRadius: "5px", backgroundColor: C.purpleSoft, color: C.purple,
              border: `1px solid #EDE9FE`,
            }}>
              Issued {fmtDate(cert.certificate_issue_date)}
            </Box>
          )}
          {cert.certificate_expire_date && (
            <Box sx={{
              fontSize: 10, fontWeight: 600, px: "7px", py: "2px",
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

  const name           = c.full_name     || "";
  const email          = c.email         || "";
  const phone          = c.phone_number  || "";
  const domain         = c.domain        || "";
  const fn             = c.function      || "";
  const subFn          = c.sub_function  || "";
  const employment     = c.employment    || [];
  const education      = c.education     || [];
  const certifications = c.certifications || [];
  const personal       = c.personal_details || {};

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

  if (isLoading) return <PageSkeleton />;

  if (isError) return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <Box sx={{ textAlign: "center" }}>
        <Typography fontSize={16} fontWeight={700} color="#EF4444" mb={1}>Failed to load candidate</Typography>
        <Typography fontSize={13} color={C.tertiary}>Please try again later.</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ backgroundColor: C.bg, minHeight: "100vh", p: "20px 20px 40px" }}>

      {/* ── Back button ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: "20px" }}>
        <IconButton size="small" onClick={() => navigate(-1)} sx={{
          border: `1px solid ${C.border}`, borderRadius: "8px",
          backgroundColor: C.white, color: C.secondary,
          "&:hover": { backgroundColor: C.accentSoft, borderColor: C.accent, color: C.accent },
        }}>
          <ArrowBackIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <Typography fontSize={12} color={C.tertiary} sx={{ cursor: "pointer", "&:hover": { color: C.accent } }}
          onClick={() => navigate(-1)}>
          Candidates
        </Typography>
        <Typography fontSize={12} color={C.border}>/</Typography>
        <Typography fontSize={12} fontWeight={600} color={C.primary}>{name || "Candidate"}</Typography>
      </Box>

      {/* ── Hero card ── */}
      <Box sx={{
        borderRadius: "16px", overflow: "hidden",
        border: `1px solid ${C.border}`, backgroundColor: C.white,
        mb: "16px",
      }}>
        {/* Colour band */}
        <Box sx={{ height: 72, backgroundColor: bg, opacity: 0.15 }} />

        <Box sx={{ px: "24px", pb: "20px", mt: "-36px" }}>
          <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
            {/* Avatar + name */}
            <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
              <Avatar sx={{
                width: 72, height: 72, fontSize: 22, fontWeight: 700,
                backgroundColor: bg, border: "3px solid #fff",
                flexShrink: 0,
              }}>
                {getInitials(name)}
              </Avatar>
              <Box sx={{ pb: "4px" }}>
                <Typography fontSize={20} fontWeight={700} color={C.primary} lineHeight={1.2}>
                  {fmt(name)}
                </Typography>
                {(currentRole || currentComp) && (
                  <Typography fontSize={12} color={C.secondary} mt="2px">
                    {currentRole}{currentComp ? ` · ${currentComp}` : ""}
                  </Typography>
                )}
                <Box sx={{ display: "flex", gap: "6px", mt: "8px", flexWrap: "wrap" }}>
                  {domain && (
                    <Box sx={{ fontSize: 10, fontWeight: 700, px: "8px", py: "2px", borderRadius: "5px", backgroundColor: C.indigoSoft, color: C.indigo, border: "1px solid #E0E7FF" }}>
                      {slugToLabel(domain)}
                    </Box>
                  )}
                  {fn && (
                    <Box sx={{ fontSize: 10, fontWeight: 700, px: "8px", py: "2px", borderRadius: "5px", backgroundColor: C.greenSoft, color: C.green, border: "1px solid #BBF7D0" }}>
                      {slugToLabel(fn)}
                    </Box>
                  )}
                  {subFn && (
                    <Box sx={{ fontSize: 10, fontWeight: 700, px: "8px", py: "2px", borderRadius: "5px", backgroundColor: C.amberSoft, color: C.amber, border: "1px solid #FDE68A" }}>
                      {slugToLabel(subFn)}
                    </Box>
                  )}
                  {relocate === true && (
                    <Box sx={{ fontSize: 10, fontWeight: 700, px: "8px", py: "2px", borderRadius: "5px", backgroundColor: C.greenSoft, color: C.green, border: "1px solid #BBF7D0" }}>
                      Open to relocate
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Contact buttons */}
            <Box sx={{ display: "flex", gap: 1, pb: "4px" }}>
              {email && (
                <Box component="a" href={`mailto:${email}`}
                  sx={{
                    display: "flex", alignItems: "center", gap: "6px",
                    fontSize: 12, fontWeight: 600, px: "12px", py: "6px",
                    borderRadius: "8px", border: `1px solid ${C.border}`,
                    backgroundColor: C.white, color: C.secondary,
                    textDecoration: "none",
                    "&:hover": { borderColor: C.accent, color: C.accent, backgroundColor: C.accentSoft },
                  }}>
                  <EmailOutlinedIcon sx={{ fontSize: 14 }} />
                  Email
                </Box>
              )}
              {phone && (
                <Box component="a" href={`tel:${phone}`}
                  sx={{
                    display: "flex", alignItems: "center", gap: "6px",
                    fontSize: 12, fontWeight: 600, px: "12px", py: "6px",
                    borderRadius: "8px", border: `1px solid ${C.border}`,
                    backgroundColor: C.white, color: C.secondary,
                    textDecoration: "none",
                    "&:hover": { borderColor: C.accent, color: C.accent, backgroundColor: C.accentSoft },
                  }}>
                  <PhoneOutlinedIcon sx={{ fontSize: 14 }} />
                  Call
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Info tiles grid ── */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3,1fr)", md: "repeat(6,1fr)" },
        gap: "10px", mb: "16px",
      }}>
        <InfoTile icon={<EmailOutlinedIcon sx={{ fontSize: 15, color: C.accent }} />}          label="Email"     value={email} />
        <InfoTile icon={<PhoneOutlinedIcon sx={{ fontSize: 15, color: C.accent }} />}          label="Phone"     value={phone} />
        <InfoTile icon={<LocationOnOutlinedIcon sx={{ fontSize: 15, color: C.accent }} />}     label="Location"  value={currentLocation || country} />
        <InfoTile icon={<WorkOutlinedIcon sx={{ fontSize: 15, color: C.accent }} />}           label="Function"  value={slugToLabel(fn)} />
        <InfoTile icon={<BusinessOutlinedIcon sx={{ fontSize: 15, color: C.accent }} />}       label="Company"   value={currentComp || "—"} />
        <InfoTile icon={<CalendarTodayOutlinedIcon sx={{ fontSize: 15, color: C.accent }} />}  label="Exp."      value={totalExp || "—"} />
      </Box>

      {/* ── Tabs card ── */}
      <Box sx={{
        borderRadius: "16px", border: `1px solid ${C.border}`,
        backgroundColor: C.white, overflow: "hidden",
      }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{
            px: "16px",
            borderBottom: `1px solid ${C.border}`,
            minHeight: 44,
            "& .MuiTab-root": {
              textTransform: "none", fontSize: 13, fontWeight: 600,
              minHeight: 44, px: "12px", color: C.tertiary,
            },
            "& .Mui-selected": { color: C.accent },
            "& .MuiTabs-indicator": { backgroundColor: C.accent, height: 2, borderRadius: "1px 1px 0 0" },
          }}
        >
          {TABS.map((t, i) => (
            <Tab key={i} label={
              <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                {t.label}
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

        <Box sx={{ p: "20px 24px" }}>

          {/* Tab 0 — Experience */}
          <TabPanel value={tab} index={0}>
            {employment.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                {employment.map((job, i) => (
                  <ExperienceCard key={job.id || i} job={job} isLast={i === employment.length - 1} />
                ))}
              </Box>
            ) : <Empty label="No employment data available." />}
          </TabPanel>

          {/* Tab 1 — Education */}
          <TabPanel value={tab} index={1}>
            {education.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {education.map((edu, i) => <EducationCard key={edu.id || i} edu={edu} />)}
              </Box>
            ) : <Empty label="No education data available." />}
          </TabPanel>

          {/* Tab 2 — Skills */}
          <TabPanel value={tab} index={2}>
            {allSkills.length > 0 ? (
              <Box>
                <SectionHeading count={allSkills.length}>All skills</SectionHeading>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {allSkills.map((skill, i) => (
                    <Box key={i} sx={{
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

          {/* Tab 3 — Certifications */}
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