import React, { memo, useState, useRef, useEffect } from "react";
import { Autocomplete, Box, FormControl, IconButton, MenuItem, Select, TextField, Typography } from "@mui/material";
import { PRIMARY } from "../../../theme";
import {
  useGetSubFunctionsQuery,
  useGetCountriesQuery,
  useGetCitiesByCountryQuery,
  useGetNormalSkillsQuery,
  useGetPrimarySkillsQuery,
  useGetMandatorySkillsQuery,
  useGetSecondarySkillsQuery,
  useGetEdcToolsQuery,
  useGetTherapeuticAreasQuery,
  useGetTemplatesQuery,
  useGetCPSkillsQuery,
  useGetCPRemainingSkillsQuery,
  useGetApproversQuery,
  useCreateRequisitionMutation,
  useEditJobMutation,
  useDeleteTemplateMutation
} from "../../../redux/services/createRequesition/createRequesition";
import GroupedSkillAutocomplete from "../../../components/autocomplete";
import { useLocation, useNavigate } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import SummaryPage from "./SummaryPage";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
// ─────────────────────────────────────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────────────────────────────────────
const STATIC = {
  domainSkillsIT: [
    { key: "javascript", label: "JavaScript" }, { key: "typescript", label: "TypeScript" },
    { key: "react", label: "React.js" }, { key: "node", label: "Node.js" },
    { key: "python", label: "Python" }, { key: "java", label: "Java" },
    { key: "dotnet", label: ".NET / C#" }, { key: "sql", label: "SQL" },
    { key: "aws", label: "AWS" }, { key: "azure", label: "Azure" },
    { key: "docker", label: "Docker" }, { key: "kubernetes", label: "Kubernetes" },
    { key: "devops", label: "DevOps" }, { key: "machine_learning", label: "Machine Learning" },
    { key: "data_science", label: "Data Science" }, { key: "cybersecurity", label: "Cybersecurity" },
    { key: "agile_scrum", label: "Agile / Scrum" }, { key: "other", label: "Other" },
  ],
  domainSkillsNonIT: [
    { key: "accounting", label: "Accounting" }, { key: "finance", label: "Finance" },
    { key: "hr_management", label: "HR Management" }, { key: "recruitment", label: "Recruitment" },
    { key: "legal", label: "Legal" }, { key: "compliance", label: "Compliance" },
    { key: "supply_chain", label: "Supply Chain" }, { key: "operations", label: "Operations" },
    { key: "customer_service", label: "Customer Service" }, { key: "ms_office", label: "MS Office" },
    { key: "data_analysis", label: "Data Analysis" }, { key: "other", label: "Other" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const DOMAINS = [
  { value: "clinical", label: "Clinical" },
  { value: "it", label: "IT" },
  { value: "non_it", label: "Non-IT" },
];
const FUNCTIONS = [
  { label: "Bio Statistics", key: "biostatistics" },
  { label: "Clinical Data Management", key: "clinical data management" },
];
const AVAILABILITY = [
  { value: "0", label: "Immediately Available" },
  { value: "30", label: "Less than 30 days" },
  { value: "60", label: "Less than 60 days" },
  { value: "90", label: "Less than 90 days" },
];
const PRIORITIES = ["High", "Medium", "Low"];
const JOB_TYPES = ["Full Time", "Part Time", "Freelancer"];
const WORK_MODES = ["Remote", "Hybrid", "Onsite"];
const POSITIONS = ["One", "Two", "More than Two"];

const getTodayPlus30 = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split("T")[0];
};

const SUB_SHORT = {
  "Clinical Data Manager": "CDM", "Statistical Programmer": "SP",
  "Clinical Programmer/CRF Developer": "CRF", "Bio Statistician": "BIO",
};
const generateTitle = (sub) => {
  const code = SUB_SHORT[sub] || sub.slice(0, 3).toUpperCase();
  const now = new Date();
  const date = `${String(now.getDate()).padStart(2, "0")}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getFullYear()).slice(-2)}`;
  const time = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
  return `${code}-${date}${time}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  primary: PRIMARY.primary,
  primaryLight: "#EBF0FB",
  primaryHover: "#2F5EC4",
  border: "#E5E7EB",
  bg: "#F3F4F6",
  surface: "#fff",
  surfaceMuted: "#F9FAFB",
  text: "#111827",
  textMuted: "#6B7280",
  textHint: "#9CA3AF",
  success: "#16A34A",
  successLight: "#F0FDF4",
  successBorder: "#BBF7D0",
  danger: "#EF4444",
  tag: "#EBF0FB",
  tagText: "#1A4FB5",
  tagBorder: "#C7D8F8",
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED MINI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const FieldRow = ({ children, style }) => (
  <div style={{
    border: `1px solid ${C.border}`, borderRadius: 8,
    padding: "10px 14px", background: C.surfaceMuted, marginBottom: 10, ...style,
  }}>
    {children}
  </div>
);

const FieldLabel = ({ children, error }) => (
  <div style={{
    fontFamily: PRIMARY.fontFamily, fontSize: PRIMARY.label.fontSize,
    fontWeight: 500, color: error ? C.danger : C.textMuted, marginBottom: 5,
  }}>
    {children}
  </div>
);

const ErrorText = ({ msg }) => msg ? (
  <div style={{ fontSize: 12, color: C.danger, marginTop: 3 }}>{msg}</div>
) : null;

const SectionCard = ({ children, style }) => (
  <div style={{
    background: C.surface, borderRadius: 12,
    border: `1px solid ${C.border}`, padding: "20px 22px", ...style,
  }}>
    {children}
  </div>
);

const SectionHeader = ({ title }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{
      fontFamily: PRIMARY.fontFamily, fontSize: 16,
      fontWeight: 600, color: C.text, marginBottom: 4,
    }}>
      {title}
    </div>
  </div>
);

const ChipTag = ({ label, onRemove }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "3px 9px", background: C.tag, color: C.tagText,
    border: `1px solid ${C.tagBorder}`, borderRadius: 20,
    fontSize: PRIMARY.chip.fontSize, fontFamily: PRIMARY.fontFamily, fontWeight: 500,
  }}>
    {label}
    {onRemove && (
      <button onClick={onRemove} style={{
        background: "none", border: "none", cursor: "pointer",
        padding: 0, display: "flex", color: C.tagText, fontSize: 12, lineHeight: 1,
      }}>
        <i className="ti ti-x" style={{ fontSize: 11 }} />
      </button>
    )}
  </span>
);

const MultiSelect = ({ options = [], selected = [], onChange, placeholder, getKey, getLabel, error }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const resolvedKey = getKey || ((o) => o.key || o.value || o);
  const resolvedLabel = getLabel || ((o) => o.label || o.lable || o.name || o);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (key) => {
    onChange(selected.includes(key) ? selected.filter(k => k !== key) : [...selected, key]);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", border: `1px solid ${error ? C.danger : C.border}`, borderRadius: 8,
          padding: "7px 10px", fontSize: 13, background: C.surface,
          cursor: "pointer", display: "flex", flexWrap: "wrap", gap: 4,
          alignItems: "center", minHeight: 36,
        }}
      >
        {selected.length === 0 && (
          <span style={{ color: C.textHint, fontSize: 13 }}>{placeholder || "select"}</span>
        )}
        {selected.map(k => {
          const opt = options.find(o => resolvedKey(o) === k);
          return opt ? (
            <ChipTag key={k} label={resolvedLabel(opt)}
              onRemove={(e) => { e.stopPropagation(); toggle(k); }} />
          ) : null;
        })}
        <i className={`ti ti-chevron-${open ? "up" : "down"}`}
          style={{ marginLeft: "auto", fontSize: 13, color: C.textMuted }} />
      </div>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 100,
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)", maxHeight: 220, overflowY: "auto",
        }}>
          {options.map(opt => {
            const k = resolvedKey(opt);
            const lbl = resolvedLabel(opt);
            const checked = selected.includes(k);
            return (
              <div key={k} onClick={() => toggle(k)} style={{
                padding: "8px 12px", fontSize: PRIMARY.label.fontSize,
                fontFamily: PRIMARY.fontFamily, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
                background: checked ? C.primaryLight : "transparent",
              }}>
                <div style={{
                  width: 15, height: 15, borderRadius: 4,
                  border: `2px solid ${checked ? C.primary : C.border}`,
                  background: checked ? C.primary : C.surface,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {checked && <i className="ti ti-check" style={{ fontSize: 9, color: "#fff" }} />}
                </div>
                {lbl}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ToggleChip = ({ label, selected, onClick }) => (
  <button onClick={onClick} style={{
    flex: 1, padding: "9px 0", borderRadius: 6,
    border: `1px solid ${selected ? C.primary : C.border}`,
    background: selected ? C.primaryLight : C.surface,
    color: selected ? C.primary : C.textMuted,
    fontSize: 13, fontWeight: selected ? 600 : 400,
    cursor: "pointer", transition: "all 0.15s",
  }}>
    {label}
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// STEPPER HEADER
// ─────────────────────────────────────────────────────────────────────────────
const StepperHeader = ({ activeStep }) => (
  <div style={{ borderRadius: 0, marginBottom: 14, overflow: "hidden", display: "flex", alignItems: "stretch" }}>
    <div style={{
      background: activeStep === 1 ? C.primary : C.surfaceMuted,
      color: activeStep === 1 ? "#fff" : C.textMuted, padding: "14px 24px",
      display: "flex", alignItems: "center", gap: 12, flex: 1,
      clipPath: "polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%, 18px 50%)",
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: "50%",
        border: "2px solid rgba(255,255,255,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 600, flexShrink: 0,
      }}>01</div>
      <div style={{ fontFamily: PRIMARY.fontFamily, fontSize: 14, fontWeight: 600 }}>Job Details</div>
    </div>
    <div style={{
      background: activeStep === 2 ? C.primary : C.surfaceMuted,
      color: activeStep === 2 ? "#fff" : C.textMuted,
      padding: "14px 24px 14px 38px", display: "flex", alignItems: "center", gap: 12, flex: 1,
      clipPath: "polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%, 18px 50%)",
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: "50%", border: `1.5px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 600, flexShrink: 0,
      }}>02</div>
      <div style={{ fontFamily: PRIMARY.fontFamily, fontSize: 14, fontWeight: 500, color: C.text }}>Summary</div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// TOAST BANNER
// ─────────────────────────────────────────────────────────────────────────────
const TemplatToastBanner = ({ onLoadNow, onDismiss }) => (
  <div style={{
    position: "fixed", right: 24, bottom: 24, width: 320, zIndex: 999,
    background: "linear-gradient(135deg,#E8532A 0%,#F06830 100%)",
    borderRadius: 12, padding: "14px 16px",
    display: "flex", alignItems: "center", gap: 14,
    boxShadow: "0 8px 30px rgba(0,0,0,.2)",
  }}>
    <button onClick={onDismiss} style={{
      width: 28, height: 28, borderRadius: "50%",
      background: "rgba(255,255,255,0.2)", border: "none",
      color: "#fff", cursor: "pointer", display: "flex",
      alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 0,
    }}>
      <CloseIcon fontSize="small" sx={{ color: "#fff", fontSize: 16 }} />
    </button>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>Load Template</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.4 }}>
        Load a saved template to pre-fill the form
      </div>
    </div>
    <button onClick={onLoadNow} style={{
      padding: "7px 18px", borderRadius: 8, background: "#fff", border: "none",
      color: "#E8532A", fontSize: 13, fontWeight: 600, cursor: "pointer",
      flexShrink: 0, whiteSpace: "nowrap",
    }}>
      Load now
    </button>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
