import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// ─── Real API shape from response.data ───────────────────────────────────────
// {
//   candidate_id1, candidate { employment[], education[], skill_info[], personal_details, ... },
//   matched_mandatory_skills[], matched_primary_skills[], matched_secondary_skills[],
//   skill_notes { [skill]: string },
//   score_intel  [ { skill, candidate, desired } ],
//   status
// }

// ─── Colour tokens ────────────────────────────────────────────────────────────
const C = {
  orange:      "#E8612A",
  orangeLight: "#FFF4F0",
  blue:        "#0A66E8",
  blueLight:   "#EAF1FD",
  green:       "#16C968",
  greenLight:  "#E6FAF1",
  red:         "#F44336",
  teal:        "#0ABFAD",
  tealLight:   "#E6FAF8",
  purple:      "#7C3AED",
  gray50:      "#F9FAFB",
  gray100:     "#F3F4F6",
  gray200:     "#E5E7EB",
  gray400:     "#9CA3AF",
  gray500:     "#6B7280",
  gray700:     "#374151",
  gray900:     "#111827",
  white:       "#FFFFFF",
};

// ─── Tiny SVG icons ───────────────────────────────────────────────────────────
const Ic = {
  Back:      () => <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor"><path d="M8 1L1 8l7 7"/></svg>,
  Location:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill={C.orange}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>,
  Clock:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill={C.gray500}><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>,
  Brief:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 3.19 16.81 2 15.36 2h-6.72C7.19 2 6 3.19 6 4.64c0 .48.11.92.18 1.36H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-4.82-1.36c0 .36-.28.64-.64.64H9.46a.636.636 0 0 1-.64-.64C8.82 4.28 9.1 4 9.46 4h5.08c.36 0 .64.28.64.64zM20 19H4V8h16v11z"/></svg>,
  Grad:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill={C.teal}><path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>,
  Skills:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>,
  Trend:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>,
  Timeline:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>,
  Pin:       () => <svg width="13" height="13" viewBox="0 0 24 24" fill={C.gray400}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>,
  Globe:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill={C.gray400}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>,
  Email:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill={C.gray400}><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>,
  Phone:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill={C.gray400}><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>,
  Chevron:   ({ open }) => <svg width="16" height="16" viewBox="0 0 24 24" fill={C.gray500} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>,
};

// ─── Small reusable atoms ─────────────────────────────────────────────────────
const Divider = () => <div style={{ height: 1, background: C.gray200, margin: "10px 0" }} />;

const Badge = ({ label, bg, color, border }) => (
  <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: bg, color, border: border ? `1px solid ${border}` : "none" }}>
    {label}
  </span>
);

const Chip = ({ label, bg, color, border }) => (
  <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 500, background: bg || C.gray100, color: color || C.gray700, border: `1px solid ${border || C.gray200}`, margin: "3px", whiteSpace: "nowrap" }}>
    {label}
  </span>
);

const ScoreBar = ({ score }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 200 }}>
    <div style={{ flex: 1, height: 6, background: C.gray200, borderRadius: 4, overflow: "hidden" }}>
      <div style={{ width: `${score}%`, height: "100%", background: score >= 90 ? C.green : score >= 70 ? C.orange : C.red, borderRadius: 4 }} />
    </div>
    <span style={{ fontSize: 13, fontWeight: 600, color: score >= 90 ? C.green : score >= 70 ? C.orange : C.red, minWidth: 38 }}>{score}%</span>
  </div>
);

