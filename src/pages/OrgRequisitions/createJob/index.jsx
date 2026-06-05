import React, {
  memo,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Grid,
  IconButton,
  useTheme,
  Autocomplete,
  MenuItem,
  Checkbox,
  InputAdornment,
  Chip,
  Tooltip,
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import StepperComponent from "../../Employer/createJob/stepper";
import UseJobRequirementsStyles from "../../../components/JobRequirements/style";
import api from "../../../api";
import { useLocation, useNavigate } from "react-router-dom";
import { uploadFileToGetQuestions } from "../../../actions/forTalent";
import { AppContext } from "../../../AppContext";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SummaryPage from "../summary/summaryOverview";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useMediaQuery } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { format } from "date-fns";
import { toast } from "react-toastify";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import WorkSharpIcon from "@mui/icons-material/WorkSharp";
import ClassIcon from "@mui/icons-material/Class";
import PeopleSharpIcon from "@mui/icons-material/PeopleSharp";
import DescriptionSharpIcon from "@mui/icons-material/DescriptionSharp";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import TuneIcon from "@mui/icons-material/Tune";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import ComputerIcon from "@mui/icons-material/Computer";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import FactoryIcon from "@mui/icons-material/Factory";
import SchoolIcon from "@mui/icons-material/School";
import { useRef } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
const checkboxBlankIcon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkboxCheckedIcon = <CheckBoxIcon fontSize="small" />;
const SUB_FUNCTION_SHORT_CODES = {
  "Clinical Data Manager": "CDM",
  "Statistical Programmer": "SP",
  "Clinical Programmer/CRF Developer": "CRF",
  "Bio Statistician": "BIO",
};
const generateJobTitle = (subFunction) => {
  const short = SUB_FUNCTION_SHORT_CODES[subFunction] || "";

  const now = new Date();

  //  DDMMYY format
  const date =
    String(now.getDate()).padStart(2, "0") +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getFullYear()).slice(-2);

  //  HHMM format
  const time =
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0");

  return `${short}-${date}${time}`;
};
function useCalendar() {
  const [open, setOpen] = useState(false);
  return {
    open,
    openCalendar: () => setOpen(true),
    closeCalendar: () => setOpen(false),
  };
}

const availability = [
  { value: "0", label: "Immediately Available" },
  { value: "30", label: "Less Than 30 days" },
  { value: "60", label: "Less Than 60 days" },
  { value: "90", label: "Less Than 90 days" },
];
const priorityOptions = [{ name: "High" }, { name: "Medium" }, { name: "Low" }];

const DOMAINS = [
  { value: "clinical", label: "Clinical", iconType: "hospital" },
  { value: "it", label: "IT", iconType: "computer" },
  { value: "non_it", label: "Non-IT", iconType: "business" },
];

const DOMAIN_SKILLS = {
  it: [
    { key: "javascript", label: "JavaScript" },
    { key: "typescript", label: "TypeScript" },
    { key: "react", label: "React.js" },
    { key: "node", label: "Node.js" },
    { key: "python", label: "Python" },
    { key: "java", label: "Java" },
    { key: "dotnet", label: ".NET / C#" },
    { key: "sql", label: "SQL" },
    { key: "aws", label: "AWS" },
    { key: "azure", label: "Azure" },
    { key: "gcp", label: "GCP" },
    { key: "docker", label: "Docker" },
    { key: "kubernetes", label: "Kubernetes" },
    { key: "devops", label: "DevOps" },
    { key: "ci_cd", label: "CI/CD" },
    { key: "machine_learning", label: "Machine Learning" },
    { key: "data_science", label: "Data Science" },
    { key: "cybersecurity", label: "Cybersecurity" },
    { key: "qa_testing", label: "QA & Testing" },
    { key: "mobile_dev", label: "Mobile Development" },
    { key: "ui_ux", label: "UI/UX Design" },
    { key: "agile_scrum", label: "Agile / Scrum" },
    { key: "project_mgmt", label: "Project Management" },
    { key: "blockchain", label: "Blockchain" },
    { key: "other", label: "Other" },
  ],
  non_it: [
    { key: "accounting", label: "Accounting" },
    { key: "finance", label: "Finance" },
    { key: "hr_management", label: "HR Management" },
    { key: "recruitment", label: "Recruitment" },
    { key: "legal", label: "Legal" },
    { key: "compliance", label: "Compliance" },
    { key: "supply_chain", label: "Supply Chain" },
    { key: "logistics", label: "Logistics" },
    { key: "procurement", label: "Procurement" },
    { key: "operations", label: "Operations" },
    { key: "admin", label: "Administration" },
    { key: "customer_service", label: "Customer Service" },
    { key: "communication", label: "Communication" },
    { key: "ms_office", label: "MS Office" },
    { key: "erp", label: "ERP Systems" },
    { key: "data_analysis", label: "Data Analysis" },
    { key: "training", label: "Training & Dev" },
    { key: "other", label: "Other" },
  ],
};

const DomainIcon = ({ iconType, sx }) => {
  const p = { sx: sx || { fontSize: 22 } };
  if (iconType === "computer") return <ComputerIcon {...p} />;
  if (iconType === "business") return <BusinessCenterIcon {...p} />;
  if (iconType === "hospital") return <LocalHospitalIcon {...p} />;
  if (iconType === "trending") return <TrendingUpIcon {...p} />;
  if (iconType === "factory") return <FactoryIcon {...p} />;
  if (iconType === "school") return <SchoolIcon {...p} />;
  return <BusinessCenterIcon {...p} />;
};

const chipSx = {
  bgcolor: "#E3F9FF",
  color: "#00A1A7",
  border: "1px solid #00D0F7",
  fontSize: 12,
  height: 28,
  borderRadius: "16px",
};

const ChipDeleteIcon = ({ onMouseDown, ...props }) => (
  <CloseIcon
    {...props}
    onMouseDown={(e) => {
      e.stopPropagation(); // prevent dropdown from opening
      onMouseDown?.(e); // still let MUI's delete handler fire
    }}
    sx={{ fontSize: "16px", color: "#00A1A7", "&:hover": { color: "#d32f2f" } }}
  />
);

const RequiredLabel = ({ children }) => (
  <>
    {children}
    <span style={{ color: "red" }}>*</span>
  </>
);

const SkillAC = memo(
  ({
    label,
    options,
    selected,
    onChange,
    errorKey,
    required,
    freeSolo = false,
    helperText = "",
    errors = {},
    setErrors,
  }) => {
    const [open, setOpen] = useState(false);

    const value = options
      .filter((s) => selected.includes(s.key))
      .concat(
        freeSolo
          ? selected
              .filter((k) => !options.find((s) => s.key === k))
              .map((k) => ({ key: k, label: k }))
          : [],
      );

    const handleChange = useCallback(
      (_e, newVal) => {
        const keys = newVal.map((item) =>
          typeof item === "string"
            ? item.trim().toLowerCase().replace(/\s+/g, "_")
            : item.key,
        );
        onChange([...new Set(keys)]);
        if (errorKey && setErrors)
          setErrors((prev) => ({ ...prev, [errorKey]: "" }));
      },
      [onChange, errorKey, setErrors],
    );

    return (
      <Autocomplete
        multiple
        size="small"
        open={open}
        onOpen={() => setOpen(true)}
        onClose={(_e, reason) => {
          if (reason === "selectOption") return;
          setOpen(false);
        }}
        sx={{
          "& .MuiInputBase-root": {
            paddingTop: "2px",
            paddingBottom: "2px",
            minHeight: "40px",
            alignItems: "center",
          },
          "& .MuiChip-root": { margin: "2px" },
          "& .MuiAutocomplete-tag": { margin: "2px" },
        }}
        disableCloseOnSelect
        blurOnSelect={false}
        clearOnBlur={false}
        openOnFocus
        fullWidth
        freeSolo={freeSolo}
        options={options}
        value={value}
        onChange={handleChange}
        getOptionLabel={(opt) =>
          typeof opt === "string"
            ? opt
            : opt.label || opt.lable || opt.key || ""
        }
        isOptionEqualToValue={(o, v) => o.key === (v?.key || v)}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => {
            const tagProps = getTagProps({ index });
            return (
              <Chip
                key={option.key || option}
                label={
                  typeof option === "string"
                    ? option
                    : option.label || option.lable || option.key
                }
                size="small"
                {...tagProps}
                deleteIcon={<ChipDeleteIcon onMouseDown={tagProps.onDelete} />}
                sx={chipSx}
              />
            );
          })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label={required ? <RequiredLabel>{label}</RequiredLabel> : label}
            error={!!errors[errorKey]}
            helperText={errors[errorKey] || helperText}
            sx={{ "& .MuiOutlinedInput-root": { padding: "4px 6px" } }}
          />
        )}
        renderOption={(props, option) => (
          <Tooltip
            arrow
            placement="right-start"
            componentsProps={{
              tooltip: {
                sx: {
                  backgroundColor: "#fff",
                  color: "#000",
                  boxShadow: "0px 2px 8px rgba(0,0,0,0.10)",
                  border: "1px solid #c6d7f8",
                },
              },
            }}
            title={
              option.description || option.lable ? (
                <Box sx={{ maxWidth: 300 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontSize: 12, fontWeight: 800, color: "#00A1A7" }}
                  >
                    {option.label || option.lable || option.key}
                  </Typography>
                  {option.description && (
                    <Typography
                      variant="body2"
                      sx={{ fontSize: 10, color: "#000", fontWeight: 500 }}
                    >
                      {option.description}
                    </Typography>
                  )}
                </Box>
              ) : (
                ""
              )
            }
          >
            <li {...props} style={{ fontSize: 12 }}>
              <Checkbox
                size="small"
                checked={selected.includes(option.key)}
                sx={{ padding: "0px 5px" }}
              />
              {option.label || option.lable || option.key}
            </li>
          </Tooltip>
        )}
      />
    );
  },
);