export const Sidebar = ({ sections, sectionStatus, activeSection, onSectionClick }) => (
  <div style={{
    width: 220, minWidth: 220, background: C.surface, borderRadius: 12,
    padding: "20px 14px", border: `1px solid ${C.border}`,
    height: "fit-content", position: "sticky", top: 10, alignSelf: "flex-start",
  }}>
    {sections.map((s, i) => {
      const done = sectionStatus[s.id];
      const active = activeSection === s.id;
      return (
        <div key={s.id}>
          {i > 0 && (
            <div style={{
              width: 2, height: 22, background: done ? C.primary : C.border,
              marginLeft: 20, transition: "background 0.3s",
            }} />
          )}
          <div onClick={() => onSectionClick(s.id)} style={{
            display: "flex", alignItems: "center", gap: 10,
            cursor: "pointer", padding: "6px 8px", borderRadius: 8,
            background: active ? C.primaryLight : "transparent",
            transition: "background 0.2s",
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
              background: done ? C.primary : C.surfaceMuted,
              border: done ? "none" : `1.5px solid ${C.border}`,
              color: done ? "#fff" : C.textHint,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700,
              boxShadow: done ? "0 2px 6px rgba(59,111,212,0.25)" : "none",
            }}>
              {done ? <i className="ti ti-check" style={{ fontSize: 11 }} /> : i + 1}
            </div>
            <span style={{
              fontFamily: PRIMARY.fontFamily, fontSize: 13,
              fontWeight: done || active ? 600 : 500,
              color: active ? C.primary : C.textMuted,
            }}>
              {s.label}
            </span>
          </div>
        </div>
      );
    })}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE DIALOG
// ─────────────────────────────────────────────────────────────────────────────
const TemplateDialog = ({ templates, onClose, onApply, onDelete }) => (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
    zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
  }}>
    <div style={{
      background: C.surface, borderRadius: 14, width: 480,
      maxWidth: "90vw", maxHeight: "80vh", display: "flex", flexDirection: "column",
      border: `1px solid ${C.border}`,
    }}>
      <div style={{
        padding: "16px 22px", borderBottom: `1px solid ${C.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 15, color: C.primary }}>
          <i className="ti ti-bookmark" style={{ fontSize: 18 }} />
          Saved templates
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted }}>
          <i className="ti ti-x" style={{ fontSize: 18 }} />
        </button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 22px" }}>
        {templates.length === 0 ? (
          <p style={{ color: C.textHint, fontSize: 13, textAlign: "center", margin: "24px 0" }}>
            No templates saved yet.
          </p>
        ) : templates.map(t => {
          const jd = t.job_details;
          return (
            <div key={t.template_id} onClick={() => onApply(t)} style={{
              padding: "12px 14px", marginBottom: 8,
              border: `1px solid ${C.border}`, borderRadius: 10,
              cursor: "pointer", transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.background = C.primaryLight; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: C.primary }}>{t.template_name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: C.textMuted }}>
                    {jd.domain}{jd.function ? ` › ${jd.function}` : ""}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, color: C.textHint }}>
                    {t.created_at ? new Date(t.created_at).toLocaleDateString("en-GB") : ""}
                  </span>
                  {/* <button onClick={e => { e.stopPropagation(); onDelete(t.template_id); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: C.danger, padding: 4 }}>
                    <i className="ti ti-trash" style={{ fontSize: 14 }} />
                  </button> */}
                  <DeleteOutlineOutlinedIcon onClick={e => { e.stopPropagation(); onDelete(t.template_id);}}
                    sx={{fontSize:15,color:"#FF5722"}}
                    />
                </div>
              </div>
              <div style={{ display: "flex", gap: 4, marginTop: 7, flexWrap: "wrap" }}>
                <span style={{
                  fontSize: 10, padding: "2px 8px", background: C.primaryLight,
                  color: C.primary, border: `1px solid ${C.tagBorder}`, borderRadius: 10,
                }}>{jd.domain}</span>
                {jd.mode && (
                  <span style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 10,
                    background: jd.mode === "normal" ? "#FFF8E1" : "#E8F5E9",
                    color: jd.mode === "normal" ? "#F57F17" : "#2E7D32",
                    border: `1px solid ${jd.mode === "normal" ? "#FFE082" : "#A5D6A7"}`,
                  }}>
                    {jd.mode === "normal" ? "Standard" : "Advanced"}
                  </span>
                )}
                {jd.mode_of_work && (
                  <span style={{
                    fontSize: 10, padding: "2px 8px", background: C.surfaceMuted,
                    color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: 10,
                  }}>{jd.mode_of_work}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ padding: "12px 22px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end" }}>
        <button onClick={onClose} style={{
          padding: "8px 20px", borderRadius: 8, border: `1px solid ${C.border}`,
          background: C.surface, fontSize: 13, cursor: "pointer", color: C.textMuted,
        }}>Close</button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// CLINICAL SKILLS PANEL
// ─────────────────────────────────────────────────────────────────────────────
const ClinicalSkillsPanel = memo(({
  skillMode, onModeChange, subFunctionKey, selectedSubFunction,
  isClinicalDataManagement, isClinicalDataManagerSub, isClinicalProgrammerSub,
  selections, setters, errors,
}) => {
  const { data: normalSkillsData = [] } = useGetNormalSkillsQuery(subFunctionKey, {
    skip: !subFunctionKey || skillMode !== "normal",
  });
  const normalSkillsOptions = Array.isArray(normalSkillsData)
    ? normalSkillsData
    : normalSkillsData?.data || [];

  const { data: primarySkillsData = [] } = useGetPrimarySkillsQuery(subFunctionKey, {
    skip: !subFunctionKey || skillMode !== "advanced" || isClinicalDataManagement || isClinicalProgrammerSub,
  });

  const { data: mandatorySkillsData = [] } = useGetMandatorySkillsQuery(
    { subFunction: subFunctionKey, primarySelected: selections.primarySkills.join(",") },
    {
      skip: !subFunctionKey || skillMode !== "advanced" ||
        (!isClinicalDataManagerSub && selections.primarySkills.length === 0),
    }
  );

  const { data: secondarySkillsData = [] } = useGetSecondarySkillsQuery(
    {
      subFunction: subFunctionKey,
      primarySelected: selections.primarySkills.join(","),
      mandatorySelected: selections.mandatorySkills.join(","),
    },
    {
      skip: !subFunctionKey || skillMode !== "advanced" ||
        (!isClinicalDataManagerSub && selections.primarySkills.length === 0) ||
        selections.mandatorySkills.length === 0,
    }
  );

  const { data: cpMandatory = [] } = useGetCPSkillsQuery("advanced", {
    skip: !isClinicalProgrammerSub || skillMode !== "advanced",
  });

  const { data: cpSecondaryData = [] } = useGetCPRemainingSkillsQuery(
    { mode: "advanced", selectedSkills: selections.cpMandatory },
    { skip: !isClinicalProgrammerSub || skillMode !== "advanced" || selections.cpMandatory.length === 0 }
  );

  const { data: cpNormalSkills = [] } = useGetCPSkillsQuery("normal", {
    skip: !isClinicalProgrammerSub || skillMode !== "normal",
  });

  const { data: edcToolsData = [] } = useGetEdcToolsQuery();
  const { data: therapeuticAreasData = [] } = useGetTherapeuticAreasQuery();

  const primaryWithKey = primarySkillsData.map(s => ({ key: s.key, label: s.lable || s.label }));

  return (
    <SectionCard>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>Skills</div>
        <div style={{ display: "flex", gap: 4, background: "#E8EAED", borderRadius: 8, padding: 3, flexShrink: 0 }}>
          {["normal", "advanced"].map(m => (
            <button key={m} onClick={() => onModeChange(m)} style={{
              padding: "6px 16px", borderRadius: 6, border: "none",
              background: skillMode === m ? C.primary : "transparent",
              color: skillMode === m ? "#fff" : C.textMuted,
              fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
            }}>
              {m === "normal" ? "Standard" : "Advanced"}
            </button>
          ))}
        </div>
      </div>

      {skillMode === "normal" ? (
        <FieldRow>
          <FieldLabel error={errors.normalSkills}>Skills *</FieldLabel>
          <GroupedSkillAutocomplete
            options={isClinicalProgrammerSub ? cpNormalSkills : normalSkillsOptions}
            value={selections.normalSkills}
            onChange={setters.normalSkills}
            placeholder="Select Skills"
          />
          <ErrorText msg={errors.normalSkills} />
        </FieldRow>
      ) : (
        <>
          {!isClinicalDataManagement && !isClinicalProgrammerSub && (
            <FieldRow>
              <FieldLabel error={errors.primarySkills}>Primary skills *</FieldLabel>
              <GroupedSkillAutocomplete
                options={primaryWithKey}
                value={selections.primarySkills}
                onChange={setters.primarySkills}
                placeholder="Select Primary Skills"
              />
              <ErrorText msg={errors.primarySkills} />
            </FieldRow>
          )}
          <FieldRow>
            <FieldLabel error={errors.mandatorySkills}>Mandatory skills *</FieldLabel>
            <GroupedSkillAutocomplete
              showTooltip
              options={isClinicalProgrammerSub ? cpMandatory : mandatorySkillsData}
              value={isClinicalProgrammerSub ? selections.cpMandatory : selections.mandatorySkills}
              onChange={isClinicalProgrammerSub ? setters.cpMandatory : setters.mandatorySkills}
              placeholder="Select Mandatory Skills"
            />
            <ErrorText msg={errors.mandatorySkills} />
          </FieldRow>
          <FieldRow>
            <FieldLabel>Secondary skills</FieldLabel>
            <GroupedSkillAutocomplete
              options={
                isClinicalProgrammerSub
                  ? cpSecondaryData
                  : secondarySkillsData.filter(s => !selections.mandatorySkills.includes(s.key))
              }
              value={isClinicalProgrammerSub ? selections.cpSecondary : selections.secondarySkills}
              onChange={isClinicalProgrammerSub ? setters.cpSecondary : setters.secondarySkills}
              placeholder="Select Secondary Skills"
            />
          </FieldRow>
          {(isClinicalDataManagerSub || isClinicalProgrammerSub) && (
            <FieldRow>
              <FieldLabel error={errors.edcTools}>EDC tools *</FieldLabel>
              <GroupedSkillAutocomplete
                options={(edcToolsData || []).map(item => ({ ...item, label: item.lable || item.label }))}
                value={selections.edcTools}
                onChange={setters.edcTools}
                placeholder="Select EDC Tools"
              />
              <ErrorText msg={errors.edcTools} />
            </FieldRow>
          )}
          {isClinicalDataManagement && (
            <FieldRow>
              <FieldLabel>Preferred therapeutic experience</FieldLabel>
              <GroupedSkillAutocomplete
                options={therapeuticAreasData.map(item => ({ ...item, label: item.lable }))}
                value={selections.therapeutic}
                onChange={setters.therapeutic}
                placeholder="Select Therapeutic Areas"
              />
            </FieldRow>
          )}
        </>
      )}
    </SectionCard>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// NON-CLINICAL SKILLS PANEL
// ─────────────────────────────────────────────────────────────────────────────
const NonClinicalSkillsPanel = memo(({ domain, selections, setters, errors }) => {
  const options = domain === "it" ? STATIC.domainSkillsIT : STATIC.domainSkillsNonIT;
  return (
    <SectionCard>
      <SectionHeader title="Skills" />
      <FieldRow>
        <FieldLabel error={errors.domainSkills}>Skills *</FieldLabel>
        <MultiSelect
          options={options} selected={selections.domainSkills}
          onChange={setters.domainSkills} placeholder="select" error={errors.domainSkills}
        />
        <ErrorText msg={errors.domainSkills} />
      </FieldRow>
    </SectionCard>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// MAIN FORM
// ─────────────────────────────────────────────────────────────────────────────
const CreateRequisitionForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ── Capture edit state ONCE on mount into refs ──
  // This prevents location.state changes (from navigate()) from
  // wiping isEditMode mid-session and triggering auto-select effects.
  const editModeRef = useRef(location.state?.editMode || false);
  const editDataRef = useRef(location.state?.requisitionData || null);
  const editJobIdRef = useRef(location.state?.jobDetailsId || null);

  const isEditMode = editModeRef.current;
  const editJobId = editJobIdRef.current;
  const returnTo = editModeRef?.returnTo;
  const [activeStep, setActiveStep] = useState(1);
  const [summaryData, setSummaryData] = useState("");
  const [jobDetailsId, setJobDetailsId] = useState("");
  const [isEditAfterSummary, setIsEditAfterSummary] = useState(false);

  const orgId = location.state?.orgId;
  const [currentOrgId] = useState(location.state?.orgId);

  // ── Domain / Function / SubFunction ──
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedFunction, setSelectedFunction] = useState("");
  const [selectedSubFunction, setSelectedSubFunction] = useState("");
  const [subFunctionKey, setSubFunctionKey] = useState("");
  const [skillMode, setSkillMode] = useState("normal");

  // ── UI state ──
  const [activeSection, setActiveSection] = useState("roleSetup");
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [deletedTemplateIds, setDeletedTemplateIds] = useState([]);
  const [showTemplatePrompt, setShowTemplatePrompt] = useState(false);
  const [minimizeTemplatePrompt, setMinimizeTemplatePrompt] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ── Job info ──
  const [designation, setDesignation] = useState("");
  const [experience, setExperience] = useState({ min: "", max: "" });
  const [availability, setAvailability] = useState("");
  const [country, setCountry] = useState("India");
  const [city, setCity] = useState("");
  const [positionsCount, setPositionsCount] = useState("One");
  const [priority, setPriority] = useState("High");
  const [jobType, setJobType] = useState("Full Time");
  const [workMode, setWorkMode] = useState("Onsite");
  const [salaryUnit, setSalaryUnit] = useState("INR / Per Annum");
  const [salary, setSalary] = useState("");
  const [closingDate, setClosingDate] = useState(getTodayPlus30());

  // ── Team ──
  const [approver, setApprover] = useState(null);
  const [taTeam, setTaTeam] = useState([]);
  const [creator, setCreator] = useState(null);
  const [jdFile, setJdFile] = useState(null);

  // ── Job description ──
  const [instructions, setInstructions] = useState("");
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");

  // ── Skills ──
  const [normalSkills, setNormalSkills] = useState([]);
  const [primarySkills, setPrimarySkills] = useState([]);
  const [mandatorySkills, setMandatorySkills] = useState([]);
  const [secondarySkills, setSecondarySkills] = useState([]);
  const [cpMandatory, setCpMandatory] = useState([]);
  const [cpSecondary, setCpSecondary] = useState([]);
  const [edcTools, setEdcTools] = useState([]);
  const [therapeutic, setTherapeutic] = useState([]);
  const [domainSkills, setDomainSkills] = useState([]);

  const [errors, setErrors] = useState({});
  const [requisitionData, setRequisitionData] = useState(null);

  // ── RTK Queries ──
  const { data: countries = [] } = useGetCountriesQuery();
  const { data: cities = [] } = useGetCitiesByCountryQuery(country, { skip: !country });
  const { data: approversResponse } = useGetApproversQuery(
    { orgID: currentOrgId },
    { skip: !currentOrgId }
  );
  const approvers = approversResponse?.data || [];

  const { data: templatesResponse } = useGetTemplatesQuery(
    { orgID: currentOrgId },
    { skip: !currentOrgId }
  );
  const allTemplates = templatesResponse?.data || [];
  const [deleteTemplate] = useDeleteTemplateMutation();

  const { data: subFunctionsData = [] } = useGetSubFunctionsQuery(selectedFunction, {
    skip: !selectedFunction || selectedDomain !== "clinical",
  });

  // ── RTK Mutation ──
  const [createRequisition, { isLoading: isSubmitting }] = useCreateRequisitionMutation();
  const [editJob, { isLoading: isUpdating }] =
    useEditJobMutation();

  // ── Derived ──
  const localTemplates = allTemplates.filter(t => !deletedTemplateIds.includes(t.template_id));
  const isClinical = selectedDomain === "clinical";
  const isNonClinical = selectedDomain !== "" && selectedDomain !== "clinical";
  const isCDM = selectedFunction === "clinical data management";
  const isCDMSub = selectedSubFunction === "Clinical Data Manager";
  const isCPSub = selectedSubFunction === "Clinical Programmer/CRF Developer";

  const subFunctionOptions = subFunctionsData.map((s) => {
    let disabled = false;
    if (selectedFunction === "biostatistics" && s.key === "biostatistician") disabled = true;
    if (selectedFunction === "clinical data management" && s.key === "medical coder") disabled = true;
    return { value: s.lable, label: s.lable, disabled, subFunction: s.sub_function };
  });

  // ── Style helpers ──
  const flatSelectStyle = {
    width: "100%", border: "none", outline: "none", background: "#fff",
    fontFamily: PRIMARY.fontFamily, fontSize: PRIMARY.label.fontSize,
    color: C.text, cursor: "pointer", padding: "10px 5px",
  };
  const muiSelectSx = {
    fontFamily: PRIMARY.fontFamily,
    "& .MuiSelect-select": { fontSize: PRIMARY.label.fontSize, fontFamily: PRIMARY.fontFamily },
  };
  const muiMenuItemSx = {
    fontFamily: PRIMARY.fontFamily, fontSize: PRIMARY.label.fontSize,
    "&:hover": { backgroundColor: "#EEF2FF" },
  };

  // ── Handlers ──
  const handleDomainChange = (val) => {
    setSelectedDomain(val);
    setSelectedFunction(""); setSelectedSubFunction(""); setSubFunctionKey("");
    setNormalSkills([]); setPrimarySkills([]); setMandatorySkills([]);
    setSecondarySkills([]); setCpMandatory([]); setCpSecondary([]);
    setEdcTools([]); setTherapeutic([]); setDomainSkills([]);
    setErrors({});
  };

  const handleFunctionChange = (val) => {
    setSelectedFunction(val);
    setSelectedSubFunction(""); setSubFunctionKey("");
  };

  const handleSubFunctionChange = (val) => {
    setSelectedSubFunction(val);
    const match = subFunctionsData.find(s => s.lable === val);
    setSubFunctionKey(match?.sub_function || "");
    setDesignation(generateTitle(val));
  };

  const handleSkillModeChange = (mode) => {
    setSkillMode(mode);
    setNormalSkills([]); setPrimarySkills([]); setMandatorySkills([]);
    setSecondarySkills([]); setCpMandatory([]); setCpSecondary([]);
  };
  const handleCancel = () => {
    if (returnTo === "matchedCandidates") {
      navigate("/account-manager/matched-candidates", {
        state: {
          requisitionData,
          orgId,
        },
      });
      return;
    }

    if (isEditAfterSummary || returnTo === "summary") {
      setActiveStep(2);
      return;
    }

    navigate(-1);
  };
  const scrollTo = (id) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const validate = () => {
    const errs = {};
    if (!selectedDomain) errs.domain = "Required";
    if (!positionsCount) errs.positionsCount = "Required";
    if (isClinical && !selectedFunction) errs.function = "Required";
    if (isClinical && !selectedSubFunction) errs.subFunction = "Required";
    if (!designation.trim()) errs.designation = "Job title is required";
    if (experience.min === "" || experience.min === null) errs.min = "Required";
    if (!experience.max) errs.max = "Required";
    if (experience.min !== "" && experience.max && Number(experience.max) < Number(experience.min)) {
      errs.max = "Max must be ≥ Min";
    }
    if (!availability) errs.availability = "Required";
    if (!country) errs.country = "Required";
    if (!jobType) errs.jobType = "Required";
    if (!workMode) errs.workMode = "Required";
    if (!priority) errs.priority = "Required";
    if (!closingDate) errs.closingDate = "Required";
    if (!approver) errs.approver = "Approver is required";
    if (!creator) errs.creator = "Creator is required";
    if (isClinical) {
      if (skillMode === "normal" && normalSkills.length === 0) errs.normalSkills = "Select at least one skill";
      if (skillMode === "advanced") {
        if (!isCDM && !isCPSub && primarySkills.length === 0) errs.primarySkills = "Required";
        const hasMandatory = isCPSub ? cpMandatory.length > 0 : mandatorySkills.length > 0;
        if (!hasMandatory) errs.mandatorySkills = "Required";
        if ((isCDMSub || isCPSub) && edcTools.length === 0) errs.edcTools = "Required";
      }
    } else if (isNonClinical && domainSkills.length === 0) {
      errs.domainSkills = "Select at least one skill";
    }
    if (saveAsTemplate && !templateName.trim()) errs.templateName = "Template name is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── SUBMIT ──
  const handleSubmit = async () => {
    setSubmitError("");
    if (!validate()) return;

    const requisitionFormData = {
      selectedDomain, selectedFunction, selectedSubFunction, subFunctionKey, skillMode,
      designation, experience, availability, country, city, positionsCount,
      priority, jobType, workMode, salaryUnit, salary, closingDate,
      creatorId: creator?.employee_id,
      approverId: approver?.employee_id,
      taTeam, instructions,
      normalSkills, primarySkills, mandatorySkills, secondarySkills,
      cpMandatory, cpSecondary, edcTools, therapeutic, domainSkills,
    };

    const fd = new FormData();
    fd.append("organisation_id", orgId || "");
    fd.append("org_emp_id", creator?.employee_id || "");
    fd.append("job_approver", approver?.employee_id || "");
    fd.append("domain", selectedDomain);
    fd.append("function", selectedFunction);
    fd.append("sub_function", subFunctionKey);
    fd.append("designation", designation);
    fd.append("no_of_positions", positionsCount);
    fd.append("min_years", experience.min);
    fd.append("max_years", experience.max);
    fd.append("availability", availability);
    fd.append("country", country);
    fd.append("city", city);
    fd.append("priority", priority);
    fd.append("job_type", jobType);
    fd.append("mode_of_work", workMode);
    fd.append("salary_range", salary);
    fd.append("salary_unit", salaryUnit);
    fd.append("closing_date", closingDate || "");
    fd.append("mode", skillMode);

    if (isClinical) {
      if (skillMode === "normal") {
        fd.append("normal_skills", normalSkills.join(","));
      } else {
        fd.append("primaryskills", primarySkills.join(","));
        fd.append("mandatoryskills", isCPSub ? cpMandatory.join(",") : mandatorySkills.join(","));
        fd.append("secondaryskills", isCPSub ? cpSecondary.join(",") : secondarySkills.join(","));
        fd.append("edc", edcTools.join(","));
        fd.append("therapeutic_areas", therapeutic.join(","));
      }
    } else {
      fd.append("additional_skill_1", domainSkills.join(","));
    }

    fd.append("recruiter", taTeam.join(","));
    fd.append("text", instructions);
    fd.append("save_as_template", saveAsTemplate ? "true" : "false");
    if (saveAsTemplate) {
      fd.append("template_name", templateName);
      fd.append("template_description", templateDescription);
    }
    if (jdFile) fd.append("file", jdFile);
    try {
      let result;
      if (editModeRef.current || isEditAfterSummary) {
        result = await editJob({
          jobId: editJobId || jobDetailsId,
          formData: fd,
        }).unwrap();

        setSummaryData(
          result?.data?.summary ||
          result?.summary ||
          summaryData
        );

        setJobDetailsId(
          editJobId || jobDetailsId
        );

        setRequisitionData(requisitionFormData);

        setIsEditAfterSummary(false);

        setActiveStep(2);

        return;
      }

      result = await createRequisition(fd).unwrap();

      setSummaryData(result?.data?.summary || result?.summary || "");
      setJobDetailsId(result?.data?.job_details_id || result?.job_details_id);
      setRequisitionData(requisitionFormData);
      setActiveStep(2);

    } catch (err) {
      console.error("Submit failed:", err);
      setSubmitError(
        err?.data?.message ||
        err?.error ||
        "Submission failed. Please try again."
      );
    }

    // try {
    //   const result = await createRequisition(fd).unwrap();
    //   setSummaryData(result?.data?.summary || result?.summary || "");
    //   setJobDetailsId(result?.data?.job_details_id || result?.job_details_id);
    //   setRequisitionData(requisitionFormData);
    //   setActiveStep(2);
    // } catch (err) {
    //   console.error("Submit failed:", err);
    //   setSubmitError(err?.data?.message || err?.error || "Submission failed. Please try again.");
    // }
  };

const handleApplyTemplate = (template) => {
    const jd = template.job_details;

    setSelectedDomain(jd.domain || "clinical");
    setSelectedFunction(jd.function || "");
    setSelectedSubFunction(jd.sub_function || "");
    setDesignation(jd.job_title || "");
    setExperience({ min: jd.min_years || "", max: jd.max_years || "" });
    setAvailability(String(jd.availability || ""));
    setCountry(jd.country || "India");
    setCity(jd.city || "");
    setPositionsCount(jd.no_of_positions || "One");
    setPriority(jd.priority || "High");
    setJobType(jd.job_type || "Full Time");
    setWorkMode(jd.mode_of_work || "Onsite");
    setSalary(jd.salary_range || "");
    setSalaryUnit(jd.salary_unit || "INR / Per Annum");
    setClosingDate(jd.closing_date ? jd.closing_date.split("T")[0] : "");
    setSkillMode(jd.mode || "normal");
    setNormalSkills(jd.normal_skills?.[0] ? jd.normal_skills[0].split(",") : []);
    setPrimarySkills(jd.primaryskills?.[0] ? jd.primaryskills[0].split(",") : []);
    setMandatorySkills(jd.mandatoryskills?.[0] ? jd.mandatoryskills[0].split(",") : []);
    setSecondarySkills(jd.secondaryskills?.[0] ? jd.secondaryskills[0].split(",") : []);
    setEdcTools(jd.edc?.[0] ? jd.edc[0].split(",") : []);
    setTherapeutic(jd.therapeutic_area?.[0] ? jd.therapeutic_area[0].split(",").filter(Boolean) : []);

    // ✅ creator is template.created_by (root level), NOT inside job_details
    const selectedCreator = approvers.find(a => a.employee_id === template.created_by);
    setCreator(selectedCreator || null);

    const selectedApprover = approvers.find(a => a.employee_id === jd.job_approver);
    setApprover(selectedApprover || null);

    setTaTeam(jd.recruiter || []);
    setTemplateDialogOpen(false);
     setShowTemplatePrompt(false);

  // move template card under sidebar
  setMinimizeTemplatePrompt(true);
  };  

  const handleDeleteTemplate = async (templateId) => {
    console.log("templateId =", templateId);
  console.log("type =", typeof templateId);
  try {
    await deleteTemplate({
      templateId,
      organisationId:orgId,
    }).unwrap();

    setDeletedTemplateIds((prev) => [...prev, templateId]);

    // optional success toast
    // toast.success("Template deleted successfully");
  } catch (error) {
    console.error("Delete template failed", error);

    // optional error toast
    // toast.error("Failed to delete template");
  }
};

  // ─────────────────────────────────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────────────────────────────────

  // Effect 1: Clean up location state immediately on mount (edit mode only).
  // Runs once. Strips editMode/requisitionData from URL state so a page
  // refresh doesn't re-trigger edit mode. The refs already hold the data.
  useEffect(() => {
    if (!editModeRef.current) return;
    navigate(location.pathname, {
      replace: true,
      state: { orgId },
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect 2: Hydrate all scalar fields from editData on mount (edit mode only).
  useEffect(() => {
    if (!editModeRef.current || !editDataRef.current) return;
    const ed = editDataRef.current;

    setSelectedDomain(ed.selectedDomain);
    setSelectedFunction(ed.selectedFunction);
    setSelectedSubFunction(ed.selectedSubFunction);
    setSubFunctionKey(ed.subFunctionKey);
    setSkillMode(ed.skillMode);
    setDesignation(ed.designation);
    setExperience(ed.experience);
    setAvailability(ed.availability);
    setCountry(ed.country);
    setCity(ed.city);
    setPositionsCount(ed.positionsCount);
    setPriority(ed.priority);
    setJobType(ed.jobType);
    setWorkMode(ed.workMode);
    setSalaryUnit(ed.salaryUnit);
    setSalary(ed.salary);
    setClosingDate(ed.closingDate);
    setTaTeam(ed.taTeam || []);
    setInstructions(ed.instructions);
    setNormalSkills(ed.normalSkills || []);
    setPrimarySkills(ed.primarySkills || []);
    setMandatorySkills(ed.mandatorySkills || []);
    setSecondarySkills(ed.secondarySkills || []);
    setCpMandatory(ed.cpMandatory || []);
    setCpSecondary(ed.cpSecondary || []);
    setEdcTools(ed.edcTools || []);
    setTherapeutic(ed.therapeutic || []);
    setDomainSkills(ed.domainSkills || []);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect 3: Resolve creator/approver once the approvers list arrives.
  // Depends on approvers so it retries until the API responds.
  useEffect(() => {
    if (!editModeRef.current || !editDataRef.current) return;
    if (approvers.length === 0) return;
    const ed = editDataRef.current;

    const selectedCreator = approvers.find(a => a.employee_id === ed.creatorId);
    const selectedApprover = approvers.find(a => a.employee_id === ed.approverId);
    setCreator(selectedCreator || null);
    setApprover(selectedApprover || null);
  }, [approvers]);

  // Effect 4: Auto-select subfunction for NON-edit mode only.
  // editModeRef.current is always the original value — safe to check here.
  useEffect(() => {
    if (editModeRef.current) return;
    if (!selectedFunction || !subFunctionsData.length) return;

    if (selectedFunction === "biostatistics") {
      const opt = subFunctionsData.find(s => s.key === "statistical programmer");
      if (opt) {
        setSelectedSubFunction(opt.lable);
        setSubFunctionKey(opt.sub_function);
        setDesignation(generateTitle(opt.lable));
      }
    }

    if (selectedFunction === "clinical data management") {
      const opt = subFunctionsData.find(s => s.key === "clinical data manager");
      if (opt) {
        setSelectedSubFunction(opt.lable);
        setSubFunctionKey(opt.sub_function);
        setDesignation(generateTitle(opt.lable));
      }
    }
  }, [selectedFunction, subFunctionsData]);

  // Effect 5: Sync subFunctionKey when subFunctionsData loads — NON-edit mode only.
  useEffect(() => {
    if (editModeRef.current) return;
    if (!selectedFunction || !selectedSubFunction) return;

    const match = subFunctionsData.find(s => s.lable === selectedSubFunction);
    if (match) setSubFunctionKey(match.sub_function);
  }, [subFunctionsData, selectedSubFunction]);

  // Effect 6: Show template prompt when templates arrive.
  useEffect(() => {
    if (allTemplates.length > 0) setShowTemplatePrompt(true);
  }, [allTemplates]);

  // ── Section status ──
  const sectionStatus = {
    roleSetup: !!(selectedDomain && positionsCount && (!isClinical || (selectedFunction && selectedSubFunction))),
    jobInfo: !!(designation.trim() && experience.min !== "" && experience.max && availability && country),
    skills: isClinical
      ? (skillMode === "normal" ? normalSkills.length > 0 : (isCPSub ? cpMandatory.length > 0 : mandatorySkills.length > 0))
      : (isNonClinical ? domainSkills.length > 0 : false),
    additionalInfo: !!(jobType && workMode && priority && closingDate),
    team: !!(approver && creator),
    jobDescription: true,
  };

  const SECTIONS = [
    { id: "roleSetup", label: "Role Setup" },
    { id: "jobInfo", label: "Job Info & Experience" },
    { id: "skills", label: "Skills" },
    { id: "additionalInfo", label: "Additional Info" },
    { id: "team", label: "Team" },
    { id: "jobDescription", label: "Job Description" },
  ];

  const skillSetters = {
    normalSkills: setNormalSkills, primarySkills: setPrimarySkills,
    mandatorySkills: setMandatorySkills, secondarySkills: setSecondarySkills,
    cpMandatory: setCpMandatory, cpSecondary: setCpSecondary,
    edcTools: setEdcTools, therapeutic: setTherapeutic, domainSkills: setDomainSkills,
  };
  const skillSelections = {
    normalSkills, primarySkills, mandatorySkills, secondarySkills,
    cpMandatory, cpSecondary, edcTools, therapeutic, domainSkills,
  };

  // ── Step 2: Summary Page ──
  if (activeStep === 2) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        padding: 14,
        background: "#fff",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 240,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <Sidebar
          sections={SECTIONS}
          sectionStatus={sectionStatus}
          activeSection={activeSection}
          onSectionClick={scrollTo}
        />
{/* 
        {minimizeTemplatePrompt && (
          <div
            onClick={() => {
              setShowTemplatePrompt(true);
              setMinimizeTemplatePrompt(false);
            }}
            style={{
              background:
                "linear-gradient(135deg,#E8532A 0%,#F06830 100%)",
              borderRadius: 12,
              padding: 12,
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <div style={{ fontWeight: 700 }}>Templates</div>
            <div style={{ fontSize: 12 }}>
              Click to load saved templates
            </div>
          </div>
        )} */}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1 }}>
        <StepperHeader activeStep={activeStep} />

        <SummaryPage
          summary={summaryData}
          jobDetailsId={jobDetailsId}
          setActiveStep={setActiveStep}
          orgEmpId={creator?.employee_id}
          formData={requisitionData}
          orgId={orgId}
          isEditMode={isEditMode}
          setIsEditAfterSummary={setIsEditAfterSummary}
          SECTIONS={SECTIONS}
        />
      </div>
    </div>
  );
}

  return (
    <div style={{
      display: "flex", gap: 14, padding: 14,
      height: "calc(100vh - 70px)", background: "#fff", boxSizing: "border-box",
    }}>
      {/* ── SIDEBAR ── */}
      <div style={{ width: 240, display: "flex", flexDirection: "column", gap: 12 }}>
        <Sidebar
          sections={SECTIONS} sectionStatus={sectionStatus}
          activeSection={activeSection} onSectionClick={scrollTo}
        />
        {minimizeTemplatePrompt && (
          <div onClick={() => { setShowTemplatePrompt(true); setMinimizeTemplatePrompt(false); }}
            style={{
              background: "linear-gradient(135deg,#E8532A 0%,#F06830 100%)",
              borderRadius: 12, padding: 12, color: "#fff", cursor: "pointer",
            }}>
            <div style={{ fontWeight: 700 }}>Templates</div>
            <div style={{ fontSize: 12 }}>Click to load saved templates</div>
          </div>
        )}
      </div>

      {/* ── MAIN SCROLL AREA ── */}
      <div style={{ flex: 1, overflowY: "auto", maxHeight: "100vh", paddingRight: 2 }}>
        <StepperHeader activeStep={activeStep} />

        {showTemplatePrompt && (
          <TemplatToastBanner
            onLoadNow={() => setTemplateDialogOpen(true)}
            onDismiss={() => { setShowTemplatePrompt(false); setMinimizeTemplatePrompt(true); }}
          />
        )}

        {/* ── ROLE SETUP ── */}
        <div id="roleSetup" style={{ marginBottom: 12 }}>
          <SectionCard>
            <SectionHeader title="Role setup" />

            <FieldRow style={errors.domain ? { borderColor: C.danger } : {}}>
              <FieldLabel error={errors.domain}>Select domain *</FieldLabel>
              <FormControl fullWidth size="small">
                <Select value={selectedDomain} onChange={e => handleDomainChange(e.target.value)}
                  displayEmpty sx={muiSelectSx}
                  renderValue={s => s
                    ? DOMAINS.find(d => d.value === s)?.label
                    : <span style={{ color: C.textHint }}>Select Domain</span>
                  }>
                  {DOMAINS.map(d => <MenuItem key={d.value} value={d.value} sx={muiMenuItemSx}>{d.label}</MenuItem>)}
                </Select>
              </FormControl>
              <ErrorText msg={errors.domain} />
            </FieldRow>

            {isClinical && (
              <FieldRow style={errors.function ? { borderColor: C.danger } : {}}>
                <FieldLabel error={errors.function}>Select Function *</FieldLabel>
                <FormControl fullWidth size="small">
                  <Select value={selectedFunction} onChange={e => handleFunctionChange(e.target.value)}
                    displayEmpty sx={muiSelectSx}
                    renderValue={s => s
                      ? FUNCTIONS.find(f => f.key === s)?.label
                      : <span style={{ color: C.textHint }}>Select Function</span>
                    }>
                    {FUNCTIONS.map(f => <MenuItem key={f.key} value={f.key} sx={muiMenuItemSx}>{f.label}</MenuItem>)}
                  </Select>
                </FormControl>
                <ErrorText msg={errors.function} />
              </FieldRow>
            )}

            <FieldRow>
              <FieldLabel error={errors.positionsCount}>Select no of positions *</FieldLabel>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                {POSITIONS.map(p => (
                  <ToggleChip key={p} label={p} selected={positionsCount === p}
                    onClick={() => { setPositionsCount(p); setErrors(e => ({ ...e, positionsCount: "" })); }} />
                ))}
              </div>
              <ErrorText msg={errors.positionsCount} />
            </FieldRow>

            {isClinical && (
              <FieldRow style={errors.subFunction ? { borderColor: C.danger } : {}}>
                <FieldLabel error={errors.subFunction}>Select Sub Function *</FieldLabel>
                <FormControl fullWidth size="small">
                  <Select value={selectedSubFunction} onChange={e => handleSubFunctionChange(e.target.value)}
                    disabled={!selectedFunction} displayEmpty
                    sx={{ ...muiSelectSx, "&.Mui-disabled": { bgcolor: "#F3F4F6" } }}
                    renderValue={s => s
                      ? <span style={{ color: C.text, fontFamily: PRIMARY.fontFamily, fontSize: PRIMARY.label.fontSize }}>
                        {subFunctionOptions.find(o => o.value === s)?.label}
                      </span>
                      : <span style={{ color: C.textHint, fontFamily: PRIMARY.fontFamily, fontSize: PRIMARY.label.fontSize }}>
                        Select Sub Function
                      </span>
                    }>
                    {subFunctionOptions.map(o => (
                      <MenuItem key={o.value} value={o.value} disabled={o.disabled} sx={muiMenuItemSx}>{o.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <ErrorText msg={errors.subFunction} />
              </FieldRow>
            )}
          </SectionCard>
        </div>

        {/* ── JOB INFO ── */}
        <div id="jobInfo" style={{ marginBottom: 12 }}>
          <SectionCard>
            <SectionHeader title="Job info & experience" />

            <FieldRow style={errors.designation ? { borderColor: C.danger } : {}}>
              <FieldLabel error={errors.designation}>Job title *</FieldLabel>
              <input value={designation}
                onChange={e => { setDesignation(e.target.value); setErrors(v => ({ ...v, designation: "" })); }}
                placeholder="e.g. Senior Statistical Programmer"
                style={{ ...flatSelectStyle, cursor: "text" }} />
              <ErrorText msg={errors.designation} />
            </FieldRow>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <FieldRow style={errors.min ? { borderColor: C.danger } : {}}>
                <FieldLabel error={errors.min}>Min experience (yrs) *</FieldLabel>
                <input type="number" min={0} value={experience.min}
                  onChange={e => { setExperience(v => ({ ...v, min: e.target.value })); setErrors(v => ({ ...v, min: "" })); }}
                  placeholder="0" style={{ ...flatSelectStyle, cursor: "text" }} />
                <ErrorText msg={errors.min} />
              </FieldRow>
              <FieldRow style={errors.max ? { borderColor: C.danger } : {}}>
                <FieldLabel error={errors.max}>Max experience (yrs) *</FieldLabel>
                <input type="number" min={0} value={experience.max}
                  onChange={e => { setExperience(v => ({ ...v, max: e.target.value })); setErrors(v => ({ ...v, max: "" })); }}
                  placeholder="10" style={{ ...flatSelectStyle, cursor: "text" }} />
                <ErrorText msg={errors.max} />
              </FieldRow>
            </div>

            <FieldRow style={errors.availability ? { borderColor: C.danger } : {}}>
              <FieldLabel error={errors.availability}>Availability *</FieldLabel>
              <FormControl fullWidth size="small">
                <Select value={availability}
                  onChange={e => { setAvailability(e.target.value); setErrors(v => ({ ...v, availability: "" })); }}
                  displayEmpty sx={muiSelectSx}
                  renderValue={s => s
                    ? <span style={{ color: C.text, fontFamily: PRIMARY.fontFamily, fontSize: PRIMARY.label.fontSize }}>
                      {AVAILABILITY.find(a => a.value === s)?.label}
                    </span>
                    : <span style={{ color: C.textHint, fontFamily: PRIMARY.fontFamily, fontSize: PRIMARY.label.fontSize }}>
                      Select Availability
                    </span>
                  }>
                  {AVAILABILITY.map(a => <MenuItem key={a.value} value={a.value} sx={muiMenuItemSx}>{a.label}</MenuItem>)}
                </Select>
              </FormControl>
              <ErrorText msg={errors.availability} />
            </FieldRow>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <FieldRow style={errors.country ? { borderColor: C.danger } : {}}>
                <FieldLabel error={errors.country}>Country *</FieldLabel>
                <FormControl fullWidth size="small">
                  <Select value={country}
                    onChange={e => { setCountry(e.target.value); setCity(""); setErrors(v => ({ ...v, country: "" })); }}
                    displayEmpty sx={muiSelectSx}
                    renderValue={s => s
                      ? <span style={{ color: C.text, fontFamily: PRIMARY.fontFamily, fontSize: PRIMARY.label.fontSize }}>{s}</span>
                      : <span style={{ color: C.textHint, fontFamily: PRIMARY.fontFamily, fontSize: PRIMARY.label.fontSize }}>Select Country</span>
                    }>
                    {countries.map(c => <MenuItem key={c} value={c} sx={muiMenuItemSx}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
                <ErrorText msg={errors.country} />
              </FieldRow>
              <FieldRow>
                <FieldLabel>City</FieldLabel>
                <FormControl fullWidth size="small">
                  <Autocomplete
                    options={cities} value={city}
                    onChange={(_, value) => setCity(value || "")}
                    disabled={!country} fullWidth size="small"
                    sx={{
                      "& .MuiInputBase-input": { fontFamily: PRIMARY.fontFamily, fontSize: PRIMARY.label.fontSize },
                      "& .MuiOutlinedInput-root": { fontFamily: PRIMARY.fontFamily, fontSize: PRIMARY.label.fontSize },
                    }}
                    renderInput={(params) => (
                      <TextField {...params} placeholder="Select City"
                        sx={{ "& .MuiOutlinedInput-root": { ...muiSelectSx } }} />
                    )}
                    slotProps={{
                      paper: {
                        sx: {
                          mt: "4px", borderRadius: "8px",
                          "& .MuiAutocomplete-option": {
                            fontFamily: PRIMARY.fontFamily, fontSize: PRIMARY.label.fontSize,
                            minHeight: "unset", padding: "8px 14px",
                          },
                          "& .MuiAutocomplete-option.Mui-focused": { backgroundColor: "#F5F7FF" },
                          "& .MuiAutocomplete-option[aria-selected='true']": { backgroundColor: "#EEF2FF" },
                        },
                      },
                    }}
                  />
                </FormControl>
              </FieldRow>
            </div>
          </SectionCard>
        </div>

        {/* ── SKILLS ── */}
        <div id="skills" style={{ marginBottom: 12 }}>
          {isClinical && subFunctionKey && (
            <ClinicalSkillsPanel
              skillMode={skillMode} onModeChange={handleSkillModeChange}
              subFunctionKey={subFunctionKey} selectedSubFunction={selectedSubFunction}
              isClinicalDataManagement={isCDM} isClinicalDataManagerSub={isCDMSub}
              isClinicalProgrammerSub={isCPSub}
              selections={skillSelections} setters={skillSetters} errors={errors}
            />
          )}
          {isClinical && !subFunctionKey && (
            <SectionCard>
              <SectionHeader title="Skills" />
              <p style={{ color: C.textHint, fontSize: 13 }}>Select a sub function to load skills.</p>
            </SectionCard>
          )}
          {isNonClinical && (
            <NonClinicalSkillsPanel
              domain={selectedDomain} selections={skillSelections}
              setters={skillSetters} errors={errors}
            />
          )}
          {!selectedDomain && (
            <SectionCard>
              <SectionHeader title="Skills" />
              <p style={{ color: C.textHint, fontSize: 13 }}>Select a domain to load skills.</p>
            </SectionCard>
          )}
        </div>

        {/* ── ADDITIONAL INFO ── */}
        <div id="additionalInfo" style={{ marginBottom: 12 }}>
          <SectionCard>
            <SectionHeader title="Additional info" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <FieldRow>
                <FieldLabel>Job type *</FieldLabel>
                <FormControl fullWidth size="small">
                  <Select value={jobType} onChange={e => setJobType(e.target.value)} displayEmpty sx={muiSelectSx}
                    renderValue={s => s
                      ? <span style={{ color: C.text, fontFamily: PRIMARY.fontFamily, fontSize: PRIMARY.label.fontSize }}>{s}</span>
                      : <span style={{ color: C.textHint, fontFamily: PRIMARY.fontFamily, fontSize: PRIMARY.label.fontSize }}>Select Job Type</span>
                    }>
                    {JOB_TYPES.map(t => <MenuItem key={t} value={t} sx={muiMenuItemSx}>{t}</MenuItem>)}
                  </Select>
                </FormControl>
              </FieldRow>

              <FieldRow>
                <FieldLabel>Work mode *</FieldLabel>
                <FormControl fullWidth size="small">
                  <Select value={workMode} onChange={e => setWorkMode(e.target.value)} displayEmpty sx={muiSelectSx}
                    renderValue={s => s
                      ? <span style={{ color: C.text, fontFamily: PRIMARY.fontFamily, fontSize: PRIMARY.label.fontSize }}>{s}</span>
                      : <span style={{ color: C.textHint, fontFamily: PRIMARY.fontFamily, fontSize: PRIMARY.label.fontSize }}>Select Work Mode</span>
                    }>
                    {WORK_MODES.map(m => <MenuItem key={m} value={m} sx={muiMenuItemSx}>{m}</MenuItem>)}
                  </Select>
                </FormControl>
              </FieldRow>

              <FieldRow>
                <FieldLabel>Priority *</FieldLabel>
                <FormControl fullWidth size="small">
                  <Select value={priority} onChange={e => setPriority(e.target.value)} displayEmpty sx={muiSelectSx}
                    renderValue={s => s
                      ? <span style={{ color: C.text, fontFamily: PRIMARY.fontFamily, fontSize: PRIMARY.label.fontSize }}>{s}</span>
                      : <span style={{ color: C.textHint, fontFamily: PRIMARY.fontFamily, fontSize: PRIMARY.label.fontSize }}>Select Priority</span>
                    }>
                    {PRIORITIES.map(p => <MenuItem key={p} value={p} sx={muiMenuItemSx}>{p}</MenuItem>)}
                  </Select>
                </FormControl>
              </FieldRow>

              <FieldRow style={errors.closingDate ? { borderColor: C.danger } : {}}>
                <FieldLabel error={errors.closingDate}>Closing date *</FieldLabel>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={closingDate ? dayjs(closingDate) : null}
                    minDate={dayjs()}
                    onChange={(v) => {
                      setClosingDate(v ? v.format("YYYY-MM-DD") : "");
                      setErrors(e => ({ ...e, closingDate: "" }));
                    }}
                    slotProps={{
                      textField: {
                        size: "small", fullWidth: true,
                        sx: { "& .MuiInputBase-input": { fontSize: PRIMARY.label.fontSize, fontFamily: PRIMARY.fontFamily } },
                      },
                    }}
                  />
                </LocalizationProvider>
                <ErrorText msg={errors.closingDate} />
              </FieldRow>

              <FieldRow>
                <FieldLabel>Salary unit</FieldLabel>
                <FormControl fullWidth size="small">
                  <Select value={salaryUnit} onChange={e => setSalaryUnit(e.target.value)}
                    disabled={country?.toLowerCase() === "india"} displayEmpty
                    sx={{ ...muiSelectSx, "&.Mui-disabled": { bgcolor: "#F8FAFC" } }}
                    renderValue={s => s
                      ? <span style={{ color: C.text, fontFamily: PRIMARY.fontFamily, fontSize: PRIMARY.label.fontSize }}>{s}</span>
                      : <span style={{ color: C.textHint, fontFamily: PRIMARY.fontFamily, fontSize: PRIMARY.label.fontSize }}>Select Salary Unit</span>
                    }>
                    {country?.toLowerCase() === "india"
                      ? <MenuItem value="INR / Per Annum" sx={muiMenuItemSx}>INR / Per Annum</MenuItem>
                      : ["USD / Per Hour", "USD / Per Month", "USD / Per Annum"].map(u => (
                        <MenuItem key={u} value={u} sx={muiMenuItemSx}>{u}</MenuItem>
                      ))
                    }
                  </Select>
                </FormControl>
              </FieldRow>

              <FieldRow>
                <FieldLabel>Salary</FieldLabel>
                <input value={salary} onChange={e => setSalary(e.target.value)}
                  placeholder={country?.toLowerCase() === "india" ? "₹ e.g. 1200000" : "e.g. 120000"}
                  style={{ ...flatSelectStyle, cursor: "text" }} />
              </FieldRow>
            </div>
          </SectionCard>
        </div>

        {/* ── TEAM ── */}
        <div id="team" style={{ marginBottom: 12 }}>
          <SectionCard>
            <SectionHeader title="Team" />

            <FieldRow style={errors.creator ? { borderColor: C.danger } : {}}>
              <FieldLabel error={errors.creator}>Creator *</FieldLabel>
              <FormControl fullWidth size="small">
                <Select value={creator?.employee_id || ""}
                  onChange={e => setCreator(approvers.find(a => a.employee_id === e.target.value) || null)}
                  displayEmpty sx={muiSelectSx}
                  renderValue={s => s
                    ? <span style={{ color: C.text, fontFamily: PRIMARY.fontFamily, fontSize: PRIMARY.label.fontSize }}>
                      {approvers.find(a => a.employee_id === s)?.full_name}
                    </span>
                    : <span style={{ color: C.textHint, fontFamily: PRIMARY.fontFamily, fontSize: PRIMARY.label.fontSize }}>
                      Select Creator
                    </span>
                  }>
                  {approvers.map(item => (
                    <MenuItem key={item.employee_id} value={item.employee_id} sx={muiMenuItemSx}>
                      {item.full_name} ({item.user_role})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <ErrorText msg={errors.creator} />
            </FieldRow>

            <FieldRow style={errors.approver ? { borderColor: C.danger } : {}}>
              <FieldLabel error={errors.approver}>Approver *</FieldLabel>
              <FormControl fullWidth size="small">
                <Select value={approver?.employee_id || ""}
                  onChange={e => setApprover(approvers.find(a => a.employee_id === e.target.value) || null)}
                  displayEmpty sx={muiSelectSx}
                  renderValue={s => s
                    ? <span style={{ color: C.text, fontFamily: PRIMARY.fontFamily, fontSize: PRIMARY.label.fontSize }}>
                      {approvers.find(a => a.employee_id === s)?.full_name}
                    </span>
                    : <span style={{ color: C.textHint, fontFamily: PRIMARY.fontFamily, fontSize: PRIMARY.label.fontSize }}>
                      Select Approver
                    </span>
                  }>
                  {approvers.map(item => (
                    <MenuItem key={item.employee_id} value={item.employee_id} sx={muiMenuItemSx}>
                      {item.full_name} ({item.user_role})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <ErrorText msg={errors.approver} />
            </FieldRow>

            <FieldRow>
              <FieldLabel>TA team</FieldLabel>
              <GroupedSkillAutocomplete
                options={approvers
                  .filter(h => h.employee_id !== approver?.employee_id)
                  .map(item => ({
                    key: item.employee_id, label: item.full_name,
                    designation: item.designation, group: item.department || "Others",
                  }))}
                value={taTeam}
                onChange={setTaTeam}
                placeholder="Select TA Team"
              />
            </FieldRow>
          </SectionCard>
        </div>

        {/* ── JOB DESCRIPTION ── */}
        <div id="jobDescription" style={{ marginBottom: 12 }}>
          <SectionCard>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>Job description</div>
              <span style={{
                fontSize: 11, padding: "3px 10px", background: C.successLight,
                color: C.success, border: `1px solid ${C.successBorder}`, borderRadius: 20, fontWeight: 600,
              }}>Optional</span>
            </div>

            <FieldRow style={{
              background: instructions ? C.primaryLight : C.surfaceMuted,
              borderColor: instructions ? C.primary : C.border,
            }}>
              <textarea rows={4} value={instructions} onChange={e => setInstructions(e.target.value)}
                placeholder="Describe the role, responsibilities, and requirements..."
                style={{
                  width: "100%", border: "none", outline: "none", background: "transparent",
                  fontSize: 13, resize: "vertical", fontFamily: "inherit",
                  color: C.text, boxSizing: "border-box",
                }} />
              <div style={{
                display: "flex", justifyContent: "flex-end",
                borderTop: `1px solid ${C.border}`, paddingTop: 6, marginTop: 4,
              }}>
                <span style={{ fontSize: 11, color: instructions.length > 2000 ? C.danger : C.textHint }}>
                  {instructions.length}/2000
                </span>
              </div>
            </FieldRow>

            <Box sx={{
              border: "2px dashed #D1D5DB", borderRadius: "24px", backgroundColor: "#FAFAFA",
              minHeight: 200, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": { borderColor: PRIMARY.primary, backgroundColor: "#F8FAFC" },
            }}>
              <input type="file" accept=".pdf,.doc,.docx,.txt,.xlsx"
                hidden id="jd-upload"
                onChange={e => setJdFile(e.target.files?.[0] || null)} />
              <label htmlFor="jd-upload" style={{
                width: "100%", height: "100%", minHeight: 200,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}>
                <Box sx={{
                  width: 64, height: 64, borderRadius: "16px", backgroundColor: "#DDF3F5",
                  display: "flex", alignItems: "center", justifyContent: "center", mb: 2,
                }}>
                  <CloudUploadOutlinedIcon sx={{ fontSize: 32, color: PRIMARY.primary }} />
                </Box>
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#0F172A", mb: 0.5, fontFamily: PRIMARY.fontFamily }}>
                  {jdFile ? jdFile.name : "Upload Job Description"}
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#94A3B8", fontFamily: PRIMARY.fontFamily }}>
                  {jdFile ? `${(jdFile.size / 1024 / 1024).toFixed(2)} MB` : "PDF, DOC, DOCX, TXT, XLSX — max 10MB"}
                </Typography>
                {jdFile && (
                  <button onClick={e => { e.preventDefault(); setJdFile(null); }}
                    style={{
                      marginTop: 8, fontSize: 12, color: C.danger, background: "none",
                      border: "none", cursor: "pointer", textDecoration: "underline",
                    }}>
                    Remove file
                  </button>
                )}
              </label>
            </Box>

            <div style={{
              border: `1.5px ${saveAsTemplate ? "solid" : "dashed"} ${saveAsTemplate ? C.primary : C.border}`,
              borderRadius: 10, padding: 14, marginTop: 12,
              background: saveAsTemplate ? C.primaryLight : C.surfaceMuted,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: saveAsTemplate ? "#DBEAFE" : C.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <i className="ti ti-bookmark" style={{ fontSize: 16, color: saveAsTemplate ? C.primary : C.textHint }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: saveAsTemplate ? C.primary : C.text }}>
                      Save as template
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: C.textHint }}>Reuse this setup for future postings</p>
                  </div>
                </div>
                <div onClick={() => setSaveAsTemplate(v => !v)} style={{
                  width: 40, height: 22, borderRadius: 20,
                  background: saveAsTemplate ? C.primary : C.border,
                  cursor: "pointer", position: "relative", transition: "background 0.2s",
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%", background: "#fff",
                    position: "absolute", top: 3, left: saveAsTemplate ? 20 : 4,
                    transition: "left 0.2s",
                  }} />
                </div>
              </div>

              {saveAsTemplate && (
                <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 0 }}>
                  <FieldRow style={errors.templateName ? { borderColor: C.danger } : {}}>
                    <FieldLabel error={errors.templateName}>Template name *</FieldLabel>
                    <input value={templateName}
                      onChange={e => { setTemplateName(e.target.value); setErrors(v => ({ ...v, templateName: "" })); }}
                      placeholder="e.g. Senior Statistical Programmer – Biostatistics"
                      style={{ ...flatSelectStyle, cursor: "text" }} />
                    <ErrorText msg={errors.templateName} />
                  </FieldRow>

                  <FieldRow style={{
                    background: templateDescription ? C.primaryLight : C.surfaceMuted,
                    borderColor: templateDescription ? C.primary : C.border,
                  }}>
                    <FieldLabel>Template description</FieldLabel>
                    <textarea rows={3} value={templateDescription}
                      onChange={e => setTemplateDescription(e.target.value)}
                      placeholder="Describe what this template is for..."
                      style={{
                        width: "100%", border: "none", outline: "none", background: "transparent",
                        fontSize: 13, resize: "vertical", fontFamily: "inherit",
                        color: C.text, boxSizing: "border-box",
                      }} />
                    <div style={{
                      display: "flex", justifyContent: "flex-end",
                      borderTop: `1px solid ${C.border}`, paddingTop: 6, marginTop: 4,
                    }}>
                      <span style={{ fontSize: 11, color: templateDescription.length > 500 ? C.danger : C.textHint }}>
                        {templateDescription.length}/500
                      </span>
                    </div>
                  </FieldRow>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* ── SUBMIT ERROR ── */}
        {submitError && (
          <div style={{
            marginBottom: 12, padding: "12px 16px", borderRadius: 8,
            background: "#FEF2F2", border: `1px solid #FCA5A5`,
            color: C.danger, fontSize: 13, fontFamily: PRIMARY.fontFamily,
          }}>
            <i className="ti ti-alert-circle" style={{ marginRight: 6 }} />
            {submitError}
          </div>
        )}

        {/* ── ACTIONS ── */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 28 }}>
          {(isEditMode || isEditAfterSummary) && (
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: "10px 26px",
                background: "#fff",
                color: C.text,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isUpdating}
            style={{
              padding: "10px 26px",
              background:
                isSubmitting || isUpdating
                  ? C.primaryHover
                  : C.primary,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 13,
              cursor:
                isSubmitting || isUpdating
                  ? "not-allowed"
                  : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              opacity:
                isSubmitting || isUpdating
                  ? 0.8
                  : 1,
            }}
          >
            {isSubmitting || isUpdating ? (
              <>
                <i
                  className="ti ti-loader-2"
                  style={{
                    fontSize: 14,
                    animation: "spin 1s linear infinite",
                  }}
                />
                {isEditMode || isEditAfterSummary
                  ? "Updating..."
                  : "Submitting..."}
              </>
            ) : (
              <>
                {isEditMode || isEditAfterSummary
                  ? "Update Job"
                  : isNonClinical
                    ? "Submit Job"
                    : "Create Job"}
                <i
                  className="ti ti-arrow-right"
                  style={{ fontSize: 14 }}
                />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── TEMPLATE DIALOG ── */}
      {templateDialogOpen && (
        <TemplateDialog
          templates={localTemplates}
          onClose={() => setTemplateDialogOpen(false)}
          onApply={handleApplyTemplate}
          onDelete={handleDeleteTemplate}
        />
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default function CreateRequisition() {
  return <CreateRequisitionForm />;
}