// ─── Skill note accordion row ─────────────────────────────────────────────────
const SkillNoteRow = ({ skill, note, score }) => {
  const [open, setOpen] = useState(false);
  const pct = score ?? 100;
  const ringColor = pct >= 90 ? C.green : pct >= 70 ? C.orange : C.red;
  return (
    <div style={{ border: `1px solid ${C.gray200}`, borderRadius: 10, marginBottom: 10, overflow: "hidden" }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", cursor: "pointer", background: C.white }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", border: `2.5px solid ${ringColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: ringColor }}>
            {pct}%
          </div>
          <span style={{ fontWeight: 600, fontSize: 14, color: C.gray900 }}>{skill}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 13, color: C.gray500, fontWeight: 500 }}>Score</span>
          <ScoreBar score={pct} />
          <Ic.Chevron open={open} />
        </div>
      </div>
      {open && (
        <div style={{ padding: "12px 18px 16px", background: C.gray50, borderTop: `1px solid ${C.gray200}` }}>
          <p style={{ margin: 0, fontSize: 13, color: C.gray500, lineHeight: 1.7 }}>{note}</p>
        </div>
      )}
    </div>
  );
};

// ─── TAB: Experience ──────────────────────────────────────────────────────────
// ─── TAB: Experience ──────────────────────────────────────────────────────────
const SKILLS_LIMIT = 8;

const JobCard = ({ job, isLast }) => {
  const [expanded, setExpanded] = useState(false);
  const skills      = job.skills_used || [];
  const visible     = expanded ? skills : skills.slice(0, SKILLS_LIMIT);
  const hiddenCount = skills.length - SKILLS_LIMIT;

  return (
    <div style={{ display: "flex", gap: 0, marginBottom: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 52 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: C.gray100, border: `1px solid ${C.gray200}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.gray400, flexShrink: 0 }}>
          <Ic.Brief />
        </div>
        {!isLast && <div style={{ flex: 1, width: 2, background: C.gray200, margin: "4px 0" }} />}
      </div>

      <div style={{ flex: 1, background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 12, padding: "16px 20px", marginBottom: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.gray900 }}>{job.job_title}</span>
              {job.is_current && <Badge label="CURRENT" bg={C.orangeLight} color={C.orange} />}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.orange, marginBottom: 6 }}>{job.company_name}</div>
            <div style={{ display: "flex", gap: 14, fontSize: 12, color: C.gray400 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Ic.Pin /> {job.location || "Not specified"}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Ic.Globe /> {job.country || "India"}</span>
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ background: C.gray100, border: `1px solid ${C.gray200}`, borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 600, color: C.gray700, marginBottom: 4, whiteSpace: "nowrap" }}>
              {job.joining_date} — {job.end_date}
            </div>
            <div style={{ fontSize: 12, color: C.gray400 }}>{job.duration}</div>
          </div>
        </div>

        {skills.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: C.gray400, marginBottom: 8 }}>SKILLS USED</div>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {visible.map(s => <Chip key={s} label={s} />)}
              {!expanded && hiddenCount > 0 && (
                <span
                  onClick={() => setExpanded(true)}
                  style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600, background: C.orangeLight, color: C.orange, border: `1px solid ${C.orange}`, margin: "3px", cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  +{hiddenCount} more
                </span>
              )}
              {expanded && hiddenCount > 0 && (
                <span
                  onClick={() => setExpanded(false)}
                  style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600, background: C.gray100, color: C.gray500, border: `1px solid ${C.gray300}`, margin: "3px", cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  Show less
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ExperienceTab = ({ employment }) => (
  <div style={{ marginTop: 20 }}>
    {employment.map((job, idx) => (
      <JobCard key={job.id} job={job} isLast={idx === employment.length - 1} />
    ))}
  </div>
);

// ─── TAB: Education ───────────────────────────────────────────────────────────
const EducationTab = ({ education }) => (
  <div style={{ marginTop: 20 }}>
    {education.map(edu => (
      <div key={edu.id} style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 12, padding: "20px 22px", display: "flex", alignItems: "center", gap: 16, justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: C.tealLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Ic.Grad />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.gray900, marginBottom: 3 }}>{edu.course}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.teal }}>{edu.university}</div>
          </div>
        </div>
        {edu.end_year && <span style={{ fontSize: 15, color: C.gray400, fontWeight: 500, flexShrink: 0 }}>{edu.end_year}</span>}
      </div>
    ))}
  </div>
);