const ClinicalSkillsPanel = memo(
  ({
    skillMode,
    onSkillModeChange,
    normalSkills,
    selectedNormalSkills,
    onNormalSkillsChange,
    primarySkills,
    selectedPrimarySkills,
    onPrimarySkillsChange,
    mandatorySkills,
    selectedMandatorySkills,
    onMandatorySkillsChange,
    secondarySkills,
    selectedSecondarySkills,
    onSecondarySkillsChange,
    clinicalProgrammerMandatorySkills,
    selectedCPMSkills,
    onCPMChange,
    clinicalProgrammerSecondarySkills,
    selectedCPSSkills,
    onCPSChange,
    sortedEdcTools,
    selectedEdcTools,
    onEdcChange,
    therapeuticAreas,
    selectedTherapeuticExperience,
    onTherapeuticChange,
    isClinicalDataManagement,
    isClinicalDataManagerSub,
    isClinicalProgrammerSub,
    selectedSubFunction,
    errors,
    setErrors,
    mandatoryOpen,
    setMandatoryOpen,
    edcOpen,
    setEdcOpen,
    therapeuticOpen,
    setTherapeuticOpen,
  }) => (
    <Box
      sx={{
        bgcolor: "#fff",
        p: 3,
        borderRadius: "24px",
        border: "1px solid #E5E7EB",
      }}
    >
      {/* Header with toggle */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            fontWeight: 600,
          }}
        >
          <WorkSharpIcon sx={{ color: "#00A1A7" }} />
          Skills
        </Typography>
        <ToggleButtonGroup
          value={skillMode}
          exclusive
          onChange={onSkillModeChange}
          size="small"
          sx={{
            "& .MuiToggleButton-root": {
              px: 2,
              py: 0.75,
              fontSize: 12,
              fontWeight: 600,
              textTransform: "none",
              border: "1px solid #E5E7EB",
              color: "text.secondary",
              "&.Mui-selected": {
                color: "#fff",
                backgroundColor: "#00A1A7",
                borderColor: "#00A1A7",
                "&:hover": { backgroundColor: "#008b91" },
              },
              "&:hover": { backgroundColor: "#f0fffe", borderColor: "#00A1A7" },
            },
          }}
        >
          <ToggleButton value="normal">
            <FlashOnIcon sx={{ fontSize: 14, mr: 0.5 }} />
            Standard
          </ToggleButton>
          <ToggleButton value="advanced">
            <TuneIcon sx={{ fontSize: 14, mr: 0.5 }} />
            Advanced
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {skillMode === "normal" ? (
        /* ── Normal mode ── */
        <Grid container direction="column" spacing={2}>
          <Grid item size={{ xs: 12 }}>
            <SkillAC
              label="Skills"
              options={normalSkills}
              selected={selectedNormalSkills}
              onChange={onNormalSkillsChange}
              errorKey="normalSkills"
              required
              freeSolo
              helperText="Type and press Enter to add skills not in the list"
              errors={errors}
              setErrors={setErrors}
            />
          </Grid>
        </Grid>
      ) : (
        /* ── Advanced mode ── */
        <Grid container direction="column" spacing={2}>
          {/* Primary Skills — hidden for CDM */}
          {!isClinicalDataManagement && (
            <Grid item size={{ xs: 12 }}>
              <SkillAC
                label="Primary Skills"
                options={primarySkills.map((s) => ({
                  ...s,
                  label: s.lable || s.label,
                }))}
                selected={selectedPrimarySkills}
                onChange={onPrimarySkillsChange}
                errorKey="primarySkills"
                required
                freeSolo
                errors={errors}
                setErrors={setErrors}
              />
            </Grid>
          )}

          {/* Mandatory Skills */}
          <Grid item size={{ xs: 12 }}>
            {selectedSubFunction === "Clinical Programmer/CRF Developer" ? (
              <SkillAC
                label="Mandatory Skills"
                options={clinicalProgrammerMandatorySkills.map((s) => ({
                  ...s,
                  label: s.label || s.lable,
                }))}
                selected={selectedCPMSkills}
                onChange={onCPMChange}
                errorKey="mandatorySkills"
                required
                errors={errors}
                setErrors={setErrors}
              />
            ) : (
              <Autocomplete
                multiple
                size="small"
                open={mandatoryOpen}
                onOpen={() => setMandatoryOpen(true)}
                onClose={(_e, reason) => {
                  if (reason === "selectOption") return;
                  setMandatoryOpen(false);
                }}
                disableCloseOnSelect
                blurOnSelect={false}
                clearOnBlur={false}
                openOnFocus
                options={mandatorySkills}
                groupBy={
                  isClinicalDataManagerSub
                    ? (opt) => opt.primary_selected
                    : undefined
                }
                value={mandatorySkills.filter((m) =>
                  selectedMandatorySkills.includes(m.key),
                )}
                onChange={(_e, newVal) =>
                  onMandatorySkillsChange(newVal.map((v) => v.key))
                }
                getOptionLabel={(opt) => opt.label || opt.lable || ""}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={option.key}
                      label={option.label || option.lable}
                      size="small"
                      {...getTagProps({ index })}
                      deleteIcon={
                        <CloseIcon
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            getTagProps({ index }).onDelete?.(e);
                          }}
                          sx={{ fontSize: 16, color: "#00A1A7" }}
                        />
                      }
                      sx={chipSx}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={<RequiredLabel>Mandatory Skills</RequiredLabel>}
                    error={!!errors.mandatorySkills}
                    helperText={errors.mandatorySkills}
                  />
                )}
                renderGroup={
                  isClinicalDataManagerSub
                    ? (params) => {
                        const groupKeys = mandatorySkills
                          .filter((x) => x.primary_selected === params.group)
                          .map((x) => x.key);
                        const allSelected = groupKeys.every((k) =>
                          selectedMandatorySkills.includes(k),
                        );
                        return (
                          <li key={params.key}>
                            <Box
                              sx={{
                                bgcolor: "#eef2ff",
                                px: 1.5,
                                py: 0.5,
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Checkbox
                                size="small"
                                checked={allSelected}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMandatorySkillsChange(
                                    allSelected
                                      ? selectedMandatorySkills.filter(
                                          (k) => !groupKeys.includes(k),
                                        )
                                      : Array.from(
                                          new Set([
                                            ...selectedMandatorySkills,
                                            ...groupKeys,
                                          ]),
                                        ),
                                  );
                                }}
                              />
                              {params.group}
                            </Box>
                            <ul style={{ paddingLeft: 16 }}>
                              {params.children}
                            </ul>
                          </li>
                        );
                      }
                    : undefined
                }
                renderOption={(props, option) => (
                  <Tooltip
                    arrow
                    placement="right-start"
                    componentsProps={{
                      tooltip: {
                        sx: {
                          backgroundColor: "#fff",
                          color: "#000",
                          boxShadow: "0px 2px 8px rgba(0,0,0,0.10)",
                          border: "1px solid #c6d7f8",
                        },
                      },
                    }}
                    title={
                      <Box sx={{ maxWidth: 300 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: "#00A1A7",
                          }}
                        >
                          {option.label || option.lable}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontSize: 10, color: "#000", fontWeight: 500 }}
                        >
                          {option.description || "No description available"}
                        </Typography>
                      </Box>
                    }
                  >
                    <li {...props} style={{ fontSize: 12 }}>
                      <Checkbox
                        size="small"
                        checked={selectedMandatorySkills.includes(option.key)}
                        sx={{ padding: "0px 5px" }}
                      />
                      {option.label || option.lable}
                    </li>
                  </Tooltip>
                )}
              />
            )}
          </Grid>

          {/* Secondary Skills */}
          <Grid item size={{ xs: 12 }}>
            {selectedSubFunction === "Clinical Programmer/CRF Developer" ? (
              <SkillAC
                label="Secondary Skills"
                size="small"
                options={clinicalProgrammerSecondarySkills
                  .filter((s) => !selectedCPMSkills.includes(s.key))
                  .map((s) => ({ ...s, label: s.label || s.lable }))}
                selected={selectedCPSSkills}
                onChange={onCPSChange}
                errors={errors}
                setErrors={setErrors}
              />
            ) : (
              <SkillAC
                label="Secondary Skills"
                size="small"
                options={secondarySkills
                  .filter((s) => !selectedMandatorySkills.includes(s.key))
                  .map((s) => ({ ...s, label: s.label || s.lable }))}
                selected={selectedSecondarySkills}
                onChange={onSecondarySkillsChange}
                errors={errors}
                setErrors={setErrors}
              />
            )}
          </Grid>

          {/* EDC Tools */}
          {(isClinicalDataManagerSub || isClinicalProgrammerSub) && (
            <Grid item size={{ xs: 12 }}>
              <Autocomplete
                multiple
                size="small"
                fullWidth
                open={edcOpen}
                onOpen={() => setEdcOpen(true)}
                onClose={(_e, reason) => {
                  if (reason === "selectOption") return;
                  setEdcOpen(false);
                }}
                disableCloseOnSelect
                blurOnSelect={false}
                clearOnBlur={false}
                openOnFocus
                options={sortedEdcTools}
                isOptionEqualToValue={(o, v) => o.key === v.key}
                value={sortedEdcTools.filter((t) =>
                  selectedEdcTools.includes(t.key),
                )}
                onChange={(_e, nv) => onEdcChange(nv.map((v) => v.key))}
                getOptionLabel={(o) => o.lable}
                renderOption={(props, option) => (
                  <li {...props} style={{ fontSize: 12 }}>
                    <Checkbox
                      size="small"
                      checked={selectedEdcTools.includes(option.key)}
                      sx={{ padding: "0px 5px" }}
                    />
                    {option.lable}
                  </li>
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={option.key}
                      label={option.lable}
                      size="small"
                      {...getTagProps({ index })}
                      sx={{ ...chipSx, fontWeight: 500 }}
                      deleteIcon={
                        <CloseIcon
                          onMouseDown={(e) => e.stopPropagation()}
                          sx={{ fontSize: 16, color: "#00A1A7" }}
                        />
                      }
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={<RequiredLabel>EDC Tools</RequiredLabel>}
                    error={!!errors.edcTools}
                    helperText={errors.edcTools}
                  />
                )}
              />
            </Grid>
          )}

          {/* Therapeutic Areas */}
          {isClinicalDataManagement && (
            <Grid item size={{ xs: 12 }}>
              <Autocomplete
                multiple
                size="small"
                fullWidth
                open={therapeuticOpen}
                onOpen={() => setTherapeuticOpen(true)}
                onClose={(_e, reason) => {
                  if (reason === "selectOption") return;
                  setTherapeuticOpen(false);
                }}
                disableCloseOnSelect
                blurOnSelect={false}
                clearOnBlur={false}
                openOnFocus
                options={therapeuticAreas}
                value={therapeuticAreas.filter((a) =>
                  selectedTherapeuticExperience.includes(a.lable),
                )}
                onChange={(_e, nv) =>
                  onTherapeuticChange(nv.map((v) => v.lable))
                }
                getOptionLabel={(o) => o.lable}
                renderOption={(props, option) => (
                  <li {...props} style={{ fontSize: 12 }}>
                    <Checkbox
                      size="small"
                      checked={selectedTherapeuticExperience.includes(
                        option.lable,
                      )}
                      sx={{ padding: "0px 5px" }}
                    />
                    {option.lable}
                  </li>
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={option.id}
                      label={option.lable}
                      size="small"
                      {...getTagProps({ index })}
                      deleteIcon={
                        <CloseIcon
                          onMouseDown={(e) => e.stopPropagation()}
                          sx={{ fontSize: 16, "&:hover": { color: "#d32f2f" } }}
                        />
                      }
                      sx={chipSx}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Preferred Therapeutic Experience"
                    placeholder="Select Therapeutic Areas"
                  />
                )}
              />
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  ),
);
const NonClinicalSkillsPanel = memo(
  ({
    domainSkillOptions,
    selectedDomainSkills,
    onDomainSkillsChange,
    errors,
    setErrors,
  }) => (
    <Box
      sx={{
        bgcolor: "#fff",
        p: { xs: 2, sm: 3 },
        borderRadius: "24px",
        border: "1px solid #E5E7EB",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: 2,
          fontWeight: 600,
        }}
      >
        <WorkSharpIcon sx={{ color: "#00A1A7" }} />
        Skills
      </Typography>

      <Grid container direction="column" spacing={2}>
        <Grid item size={{ xs: 12 }}>
          <SkillAC
            label="Skills"
            options={domainSkillOptions}
            selected={selectedDomainSkills}
            onChange={onDomainSkillsChange}
            errorKey="domainSkills"
            required
            freeSolo
            helperText="Select or type to add custom skills"
            errors={errors}
            setErrors={setErrors}
          />
        </Grid>
      </Grid>
    </Box>
  ),
);
// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const CreateRequisition = memo(() => {
  const [activeStep, setActiveStep] = useState(0);
  const [designation, setDesignation] = useState("");
  const [instructions, setInstructions] = useState("");
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [experience, setExperience] = useState({ min: "", max: "" });
  const [selectedPrimarySkills, setSelectedPrimarySkills] = useState([]);
  const [selectedSecondarySkills, setSelectedSecondarySkills] = useState([]);
  const [selectedMandatorySkills, setSelectedMandatorySkills] = useState([]);
  const [secondarySkills, setSecondarySkills] = useState([]);
  const [mandatorySkills, setMandatorySkills] = useState([]);
  const [
    clinicalProgrammerMandatorySkills,
    setClinicalProgrammerMandatorySkills,
  ] = useState([]);
  const [selectedCPMSkills, setSelectedCPMSkills] = useState([]);
  const [
    clinicalProgrammerSecondarySkills,
    setClinicalProgrammerSecondarySkills,
  ] = useState([]);
  const [selectedCPSSkills, setSelectedCPSSkills] = useState([]);
  const [primarySkills, setPrimarySkills] = useState([]);
  const [selectedAvailability, setSelectedAvailability] = useState({
    value: "30",
    label: "Less Than 30 days",
  });
  const [selectedPositionsCount, setSelectedPositionsCount] = useState("One");
  const [jobDetails, setJobDetails] = useState({});
  const [jobDetailsId, setJobdetailsId] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState("High");
  const [closingDate, setClosingDate] = useState(null);
  const anchorElRef = useRef(null);
  const theme = useTheme();
  const { open, openCalendar, closeCalendar } = useCalendar();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [therapeuticAreas, setTherapeuticAreas] = useState([]);

  const FUNCTIONS = [
    { label: "Bio Statistics", key: "biostatistics" },
    { label: "Clinical Data Management", key: "clinical data management" },
  ];

  const [selectedFunctions, setSelectedFunctions] = useState("");
  const selectedFunctionKey =
    FUNCTIONS.find((f) => f.label === selectedFunctions)?.key || "";

  const [subFunctions, setSubFunctions] = useState([]);
  const [selectedSubFunction, setSelectedSubFunction] = useState("");
  const [subFunctionMap, setSubFunctionMap] = useState({});
  const [subFunctionKey, setSubfunctionKey] = useState("");
  const [disabledSubFunctions, setDisabledSubFunctions] = useState([]);
  const [edcTools, setEdcTools] = useState([]);

  const selectedSubFunctionKey = subFunctionMap[selectedSubFunction] || "";

  const [selectedTherapeuticExperience, setSelectedTherapeuticExperience] =
    useState([]);
  const sortedEdcTools = React.useMemo(() => {
    if (!Array.isArray(edcTools)) return [];
    return [...edcTools].sort((a, b) => {
      if (a.lable.toLowerCase() === "other") return 1;
      if (b.lable.toLowerCase() === "other") return -1;
      return a.lable.localeCompare(b.lable);
    });
  }, [edcTools]);

  const [selectedEdcTools, setSelectedEdcTools] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [skillMode, setSkillMode] = useState("normal");
  const [normalSkills, setNormalSkills] = useState([]);
  const [selectedNormalSkills, setSelectedNormalSkills] = useState([]);
  const [selectedDomainSkills, setSelectedDomainSkills] = useState([]);

  const isClinicalDomain = selectedDomain === "clinical";
  const isNonClinicalDomain =
    selectedDomain !== "" && selectedDomain !== "clinical";
  const domainSkillOptions = DOMAIN_SKILLS[selectedDomain] || [];

  const location = useLocation();
  const templateFromSidebar = location.state?.template;
  const templateAppliedRef = useRef(false);

  // useEffect(() => {
  //   if (templateFromSidebar && !templateAppliedRef.current) {
  //     templateAppliedRef.current = true;
  //     applyTemplate(templateFromSidebar);
  //   }
  // }, [templateFromSidebar]);
  const [hiringManagerList, setHiringManagerList] = useState([]);

  useEffect(() => {
    if (
      templateFromSidebar &&
      hiringManagerList.length > 0 &&
      !templateAppliedRef.current
    ) {
      templateAppliedRef.current = true;
      applyTemplate(templateFromSidebar);
    }
  }, [templateFromSidebar, hiringManagerList]);

  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateNameError, setTemplateNameError] = useState("");
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [startupDialogOpen, setStartupDialogOpen] = useState(false);

  const [openRecruiterDropdown, setOpenRecruiterDropdown] = useState(false);
  const [mandatoryOpen, setMandatoryOpen] = useState(false);
  const [edcOpen, setEdcOpen] = useState(false);
  const [therapeuticOpen, setTherapeuticOpen] = useState(false);

  const { setLoading, formData, setFormData } = useContext(AppContext);
  const classes = UseJobRequirementsStyles();
  const navigate = useNavigate();
  const maxLength = 2000;
  const [errors, setErrors] = useState({});

  const getTodayPlus30Days = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d;
  };

  const isClinicalDataManagement =
    selectedFunctions === "Clinical Data Management";
  const isClinicalDataManagerSub =
    selectedSubFunction === "Clinical Data Manager";
  const isClinicalProgrammerSub =
    selectedSubFunction === "Clinical Programmer/CRF Developer";
  const jobTypes = ["Full Time", "Part Time", "Freelancer"];
  const ModeOfWork = ["Remote", "Hybrid", "Onsite"];

  const [countries, setCountries] = useState([]);
  const [stateAndCityOptions, setStateAndCityOptions] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedStateAndCity, setSelectedStateAndCity] = useState("");
  const [toggleCreateJob, setToggleCreateJob] = useState(false);
  const [localData, setLocalData] = useState({
    jobType: "Full Time",
    salaryRange: null,
    salaryUnit: null,
    country: "India",
    modeOfWork: "Onsite",
    stateAndCity: "",
    selectedManager: null,
    selectedRectuiter: [],
    selectedRecruiterIds: [],
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const isRestoringRef = useRef(false);
  const hasFetchedTemplates = useRef(false);
  const hasFetchedStaticData = useRef(false);
  const hasFetchedMountData = useRef(false);

  const fromMatchedEdit = location.state?.fromMatchedEdit || false || null;
  const matchedJobId = location.state?.job_details_id || null;
  const isFreshCreate = location.state?.fresh === true;
  const [fromSummary, setFromSummary] = useState(false);

  function toggleCreateJobHandler(toggle) {
    setToggleCreateJob(toggle);
  }

  useEffect(() => {
    if (!localData.country) return;
    if (localData.country.toLowerCase() === "india") {
      setLocalData((prev) => ({ ...prev, salaryUnit: "INR / Per Annum" }));
    } else {
      setLocalData((prev) => ({ ...prev, salaryUnit: "" }));
    }
  }, [localData.country]);

  const [recruitersList, setRecruitersList] = useState([]);
  const Approver = JSON.parse(localStorage.getItem("user"));
  const apiResApprover = hiringManagerList.find(
    (val) => val?.name?.toLowerCase() === Approver?.name?.toLowerCase(),
  );

  const handleAutoCompleteChange = (key) => (_e, value) => {
    setLocalData((prev) => ({ ...prev, [key]: value || "" }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleDomainChange = (domainValue) => {
    if (domainValue === selectedDomain) return;
    setSelectedDomain(domainValue);
    setSelectedDomainSkills([]);
    setSelectedNormalSkills([]);
    setSelectedPrimarySkills([]);
    setSelectedMandatorySkills([]);
    setSelectedSecondarySkills([]);
    setSelectedCPMSkills([]);
    setSelectedCPSSkills([]);
    setNormalSkills([]);
    setMandatorySkills([]);
    setSecondarySkills([]);
    setPrimarySkills([]);
    if (domainValue !== "clinical") {
      setSelectedFunctions("");
      setSelectedSubFunction("");
      setSubFunctions([]);
      setSubfunctionKey("");
    }
    setErrors({});
  };

  const handleSkillModeChange = (_e, newMode) => {
    if (!newMode || newMode === skillMode) return;
    setSkillMode(newMode);
    setSelectedNormalSkills([]);
    setSelectedPrimarySkills([]);
    setSelectedMandatorySkills([]);
    setSelectedSecondarySkills([]);
    setSelectedCPMSkills([]);
    setSelectedCPSSkills([]);
    setErrors((prev) => ({
      ...prev,
      normalSkills: "",
      primarySkills: "",
      mandatorySkills: "",
    }));
    if (newMode === "normal" && subFunctionKey)
      fetchNormalSkills(subFunctionKey);
  };

  const fetchNormalSkills = async (key) => {
    if (!key) return;
    console.log("fetchingNormalSkills,,,", key);
    if (key === "clinical programmer/crf developer" && skillMode === "normal") {
      try {
        const res = await api.get(`/raveprogrammer/skills?mode=normal`);
        console.log("clinicalRaveData", res.data.data);
        setNormalSkills(res?.data?.data || []);
      } catch (error) {
        setNormalSkills([]);
      }
    } else if (
      key === "clinical programmer/crf developer" &&
      skillMode === "advanced"
    ) {
      try {
        const res = await api.get(`/raveprogrammer/skills?mode=advanced`);
        console.log("clinicalRaveDataOf Advanced", res.data.data);
        setClinicalProgrammerMandatorySkills(res?.data?.data || []);
      } catch (error) {
        setNormalSkills([]);
      }
    } else {
      try {
        const res = await api.get(
          `/normal_skill/by-sub_function?sub_function=${key}`,
        );
        setNormalSkills(res?.data?.data || []);
      } catch {
        setNormalSkills([]);
      }
    }
  };

  // ── parseToArray: handles ["a,b,c"] array-of-csv format from API ──
  const parseToArray = (value) => {
    if (!value) return [];
    const flat = Array.isArray(value) ? value.join(",") : String(value);
    if (!flat || flat === "string") return [];
    return flat
      .split(",")
      .map((x) => x.trim())
      .filter((x) => x && x !== "string" && x !== "");
  };

  const validateStep0 = () => {
    const errs = {};
    if (!selectedDomain) {
      errs.domain = "Please select a domain";
      setErrors(errs);
      return false;
    }
    if (!localData.country) errs.country = "Country is required";
    if (!localData.jobType) errs.jobType = "Job Type is required";
    if (!localData.modeOfWork) errs.modeOfWork = "Mode of Work is required";
    if (!localData.selectedManager)
      errs.selectedManager = "Approver is required";
    if (!designation.trim()) errs.designation = "Job title is required";
    if (!selectedPositionsCount)
      errs.positionsCount = "Please select number of positions";
    if (!experience.min && experience.min !== 0)
      errs.min = "Minimum experience is required";
    if (!experience.max) errs.max = "Maximum experience is required";
    if (
      experience.min &&
      experience.max &&
      Number(experience.max) < Number(experience.min)
    )
      errs.max = "Max experience cannot be less than Min";
    if (!selectedAvailability) errs.availability = "Select availability";
    if (!closingDate) errs.closingDate = "Closing date is required";
    if (
      (isClinicalDataManagerSub || isClinicalProgrammerSub) &&
      selectedEdcTools.length === 0
    ) {
      errs.edcTools = "Please select at least one EDC tool";
    }
    if (isClinicalDomain) {
      if (skillMode === "normal") {
        if (selectedNormalSkills.length === 0)
          errs.normalSkills = "Select at least one skill";
      } else {
        if (!isClinicalDataManagement && selectedPrimarySkills.length === 0)
          errs.primarySkills = "Select at least one primary skill";
        if (
          (selectedSubFunction === "Clinical Programmer/CRF Developer"
            ? selectedCPMSkills.length
            : selectedMandatorySkills.length) === 0
        )
          errs.mandatorySkills = "Select at least one mandatory skill";
      }
    } else {
      if (selectedDomainSkills.length === 0)
        errs.domainSkills = "Select at least one skill";
    }
    if (saveAsTemplate && !(templateName.trim() || designation.trim()))
      errs.templateName = "Template name is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const resetAllStates = () => {
    setActiveStep(0);
    setDesignation("");
    setInstructions("");
    setFile(null);
    setFileError("");
    setExperience({ min: "", max: "" });
    setSelectedPrimarySkills([]);
    setSelectedMandatorySkills([]);
    setSelectedSecondarySkills([]);
    setSelectedCPMSkills([]);
    setSelectedCPSSkills([]);
    setMandatorySkills([]);
    setSecondarySkills([]);
    setClinicalProgrammerMandatorySkills([]);
    setClinicalProgrammerSecondarySkills([]);
    setSelectedFunctions("");
    setSelectedSubFunction("");
    setSubFunctions([]);
    setSubfunctionKey("");
    setSelectedAvailability({ value: "30", label: "Less Than 30 days" });
    setSelectedPositionsCount("One");
    setSelectedEdcTools([]);
    setSelectedTherapeuticExperience([]);
    setClosingDate(null);
    setSelectedPriority("High");
    setSelectedCountry("");
    setSelectedStateAndCity("");
    setStateAndCityOptions([]);
    setLocalData({
      jobType: "Full Time",
      salaryRange: null,
      salaryUnit: null,
      country: "India",
      modeOfWork: "Onsite",
      stateAndCity: "",
      selectedManager: null,
      selectedRectuiter: [],
      selectedRecruiterIds: [],
    });
    setErrors({});
    setIsEditMode(false);
    setIsDirty(false);
    setSelectedDomain("");
    setSelectedDomainSkills([]);
    setSkillMode("normal");
    setNormalSkills([]);
    setSelectedNormalSkills([]);
    setSaveAsTemplate(false);
    setTemplateName("");
    setTemplateNameError("");
    setSelectedTemplate(null);
  };

  const fetchTemplates = async (showStartup = false) => {
    setLoadingTemplates(true);
    try {
      const res = await api.get("/job-templates");
      if (res.data?.success) {
        const data = res.data.data || [];
        setTemplates(data);
        if (showStartup && isFreshCreate && data.length > 0)
          setStartupDialogOpen(true);
      }
    } catch {
    } finally {
      setLoadingTemplates(false);
    }
  };

  useEffect(() => {
    if (hasFetchedTemplates.current) return;
    hasFetchedTemplates.current = true;
    fetchTemplates(true);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // applyTemplate — fully resolved, no setTimeout nesting
  // ─────────────────────────────────────────────────────────────────────────────
  const applyTemplate = async (template) => {
    if (!template) return;
    isRestoringRef.current = true;
    const jd = template.job_details;

    const functionMap = {
      biostatistics: "Bio Statistics",
      "bio statistics": "Bio Statistics",
      "clinical data management": "Clinical Data Management",
    };
    const mappedFunction =
      functionMap[jd.function?.toLowerCase()?.trim()] || jd.function || "";
    const isCDM = mappedFunction === "Clinical Data Management";
    const templateDomain = jd.domain || "clinical";
    const templateMode = jd.mode || "normal";

    const primaryArr = parseToArray(jd.primaryskills);
    const mandatoryArr = parseToArray(jd.mandatoryskills);
    const secondaryArr = parseToArray(jd.secondaryskills);
    const primaryCsv = isCDM ? "" : primaryArr.join(",");

    const endpointMap = {
      "Bio Statistics": "biostatistics",
      "Clinical Data Management": "clinical data management",
    };

    const normPos = (v) => {
      if (!v) return "One";
      const l = v.toLowerCase();
      return l === "one"
        ? "One"
        : l === "two"
          ? "Two"
          : l.includes("more")
            ? "More than Two"
            : v;
    };
    const normJobType = (v) => {
      if (!v) return "Full Time";
      const l = v.toLowerCase();
      return l.includes("full")
        ? "Full Time"
        : l.includes("part")
          ? "Part Time"
          : l.includes("free")
            ? "Freelancer"
            : v;
    };
    const normMode = (v) => {
      if (!v) return "OnSite";
      const l = v.toLowerCase();
      return l.includes("remote")
        ? "Remote"
        : l.includes("hybrid")
          ? "Hybrid"
          : "Onsite";
    };

    let resolvedSubFunctionKey = jd.sub_function || "";
    let resolvedSubFunctionLabel = "";
    let resolvedSubFunctionMap = {};
    let resolvedSubFunctions = [];
    let resolvedDisabled = [];

    if (templateDomain === "clinical" && endpointMap[mappedFunction]) {
      try {
        const subFuncRes = await api.get(
          `/dropdown/${endpointMap[mappedFunction]}`,
        );
        const data = subFuncRes.data || [];
        const map = {};
        data.forEach((item) => {
          const label = item.label || item.lable;
          map[label] = item.sub_function;
        });
        resolvedSubFunctionMap = map;

        // Case-insensitive reverse lookup: key → label
        const reverseMap = Object.fromEntries(
          Object.entries(map).map(([label, key]) => [
            key.toLowerCase().trim(),
            label,
          ]),
        );
        resolvedSubFunctionLabel =
          reverseMap[jd.sub_function?.toLowerCase()?.trim()] || "";
        resolvedSubFunctionKey =
          map[resolvedSubFunctionLabel] || jd.sub_function || "";

        const disabled =
          mappedFunction === "Bio Statistics"
            ? ["BioStatistician"]
            : ["CRF Developer", "Medical Coder"];
        resolvedDisabled = disabled;
        const labels = data.map((item) => item.label || item.lable);
        resolvedSubFunctions = [
          ...labels.filter((l) => !disabled.includes(l)),
          ...labels.filter((l) => disabled.includes(l)),
        ];
      } catch {}
    }
    const isClinicalProg =
      resolvedSubFunctionLabel === "Clinical Programmer/CRF Developer";

    const [primarySkillsRes, cpMandatoryRes, cpSecondaryRes, citiesRes] =
      await Promise.allSettled([
        templateDomain === "clinical" &&
        !isCDM &&
        !isClinicalProg &&
        mappedFunction
          ? api.get(
              `/skills/${mappedFunction === "Bio Statistics" ? "statistical programmer" : "clinical data manager"}`,
            )
          : Promise.resolve(null),
        templateDomain === "clinical" && isClinicalProg
          ? api.get(`/raveprogrammer/skills`)
          : Promise.resolve(null),
        templateDomain === "clinical" &&
        isClinicalProg &&
        mandatoryArr.length > 0
          ? api.post(`/raveprogrammerskills/remaining`, {
              selected_skill_keys: mandatoryArr,
            })
          : Promise.resolve(null),
        jd.country
          ? api.get(`/dropdown/locations?country=${jd.country}`)
          : Promise.resolve(null),
      ]);

    let mandatorySkillsData = [];
    let secondarySkillsData = [];
    let normalSkillsData = [];

    if (
      templateDomain === "clinical" &&
      templateMode === "normal" &&
      resolvedSubFunctionKey
    ) {
      try {
        const r = await api.get(
          `/normal_skill/by-sub_function?sub_function=${resolvedSubFunctionKey}`,
        );
        normalSkillsData = r?.data?.data || [];
      } catch {}
    }

    if (
      templateDomain === "clinical" &&
      templateMode === "advanced" &&
      !isClinicalProg &&
      resolvedSubFunctionKey
    ) {
      try {
        const r = await api.get(
          `/mandatory_skill/by-primary?sub_function=${resolvedSubFunctionKey}&primary_selected=${primaryCsv}`,
        );
        mandatorySkillsData = Array.isArray(r?.data?.data) ? r.data.data : [];
      } catch {}
      if (mandatoryArr.length > 0) {
        try {
          const r = await api.post(
            `/secondary_skill/by-mandatory?sub_function=${resolvedSubFunctionKey}&primary_selected=${primaryCsv}&mandatory_selected=${mandatoryArr.join(",")}`,
          );
          secondarySkillsData = r?.data?.data || [];
        } catch {}
      }
    }

    const primarySkillsData =
      !isCDM && !isClinicalProg && primarySkillsRes.status === "fulfilled"
        ? primarySkillsRes.value?.data || []
        : [];
    const cpMandatoryData =
      isClinicalProg && cpMandatoryRes.status === "fulfilled"
        ? Array.isArray(cpMandatoryRes.value?.data?.data)
          ? cpMandatoryRes.value.data.data
          : []
        : [];
    const cpSecondaryData =
      isClinicalProg && cpSecondaryRes.status === "fulfilled"
        ? Array.isArray(cpSecondaryRes.value?.data?.data)
          ? cpSecondaryRes.value.data.data
          : []
        : [];
    const citiesData =
      citiesRes.status === "fulfilled" && citiesRes.value?.data
        ? citiesRes.value.data || []
        : [];

    let availableEdcTools = edcTools;
    if (!availableEdcTools.length) {
      try {
        const edcRes = await api.get("/edc-tools");
        availableEdcTools = edcRes?.data?.data || [];
        setEdcTools(availableEdcTools);
      } catch {}
    }

    const rawEdc = parseToArray(jd.edc);
    const resolvedEdcKeys = rawEdc
      .map((val) => {
        const normalizedVal = val
          .toLowerCase()
          .trim()
          .replace(/\s*\/\s*/g, "/")
          .replace(/\s+/g, " ");
        const match = availableEdcTools.find((t) => {
          const toolLabel = (t.lable || t.label || "")
            .toLowerCase()
            .trim()
            .replace(/\s*\/\s*/g, "/")
            .replace(/\s+/g, " ");
          return (
            toolLabel === normalizedVal ||
            toolLabel.includes(normalizedVal) ||
            normalizedVal.includes(toolLabel)
          );
        });
        return match?.key || null;
      })
      .filter(Boolean);

    const avail =
      jd.availability != null
        ? availability.find((a) => a.value === String(jd.availability))
        : null;
    const closingDateVal = getTodayPlus30Days();
    const approverMatch =
      jd.job_approver && hiringManagerList.length > 0
        ? hiringManagerList.find((m) => m.id === jd.job_approver) || null
        : null;

    // ── Set all state synchronously in one pass ──
    setSelectedDomain(templateDomain);
    setSkillMode(templateMode);

    if (templateDomain === "clinical") {
      setSelectedFunctions(mappedFunction);
      setSubFunctionMap(resolvedSubFunctionMap);
      setSubFunctions(resolvedSubFunctions);
      setDisabledSubFunctions(resolvedDisabled);
      setSubfunctionKey(resolvedSubFunctionKey);
      setSelectedSubFunction(resolvedSubFunctionLabel); // sync — no setTimeout needed

      // Options first
      setNormalSkills(normalSkillsData);
      setPrimarySkills(primarySkillsData);
      setMandatorySkills(mandatorySkillsData);
      setSecondarySkills(secondarySkillsData);
      setClinicalProgrammerMandatorySkills(cpMandatoryData);
      setClinicalProgrammerSecondarySkills(cpSecondaryData);

      // Selections after options
      setSelectedNormalSkills(
        templateMode === "normal" ? parseToArray(jd.normal_skills) : [],
      );
      setSelectedPrimarySkills(isCDM ? [] : primaryArr);
      setSelectedMandatorySkills(isClinicalProg ? [] : mandatoryArr);
      setSelectedSecondarySkills(isClinicalProg ? [] : secondaryArr);
      setSelectedCPMSkills(isClinicalProg ? mandatoryArr : []);
      setSelectedCPSSkills(isClinicalProg ? secondaryArr : []);
    } else {
      setSelectedNormalSkills([]);
      setSelectedDomainSkills(parseToArray(jd.domainskills));
    }

    setSelectedEdcTools(resolvedEdcKeys);
    setDesignation(jd.designation || jd.job_title || "");
    setExperience({ min: jd.min_years ?? "", max: jd.max_years ?? "" });
    setSelectedPositionsCount(normPos(jd.no_of_positions));
    setSelectedPriority(jd.priority || "High");
    setSelectedAvailability(avail || null);
    if (closingDateVal && !isNaN(closingDateVal.getTime()))
      setClosingDate(closingDateVal);
    setSelectedTherapeuticExperience(parseToArray(jd.therapeutic_area));
    setStateAndCityOptions(citiesData);
    setSelectedStateAndCity(jd.city || "");
    setLocalData((prev) => ({
      ...prev,
      jobType: normJobType(jd.job_type),
      country: jd.country || "India",
      stateAndCity: jd.city || "",
      modeOfWork: normMode(jd.mode_of_work),
      salaryRange:
        jd.salary_range && jd.salary_range !== "string" ? jd.salary_range : "",
      salaryUnit:
        jd.salary_unit && jd.salary_unit !== "string" ? jd.salary_unit : "",
      ...(approverMatch ? { selectedManager: approverMatch } : {}),
    }));
    setSelectedTemplate(template);
    setTemplateDialogOpen(false);

    // Single cleanup at the very end
    setTimeout(() => {
      isRestoringRef.current = false;
    }, 100);
    toast.success(`Template "${template.template_name}" applied!`);
  };

  useEffect(() => {
    if (apiResApprover && !localData.selectedManager)
      setLocalData((prev) => ({ ...prev, selectedManager: apiResApprover }));
  }, [apiResApprover]);

  useEffect(() => {
    if (formData?.fromMatchedEdit) {
      setIsEditMode(true);
      setIsDirty(true);
      navigate(".", {
        replace: true,
        state: { ...location.state, fromMatchedEdit: false },
      });
    }
  }, [formData?.fromMatchedEdit]);

  // ── Restore formData (edit mode) — NO isRestoringRef here ──
  useEffect(() => {
    if (!formData || isFreshCreate) return;

    const funcKeyToLabel = {
      biostatistics: "Bio Statistics",
      "clinical data management": "Clinical Data Management",
    };
    const functionLabel =
      funcKeyToLabel[formData.function?.toLowerCase()] ||
      formData.function ||
      "";

    setSelectedFunctions(functionLabel);
    setExperience(formData.experience || { min: "", max: "" });
    setDesignation(formData.designation || "");
    setSelectedPrimarySkills(formData.primaryskills || []);

    const isCPF =
      formData.sub_function === "clinical programmer/crf developer" ||
      formData.sub_function === "Clinical Programmer/CRF Developer";
    if (isCPF) {
      setSelectedCPMSkills(formData.mandatoryskills || []);
      setSelectedCPSSkills(formData.secondaryskills || []);
    } else {
      setSelectedMandatorySkills(formData.mandatoryskills || []);
      setSelectedSecondarySkills(formData.secondaryskills || []);
    }

    setSelectedAvailability(formData.availability || null);
    setSelectedPositionsCount(formData.no_of_positions || "");
    setInstructions(formData.text || "");
    setClosingDate(
      formData.closing_date ? new Date(formData.closing_date) : null,
    );
    setSelectedEdcTools(
      formData.edc ? formData.edc.split(",").filter(Boolean) : [],
    );
    setSelectedTherapeuticExperience(
      formData.therapeutic_experience
        ? formData.therapeutic_experience.split(",").filter(Boolean)
        : [],
    );
    setSelectedStateAndCity(formData.city || "");
    setSkillMode(formData.skillMode || "advanced");
    setSelectedNormalSkills(formData.normal_skills || []);
    setSelectedDomain(formData.domain || "clinical");
    setSelectedDomainSkills(formData.domainskills || []);
    setLocalData({
      jobType: formData.jobType || "",
      country: formData.country || "",
      stateAndCity: formData.city || "",
      modeOfWork: formData.modeOfWork || "",
      selectedManager: formData.selectedManager || null,
      selectedRectuiter: formData.selectedRectuiter || [],
      selectedRecruiterIds: formData.selectedRecruiterIds || [],
      salaryRange: formData.salaryRange || "",
      salaryUnit: formData.salaryUnit || "",
    });
  }, [formData, isFreshCreate]);

  useEffect(() => {
    if (isFreshCreate) {
      setFormData(null);
      resetAllStates();
    }
  }, [isFreshCreate]);

  // Fetch sub-functions when formData.function is available
  useEffect(() => {
    if (!formData?.function || isFreshCreate) return;
    fetchSubFunctions(formData.function);
  }, [formData?.function, isFreshCreate]);

  // Resolve sub_function key → label once subFunctions list is loaded
  useEffect(() => {
    if (!formData?.sub_function || subFunctions.length === 0) return;
    if (Object.keys(subFunctionMap).length === 0) return;

    const isAlreadyLabel = subFunctions.includes(formData.sub_function);
    let resolvedLabel = "";

    if (isAlreadyLabel) {
      resolvedLabel = formData.sub_function;
    } else {
      resolvedLabel =
        Object.keys(subFunctionMap).find(
          (lbl) => subFunctionMap[lbl] === formData.sub_function,
        ) || "";
    }

    if (resolvedLabel) {
      setSelectedSubFunction(resolvedLabel);
      const key = subFunctionMap[resolvedLabel] || formData.sub_function;
      setSubfunctionKey(key);
    }
  }, [subFunctions, subFunctionMap, formData?.sub_function, isFreshCreate]);

  useEffect(() => {
    if (!isFreshCreate) return;
    if (localData.country === "India" && stateAndCityOptions.length === 0)
      handleSelectCountry("India");
    setClosingDate(getTodayPlus30Days());
  }, [isFreshCreate]);

  const handlePositionsCountClick = (text) => {
    setSelectedPositionsCount(text);
    setErrors((prev) => ({ ...prev, positionsCount: "" }));
  };
  const handleInstructionsChange = (e) => {
    setInstructions(e.target.value);
    setErrors((prev) => ({ ...prev, instructions: "" }));
  };
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const valid = [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (valid.includes(f.type)) {
      setFile(f);
      setFileError("");
      setErrors((prev) => ({ ...prev, instructions: "" }));
    } else {
      setFileError("Please upload a valid file (PDF, TXT, DOC, DOCX, XLSX).");
      setFile(null);
    }
  };
  const finalTemplateName = templateName.trim() || designation.trim();
  const handleExperience = (e) => {
    const { name, value } = e.target;
    setExperience((prev) => ({
      ...prev,
      [name]: value === "" ? "" : Number(value),
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const buildCommonFormData = (fd) => {
    fd.append("no_of_positions", selectedPositionsCount || "");
    fd.append("designation", designation.trim());
    fd.append("min_years", experience.min ?? "0");
    fd.append("max_years", experience.max || "");
    fd.append("priority", selectedPriority);
    fd.append("country", localData.country || "");
    fd.append("city", localData.stateAndCity || "");
    fd.append("job_type", localData.jobType || "");
    fd.append("mode_of_work", localData.modeOfWork || "");
    fd.append("salary_range", localData.salaryRange || "");
    fd.append("salary_unit", localData.salaryUnit || "");
    fd.append("job_approver", localData.selectedManager?.id || "");
    fd.append("recruiter", localData.selectedRecruiterIds.join(","));
    if (
      selectedAvailability?.value !== null &&
      selectedAvailability?.value !== ""
    )
      fd.append("availability", selectedAvailability.value);
    if (closingDate)
      fd.append("closing_date", format(closingDate, "yyyy-MM-dd"));
    if (file) fd.append("file", file);
    else if (instructions.trim()) fd.append("text", instructions.trim());
    fd.append("save_as_template", saveAsTemplate);
    if (saveAsTemplate && templateName.trim())
      fd.append("template_name", finalTemplateName);
  };

  const handleSubmitClinical = async () => {
    const fd = new FormData();
    fd.append("domain", "clinical");
    fd.append("function", selectedFunctionKey);
    fd.append(
      "sub_function",
      selectedSubFunctionKey === "clinical programmer"
        ? "clinical programmer/crf developer"
        : selectedSubFunctionKey,
    );
    fd.append("mode", skillMode);
    if (skillMode === "normal") {
      fd.append("normal_skills", selectedNormalSkills.join(","));
      fd.append("primaryskills", "");
      fd.append("mandatoryskills", "");
      fd.append("secondaryskills", "");
    } else {
      fd.append("normal_skills", "");
      fd.append("primaryskills", selectedPrimarySkills.join(","));
      fd.append(
        "mandatoryskills",
        selectedSubFunction === "Clinical Programmer/CRF Developer"
          ? selectedCPMSkills.join(",")
          : selectedMandatorySkills.join(","),
      );
      fd.append(
        "secondaryskills",
        selectedSubFunction === "Clinical Programmer/CRF Developer"
          ? selectedCPSSkills.join(",")
          : selectedSecondarySkills.join(","),
      );
    }
    fd.append("edc", selectedEdcTools.join(","));
    fd.append("therapeutic_experience", selectedTherapeuticExperience || "");
    buildCommonFormData(fd);
    try {
      const response = await uploadFileToGetQuestions(fd, setLoading);
      if (response?.data) {
        if (saveAsTemplate) {
          fetchTemplates();
          setSaveAsTemplate(false);
          setTemplateName("");
        }
        const snap = {
          domain: "clinical",
          designation,
          experience,
          function: selectedFunctionKey,
          sub_function: selectedSubFunctionKey,
          skillMode,
          normal_skills: selectedNormalSkills,
          primaryskills: selectedPrimarySkills,
          mandatoryskills:
            selectedSubFunction === "Clinical Programmer/CRF Developer"
              ? selectedCPMSkills
              : selectedMandatorySkills,
          secondaryskills:
            selectedSubFunction === "Clinical Programmer/CRF Developer"
              ? selectedCPSSkills
              : selectedSecondarySkills,
          availability: selectedAvailability,
          no_of_positions: selectedPositionsCount,
          text: instructions,
          closing_date: closingDate,
          edc: selectedEdcTools.join(","),
          therapeutic_experience: selectedTherapeuticExperience.join(",") || "",
          jobType: localData.jobType,
          country: localData.country,
          city: localData.stateAndCity,
          modeOfWork: localData.modeOfWork,
          selectedManager: localData.selectedManager,
          selectedRectuiter: localData.selectedRectuiter,
          selectedRecruiterIds: localData.selectedRecruiterIds,
          jobDetailsId: response.data.job_details_id,
        };
        setFormData(snap);
        setJobdetailsId(response.data.job_details_id);
        setJobDetails(response.data);
        setActiveStep(1);
        setToggleCreateJob(false);
      }
    } catch (error) {
      if (error.response)
        alert(
          `Server Error ${error.response.status}: ${JSON.stringify(error.response.data)}`,
        );
      else if (error.request) alert("No response from server.");
      else alert(`Error: ${error.message}`);
    }
  };
  const handleSubmitNonClinical = async () => {
    const fd = new FormData();

    fd.append("domain", selectedDomain);

    // ✅ ADD THIS
    fd.append("function", "generic");
    fd.append("sub_function", "generic");

    fd.append("mode", "normal");
    fd.append("domainskills", selectedDomainSkills.join(","));

    buildCommonFormData(fd);

    try {
      setLoading(true);
      const response = await uploadFileToGetQuestions(fd, setLoading);

      if (response?.data) {
        if (saveAsTemplate) {
          fetchTemplates();
          setSaveAsTemplate(false);
          setTemplateName("");
        }

        toast.success("Job created successfully!");
        navigate("/recruit/requisitions");
        setFormData(response.data.domain);
      }
    } catch (error) {
      if (error.response)
        alert(
          `Server Error ${error.response.status}: ${JSON.stringify(error.response.data)}`,
        );
      else if (error.request) alert("No response from server.");
      else alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      if (validateStep0()) {
        if (isClinicalDomain) await handleSubmitClinical();
        else await handleSubmitNonClinical();
      }
    } else if (activeStep === 1) {
      const form = document.getElementById("recruitment");
      form?.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true }),
      );
    }
  };

  const fetchSubFunctions = async (selectedFunc) => {
    const funcObj = FUNCTIONS.find(
      (f) => f.label === selectedFunc || f.key === selectedFunc?.toLowerCase(),
    );
    const endpoint = funcObj?.key;
    if (!endpoint) return;
    try {
      const res = await api.get(`/dropdown/${endpoint}`);
      const data = res.data;
      const labels = data.map((item) => item.label || item.lable);
      const map = {};
      data.forEach((item) => {
        const label = item.label || item.lable;
        map[label] = item.sub_function;
      });
      setSubFunctionMap(map);

      const funcLabel = funcObj.label;
      const disabled =
        funcLabel === "Bio Statistics"
          ? ["BioStatistician"]
          : ["CRF Developer", "Medical Coder"];
      setDisabledSubFunctions(disabled);
      const sorted = [
        ...labels.filter((l) => !disabled.includes(l)),
        ...labels.filter((l) => disabled.includes(l)),
      ];
      setSubFunctions(sorted);

      // Only set default in fresh create mode — never override edit/template restore
      if (!formData?.sub_function && !isEditMode && !isRestoringRef.current) {
        const enabled = sorted.filter((l) => !disabled.includes(l));
        const defaultSub = enabled[0] || "";
        setSelectedSubFunction(defaultSub);
        const autoTitle = generateJobTitle(defaultSub);
        setDesignation(autoTitle);
        setSubfunctionKey(map[defaultSub] || "");
      }
    } catch {}
  };

  useEffect(() => {
    if (hasFetchedStaticData.current) return;
    hasFetchedStaticData.current = true;
    Promise.all([api.get("/edc-tools"), api.get("/therapeutic-areas")])
      .then(([edcRes, taRes]) => {
        setEdcTools(edcRes?.data?.data || []);
        if (taRes?.data?.success) setTherapeuticAreas(taRes.data.data);
      })
      .catch(() => {});
  }, []);

  const fetchPrimarySkills = async (selectedFunc) => {
    const ep = {
      "Bio Statistics": "statistical programmer",
      "Clinical Data Management": "clinical data manager",
    };
    if (!ep[selectedFunc]) return;
    try {
      const r = await api.get(`/skills/${ep[selectedFunc]}`);
      setPrimarySkills(r.data || []);
    } catch {}
  };

  const fetchMandatorySkills = async (key, primaryCsv = "") => {
    if (!key) return;
    try {
      const r = await api.get(
        `/mandatory_skill/by-primary?sub_function=${key}&primary_selected=${primaryCsv}`,
      );
      setMandatorySkills(Array.isArray(r?.data?.data) ? r.data.data : []);
    } catch {}
  };

  const fetchSecondarySkills = async (key, primaryCsv, mandatoryCsv) => {
    if (!key) return;
    try {
      const r = await api.post(
        `/secondary_skill/by-mandatory?sub_function=${key}&primary_selected=${primaryCsv}&mandatory_selected=${mandatoryCsv}`,
      );
      setSecondarySkills(r?.data?.data || []);
    } catch {}
  };

  const fetchClinicalProgrammerMandatorySkills = async (key) => {
    if (!key) return;
    try {
      const r = await api.get(`/raveprogrammer/skills`);
      setClinicalProgrammerMandatorySkills(
        Array.isArray(r?.data?.data) ? r.data.data : [],
      );
    } catch {}
  };
  const fetchClinicalProgrammerSecondarySkills = async (mandatoryCsv = "") => {
    try {
      const r = await api.post(`/raveprogrammerskills/remaining`, {
        selected_skill_keys: mandatoryCsv,
      });
      setClinicalProgrammerSecondarySkills(
        Array.isArray(r?.data?.data) ? r.data.data : [],
      );
    } catch {}
  };

  useEffect(() => {
    if (isRestoringRef.current || !isClinicalDomain) return;

    if (selectedSubFunction && subFunctionMap[selectedSubFunction]) {
      const key = subFunctionMap[selectedSubFunction];
      setSubfunctionKey(key);

      console.log("MODE:", skillMode);
      console.log("KEY:", key);

      if (skillMode === "normal") {
        fetchNormalSkills(key);
      } else if (skillMode === "advanced") {
        if (key === "clinical programmer/crf developer") {
          fetchClinicalProgrammerMandatorySkills(key);
          if (!isEditMode) setSelectedPrimarySkills([]);
        } else {
          fetchPrimarySkills(selectedFunctions);

          if (isClinicalDataManagement) {
            fetchMandatorySkills(key, "");
          }
        }
      }
    }
  }, [
    selectedSubFunction,
    isClinicalDataManagement,
    subFunctionMap,
    skillMode,
    isClinicalDomain,
  ]);

  useEffect(() => {
    if (
      !isRestoringRef.current &&
      skillMode === "normal" &&
      subFunctionKey &&
      isClinicalDomain
    )
      fetchNormalSkills(subFunctionKey);
  }, [skillMode]);
  useEffect(() => {
    if (
      isRestoringRef.current ||
      !isEditMode ||
      !subFunctionKey ||
      !selectedPrimarySkills.length
    )
      return;
    fetchMandatorySkills(subFunctionKey, selectedPrimarySkills.join(","));
  }, [isEditMode, subFunctionKey, selectedPrimarySkills]);
  useEffect(() => {
    if (
      isRestoringRef.current ||
      !isEditMode ||
      selectedSubFunction !== "Clinical Programmer/CRF Developer" ||
      !selectedCPMSkills.length
    )
      return;
    fetchClinicalProgrammerSecondarySkills(selectedCPMSkills);
  }, [isEditMode, selectedCPMSkills]);
  useEffect(() => {
    if (isRestoringRef.current || skillMode !== "advanced" || !subFunctionKey)
      return;
    const primaryCsv = isClinicalDataManagement
      ? ""
      : selectedPrimarySkills.join(",");
    fetchSecondarySkills(
      subFunctionKey,
      primaryCsv,
      selectedMandatorySkills.join(","),
    );
  }, [
    selectedMandatorySkills,
    subFunctionKey,
    selectedPrimarySkills,
    isClinicalDataManagement,
    skillMode,
  ]);
  useEffect(() => {
    if (isRestoringRef.current || !isClinicalDomain) return;
    if (selectedSubFunction && subFunctionMap[selectedSubFunction]) {
      const key = subFunctionMap[selectedSubFunction];
      setSubfunctionKey(key);
      if (skillMode === "normal") {
        fetchNormalSkills(key);
      } else {
        if (isClinicalDataManagement) {
          fetchMandatorySkills(key, "");
          if (!isEditMode) setSelectedPrimarySkills([]);
        }
        if (key === "clinical programmer/crf developer") {
          fetchClinicalProgrammerMandatorySkills(key);
          if (!isEditMode) setSelectedPrimarySkills([]);
        } else if (primarySkills.length === 0)
          fetchPrimarySkills(selectedFunctions);
      }
    }
  }, [
    selectedSubFunction,
    isClinicalDataManagement,
    subFunctionMap,
    skillMode,
    isClinicalDomain,
  ]);

  useEffect(() => {
    if (
      !isRestoringRef.current &&
      skillMode === "normal" &&
      subFunctionKey &&
      isClinicalDomain
    )
      fetchNormalSkills(subFunctionKey);
  }, [skillMode]);
  useEffect(() => {
    if (
      isRestoringRef.current ||
      !isEditMode ||
      !subFunctionKey ||
      !selectedPrimarySkills.length
    )
      return;
    fetchMandatorySkills(subFunctionKey, selectedPrimarySkills.join(","));
  }, [isEditMode, subFunctionKey, selectedPrimarySkills]);
  useEffect(() => {
    if (
      isRestoringRef.current ||
      !isEditMode ||
      selectedSubFunction !== "Clinical Programmer/CRF Developer" ||
      !selectedCPMSkills.length
    )
      return;
    fetchClinicalProgrammerSecondarySkills(selectedCPMSkills);
  }, [isEditMode, selectedCPMSkills]);
  useEffect(() => {
    if (isRestoringRef.current || skillMode !== "advanced" || !subFunctionKey)
      return;
    const primaryCsv = isClinicalDataManagement
      ? ""
      : selectedPrimarySkills.join(",");
    fetchSecondarySkills(
      subFunctionKey,
      primaryCsv,
      selectedMandatorySkills.join(","),
    );
  }, [
    selectedMandatorySkills,
    subFunctionKey,
    selectedPrimarySkills,
    isClinicalDataManagement,
    skillMode,
  ]);

  useEffect(() => {
    if (
      !isRestoringRef.current &&
      skillMode === "normal" &&
      subFunctionKey &&
      isClinicalDomain
    )
      fetchNormalSkills(subFunctionKey);
  }, [skillMode]);

  // ── EDIT MODE: fetch mandatory OPTIONS once subFunctionKey is ready ──
  // No isRestoringRef guard — we NEED this to fire in edit mode
  useEffect(() => {
    if (
      !isEditMode ||
      !subFunctionKey ||
      skillMode !== "advanced" ||
      isClinicalProgrammerSub
    )
      return;

    const primaryCsv = isClinicalDataManagement
      ? ""
      : selectedPrimarySkills.join(",");
    fetchMandatorySkills(subFunctionKey, primaryCsv);
  }, [isEditMode, subFunctionKey, skillMode, isClinicalProgrammerSub]);
  // NOTE: selectedPrimarySkills intentionally NOT in deps — fires once when subFunctionKey arrives

  // ── EDIT MODE: fetch secondary OPTIONS once mandatory OPTIONS are loaded ──
  // mandatorySkills (the options array) as dep — auto-triggers after fetchMandatorySkills
  useEffect(() => {
    if (
      !isEditMode ||
      !subFunctionKey ||
      skillMode !== "advanced" ||
      isClinicalProgrammerSub ||
      mandatorySkills.length === 0 ||
      selectedMandatorySkills.length === 0
    )
      return;

    const primaryCsv = isClinicalDataManagement
      ? ""
      : selectedPrimarySkills.join(",");
    const mandatoryCsv = selectedMandatorySkills.join(",");
    fetchSecondarySkills(subFunctionKey, primaryCsv, mandatoryCsv);
  }, [isEditMode, mandatorySkills, subFunctionKey, skillMode]);
  // NOTE: mandatorySkills as dep — fires after fetchMandatorySkills populates options

  // ── EDIT MODE: Clinical Programmer secondary skills ──
  useEffect(() => {
    if (
      !isEditMode ||
      !isClinicalProgrammerSub ||
      selectedCPMSkills.length === 0
    )
      return;
    fetchClinicalProgrammerSecondarySkills(selectedCPMSkills);
  }, [isEditMode, isClinicalProgrammerSub, selectedCPMSkills]);

  // ── CREATE MODE only: secondary skills (non-CP) ──
  useEffect(() => {
    if (
      isRestoringRef.current ||
      isEditMode ||
      skillMode !== "advanced" ||
      !subFunctionKey ||
      isClinicalProgrammerSub
    )
      return;
    if (secondarySkills.length > 0 && selectedSecondarySkills.length > 0)
      return;

    const primaryCsv = isClinicalDataManagement
      ? ""
      : selectedPrimarySkills.join(",");
    fetchSecondarySkills(
      subFunctionKey,
      primaryCsv,
      selectedMandatorySkills.join(","),
    );
  }, [
    selectedMandatorySkills,
    subFunctionKey,
    selectedPrimarySkills,
    isClinicalDataManagement,
    skillMode,
    isEditMode,
  ]);

  useEffect(() => {
    if (hasFetchedMountData.current) return;
    hasFetchedMountData.current = true;
    const fetchMountData = async () => {
      const roles = ["super_admin", "admin", "hm_user"];
      const [countriesRes, ...roleResponses] = await Promise.allSettled([
        api.get("/dropdown/countries"),
        ...roles.map((role) =>
          api
            .get(`/user-employees/by-role_v1?user_role=${role}`)
            .catch(() => ({ data: { data: [] } })),
        ),
      ]);
      if (countriesRes.status === "fulfilled")
        setCountries(countriesRes.value?.data || []);
      const allUsers = roleResponses
        .filter((r) => r.status === "fulfilled")
        .flatMap((r) => r.value?.data?.data || []);
      const uniqueMap = new Map();
      allUsers.forEach((u) => {
        if (u.id && u.name)
          uniqueMap.set(u.id, {
            id: u.id,
            name: u.name,
            designation: u.designation,
          });
      });
      const uniqueUsers = Array.from(uniqueMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      );
      setHiringManagerList(uniqueUsers);
      setRecruitersList(uniqueUsers);
      setLoadingUsers(false);
    };
    fetchMountData();
  }, []);

  const handleSelectCountry = (country) => {
    setSelectedCountry(country || "");
    setSelectedStateAndCity("");
    setLocalData((prev) => ({
      ...prev,
      country: country || "",
      stateAndCity: "",
    }));
    if (country) {
      api
        .get(`/dropdown/locations?country=${country}`)
        .then((r) => setStateAndCityOptions(r.data || []))
        .catch(() => setStateAndCityOptions([]));
    } else {
      setStateAndCityOptions([]);
    }
  };

  useEffect(() => {
    if (!jobDetails) return;
    const country = jobDetails.country || "";
    setSelectedCountry(country);
    setSelectedStateAndCity(formData?.city);
    if (jobDetails.hiring_manager && hiringManagerList.length > 0) {
      const m = hiringManagerList.find(
        (x) => x.id === jobDetails.hiring_manager.id,
      );
      if (m) setLocalData((prev) => ({ ...prev, selectedManager: m }));
    }
    if (country)
      api
        .get(`/dropdown/locations?country=${country}`)
        .then((r) => setStateAndCityOptions(r.data || []))
        .catch(() => {});
  }, [jobDetails, hiringManagerList]);

  const normalizeJobType = (value) => {
    if (!value) return "";
    const lower = value.trim().toLowerCase();
    return lower.includes("full")
      ? "Full Time"
      : lower.includes("part")
        ? "Part Time"
        : lower.includes("free")
          ? "Freelancer"
          : value;
  };

  const handleUpdateJob = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      const finalJobId = jobDetailsId || matchedJobId;
      if (!finalJobId) {
        toast.error("Job ID not found – please try again");
        return;
      }
      if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          finalJobId,
        )
      ) {
        toast.error("Invalid Job ID format");
        return;
      }
      fd.append("job_id", finalJobId);
      fd.append("domain", selectedDomain || "clinical");
      fd.append("designation", designation.trim());
      if (selectedDomain !== "clinical") {
        fd.append("function", "generic");
        fd.append("sub_function", "generic");
      } else {
        fd.append("function", selectedFunctionKey);
        fd.append("sub_function", selectedSubFunctionKey);
      }
      fd.append("no_of_positions", selectedPositionsCount || "One");
      fd.append("min_years", experience.min || "0");
      fd.append("max_years", experience.max || "");
      fd.append("mode", isClinicalDomain ? skillMode : "normal");
      if (isClinicalDomain) {
        if (skillMode === "normal") {
          fd.append("normal_skills", selectedNormalSkills.join(","));
          fd.append("primaryskills", "");
          fd.append("mandatoryskills", "");
          fd.append("secondaryskills", "");
        } else {
          fd.append("normal_skills", "");
          fd.append(
            "primaryskills",
            !isClinicalDataManagement ? selectedPrimarySkills.join(",") : "",
          );
          fd.append(
            "mandatoryskills",
            selectedSubFunction === "Clinical Programmer/CRF Developer"
              ? selectedCPMSkills.join(",")
              : selectedMandatorySkills.join(","),
          );
          fd.append(
            "secondaryskills",
            selectedSubFunction === "Clinical Programmer/CRF Developer"
              ? selectedCPSSkills.join(",")
              : selectedSecondarySkills.join(","),
          );
        }
        fd.append("edc", selectedEdcTools.join(",") || "");
        fd.append(
          "therapeutic_areas",
          selectedTherapeuticExperience.join(",") || "",
        );
      } else {
        fd.append("domainskills", selectedDomainSkills.join(","));
      }
      fd.append("priority", selectedPriority);
      fd.append("availability", selectedAvailability?.value || "");
      if (closingDate)
        fd.append("closing_date", format(closingDate, "yyyy-MM-dd"));
      fd.append("country", localData.country || "");
      fd.append("city", localData.stateAndCity || "");
      fd.append("job_type", localData.jobType || "");
      fd.append("mode_of_work", localData.modeOfWork || "");
      fd.append("salary_range", localData.salaryRange?.trim() || "");
      fd.append("salary_unit", localData.salaryUnit || "");
      fd.append("job_approver", localData.selectedManager?.id || "");
      fd.append("recruiter", localData.selectedRecruiterIds.join(",") || "");
      if (file) fd.append("file", file);
      else if (instructions.trim()) fd.append("text", instructions.trim());

      const res = await api.put(`/edit-job_v1/${finalJobId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res?.data?.success) {
        setJobDetails({ ...jobDetails, summary: res?.data?.data?.summary });
        setJobdetailsId(res.data?.data?.job_details_id);
        toast.success("Job updated successfully!");
        if (isClinicalDomain) setActiveStep(1);
        else navigate("/recruit/dashboard/requisitions");
        setIsEditMode(false);
        setIsDirty(false);
        setFormData({
          domain: selectedDomain,
          designation,
          experience,
          function: selectedFunctionKey,
          sub_function: selectedSubFunctionKey,
          skillMode,
          normalskills: selectedNormalSkills,
          domainskills: selectedDomainSkills,
          primaryskills: selectedPrimarySkills,
          mandatoryskills:
            selectedSubFunction === "Clinical Programmer/CRF Developer"
              ? selectedCPMSkills
              : selectedMandatorySkills,
          secondaryskills:
            selectedSubFunction === "Clinical Programmer/CRF Developer"
              ? selectedCPSSkills
              : selectedSecondarySkills,
          availability: selectedAvailability,
          no_of_positions: selectedPositionsCount,
          text: instructions,
          closing_date: closingDate,
          edc: selectedEdcTools.join(","),
          therapeutic_experience: selectedTherapeuticExperience.join(","),
          jobType: localData.jobType,
          country: localData.country,
          city: localData.stateAndCity,
          modeOfWork: localData.modeOfWork,
          selectedManager: localData.selectedManager,
          selectedRectuiter: localData.selectedRectuiter,
          selectedRecruiterIds: localData.selectedRecruiterIds,
          jobDetailsId: res.data.job_details_id,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Stable callbacks ───
  const onNormalSkillsChange = useCallback((k) => {
    setSelectedNormalSkills(k);
    setIsDirty(false);
  }, []);
  const onPrimarySkillsChange = useCallback(
    (keys) => {
      setSelectedPrimarySkills(keys);
      if (keys.length > 0) {
        fetchMandatorySkills(subFunctionKey, keys.join(","));
        fetchClinicalProgrammerMandatorySkills(subFunctionKey);
      } else {
        setMandatorySkills([]);
        setSelectedMandatorySkills([]);
        setSecondarySkills([]);
        setSelectedSecondarySkills([]);
      }
      setIsDirty(false);
    },
    [subFunctionKey],
  );
  const onMandatorySkillsChange = useCallback((keys) => {
    setSelectedMandatorySkills(keys);
    setIsDirty(false);
  }, []);
  const onSecondarySkillsChange = useCallback((k) => {
    setSelectedSecondarySkills(k);
    setIsDirty(false);
  }, []);
  const onCPMChange = useCallback((keys) => {
    fetchClinicalProgrammerSecondarySkills(keys);
    setSelectedCPMSkills(keys);
    setIsDirty(false);
  }, []);
  const onCPSChange = useCallback((k) => {
    setSelectedCPSSkills(k);
    setIsDirty(false);
  }, []);
  const onEdcChange = useCallback((keys) => {
    setSelectedEdcTools(keys);
    setIsDirty(false);
  }, []);
  const onTherapeuticChange = useCallback((vals) => {
    setSelectedTherapeuticExperience(vals);
    setIsDirty(false);
  }, []);
  const onDomainSkillsChange = useCallback((k) => {
    setSelectedDomainSkills(k);
    setIsDirty(false);
  }, []);

  const handleDeleteTemplate = async (templateId) => {
    try {
      await api.delete(`/job-templates/${templateId}`);
      toast.success("Template deleted successfully");
      setTemplates((prev) => prev.filter((t) => t.template_id !== templateId));
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };

  useEffect(() => {
    if (saveAsTemplate && !templateName) setTemplateName(designation);
  }, [saveAsTemplate, designation]);
const [activeSection, setActiveSection] = useState("roleSetup");
  // ─── RENDER ───
  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        
        bgcolor: "#f3f4f6",
        gap: 2,
        p: 2,
      }}
    >
      {/* ================= LEFT SIDEBAR ================= */}
      {(() => {
        // ── Section completion logic ──
        const sectionStatus = {
          roleSetup: (() => {
            if (!selectedDomain) return false;
            if (isClinicalDomain) {
              if (!selectedFunctions || !selectedSubFunction) return false;
            }
            if (!selectedPositionsCount) return false;
            return true;
          })(),

          jobInfo: (() => {
            if (!designation.trim()) return false;
            if (!experience.min && experience.min !== 0) return false;
            if (!experience.max) return false;
            if (!selectedAvailability) return false;
            if (!localData.country) return false;
            return true;
          })(),

          skills: (() => {
            if (isClinicalDomain) {
              if (skillMode === "normal") {
                return selectedNormalSkills.length > 0;
              } else {
                if (
                  !isClinicalDataManagement &&
                  selectedPrimarySkills.length === 0
                )
                  return false;
                const mandatory =
                  selectedSubFunction === "Clinical Programmer/CRF Developer"
                    ? selectedCPMSkills.length > 0
                    : selectedMandatorySkills.length > 0;
                return mandatory;
              }
            }
            if (isNonClinicalDomain) {
              return selectedDomainSkills.length > 0;
            }
            return false;
          })(),

          additionalInfo: (() => {
            if (!localData.jobType) return false;
            if (!localData.modeOfWork) return false;
            if (!selectedPriority) return false;
            if (!closingDate) return false;
            return true;
          })(),

          team: (() => {
            return !!localData.selectedManager;
          })(),

          jobDescription: true, // optional — always ticked
        };

        const sections = [
          { id: "roleSetup", label: "Role Setup" },
          { id: "jobInfo", label: "Job Info & Experience" },
          { id: "skills", label: "Skills" },
          { id: "additionalInfo", label: "Additional Info" },
          { id: "team", label: "Team" },
          { id: "jobDescription", label: "Job Description" },
        ];
        

        return (
          <Box
  sx={{
    width: 240,
    minWidth: 240,
    bgcolor: "#FFFFFF",
    borderRadius: "20px",
    p: 2.5,
    border: "1px solid #E8EEF3",
    // boxShadow: "0 4px 18px rgba(0,0,0,0.04)",
    height: "fit-content",
    position: "sticky",
    top: 10,
    alignSelf: "flex-start",
  }}
>
  {sections.map((item, index, arr) => {
    const isDone = sectionStatus[item.id];

    return (
      <Box
        key={item.id}
       onClick={() => {
  setActiveSection(item.id);

  document.getElementById(item.id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}}
        sx={{
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  mb: index === arr.length - 1 ? 0 : 3.5,
  cursor: "pointer",
  position: "relative",
  transition: "0.3s",
  px: 1,
  py: 0.8,
  borderRadius: "12px",

  bgcolor:
    activeSection === item.id
      ? "rgba(0, 208, 247, 0.10)"
      : "transparent",

  "&:hover": {
    bgcolor: "rgba(0, 208, 247, 0.08)",
  },

  "&:hover .step-label": {
    color: "#00D0F7",
  },
}}
      >
        {/* Connector line */}
        {index !== arr.length - 1 && (
          <Box
            sx={{
              position: "absolute",
              left: 20,
              top: 26,
              width: "2px",
              height: "42px",
              bgcolor: isDone ? "#00D0F7" : "#E5E7EB",
              transition: "0.3s",
            }}
          />
        )}

        {/* Circle */}
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            bgcolor: isDone ? "#00BBD4" : "#F8FAFC",
            color: isDone ? "#fff" : "#94A3B8",
            border: isDone
              ? "none"
              : "1.5px solid #DCE3EA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            zIndex: 1,
            fontSize: 11,
            transition: "all 0.3s ease",
            flexShrink: 0,
            boxShadow: isDone
              ? "0 4px 10px rgba(0,208,247,0.25)"
              : "none",
          }}
        >
          {isDone ? "✓" : index + 1}
        </Box>

        {/* Label */}
        <Typography
          className="step-label"
          sx={{
            fontSize: "13px",
            fontWeight: isDone ? 600 : 500,
            color: isDone ? "#64748B" : "#64748B",
            transition: "0.3s",
            lineHeight: 1.2,
          }}
        >
          {item.label}
        </Typography>
      </Box>
    );
  })}
</Box>
        );
      })()}

      {/* ================= RIGHT CONTENT ================= */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          height: "100%",
          pr: 1,
            
    boxSizing: "border-box",


          "&::-webkit-scrollbar": {
            width: "6px",
          },

          "&::-webkit-scrollbar-thumb": {
            background: "#CBD5E1",
            borderRadius: "20px",
          },
        }}
      >
        {(isClinicalDomain || !selectedDomain) && (
          <StepperComponent
            activeStep={activeStep}
            handleStepClick={setActiveStep}
          />
        )}

        <Box sx={{ mt: 1, }}>
          {activeStep === 0 ? (
            <Grid container direction="column" spacing={3}>
              {/* ================= TEMPLATE BAR ================= */}
              <Grid item>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1,
                    bgcolor: "#f0fffe",
                    border: "1px solid #b2ebf2",
                    borderRadius: 3,
                    px: 2.5,
                    py: 1.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <BookmarkBorderIcon
                      sx={{ color: "#00A1A7", fontSize: 20 }}
                    />

                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="#00A1A7"
                    >
                      Templates
                    </Typography>

                    {templates.length > 0 && (
                      <Chip
                        label={`${templates.length} saved`}
                        size="small"
                        sx={{
                          bgcolor: "#00A1A7",
                          color: "#fff",
                          fontSize: 11,
                          height: 20,
                        }}
                      />
                    )}
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<BookmarkIcon />}
                    onClick={() => setTemplateDialogOpen(true)}
                    disabled={templates.length === 0}
                    sx={{
                      borderColor: "#00A1A7",
                      color: "#00A1A7",
                      fontSize: 12,
                      textTransform: "none",
                      "&:hover": {
                        bgcolor: "#e0f7fa",
                        borderColor: "#00A1A7",
                      },
                    }}
                  >
                    {templates.length === 0
                      ? "No templates yet"
                      : "Load Template"}
                  </Button>
                </Box>
              </Grid>

              {/* ================= ROLE SETUP ================= */}
              <Grid item id="roleSetup">
                <Box
                  sx={{
                    bgcolor: "#fff",
                    p: { xs: 2, sm: 3 },
                    borderRadius: "24px",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 2,
                      fontWeight: 600,
                    }}
                  >
                    <WorkSharpIcon sx={{ color: "#00A1A7" }} />
                    Role Setup
                  </Typography>

                  <Grid container spacing={2} direction="column">
                    <Grid item size={{ xs: 12 }}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label={<RequiredLabel>Select Domain</RequiredLabel>}
                        value={selectedDomain}
                        error={!!errors.domain}
                        helperText={errors.domain}
                        onChange={(e) => {
                          handleDomainChange(e.target.value);
                          setErrors((prev) => ({ ...prev, domain: "" }));
                        }}
                      >
                        {DOMAINS.map((d) => (
                          <MenuItem key={d.value} value={d.value}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <DomainIcon
                                iconType={d.iconType}
                                sx={{ fontSize: 16, color: "#00A1A7" }}
                              />
                              {d.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid item size={{ xs: 12 }}>
                      <Typography
  variant="body2"
  fontWeight={600}
  sx={{
    mb: 0.75,
    display: "flex",
    alignItems: "center",
    gap: 0.7,
    fontSize: {
      xs: "0.75rem",
      sm: "0.85rem",
    },
  }}
>
  <GroupsOutlinedIcon
    sx={{
      fontSize: 18,
      color: "#00D0F7",
    }}
  />

  No. of Positions <span style={{ color: "red" }}>*</span>
</Typography>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {["One", "Two", "More than Two"].map((text) => (
                          <Button
                            key={text}
                            variant="contained"
                            size="small"
                            sx={{
                              flex: 1,
                              height: 40,
                              fontSize: {
                                xs: "0.65rem",
                                sm: "0.75rem",
                                lg: "0.8rem",
                              },
                              boxShadow: "none",
                              textTransform: "none",
                              fontWeight:
                                selectedPositionsCount === text ? 700 : 400,
                              border: errors.positionsCount
                                ? "1px solid red"
                                : selectedPositionsCount === text
                                  ? `2px solid ${theme.palette.blue?.main || "#00A1A7"}`
                                  : "1px solid #D1D5DB",
                              backgroundColor:
                                selectedPositionsCount === text
                                  ? theme.palette.blue?.main || "#00A1A7"
                                  : "#fff",
                              color:
                                selectedPositionsCount === text
                                  ? "#fff"
                                  : "#333",
                              "&:hover": {
                                backgroundColor:
                                  theme.palette.blue?.main || "#00A1A7",
                                color: "#fff",
                              },
                            }}
                            onClick={() => handlePositionsCountClick(text)}
                          >
                            {text}
                          </Button>
                        ))}
                      </Box>
                      {errors.positionsCount && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5, display: "block" }}
                        >
                          {errors.positionsCount}
                        </Typography>
                      )}
                    </Grid>

                    {isClinicalDomain && (
                      <>
                        <Grid item size={{ xs: 12 }}>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            label={<RequiredLabel>Function</RequiredLabel>}
                            value={selectedFunctions}
                            disabled={isEditMode}
                            error={!!errors.selectedFunctions}
                            helperText={errors.selectedFunctions}
                            onChange={(e) => {
                              const v = e.target.value;
                              setSelectedFunctions(v);
                              setSelectedSubFunction("");
                              fetchSubFunctions(v);
                              setErrors((prev) => ({
                                ...prev,
                                selectedFunctions: "",
                              }));
                            }}
                          >
                            <MenuItem value="" disabled>
                              <em>Select Function</em>
                            </MenuItem>
                            {FUNCTIONS.map((f) => (
                              <MenuItem key={f.key} value={f.label}>
                                {f.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>

                        <Grid item size={{ xs: 12 }}>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            label={<RequiredLabel>Sub Function</RequiredLabel>}
                            disabled={!selectedFunctions || isEditMode}
                            value={selectedSubFunction}
                            error={!!errors.selectedSubFunction}
                            helperText={errors.selectedSubFunction}
                            onChange={(e) => {
                              const v = e.target.value;
                              setSelectedSubFunction(v);
                              const autoTitle = generateJobTitle(v);
                              setDesignation(autoTitle);
                            }}
                          >
                            <MenuItem value="" disabled>
                              <em>Select Sub Function</em>
                            </MenuItem>
                            {subFunctions.map((opt) => (
                              <MenuItem
                                key={opt}
                                value={opt}
                                disabled={disabledSubFunctions.includes(opt)}
                              >
                                {opt}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Box>
              </Grid>

              {/* ================= JOB INFO ================= */}
              <Grid item id="jobInfo">
                <Box
                  sx={{
                    bgcolor: "#fff",
                    p: { xs: 2, sm: 3 },
                    borderRadius: "24px",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 2,
                      fontWeight: 600,
                    }}
                  >
                    <ClassIcon sx={{ color: "#00A1A7" }} />
                    Job Info & Experience
                  </Typography>

                  <Grid container spacing={2} direction="column">
                    <Grid item size={{ xs: 12 }}>
                      <TextField
                        label={<RequiredLabel>Job Title</RequiredLabel>}
                        fullWidth
                        size="small"
                        value={designation}
                        onChange={(e) => {
                          setDesignation(e.target.value);
                          setErrors((prev) => ({ ...prev, designation: "" }));
                          setIsDirty(false);
                        }}
                        error={!!errors.designation}
                        helperText={errors.designation}
                      />
                    </Grid>

                    <Grid item size={{ xs: 12 }}>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField
                          label={<RequiredLabel>Min Exp</RequiredLabel>}
                          type="number"
                          size="small"
                          name="min"
                          value={experience.min || ""}
                          onChange={(e) => {
                            handleExperience(e);
                            setIsDirty(false);
                          }}
                          error={!!errors.min}
                          helperText={errors.min}
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          label={<RequiredLabel>Max Exp</RequiredLabel>}
                          type="number"
                          size="small"
                          name="max"
                          value={experience.max || ""}
                          onChange={(e) => {
                            handleExperience(e);
                            setIsDirty(false);
                          }}
                          sx={{ flex: 1 }}
                          error={!!errors.max}
                          helperText={errors.max}
                        />
                      </Box>
                    </Grid>

                    <Grid item size={{ xs: 12 }}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label={
                          <RequiredLabel>Select Availability</RequiredLabel>
                        }
                        value={selectedAvailability?.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedAvailability(
                            val === ""
                              ? null
                              : availability.find((o) => o.value === val),
                          );
                          setErrors((prev) => ({ ...prev, availability: "" }));
                          setIsDirty(false);
                        }}
                        error={!!errors.availability}
                        helperText={errors.availability}
                      >
                        <MenuItem value="" disabled>
                          <em>Select Availability</em>
                        </MenuItem>
                        {availability.map((o) => (
                          <MenuItem
                            key={o.value ?? "null"}
                            value={o.value ?? ""}
                          >
                            {o.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid item size={{ xs: 12 }}>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Autocomplete
                          freeSolo
                          forcePopupIcon
                          size="small"
                          fullWidth
                          options={countries}
                          value={
                            jobDetails.country || localData.country || null
                          }
                          onChange={(_e, value) => {
                            if (value !== selectedCountry) {
                              handleSelectCountry(value);
                              setSelectedStateAndCity("");
                              setLocalData((prev) => ({
                                ...prev,
                                stateAndCity: "",
                              }));
                            }
                            setErrors((prev) => ({
                              ...prev,
                              country: "",
                              stateAndCity: "",
                            }));
                            setIsDirty(false);
                          }}
                          getOptionLabel={(o) => o || ""}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Country"
                              error={!!errors.country}
                              helperText={
                                errors.country ? "Country is required" : ""
                              }
                              required
                              InputLabelProps={{
                                sx: {
                                  "& .MuiFormLabel-asterisk": { color: "red" },
                                },
                              }}
                            />
                          )}
                        />
                        <Autocomplete
                          freeSolo
                          fullWidth
                          forcePopupIcon
                          size="small"
                          options={stateAndCityOptions}
                          disabled={!localData.country}
                          value={jobDetails.city || selectedStateAndCity || ""}
                          onChange={(_e, value) => {
                            setSelectedStateAndCity(value);
                            setLocalData((prev) => ({
                              ...prev,
                              stateAndCity: value || "",
                            }));
                            setErrors((prev) => ({
                              ...prev,
                              stateAndCity: "",
                            }));
                            setIsDirty(false);
                          }}
                          getOptionLabel={(o) => o || ""}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="City"
                              error={!!errors.stateAndCity}
                              helperText={
                                errors.stateAndCity ? "City is required" : ""
                              }
                            />
                          )}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* ================= SKILLS ================= */}
              <Grid item id="skills">
                <Box
                  sx={{
                    bgcolor: "#fff",
                    borderRadius: "24px",
                  }}
                >
                  {isClinicalDomain && (
                    <ClinicalSkillsPanel
                      skillMode={skillMode}
                      onSkillModeChange={handleSkillModeChange}
                      normalSkills={normalSkills}
                      selectedNormalSkills={selectedNormalSkills}
                      onNormalSkillsChange={onNormalSkillsChange}
                      primarySkills={primarySkills}
                      selectedPrimarySkills={selectedPrimarySkills}
                      onPrimarySkillsChange={onPrimarySkillsChange}
                      mandatorySkills={mandatorySkills}
                      selectedMandatorySkills={selectedMandatorySkills}
                      onMandatorySkillsChange={onMandatorySkillsChange}
                      secondarySkills={secondarySkills}
                      selectedSecondarySkills={selectedSecondarySkills}
                      onSecondarySkillsChange={onSecondarySkillsChange}
                      clinicalProgrammerMandatorySkills={
                        clinicalProgrammerMandatorySkills
                      }
                      selectedCPMSkills={selectedCPMSkills}
                      onCPMChange={onCPMChange}
                      clinicalProgrammerSecondarySkills={
                        clinicalProgrammerSecondarySkills
                      }
                      selectedCPSSkills={selectedCPSSkills}
                      onCPSChange={onCPSChange}
                      sortedEdcTools={sortedEdcTools}
                      selectedEdcTools={selectedEdcTools}
                      onEdcChange={onEdcChange}
                      therapeuticAreas={therapeuticAreas}
                      selectedTherapeuticExperience={
                        selectedTherapeuticExperience
                      }
                      onTherapeuticChange={onTherapeuticChange}
                      isClinicalDataManagement={isClinicalDataManagement}
                      isClinicalDataManagerSub={isClinicalDataManagerSub}
                      isClinicalProgrammerSub={isClinicalProgrammerSub}
                      selectedSubFunction={selectedSubFunction}
                      errors={errors}
                      setErrors={setErrors}
                      mandatoryOpen={mandatoryOpen}
                      setMandatoryOpen={setMandatoryOpen}
                      edcOpen={edcOpen}
                      setEdcOpen={setEdcOpen}
                      therapeuticOpen={therapeuticOpen}
                      setTherapeuticOpen={setTherapeuticOpen}
                    />
                  )}

                  {isNonClinicalDomain && (
                    <NonClinicalSkillsPanel
                      domainSkillOptions={domainSkillOptions}
                      selectedDomainSkills={selectedDomainSkills}
                      onDomainSkillsChange={onDomainSkillsChange}
                      errors={errors}
                      setErrors={setErrors}
                    />
                  )}
                </Box>
              </Grid>

              {/* ================= ADDITIONAL INFO ================= */}
              <Grid item id="additionalInfo">
                <Box
                  sx={{
                    bgcolor: "#fff",
                    p: { xs: 2, sm: 3 },
                    borderRadius: "24px",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 2,
                      fontWeight: 600,
                    }}
                  >
                    <ClassIcon sx={{ color: "#00A1A7" }} />
                    Additional Info
                  </Typography>

                  <Grid container spacing={2} direction="column">
                    <Grid item size={{ xs: 12 }}>
                      <Autocomplete
                        freeSolo
                        forcePopupIcon
                        size="small"
                        fullWidth
                        options={jobTypes}
                        value={
                          normalizeJobType(jobDetails?.job_type) ||
                          normalizeJobType(localData.jobType) ||
                          null
                        }
                        onChange={(e, value) => {
                          handleAutoCompleteChange("jobType")(e, value);
                          setIsDirty(false);
                        }}
                        isOptionEqualToValue={(o, v) => o === v}
                        getOptionLabel={(o) => o || ""}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Job Type"
                            error={!!errors.jobType}
                            helperText={
                              errors.jobType ? "Job Type is required" : ""
                            }
                            required
                            InputLabelProps={{
                              sx: {
                                "& .MuiFormLabel-asterisk": { color: "red" },
                              },
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item size={{ xs: 12 }}>
                      <Autocomplete
                        freeSolo
                        fullWidth
                        forcePopupIcon
                        size="small"
                        options={ModeOfWork}
                        value={
                          jobDetails?.mode_of_work ||
                          localData.modeOfWork ||
                          null
                        }
                        onChange={(e, value) => {
                          handleAutoCompleteChange("modeOfWork")(e, value);
                          setIsDirty(false);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Mode Of Work"
                            error={!!errors.modeOfWork}
                            helperText={
                              errors.modeOfWork ? "Mode is required" : ""
                            }
                            required
                            InputLabelProps={{
                              sx: {
                                "& .MuiFormLabel-asterisk": { color: "red" },
                              },
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item size={{ xs: 12 }}>
                      <Autocomplete
                        size="small"
                        fullWidth
                        disableClearable
                        options={priorityOptions}
                        value={
                          priorityOptions.find(
                            (o) => o.name === selectedPriority,
                          ) ||
                          priorityOptions[0] ||
                          null
                        }
                        onChange={(_e, nv) => {
                          setSelectedPriority(nv?.name || "High");
                          setIsDirty(false);
                        }}
                        getOptionLabel={(o) => o.name || ""}
                        isOptionEqualToValue={(o, v) => o.name === v?.name}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={<RequiredLabel>Priority</RequiredLabel>}
                            error={!!errors.priority}
                          />
                        )}
                        renderOption={(props, option) => (
                          <li {...props} style={{ fontSize: 13 }}>
                            {option.name}
                          </li>
                        )}
                      />
                    </Grid>

                    <Grid item size={{ xs: 12 }}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Box
                          ref={anchorElRef}
                          onClick={openCalendar}
                          sx={{ cursor: "pointer", width: "100%" }}
                        >
                          <TextField
                            label={<RequiredLabel>Closing Date</RequiredLabel>}
                            value={
                              closingDate
                                ? format(closingDate, "dd/MM/yyyy")
                                : ""
                            }
                            fullWidth
                            size="small"
                            readOnly
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <CalendarTodayIcon />
                                </InputAdornment>
                              ),
                            }}
                            error={!!errors.closingDate}
                            helperText={errors.closingDate}
                          />
                        </Box>
                        <DatePicker
                          open={open}
                          onClose={closeCalendar}
                          value={closingDate}
                          onChange={(nv) => {
                            setClosingDate(nv);
                            closeCalendar();
                            setErrors((prev) => ({ ...prev, closingDate: "" }));
                            setIsDirty(false);
                          }}
                          minDate={new Date()}
                          slotProps={{
                            popper: {
                              anchorEl: anchorElRef.current,
                              placement: "bottom-start",
                            },
                          }}
                          slots={{ textField: () => null }}
                        />
                      </LocalizationProvider>
                    </Grid>

                    <Grid item size={{ xs: 12 }}>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Autocomplete
                          fullWidth
                          size="small"
                          disabled={
                            localData.country?.toLowerCase() === "india"
                          }
                          options={
                            localData.country?.toLowerCase() === "india"
                              ? ["INR / Per Annum"]
                              : [
                                  "USD / Per Hour",
                                  "USD / Per Month",
                                  "USD / Per Annum",
                                ]
                          }
                          value={localData.salaryUnit || null}
                          onChange={(_e, value) => {
                            setLocalData((prev) => ({
                              ...prev,
                              salaryUnit: value || "",
                            }));
                            setIsDirty(false);
                          }}
                          renderInput={(params) => (
                            <TextField {...params} label="Salary Unit" />
                          )}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          label="Salary"
                          placeholder="per annum"
                          value={localData.salaryRange || ""}
                          onChange={(e) => {
                            setLocalData((prev) => ({
                              ...prev,
                              salaryRange: e.target.value,
                            }));
                            setIsDirty(false);
                          }}
                          InputProps={{
                            startAdornment:
                              localData.country?.toLowerCase() === "india" ? (
                                <InputAdornment position="start">
                                  ₹
                                </InputAdornment>
                              ) : null,
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* ================= TEAM ================= */}
              <Grid item id="team">
                <Box
                  sx={{
                    bgcolor: "#fff",
                    p: { xs: 2, sm: 3 },
                    borderRadius: "24px",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 2,
                      fontWeight: 600,
                    }}
                  >
                    <PeopleSharpIcon sx={{ color: "#00A1A7" }} />
                    Team
                  </Typography>

                  <Grid container direction="column" spacing={2}>
                    <Grid item size={{ xs: 12 }}>
                      <Autocomplete
                        size="small"
                        options={hiringManagerList}
                        value={localData.selectedManager || null}
                        onChange={(_e, value) => {
                          setLocalData((prev) => ({
                            ...prev,
                            selectedManager: value,
                          }));
                          setErrors((prev) => ({
                            ...prev,
                            selectedManager: "",
                          }));
                          setIsDirty(false);
                        }}
                        getOptionLabel={(o) =>
                          `${o?.name} (${o?.designation})` || ""
                        }
                        isOptionEqualToValue={(o, v) => o?.id === v?.id}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Approver"
                            required
                            error={!!errors.selectedManager}
                            helperText={errors.selectedManager && "Required"}
                            sx={{
                              "& .MuiFormLabel-asterisk": { color: "red" },
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item size={{ xs: 12 }}>
                      <Autocomplete
                        multiple
                        size="small"
                        open={openRecruiterDropdown}
                        onOpen={() => setOpenRecruiterDropdown(true)}
                        onClose={(_e, reason) => {
                          if (reason === "selectOption") return;
                          setOpenRecruiterDropdown(false);
                        }}
                        disableCloseOnSelect
                        blurOnSelect={false}
                        clearOnBlur={false}
                        openOnFocus
                        options={recruitersList.filter(
                          (u) =>
                            u.id !== localData.selectedManager?.id &&
                            u.designation !== "Super admin",
                        )}
                        value={localData.selectedRectuiter || []}
                        onChange={(_e, value = []) => {
                          setIsDirty(false);
                          const ids = value.filter(Boolean).map((i) => i.id);
                          setLocalData((prev) => ({
                            ...prev,
                            selectedRectuiter: value,
                            selectedRecruiterIds: ids,
                          }));
                          setErrors((prev) => ({
                            ...prev,
                            selectedRectuiter: "",
                          }));
                        }}
                        getOptionLabel={(o) => o?.name || ""}
                        isOptionEqualToValue={(o, v) => o?.id === v?.id}
                        renderOption={(props, option, { selected }) => (
                          <li {...props} style={{ fontSize: 12 }}>
                            <Checkbox
                              icon={checkboxBlankIcon}
                              checkedIcon={checkboxCheckedIcon}
                              style={{ marginRight: 8 }}
                              checked={selected}
                              size="small"
                              sx={{ padding: "0px 5px" }}
                            />
                            {`${option?.name} (${option?.designation})`}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="TA Team"
                            error={!!errors.selectedRectuiter}
                            helperText={errors.selectedRectuiter && "Required"}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* ================= JOB DESCRIPTION ================= */}
              <Grid item id="jobDescription">
                <Box
                  sx={{
                    bgcolor: "#fff",
                    p: { xs: 2, sm: 3 },
                    borderRadius: "24px",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  {/* ── Header ── */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 3,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        fontWeight: 600,
                      }}
                    >
                      <DescriptionSharpIcon sx={{ color: "#00A1A7" }} />
                      Job Description
                    </Typography>
                    <Chip
                      label="Optional"
                      size="small"
                      sx={{
                        bgcolor: "#F0FDF4",
                        color: "#16A34A",
                        border: "1px solid #BBF7D0",
                        fontSize: 11,
                        fontWeight: 600,
                        height: 22,
                      }}
                    />
                  </Box>

                  {/* ── Text instruction box ── */}
                  <Box
                    sx={{
                      border: instructions
                        ? "1.5px solid #00A1A7"
                        : "1.5px solid #E5E7EB",
                      borderRadius: "16px",
                      p: 2,
                      mb: 2,
                      bgcolor: instructions ? "#f0fffe" : "#FAFAFA",
                      transition: "all 0.2s",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: "#6B7280",
                        mb: 0.5,
                        display: "block",
                        letterSpacing: 0.3,
                        textTransform: "uppercase",
                        fontSize: 10,
                      }}
                    >
                      Write Instructions
                    </Typography>
                    <TextField
                      placeholder="Describe the role, responsibilities, requirements, and any specific instructions for candidates..."
                      fullWidth
                      multiline
                      rows={4}
                      variant="standard"
                      value={instructions}
                      onChange={(e) => {
                        handleInstructionsChange(e);
                        setIsDirty(false);
                      }}
                      error={!!errors.instructions}
                      inputProps={{ maxLength: maxLength + 100 }}
                      InputProps={{ disableUnderline: true }}
                      sx={{
                        "& .MuiInputBase-input": {
                          fontSize: 13,
                          color: "#111827",
                          lineHeight: 1.6,
                        },
                      }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: 1,
                        pt: 1,
                        borderTop: "1px solid #E5E7EB",
                      }}
                    >
                      {errors.instructions ? (
                        <Typography variant="caption" color="error">
                          {errors.instructions}
                        </Typography>
                      ) : (
                        <Typography
                          variant="caption"
                          sx={{ color: "#9CA3AF", fontSize: 11 }}
                        >
                          Be specific — better descriptions attract better
                          candidates
                        </Typography>
                      )}
                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            instructions.length > maxLength
                              ? "#EF4444"
                              : "#9CA3AF",
                          fontWeight: 600,
                          fontSize: 11,
                        }}
                      >
                        {instructions.length}/{maxLength}
                      </Typography>
                    </Box>
                  </Box>

                  {/* ── OR divider ── */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      my: 2.5,
                    }}
                  >
                    <Box sx={{ flex: 1, height: "1px", bgcolor: "#E5E7EB" }} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#9CA3AF",
                        fontWeight: 600,
                        fontSize: 12,
                        px: 1,
                        bgcolor: "#fff",
                      }}
                    >
                      OR
                    </Typography>
                    <Box sx={{ flex: 1, height: "1px", bgcolor: "#E5E7EB" }} />
                  </Box>

                  {/* ── Upload box ── */}
                  <Box
                    sx={{
                      border: file
                        ? "1.5px solid #00A1A7"
                        : "1.5px dashed #D1D5DB",
                      borderRadius: "16px",
                      p: 3,
                      textAlign: "center",
                      bgcolor: file ? "#f0fffe" : "#FAFAFA",
                      transition: "all 0.2s",
                      "&:hover": {
                        borderColor: "#00A1A7",
                        bgcolor: "#f0fffe",
                      },
                    }}
                  >
                    {!file ? (
                      <Button
                        variant="text"
                        component="label"
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 1,
                          width: "100%",
                          textTransform: "none",
                          color: "#6B7280",
                          "&:hover": {
                            bgcolor: "transparent",
                            color: "#00A1A7",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: "12px",
                            bgcolor: "#E0F7FA",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mb: 0.5,
                          }}
                        >
                          <CloudUploadIcon
                            sx={{ fontSize: 26, color: "#00A1A7" }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="#111827"
                        >
                          Upload Job Description
                        </Typography>
                        <Typography variant="caption" color="#9CA3AF">
                          PDF, DOC, DOCX, TXT, XLSX — max 10MB
                        </Typography>
                        <input
                          type="file"
                          hidden
                          onChange={(e) => {
                            handleFileChange(e);
                            setIsDirty(false);
                          }}
                          accept=".pdf,.txt,.doc,.docx,.xlsx"
                        />
                      </Button>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "10px",
                            bgcolor: "#E0F7FA",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <DescriptionSharpIcon
                            sx={{ fontSize: 20, color: "#00A1A7" }}
                          />
                        </Box>
                        <Box sx={{ textAlign: "left" }}>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="#111827"
                            noWrap
                            sx={{ maxWidth: 220 }}
                          >
                            {file.name}
                          </Typography>
                          <Typography variant="caption" color="#9CA3AF">
                            {(file.size / 1024).toFixed(1)} KB
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => setFile(null)}
                          sx={{
                            ml: 1,
                            color: "#EF4444",
                            bgcolor: "#FEF2F2",
                            "&:hover": { bgcolor: "#FEE2E2" },
                          }}
                        >
                          <CloseIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    )}
                    {fileError && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 1, display: "block" }}
                      >
                        {fileError}
                      </Typography>
                    )}
                  </Box>

                  {/* ── Save as Template ── */}
                  {!isEditMode && (
                    <Box
                      sx={{
                        mt: 2.5,
                        border: saveAsTemplate
                          ? "1.5px solid #00A1A7"
                          : "1.5px dashed #E5E7EB",
                        borderRadius: "16px",
                        p: 2,
                        bgcolor: saveAsTemplate ? "#f0fffe" : "#FAFAFA",
                        transition: "all 0.2s",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: "10px",
                              bgcolor: saveAsTemplate ? "#E0F7FA" : "#F3F4F6",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <BookmarkBorderIcon
                              sx={{
                                fontSize: 18,
                                color: saveAsTemplate ? "#00A1A7" : "#9CA3AF",
                              }}
                            />
                          </Box>
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              color={saveAsTemplate ? "#00A1A7" : "#111827"}
                            >
                              Save as Template
                            </Typography>
                            <Typography
                              variant="caption"
                              color="#9CA3AF"
                              sx={{ fontSize: 11 }}
                            >
                              Reuse this setup for future job postings
                            </Typography>
                          </Box>
                        </Box>
                        <Switch
                          checked={saveAsTemplate}
                          onChange={(e) => {
                            setSaveAsTemplate(e.target.checked);
                            if (!e.target.checked) {
                              setTemplateName("");
                              setTemplateNameError("");
                              setErrors((prev) => ({
                                ...prev,
                                templateName: "",
                              }));
                            }
                          }}
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": {
                              color: "#00A1A7",
                            },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                              {
                                backgroundColor: "#00A1A7",
                              },
                          }}
                        />
                      </Box>

                      {saveAsTemplate && (
                        <Box sx={{ mt: 2 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label={<RequiredLabel>Template Name</RequiredLabel>}
                            placeholder="e.g. Senior Statistical Programmer – Biostatistics"
                            value={templateName}
                            onChange={(e) => {
                              setTemplateName(e.target.value);
                              setTemplateNameError("");
                              setErrors((prev) => ({
                                ...prev,
                                templateName: "",
                              }));
                            }}
                            error={!!errors.templateName || !!templateNameError}
                            helperText={
                              errors.templateName ||
                              templateNameError ||
                              "This template will be available for future job postings"
                            }
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "10px",
                                bgcolor: "#fff",
                              },
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          ) : (
            <SummaryPage
              summary={jobDetails.summary}
              jobDetailsId={jobDetailsId}
              setActiveStep={setActiveStep}
              toggleCreateJobHandler={toggleCreateJobHandler}
              setIsEditMode={setIsEditMode}
              setIsDirty={setIsDirty}
              setFromSummary={setFromSummary}
            />
          )}
        </Box>

        <Dialog
          open={templateDialogOpen}
          onClose={() => setTemplateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 600, color: "#00A1A7" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <BookmarkBorderIcon />
              Saved Templates
            </Box>
          </DialogTitle>

          <DialogContent dividers>
            {templates.length === 0 ? (
              <Typography>No templates available</Typography>
            ) : (
              templates.map((template) => {
                const jd = template.job_details;
                const tDomain = jd.domain || "clinical";
                const domainObj = DOMAINS.find((d) => d.value === tDomain);
                const tId = template.template_id;

                return (
                  <Paper
                    key={template.template_id}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      cursor: "pointer",
                      border: "1px solid #e5e7eb",
                      boxShadow: "none",

                      "&:hover": {
                        backgroundColor: "#f7ffff",
                        borderColor: "#00A1A7",
                      },
                    }}
                    onClick={() => applyTemplate(template)}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        {domainObj && (
                          <DomainIcon
                            iconType={domainObj.iconType}
                            sx={{
                              fontSize: 15,
                              color: "#00A1A7",
                            }}
                          />
                        )}

                        <Typography
                          sx={{ fontSize: 12 }}
                          fontWeight={600}
                          color="#00A1A7"
                        >
                          {template.template_name}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Typography
                          sx={{ fontSize: 11 }}
                          variant="body2"
                          fontWeight={500}
                          color="text.secondary"
                        >
                          {template.created_at
                            ? format(
                                new Date(template.created_at),
                                "dd/MM/yyyy",
                              )
                            : ""}
                        </Typography>

                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTemplate(tId);
                          }}
                          sx={{
                            color: "#ef4444",

                            "&:hover": {
                              background: "#fee2e2",
                            },
                          }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    </Box>

                    <Typography
                      sx={{ fontSize: 12 }}
                      variant="body2"
                      color="text.secondary"
                      fontWeight={500}
                    >
                      {domainObj?.label}
                      {jd.function ? ` › ${jd.function}` : ""}
                      {jd.sub_function ? ` › ${jd.sub_function}` : ""}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.5,
                        mt: 0.5,
                        flexWrap: "wrap",
                      }}
                    >
                      <Chip
                        label={domainObj?.label || tDomain}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: 10,
                          bgcolor: "#f0fffe",
                          color: "#00A1A7",
                          border: "1px solid #b2ebf2",
                        }}
                      />

                      {jd.mode && (
                        <Chip
                          label={
                            jd.mode === "normal" ? "⚡ Standard" : "🎚 Advanced"
                          }
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: 10,
                            bgcolor:
                              jd.mode === "normal" ? "#fff8e1" : "#e8f5e9",

                            color: jd.mode === "normal" ? "#f57f17" : "#2e7d32",

                            border: `1px solid ${
                              jd.mode === "normal" ? "#ffe082" : "#a5d6a7"
                            }`,
                          }}
                        />
                      )}
                    </Box>
                  </Paper>
                );
              })
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setTemplateDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* ================= BOTTOM BUTTONS ================= */}
        {activeStep === 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              mt: 3,
              mb: 2,
            }}
          >
            {isEditMode ? (
              <>
                <Button
                  variant="contained"
                  sx={{
                    background: "#00A1A7",
                    borderRadius: "12px",
                  }}
                  onClick={() => {
                    if (formData?.fromMatchedEdit) {
                      navigate("/recruit/dashboard/matched-candidates", {
                        state: {
                          job_details_id: jobDetailsId || matchedJobId,
                        },
                      });
                      return;
                    }

                    setIsDirty(false);
                    setIsEditMode(false);
                    setActiveStep(1);
                  }}
                >
                  Cancel
                </Button>

                <Button
                  variant="contained"
                  sx={{
                    background: "#00A1A7",
                    borderRadius: "12px",
                  }}
                  onClick={handleUpdateJob}
                  disabled={isDirty}
                >
                  Update
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                sx={{
                  background: "#00A1A7",
                  borderRadius: "12px",
                  px: 4,
                  py: 1,
                  fontWeight: 600,
                  textTransform: "none",
                }}
                onClick={handleNext}
              >
                {isNonClinicalDomain ? "Submit Job" : "Create"}
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
  {
    /* ✅ closes return */
  }
});

export default CreateRequisition;