// ─── TAB: Skills ─────────────────────────────────────────────────────────────
const SkillsTab = ({ skillInfo, mandatorySkills, primarySkills, secondarySkills }) => {
  const allSkills = skillInfo?.[0]?.key_skills?.split(",").map(s => s.trim()) || [];

  // build lookup: normalise to lowercase for matching
  const mandatorySet  = new Set(mandatorySkills.map(s => s.toLowerCase()));
  const primarySet    = new Set(primarySkills.map(s => s.toLowerCase()));
  const secondarySet  = new Set(secondarySkills.map(s => s.toLowerCase()));

  const chipStyle = (skill) => {
    const k = skill.toLowerCase();
    if (mandatorySet.has(k))  return { bg: C.orangeLight, color: C.orange,  border: C.orange };
    if (primarySet.has(k))    return { bg: C.blueLight,   color: C.blue,    border: C.blue   };
    if (secondarySet.has(k))  return { bg: C.gray100,     color: C.gray700, border: C.gray300 };
    return                           { bg: C.gray100,     color: C.gray700, border: C.gray200 };
  };

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 12, padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: C.orangeLight, display: "flex", alignItems: "center", justifyContent: "center", color: C.orange }}>
            <Ic.Skills />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: C.gray900 }}>Skills</span>
        </div>
        <Divider />

        {/* Legend */}
        <div style={{ display: "flex", gap: 20, marginBottom: 16, flexWrap: "wrap" }}>
          {[
            { label: "Mandatory Match", color: C.orange },
            { label: "Primary Match",   color: C.blue   },
            { label: "Secondary Match", color: C.gray400 },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.gray700 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", border: `2px solid ${color}` }} />
              {label}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {allSkills.map(skill => {
            const s = chipStyle(skill);
            return <Chip key={skill} label={skill} bg={s.bg} color={s.color} border={s.border} />;
          })}
        </div>
      </div>
    </div>
  );
};

// ─── TAB: Skill Intel ─────────────────────────────────────────────────────────
const SkillIntelTab = ({ scoreIntel, skillNotes }) => {
  const radarData = scoreIntel.map(item => ({
    subject: item.skill,
    candidate: item.candidate,
    desired: item.desired,
  }));

  // build score lookup from score_intel for the ring badges
  const scoreMap = scoreIntel.reduce((acc, item) => {
    acc[item.skill] = item.candidate;
    return acc;
  }, {});

  return (
    <div style={{ marginTop: 20 }}>
      {/* Legend */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 18, marginBottom: 4 }}>
        {[{ label: "Candidate", color: "#8884d8" }, { label: "Desired", color: C.green }].map(({ label, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.gray500 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
            {label}
          </div>
        ))}
      </div>

      {/* Radar chart */}
      <div style={{ width: "100%", height: 340 }}>
        <ResponsiveContainer>
          <RadarChart data={radarData}>
            <PolarGrid stroke={C.gray200} />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: C.gray700 }} />
            <Radar name="Candidate" dataKey="candidate" stroke="#8884d8" fill="#8884d8" fillOpacity={0.35} />
            <Radar name="Desired"   dataKey="desired"   stroke={C.green} fill={C.green} fillOpacity={0} strokeDasharray="4 3" />
            <Tooltip formatter={(val) => `${val}%`} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Skill Notes — one accordion per skill_notes entry */}
      {Object.keys(skillNotes).length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.gray900, marginBottom: 12 }}>Skill Notes</div>
          {Object.entries(skillNotes).map(([skill, note]) => (
            <SkillNoteRow key={skill} skill={skill} note={note} score={scoreMap[skill] ?? null} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── TAB: Timeline ────────────────────────────────────────────────────────────
const TimelineTab = ({ employment }) => (
  <div style={{ marginTop: 24, paddingLeft: 32, position: "relative" }}>
    <div style={{ position: "absolute", left: 15, top: 0, bottom: 0, width: 2, background: C.gray200 }} />
    {employment.map(job => (
      <div key={job.id} style={{ position: "relative", marginBottom: 28 }}>
        <div style={{ position: "absolute", left: -24, top: 6, width: 14, height: 14, borderRadius: "50%", background: job.is_current ? C.orange : C.gray400, border: `2px solid ${C.white}`, boxShadow: `0 0 0 2px ${job.is_current ? C.orange : C.gray400}` }} />
        <div style={{ fontSize: 12, color: C.gray400, marginBottom: 3 }}>{job.joining_date} — {job.end_date}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.gray900 }}>{job.job_title}</div>
        <div style={{ fontSize: 13, color: C.orange }}>{job.company_name}</div>
        <div style={{ fontSize: 12, color: C.gray400 }}>{job.duration}</div>
      </div>
    ))}
  </div>
);

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { key: "experience", label: "Experience", icon: <Ic.Brief />  },
  { key: "education",  label: "Education",  icon: <Ic.Grad />   },
  { key: "skills",     label: "Skills",     icon: <Ic.Skills /> },
  { key: "skillintel", label: "Skill Intel",icon: <Ic.Trend />  },
  { key: "timeline",   label: "Timeline",   icon: <Ic.Timeline />},
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const ViewProfileDetails = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();

  // profileResponse = response.data (after transformResponse)
  const profile = state?.profileResponse;

  const candidate            = profile?.candidate;
  const matchedMandatory     = profile?.matched_mandatory_skills  || [];
  const matchedPrimary       = profile?.matched_primary_skills    || [];
  const matchedSecondary     = profile?.matched_secondary_skills  || [];
  const skillNotes           = profile?.skill_notes               || {};
  const scoreIntel           = profile?.score_intel               || [];
  const matchStatus          = profile?.status                    || "matched";

  const [activeTab, setActiveTab] = useState("experience");

  // total experience from current employment record
  const totalExperience = useMemo(() => {
    const cur = candidate?.employment?.find(e => e.is_current);
    if (!cur) return null;
    return `${cur.total_exp_years} Years ${cur.total_exp_months} Months`;
  }, [candidate]);

  if (!candidate) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", fontFamily: "sans-serif", color: C.gray500 }}>
        No profile data found.
      </div>
    );
  }

  const initials = `${candidate.first_name?.charAt(0) || ""}${candidate.last_name?.charAt(0) || ""}`;
  const currentJob = candidate.employment?.find(e => e.is_current);
  const skillintelScore = candidate.skill_info?.[0]?.skillintel_score || 0;
  const skillCount = candidate.skill_info?.[0]?.key_skills?.split(",").length || 0;

  const tabCount = (key) => {
    if (key === "experience") return candidate.employment?.length || 0;
    if (key === "education")  return candidate.education?.length  || 0;
    if (key === "skills")     return skillCount;
    return null;
  };

  const statusBadge = matchStatus === "matched"
    ? { label: "MATCHED", bg: "#FFF9E6", color: "#C78A00", border: "#F5D376" }
    : { label: matchStatus.toUpperCase(), bg: C.gray100, color: C.gray700, border: C.gray300 };

  return (
    <div style={{ minHeight: "100vh", background: "#F1F4F9", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", padding: 24, boxSizing: "border-box" }}>

      {/* ── HEADER CARD ─────────────────────────────────────── */}
      <div style={{ background: C.white, borderRadius: 14, padding: "18px 24px", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>

        {/* LEFT */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* back */}
          <button onClick={() => navigate(-1)} style={{ width: 38, height: 38, borderRadius: "50%", border: `1px solid ${C.gray200}`, background: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.gray700, flexShrink: 0 }}>
            <Ic.Back />
          </button>

          {/* avatar */}
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.orange, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, flexShrink: 0 }}>
            {initials}
          </div>

          {/* info */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: C.gray900 }}>{candidate.full_name}</span>
              <Badge label={statusBadge.label} bg={statusBadge.bg} color={statusBadge.color} border={statusBadge.border} />
            </div>

            {currentJob && (
              <div style={{ fontSize: 13, color: C.gray500, marginBottom: 4 }}>
                {currentJob.job_title} &nbsp;·&nbsp; {currentJob.company_name}
              </div>
            )}

            <div style={{ display: "flex", gap: 16, fontSize: 12, color: C.gray400, flexWrap: "wrap" }}>
              {candidate.email && (
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Ic.Email /> {candidate.email}
                </span>
              )}
              {candidate.phone_no && (
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Ic.Phone /> {candidate.phone_no}
                </span>
              )}
              <span style={{ fontWeight: 600, color: C.gray700 }}>CLIN{candidate.clin_id}</span>
            </div>

            {(candidate.personal_details?.city || candidate.personal_details?.country) && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, fontSize: 12 }}>
                <Ic.Location />
                <span style={{ color: C.orange }}>
                  {[candidate.personal_details.city, candidate.personal_details.country].filter(Boolean).join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
          {totalExperience && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.gray50, border: `1px solid ${C.gray200}`, borderRadius: 20, padding: "5px 14px", fontSize: 13, color: C.gray600 }}>
              <Ic.Clock /> {totalExperience}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.orangeLight, border: `1px solid #F5C4AE`, borderRadius: 20, padding: "5px 14px", fontSize: 13, fontWeight: 700, color: C.orange }}>
            <Ic.Trend /> Skill Intel {Math.round(skillintelScore * 10) / 10}
          </div>
        </div>
      </div>

      {/* ── BODY CARD ────────────────────────────────────────── */}
      <div style={{ background: C.white, borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>

        {/* Tab bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.gray200}`, padding: "0 24px", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", gap: 0 }}>
            {TABS.map(tab => {
              const count   = tabCount(tab.key);
              const isActive = activeTab === tab.key;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "16px 16px", fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? C.orange : C.gray500, background: "none", border: "none", borderBottom: isActive ? `2.5px solid ${C.orange}` : "2.5px solid transparent", cursor: "pointer", whiteSpace: "nowrap" }}>
                  <span style={{ color: isActive ? C.orange : C.gray400 }}>{tab.icon}</span>
                  {tab.label}
                  {count != null && (
                    <span style={{ background: isActive ? C.orange : C.gray200, color: isActive ? C.white : C.gray500, borderRadius: "50%", width: 20, height: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Shortlist / Reject */}
          <div style={{ display: "flex", gap: 10, padding: "8px 0" }}>
            <button style={{ background: C.green, color: C.white, border: "none", borderRadius: 8, padding: "9px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Shortlist
            </button>
            <button style={{ background: "#F44336", color: C.white, border: "none", borderRadius: 8, padding: "9px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Reject
            </button>
          </div>
        </div>

        {/* Tab body */}
        <div style={{ padding: "8px 24px 32px" }}>
          {activeTab === "experience" && <ExperienceTab employment={candidate.employment || []} />}
          {activeTab === "education"  && <EducationTab  education={candidate.education || []} />}
          {activeTab === "skills"     && (
            <SkillsTab
              skillInfo={candidate.skill_info}
              mandatorySkills={matchedMandatory}
              primarySkills={matchedPrimary}
              secondarySkills={matchedSecondary}
            />
          )}
          {activeTab === "skillintel" && (
            <SkillIntelTab scoreIntel={scoreIntel} skillNotes={skillNotes} />
          )}
          {activeTab === "timeline"   && <TimelineTab employment={candidate.employment || []} />}
        </div>
      </div>
    </div>
  );
};

export default ViewProfileDetails;