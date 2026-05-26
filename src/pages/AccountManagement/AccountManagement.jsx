import React, { useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  ListItemButton,
  Checkbox,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Grid,
  MenuItem,
  Snackbar,
  Select,
  FormControl,
  FormHelperText,
  Divider,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import BusinessIcon from "@mui/icons-material/Business";
import Person2OutlinedIcon from "@mui/icons-material/Person2Outlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import WcOutlinedIcon from "@mui/icons-material/WcOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { CheckCircleOutlineOutlined } from "@mui/icons-material";

import {
  useAssignOrganisationMutation,
  useGetAllInternalUsersQuery,
  useGetMyOrganisationsQuery,
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
} from "../../redux/services/requisition/requisition";
import { useCreateUserMutation } from "../../redux/services/userManagement/userManagement";

// ── ADD THIS IMPORT from your userManagement service ──
import { useUpdateUserByAdminMutation } from "../../redux/services/userManagement/userManagement";

import ReusableMRT from "../../components/table";

/* ─────────────────────── Design tokens ─────────────────────── */
const C = {
  accent: "#FF5F1F",
  accentSoft: "#FFF0E8",
  accentMid: "#FFD6BF",
  border: "#E8E8EC",
  bg: "#F7F7F9",
  white: "#FFFFFF",
  primary: "#111118",
  secondary: "#5C5C70",
  tertiary: "#9696A6",
  green: "#0F6E56",
  greenSoft: "#E7F8EE",
};

const T = {
  label: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: C.tertiary,
  },
  value: { fontSize: 14, fontWeight: 600, color: C.primary },
  valueSm: { fontSize: 13, fontWeight: 500, color: C.primary },
  meta: { fontSize: 11, fontWeight: 400, color: C.tertiary },
};

/* ─────────────────────── Helpers ─────────────────────── */
function getInitials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}
function roleLabel(role = "") {
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const DIAL_CODES = [
  { code: "+91", label: "🇮🇳 +91" },
  { code: "+1",  label: "🇺🇸 +1"  },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+61", label: "🇦🇺 +61" },
  { code: "+971",label: "🇦🇪 +971"},
  { code: "+65", label: "🇸🇬 +65" },
  { code: "+49", label: "🇩🇪 +49" },
  { code: "+33", label: "🇫🇷 +33" },
  { code: "+81", label: "🇯🇵 +81" },
  { code: "+86", label: "🇨🇳 +86" },
];
function splitPhone(fullPhone = "") {
  if (!fullPhone) return { dialCode: "+91", local: "" };
  const match = DIAL_CODES.find((d) => fullPhone.startsWith(d.code));
  if (match) return { dialCode: match.code, local: fullPhone.slice(match.code.length) };
  return { dialCode: "+91", local: fullPhone.replace(/^\+/, "") };
}

const GENDER_OPTIONS     = ["Male", "Female", "Other", "Prefer not to say"];
const EMP_TYPE_OPTIONS   = ["Full-time", "Part-time", "Contract", "Intern"];
const EMP_STATUS_OPTIONS = ["Active", "Inactive", "On Leave", "Terminated"];
const TZ_OPTIONS = [
  "UTC","Asia/Kolkata","America/New_York","America/Los_Angeles",
  "Europe/London","Europe/Paris","Asia/Tokyo","Australia/Sydney",
];
const USER_ROLE_OPTIONS = [
  { value: "accountmanager", label: "AccountManager" },
  { value: "super_admin",    label: "Super Admin"    },
];

/* ─────────────────────── Field styles ─────────────────────── */
const editFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px", fontSize: 13, background: "#FFF7F2",
    transition: "all 0.2s ease",
    "& fieldset": { borderColor: "#FFD6BF", borderWidth: "1.5px" },
    "&:hover": { background: "#FFF1E8" },
    "&:hover fieldset": { borderColor: "#FF8A4C" },
    "&.Mui-focused": { background: "#fff", boxShadow: "0 0 0 3px rgba(255,95,31,0.10)" },
    "&.Mui-focused fieldset": { borderColor: C.accent, borderWidth: "2px" },
  },
  "& .MuiInputBase-input": { py: 1.2, fontWeight: 500, color: C.primary },
};
const errorFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px", fontSize: 13, background: "#FFF5F5",
    "& fieldset": { borderColor: "#FCA5A5", borderWidth: "1.5px" },
    "&.Mui-focused fieldset": { borderColor: "#EF4444", borderWidth: "2px" },
  },
  "& .MuiInputBase-input": { py: 1.2, fontWeight: 500, color: C.primary },
};

/* ─────────────────────── Shared sub-components ─────────────────────── */
function ReadField({ label, value }) {
  return (
    <Box>
      <Typography sx={{ ...T.label, mb: "3px" }}>{label}</Typography>
      <Typography sx={value ? T.value : { ...T.value, color: C.tertiary }}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

function EditField({ label, fieldKey, select, options = [], form, setForm, error }) {
  const sx = error ? errorFieldSx : editFieldSx;
  return (
    <Box>
      <Typography sx={{ ...T.label, mb: "5px" }}>{label}</Typography>
      {select ? (
        <TextField
          select size="small" fullWidth
          value={form[fieldKey] ?? ""}
          onChange={(e) => setForm((p) => ({ ...p, [fieldKey]: e.target.value }))}
          sx={sx} error={!!error} helperText={error}
        >
          <MenuItem value=""><em style={{ color: C.tertiary, fontStyle: "normal" }}>—</em></MenuItem>
          {options.map((o) => (
            <MenuItem key={typeof o === "string" ? o : o.value} value={typeof o === "string" ? o : o.value}>
              {typeof o === "string" ? o : o.label}
            </MenuItem>
          ))}
        </TextField>
      ) : (
        <TextField
          size="small" fullWidth
          value={form[fieldKey] ?? ""}
          onChange={(e) => setForm((p) => ({ ...p, [fieldKey]: e.target.value }))}
          sx={sx} error={!!error} helperText={error}
        />
      )}
    </Box>
  );
}

function PhoneEditField({ dialCode, setDialCode, localPhone, setLocalPhone, error }) {
  return (
    <Box>
      <Typography sx={{ ...T.label, mb: "5px" }}>Phone</Typography>
      <Box sx={{ display: "flex", gap: 1 }}>
        <FormControl size="small" sx={{ minWidth: 108 }}>
          <Select
            value={dialCode} onChange={(e) => setDialCode(e.target.value)}
            sx={{
              borderRadius: "10px", fontSize: 13,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: error ? "#EF4444" : C.border },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#D1D5DB" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: C.accent },
            }}
          >
            {DIAL_CODES.map((d) => <MenuItem key={d.code} value={d.code}>{d.label}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField
          size="small" fullWidth placeholder="9876543210"
          value={localPhone}
          onChange={(e) => setLocalPhone(e.target.value.replace(/\D/g, ""))}
          error={!!error} helperText={error}
          inputProps={{ inputMode: "numeric", maxLength: 15 }}
          sx={error ? errorFieldSx : editFieldSx}
        />
      </Box>
    </Box>
  );
}

function ProfileInfoCard({ label, value, icon }) {
  return (
    <Box sx={{
      p: "12px 14px", borderRadius: "12px", background: C.white,
      border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 1.5,
      transition: "0.2s ease",
      "&:hover": { borderColor: "#FFB38A", boxShadow: "0 4px 14px rgba(255,95,31,0.07)" },
    }}>
      <Box sx={{ width: 36, height: 36, borderRadius: "9px", flexShrink: 0, background: "#F3F4F6",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ ...T.label, mb: "2px" }}>{label}</Typography>
        <Typography sx={{ ...T.value, whiteSpace: "nowrap", overflow: "hidden",
          textOverflow: "ellipsis", color: value ? C.primary : C.tertiary }}>
          {value || "—"}
        </Typography>
      </Box>
    </Box>
  );
}

/* ════════════════════════════════════════════
   ROOT
════════════════════════════════════════════ */
export default function AccountManagement() {
  const [tab, setTab] = useState(0);
  return (
    <Box sx={{ p: 1 }}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{
        mb: "16px", minHeight: 36,
        "& .MuiTabs-indicator": { backgroundColor: C.accent, height: 2, borderRadius: 1 },
        "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: 13,
          minHeight: 36, px: "14px", color: C.secondary, "&.Mui-selected": { color: C.accent } },
      }}>
        <Tab icon={<Person2OutlinedIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="My Profile" />
        <Tab icon={<GroupOutlinedIcon    sx={{ fontSize: 15 }} />} iconPosition="start" label="Users"      />
      </Tabs>
      {tab === 0 && <MyProfileTab />}
      {tab === 1 && <UsersTab />}
    </Box>
  );
}

/* ════════════════════════════════════════════
   MY PROFILE TAB  (unchanged)
════════════════════════════════════════════ */
function MyProfileTab() {
  const { data, isLoading, isError, refetch } = useGetMyProfileQuery();
  const [updateProfile, { isLoading: saving }] = useUpdateMyProfileMutation();
  const profile = data?.data ?? {};
  const [editing, setEditing]     = useState(false);
  const [form, setForm]           = useState({});
  const [dialCode, setDialCode]   = useState("+91");
  const [localPhone, setLocalPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });

  const startEdit = () => {
    const { dialCode: dc, local } = splitPhone(profile.phone);
    setDialCode(dc); setLocalPhone(local); setPhoneError("");
    setForm({
      first_name: profile.first_name ?? "", last_name: profile.last_name ?? "",
      emp_id: profile.emp_id ?? "", department: profile.department ?? "",
      emp_type: profile.emp_type ?? "", emp_status: profile.emp_status ?? "",
      gender: profile.gender ?? "", emp_designation: profile.emp_designation ?? "",
      time_zone: profile.time_zone ?? "",
    });
    setEditing(true);
  };

  const handleSave = async () => {
    if (localPhone && (localPhone.length < 7 || localPhone.length > 15)) {
      setPhoneError("Enter a valid phone number (7–15 digits)"); return;
    }
    setPhoneError("");
    const nn = (v) => (v === "" ? null : v);
    const payload = {
      first_name: nn(form.first_name), last_name: nn(form.last_name),
      phone: localPhone ? `${dialCode}${localPhone}` : null,
      emp_id: nn(form.emp_id), department: nn(form.department),
      emp_type: nn(form.emp_type), emp_status: nn(form.emp_status),
      gender: nn(form.gender), emp_designation: nn(form.emp_designation),
      time_zone: nn(form.time_zone),
    };
    try {
      await updateProfile(payload).unwrap();
      await refetch();
      setToast({ open: true, msg: "Profile updated successfully!", severity: "success" });
      setEditing(false);
    } catch (err) {
      setToast({ open: true, msg: err?.data?.message ?? "Failed to update profile.", severity: "error" });
    }
  };

  if (isLoading && !profile?.full_name)
    return <Box display="flex" justifyContent="center" py={8}><CircularProgress sx={{ color: C.accent }} /></Box>;
  if (isError)
    return <Alert severity="error" sx={{ borderRadius: "10px" }}>Failed to load profile.</Alert>;

  const SecLabel = ({ children }) => <Typography sx={{ ...T.label, mb: "12px" }}>{children}</Typography>;

  return (
    <Box sx={{ backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: "14px", overflow: "hidden" }}>
      <Box sx={{ p: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: C.accent, fontSize: 16, fontWeight: 700 }}>
            {getInitials(profile.full_name)}
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: C.primary, lineHeight: 1.2 }}>{profile.full_name || "—"}</Typography>
            <Typography sx={T.meta}>{profile.email}</Typography>
          </Box>
        </Box>
        {!editing ? (
          <Button size="small" startIcon={<EditOutlinedIcon sx={{ fontSize: 13 }} />} onClick={startEdit}
            sx={{ textTransform: "none", fontSize: 12, fontWeight: 600, color: C.accent,
              border: `1px solid ${C.accent}`, borderRadius: "8px", "&:hover": { backgroundColor: C.accentSoft } }}>
            Edit Profile
          </Button>
        ) : (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button size="small" onClick={() => { setEditing(false); setPhoneError(""); }}
              sx={{ textTransform: "none", fontSize: 12, fontWeight: 600, color: C.secondary,
                border: `1px solid ${C.border}`, borderRadius: "8px", "&:hover": { backgroundColor: "#F9FAFB" } }}>
              Cancel
            </Button>
            <Button size="small" onClick={handleSave} disabled={saving}
              startIcon={saving ? <CircularProgress size={12} sx={{ color: "#fff" }} /> : <SaveOutlinedIcon sx={{ fontSize: 13 }} />}
              sx={{ textTransform: "none", fontSize: 12, fontWeight: 600, color: "#fff", backgroundColor: C.accent,
                borderRadius: "8px", "&:hover": { backgroundColor: "#E54E10" },
                "&:disabled": { backgroundColor: "#F3F4F6", color: C.tertiary } }}>
              Save Changes
            </Button>
          </Box>
        )}
      </Box>

      <Box sx={{ p: "20px 24px" }}>
        <SecLabel>Basic Information</SecLabel>
        <Grid container spacing={2} mb="20px">
          {editing ? (
            <>
              <Grid item size={{ xs: 12, sm: 6 }}><EditField label="First Name" fieldKey="first_name" form={form} setForm={setForm} /></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><EditField label="Last Name"  fieldKey="last_name"  form={form} setForm={setForm} /></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><PhoneEditField dialCode={dialCode} setDialCode={setDialCode} localPhone={localPhone} setLocalPhone={setLocalPhone} error={phoneError} /></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><EditField label="Gender" fieldKey="gender" form={form} setForm={setForm} select options={GENDER_OPTIONS} /></Grid>
            </>
          ) : (
            <>
              <Grid item size={{ xs: 12, sm: 6 }}><ProfileInfoCard label="First Name" value={profile.first_name} icon={<PersonOutlineOutlinedIcon sx={{ color: "#FF6B2C", fontSize: 18 }} />} /></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><ProfileInfoCard label="Last Name"  value={profile.last_name}  icon={<PersonOutlineOutlinedIcon sx={{ color: "#FF6B2C", fontSize: 18 }} />} /></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><ProfileInfoCard label="Phone"  value={profile.phone}  icon={<PhoneOutlinedIcon sx={{ color: "#10B981", fontSize: 18 }} />} /></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><ProfileInfoCard label="Gender" value={profile.gender} icon={<WcOutlinedIcon     sx={{ color: "#8B5CF6", fontSize: 18 }} />} /></Grid>
            </>
          )}
        </Grid>

        <Box sx={{ borderTop: `1px solid ${C.border}`, mb: "20px" }} />
        <SecLabel>Employment Details</SecLabel>
        <Grid container spacing={2}>
          {editing ? (
            <>
              <Grid item size={{ xs: 12, sm: 6 }}><EditField label="Employee ID"    fieldKey="emp_id"          form={form} setForm={setForm} /></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><EditField label="Department"     fieldKey="department"      form={form} setForm={setForm} /></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><EditField label="Designation"    fieldKey="emp_designation" form={form} setForm={setForm} /></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><EditField label="Employee Type"  fieldKey="emp_type"        form={form} setForm={setForm} select options={EMP_TYPE_OPTIONS}   /></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><EditField label="Status"         fieldKey="emp_status"      form={form} setForm={setForm} select options={EMP_STATUS_OPTIONS} /></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><EditField label="Time Zone"      fieldKey="time_zone"       form={form} setForm={setForm} select options={TZ_OPTIONS}         /></Grid>
            </>
          ) : (
            <>
              <Grid item size={{ xs: 12, sm: 6 }}><ProfileInfoCard label="Employee ID"   value={profile.emp_id}          icon={<BadgeOutlinedIcon        sx={{ color: "#3B82F6", fontSize: 18 }} />} /></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><ProfileInfoCard label="Department"    value={profile.department}      icon={<WorkOutlineOutlinedIcon  sx={{ color: "#F59E0B", fontSize: 18 }} />} /></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><ProfileInfoCard label="Designation"   value={profile.emp_designation} icon={<WorkOutlineOutlinedIcon  sx={{ color: "#EF4444", fontSize: 18 }} />} /></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><ProfileInfoCard label="Employee Type" value={profile.emp_type}        icon={<BadgeOutlinedIcon        sx={{ color: "#14B8A6", fontSize: 18 }} />} /></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><ProfileInfoCard label="Status"        value={profile.emp_status}      icon={<BadgeOutlinedIcon        sx={{ color: "#6366F1", fontSize: 18 }} />} /></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><ProfileInfoCard label="Time Zone"     value={profile.time_zone}       icon={<PublicOutlinedIcon       sx={{ color: "#EC4899", fontSize: 18 }} />} /></Grid>
            </>
          )}
        </Grid>
      </Box>

      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={toast.severity} sx={{ borderRadius: "10px", fontSize: 13 }}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}

/* ════════════════════════════════════════════
   USERS TAB
════════════════════════════════════════════ */
function UsersTab() {
  const [drawerUser,  setDrawerUser]  = useState(null);
  const [editUser,    setEditUser]    = useState(null); // ← new
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });

  const { data, isLoading, isError, refetch: refetchUsers } = useGetAllInternalUsersQuery();
  const users = data?.data ?? [];

  if (isLoading)
    return <Box display="flex" justifyContent="center" py={10}><CircularProgress sx={{ color: C.accent }} /></Box>;
  if (isError)
    return <Alert severity="error">Failed to load users.</Alert>;

  const columnData = [
    {
      accessorKey: "full_name",
      header: "User",
      Cell: ({ row }) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: C.accent, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
            {getInitials(row.original.full_name)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: C.primary,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {row.original.full_name}
            </Typography>
            <Typography sx={{ fontSize: 11, color: C.tertiary,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {row.original.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      accessorKey: "user_role",
      header: "Role",
      Cell: ({ cell }) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 13, color: C.accent, flexShrink: 0 }} />
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: C.secondary, textTransform: "capitalize" }}>
            {roleLabel(cell.getValue() ?? "")}
          </Typography>
        </Box>
      ),
    },
    {
      accessorKey: "organisations_count",
      header: "Organisations",
      size: 250,
      Cell: ({ row }) => {
        const orgs = row.original.organisations ?? [];
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, mr: "3px" }}>
              <BusinessIcon sx={{ fontSize: 12, color: C.tertiary }} />
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: C.secondary }}>
                {row.original.organisations_count}
              </Typography>
            </Box>
            {orgs.slice(0, 2).map((o) => (
              <Box key={o.organisation_id} sx={{ fontSize: 10, fontWeight: 600, px: "7px", py: "2px",
                borderRadius: "6px", backgroundColor: C.accentSoft, color: C.accent, whiteSpace: "nowrap" }}>
                {o.organisation_name}
              </Box>
            ))}
            <Tooltip title={orgs.slice(2).map((o) => o.organisation_name).join(", ")} placement="top">
            {orgs.length > 2 && (
              <Box sx={{ fontSize: 10, fontWeight: 600, px: "7px", py: "2px",
                borderRadius: "6px", backgroundColor: "#F3F4F6", color: C.tertiary }}>
                +{orgs.length - 2}
              </Box>
            )}
            </Tooltip>
          </Box>
        );
      },
    },
    {
      id: "assign",
      header: "Assign Org",
      enableColumnFilter: false,
      enableSorting: false,
      Cell: ({ row }) => (
        <Button size="small"
          startIcon={<Person2OutlinedIcon sx={{ fontSize: 12 }} />}
          onClick={(e) => { e.stopPropagation(); setDrawerUser(row.original); }}
          sx={{ textTransform: "none", fontSize: 11, fontWeight: 600, color: C.accent,
            border: `1px solid ${C.accent}`, borderRadius: "8px",
            "&:hover": { backgroundColor: C.accentSoft } }}>
          Assign Org
        </Button>
      ),
    },
    {
      id: "update",
      header: "Update",
      enableColumnFilter: false,
      enableSorting: false,
      Cell: ({ row }) => (
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); setEditUser(row.original); }}
          sx={{ color: C.accent, "&:hover": { backgroundColor: C.accentSoft, borderRadius: "8px" } }}
        >
          <EditOutlinedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center",mb:1,mt:-2 }}>
        <Button size="small" startIcon={<PersonAddOutlinedIcon sx={{ fontSize: 13 }} />}
          onClick={() => setAddUserOpen(true)}
          sx={{ textTransform: "none", fontSize: 12, fontWeight: 600, color: C.white,
            backgroundColor: C.accent, borderRadius: "8px", px: "14px",
            boxShadow: "0 2px 8px rgba(255,95,31,0.25)",
            "&:hover": { backgroundColor: "#E54E10", boxShadow: "0 4px 12px rgba(255,95,31,0.35)" } }}>
          Add User
        </Button>
      </Box>

      <Box sx={{ border: `1px solid ${C.border}`, borderRadius: "12px", overflow: "hidden", backgroundColor: C.white }}>
        <ReusableMRT
          data={users}
          columnData={columnData}
          enableRowActions={false}
          enableRowClickModal={false}
          onRowClick={(row) => setDrawerUser(row)}
          height="calc(100vh - 175px)"
        />
      </Box>

      {/* Assign Org dialog */}
      <AssignOrgDialog user={drawerUser} onClose={() => setDrawerUser(null)} />

      {/* ── NEW: Edit User dialog ── */}
      <EditUserDialog
        user={editUser}
        onClose={() => setEditUser(null)}
        onSuccess={(msg) => {
          setToast({ open: true, msg, severity: "success" });
          refetchUsers();
        }}
        onError={(msg) => setToast({ open: true, msg, severity: "error" })}
      />

      <AddUserDialog
        open={addUserOpen}
        onClose={() => setAddUserOpen(false)}
        onSuccess={(msg) => { setToast({ open: true, msg, severity: "success" }); refetchUsers(); }}
        onError={(msg) => setToast({ open: true, msg, severity: "error" })}
      />

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={toast.severity} sx={{ borderRadius: "10px", fontSize: 13 }}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
}

/* ════════════════════════════════════════════
   EDIT USER DIALOG
   PUT /acc/update_user_details_by_admin/{user_id}
════════════════════════════════════════════ */
function EditUserDialog({ user, onClose, onSuccess, onError }) {
  const [form, setForm]             = useState({});
  const [dialCode, setDialCode]     = useState("+91");
  const [localPhone, setLocalPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [errors, setErrors]         = useState({});

  // ── RTK mutation — add this endpoint to your userManagement service ──
  const [updateUserByAdmin, { isLoading: saving }] = useUpdateUserByAdminMutation();

  /* Populate form when `user` changes */
  React.useEffect(() => {
    if (!user) return;

    const { dialCode: dc, local } = splitPhone(user.phone ?? "");
    setDialCode(dc);
    setLocalPhone(local);
    setPhoneError("");
    setErrors({});

    // ── Derive first/last name ──
    // API may return full_name only, or separate first_name/last_name
    let firstName = user.first_name ?? "";
    let lastName  = user.last_name  ?? "";
    if (!firstName && !lastName && user.full_name) {
      const parts = user.full_name.trim().split(/\s+/);
      firstName = parts[0] ?? "";
      lastName  = parts.slice(1).join(" ");
    }

    // ── Normalise user_role to match USER_ROLE_OPTIONS values ──
    // API may return "AccountManager", "account_manager", "accountmanager", "super_admin", "Super Admin" etc.
    const rawRole = (user.user_role ?? "").toLowerCase().replace(/[\s_-]/g, "");
    const normaliseRole = (raw) => {
      if (raw === "accountmanager") return "accountmanager";
      if (raw === "superadmin")     return "super_admin";
      return user.user_role ?? ""; // fallback: use as-is
    };

    setForm({
      first_name:      firstName,
      last_name:       lastName,
      user_role:       normaliseRole(rawRole),
      emp_id:          user.emp_id          ?? "",
      department:      user.department      ?? "",
      emp_type:        user.emp_type        ?? "",
      emp_status:      user.emp_status      ?? "",
      gender:          user.gender          ?? "",
      emp_designation: user.emp_designation ?? "",
      time_zone:       user.time_zone       ?? "",
    });
  }, [user]);

  const handleClose = () => {
    setErrors({});
    setPhoneError("");
    onClose();
  };

  const handleSave = async () => {
    /* Basic validation */
    const errs = {};
    if (!form.first_name) errs.first_name = "Required";
    if (!form.last_name)  errs.last_name  = "Required";
    if (!form.user_role)  errs.user_role  = "Required";
    if (localPhone && (localPhone.length < 7 || localPhone.length > 15))
      errs.phone = "Enter a valid phone number (7–15 digits)";

    if (Object.keys(errs).length) { setErrors(errs); if (errs.phone) setPhoneError(errs.phone); return; }

    const nn = (v) => (v === "" ? null : v);

    // API rejects phone with leading "+" — strip it before sending
    // stored: "+918877654467" → send: "918877654467"
    const buildPhone = () => {
      if (!localPhone) return null;
      const full = `${dialCode}${localPhone}`; // e.g. "+918877654467"
      return full.replace(/^\+/, "");           // → "918877654467"
    };

    const payload = {
      first_name:      nn(form.first_name),
      last_name:       nn(form.last_name),
      phone:           buildPhone(),
      user_role:       nn(form.user_role),
      emp_id:          nn(form.emp_id),
      department:      nn(form.department),
      emp_type:        nn(form.emp_type),
      emp_status:      nn(form.emp_status),
      gender:          nn(form.gender),
      emp_designation: nn(form.emp_designation),
      time_zone:       nn(form.time_zone),
    };

    try {
      await updateUserByAdmin({ userId: user.id, body: payload }).unwrap();
      onSuccess?.(`${form.first_name} ${form.last_name} updated successfully!`);
      handleClose();
    } catch (err) {
      onError?.(err?.data?.message ?? "Failed to update user.");
    }
  };

  return (
    <Dialog
      open={!!user}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden" } }}
    >
      {/* ── Header ── */}
      <DialogTitle sx={{ px: "24px", pt: "24px", pb: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: "10px", backgroundColor: C.accentSoft,
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <EditOutlinedIcon sx={{ fontSize: 18, color: C.accent }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: C.primary }}>Edit User</Typography>
              <Typography sx={{ ...T.meta, mt: "1px" }}>Update details for {user?.full_name}</Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={handleClose} sx={{ color: C.tertiary, mt: "-4px" }}>
            <CloseIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Box>

        {/* User identity pill */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: "10px 14px", mt: "14px",
          backgroundColor: C.accentSoft, borderRadius: "10px" }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: C.accent, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
            {getInitials(user?.full_name ?? "")}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={T.valueSm}>{user?.full_name}</Typography>
            <Typography sx={T.meta}>{user?.email}</Typography>
          </Box>
        </Box>
      </DialogTitle>

      {/* ── Content ── */}
      <DialogContent sx={{ px: "24px", pt: "20px", pb: 0 }}>

        {/* Role selector */}
        <Box sx={{ mb: "20px" }}>
          <Typography sx={{ ...T.label, mb: "8px" }}>User Role *</Typography>
          <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {USER_ROLE_OPTIONS.map((r) => {
              const active = form.user_role === r.value;
              return (
                <Box key={r.value} onClick={() => { setForm((p) => ({ ...p, user_role: r.value })); setErrors((e) => ({ ...e, user_role: "" })); }}
                  sx={{ display: "flex", alignItems: "center", gap: "6px", px: "12px", py: "8px",
                    borderRadius: "10px", cursor: "pointer",
                    border: `1.5px solid ${active ? C.accent : C.border}`,
                    backgroundColor: active ? C.accentSoft : C.white,
                    transition: "all 0.15s ease",
                    "&:hover": { borderColor: active ? C.accent : C.accentMid, backgroundColor: active ? C.accentSoft : "#FFFAF7" } }}>
                  <ShieldOutlinedIcon sx={{ fontSize: 13, color: active ? C.accent : C.tertiary }} />
                  <Typography sx={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? C.accent : C.secondary }}>
                    {r.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
          {errors.user_role && <FormHelperText error sx={{ mt: "4px", ml: "2px", fontSize: 11 }}>{errors.user_role}</FormHelperText>}
        </Box>

        <Divider sx={{ mb: "16px", borderColor: C.border }} />

        {/* Basic info */}
        <Typography sx={{ ...T.label, mb: "12px" }}>Basic Information</Typography>
        <Grid container spacing={2} mb="16px">
          <Grid item size={{ xs: 12, sm: 6 }}>
            <EditField label="First Name *" fieldKey="first_name" form={form} setForm={setForm} error={errors.first_name} />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <EditField label="Last Name *"  fieldKey="last_name"  form={form} setForm={setForm} error={errors.last_name}  />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <PhoneEditField
              dialCode={dialCode} setDialCode={setDialCode}
              localPhone={localPhone} setLocalPhone={(v) => { setLocalPhone(v); setPhoneError(""); }}
              error={phoneError}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <EditField label="Gender" fieldKey="gender" form={form} setForm={setForm} select options={GENDER_OPTIONS} />
          </Grid>
        </Grid>

        <Divider sx={{ mb: "16px", borderColor: C.border }} />

        {/* Employment */}
        <Typography sx={{ ...T.label, mb: "12px" }}>Employment Details</Typography>
        <Grid container spacing={2}>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <EditField label="Employee ID"   fieldKey="emp_id"          form={form} setForm={setForm} />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <EditField label="Department"    fieldKey="department"      form={form} setForm={setForm} />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <EditField label="Designation"   fieldKey="emp_designation" form={form} setForm={setForm} />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <EditField label="Employee Type" fieldKey="emp_type"        form={form} setForm={setForm} select options={EMP_TYPE_OPTIONS}   />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <EditField label="Status"        fieldKey="emp_status"      form={form} setForm={setForm} select options={EMP_STATUS_OPTIONS} />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <EditField label="Time Zone"     fieldKey="time_zone"       form={form} setForm={setForm} select options={TZ_OPTIONS}         />
          </Grid>
        </Grid>
      </DialogContent>

      {/* ── Actions ── */}
      <DialogActions sx={{ px: "24px", py: "20px", gap: 1.5 }}>
        <Button fullWidth variant="outlined" onClick={handleClose}
          sx={{ textTransform: "none", fontWeight: 600, fontSize: 13, borderColor: C.border,
            color: C.secondary, borderRadius: "10px",
            "&:hover": { borderColor: "#D1D5DB", backgroundColor: "#F9FAFB" } }}>
          Cancel
        </Button>
        <Button fullWidth variant="contained" onClick={handleSave} disabled={saving}
          startIcon={saving ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <SaveOutlinedIcon sx={{ fontSize: 14 }} />}
          sx={{ textTransform: "none", fontWeight: 600, fontSize: 13, backgroundColor: C.accent,
            borderRadius: "10px", boxShadow: "none",
            "&:hover": { backgroundColor: "#E54E10", boxShadow: "none" },
            "&:disabled": { backgroundColor: "#F3F4F6", color: C.tertiary } }}>
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ════════════════════════════════════════════
   ADD USER DIALOG  (2-step, unchanged)
════════════════════════════════════════════ */
const EMPTY_FORM = {
  user_role: "", first_name: "", last_name: "", email: "",
  emp_id: "", department: "", emp_type: "", emp_status: "",
  gender: "", emp_designation: "", timezone: "",
};

function validateStep(step, form, localPhone) {
  const errs = {};
  if (step === 0) {
    if (!form.user_role) errs.user_role = "Role is required";
    if (!form.first_name) errs.first_name = "First name is required";
    if (!form.last_name)  errs.last_name  = "Last name is required";
    if (!form.email) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email address";
    if (localPhone && (localPhone.length < 7 || localPhone.length > 15))
      errs.phone = "Enter a valid phone number (7–15 digits)";
  }
  return errs;
}

function AddUserDialog({ open, onClose, onSuccess, onError }) {
  const [step, setStep]             = useState(0);
  const [form, setForm]             = useState({ ...EMPTY_FORM });
  const [errors, setErrors]         = useState({});
  const [dialCode, setDialCode]     = useState("+91");
  const [localPhone, setLocalPhone] = useState("");
  const [done, setDone]             = useState(false);
  const [createdUser, setCreatedUser] = useState(null);

  const [createUser, { isLoading: creating }] = useCreateUserMutation();

  const reset = () => { setStep(0); setForm({ ...EMPTY_FORM }); setErrors({}); setDialCode("+91"); setLocalPhone(""); setDone(false); setCreatedUser(null); };
  const handleClose = () => { reset(); onClose(); };

  const handleNext = () => {
    const errs = validateStep(step, form, localPhone);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setStep(1);
  };

  const handleSubmit = async () => {
    const nn = (v) => (v === "" ? null : v);
    const payload = {
      user_role: form.user_role, first_name: nn(form.first_name), last_name: nn(form.last_name),
      email: form.email, phone: localPhone ? `${dialCode}${localPhone}` : null,
      timezone: nn(form.timezone), emp_id: nn(form.emp_id), department: nn(form.department),
      emp_type: nn(form.emp_type), emp_status: nn(form.emp_status),
      gender: nn(form.gender), emp_designation: nn(form.emp_designation),
    };
    try {
      const res = await createUser(payload).unwrap();
      setCreatedUser(res?.data ?? payload);
      setDone(true);
    } catch (err) {
      onError(err?.data?.message ?? "Failed to create user. Please try again.");
    }
  };

  const stepLabels = ["Account & Role", "Employment Details"];

  if (done) {
    return (
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden" } }}>
        <Box sx={{ p: "40px 32px", textAlign: "center" }}>
          <Box sx={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: C.greenSoft,
            display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
            <CheckCircleOutlineOutlined sx={{ fontSize: 32, color: C.green }} />
          </Box>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: C.primary, mb: "4px" }}>User Created!</Typography>
          <Typography sx={{ ...T.meta, fontSize: 12, mb: "16px" }}>
            {createdUser?.first_name} {createdUser?.last_name} has been added successfully.
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: "10px 14px", borderRadius: "10px",
            backgroundColor: C.accentSoft, mb: "24px", textAlign: "left" }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: C.accent, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
              {getInitials(`${createdUser?.first_name ?? ""} ${createdUser?.last_name ?? ""}`)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={T.valueSm}>{createdUser?.first_name} {createdUser?.last_name}</Typography>
              <Typography sx={T.meta}>{createdUser?.email}</Typography>
            </Box>
            <Box sx={{ fontSize: 10, fontWeight: 700, px: "8px", py: "3px", borderRadius: "6px",
              backgroundColor: C.accent, color: "#fff", whiteSpace: "nowrap", flexShrink: 0 }}>
              {roleLabel(createdUser?.user_role ?? "")}
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button fullWidth variant="outlined" onClick={handleClose}
              sx={{ textTransform: "none", fontWeight: 600, fontSize: 13, borderColor: C.border,
                color: C.secondary, borderRadius: "10px", "&:hover": { borderColor: "#D1D5DB", backgroundColor: "#F9FAFB" } }}>
              Close
            </Button>
            <Button fullWidth variant="contained" onClick={reset}
              sx={{ textTransform: "none", fontWeight: 600, fontSize: 13, backgroundColor: C.accent,
                borderRadius: "10px", boxShadow: "none", "&:hover": { backgroundColor: "#E54E10", boxShadow: "none" } }}>
              Add Another
            </Button>
          </Box>
        </Box>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden" } }}>
      <DialogTitle sx={{ px: "24px", pt: "24px", pb: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: "10px", backgroundColor: C.accentSoft,
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PersonAddOutlinedIcon sx={{ fontSize: 18, color: C.accent }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: C.primary }}>Add New User</Typography>
              <Typography sx={{ ...T.meta, mt: "1px" }}>Step {step + 1} of 2 — {stepLabels[step]}</Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={handleClose} sx={{ color: C.tertiary, mt: "-4px" }}>
            <CloseIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Box>
        <Box sx={{ mt: "8px", display: "flex", gap: "6px" }}>
          {[0, 1].map((i) => (
            <Box key={i} sx={{ flex: 1, height: 3, borderRadius: 2,
              backgroundColor: i <= step ? C.accent : C.border, transition: "background-color 0.3s ease" }} />
          ))}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: "24px", pt: "20px", pb: 0 }}>
        {step === 0 && (
          <Box>
            <Box sx={{ mb: "20px" }}>
              <Typography sx={{ ...T.label, mb: "8px",mt:1 }}>User Role *</Typography>
              <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {USER_ROLE_OPTIONS.map((r) => {
                  const active = form.user_role === r.value;
                  return (
                    <Box key={r.value}
                      onClick={() => { setForm((p) => ({ ...p, user_role: r.value })); setErrors((e) => ({ ...e, user_role: "" })); }}
                      sx={{ display: "flex", alignItems: "center", gap: "6px", px: "12px", py: "8px",
                        borderRadius: "10px", cursor: "pointer",
                        border: `1.5px solid ${active ? C.accent : C.border}`,
                        backgroundColor: active ? C.accentSoft : C.white, transition: "all 0.15s ease",
                        "&:hover": { borderColor: active ? C.accent : C.accentMid, backgroundColor: active ? C.accentSoft : "#FFFAF7" } }}>
                      <ShieldOutlinedIcon sx={{ fontSize: 13, color: active ? C.accent : C.tertiary }} />
                      <Typography sx={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? C.accent : C.secondary }}>
                        {r.label}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
              {errors.user_role && <FormHelperText error sx={{ mt: "4px", ml: "2px", fontSize: 11 }}>{errors.user_role}</FormHelperText>}
            </Box>
            <Divider sx={{ my: "16px", borderColor: C.border }} />
            <Grid container spacing={2}>
              <Grid item size={{ xs: 12, sm: 6 }}><EditField label="First Name *" fieldKey="first_name" form={form} setForm={setForm} error={errors.first_name} /></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><EditField label="Last Name *"  fieldKey="last_name"  form={form} setForm={setForm} error={errors.last_name}  /></Grid>
              <Grid item size={{ xs: 12 }}>
                <Box>
                  <Typography sx={{ ...T.label, mb: "5px" }}>Email Address *</Typography>
                  <TextField size="small" fullWidth type="email" placeholder="user@company.com"
                    value={form.email}
                    onChange={(e) => { setForm((p) => ({ ...p, email: e.target.value })); setErrors((er) => ({ ...er, email: "" })); }}
                    error={!!errors.email} helperText={errors.email}
                    sx={errors.email ? errorFieldSx : editFieldSx}
                    InputProps={{ startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon sx={{ fontSize: 15, color: errors.email ? "#EF4444" : C.tertiary }} />
                      </InputAdornment>
                    )}}
                  />
                </Box>
              </Grid>
              <Grid item size={{ xs: 12 }}>
                <PhoneEditField dialCode={dialCode} setDialCode={setDialCode} localPhone={localPhone} setLocalPhone={setLocalPhone} error={errors.phone} />
              </Grid>
            </Grid>
          </Box>
        )}

        {step === 1 && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: "10px 14px", borderRadius: "10px", backgroundColor: C.accentSoft, mb: "20px" }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: C.accent, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {getInitials(`${form.first_name} ${form.last_name}`)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={T.valueSm}>{form.first_name} {form.last_name}</Typography>
                <Typography sx={T.meta}>{form.email}</Typography>
              </Box>
              <Box sx={{ fontSize: 10, fontWeight: 700, px: "8px", py: "3px", borderRadius: "6px", backgroundColor: C.accent, color: "#fff", whiteSpace: "nowrap" }}>
                {roleLabel(form.user_role)}
              </Box>
            </Box>
            <Grid container spacing={2}>
              <Grid item size={{ xs: 12, sm: 6 }}><EditField label="Employee ID"   fieldKey="emp_id"          form={form} setForm={setForm} /></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><EditField label="Department"    fieldKey="department"      form={form} setForm={setForm} /></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><EditField label="Designation"   fieldKey="emp_designation" form={form} setForm={setForm} /></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><EditField label="Gender"        fieldKey="gender"          form={form} setForm={setForm} select options={GENDER_OPTIONS}     /></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><EditField label="Employee Type" fieldKey="emp_type"        form={form} setForm={setForm} select options={EMP_TYPE_OPTIONS}   /></Grid>
              <Grid item size={{ xs: 12, sm: 6 }}><EditField label="Status"        fieldKey="emp_status"      form={form} setForm={setForm} select options={EMP_STATUS_OPTIONS} /></Grid>
              <Grid item size={{ xs: 12 }}>       <EditField label="Time Zone"     fieldKey="timezone"        form={form} setForm={setForm} select options={TZ_OPTIONS}         /></Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: "24px", py: "20px", gap: 1.5 }}>
        {step === 0 ? (
          <Button fullWidth variant="outlined" onClick={handleClose}
            sx={{ textTransform: "none", fontWeight: 600, fontSize: 13, borderColor: C.border,
              color: C.secondary, borderRadius: "10px", "&:hover": { borderColor: "#D1D5DB", backgroundColor: "#F9FAFB" } }}>
            Cancel
          </Button>
        ) : (
          <Button fullWidth variant="outlined" startIcon={<ArrowBackIcon sx={{ fontSize: 14 }} />} onClick={() => setStep(0)}
            sx={{ textTransform: "none", fontWeight: 600, fontSize: 13, borderColor: C.border,
              color: C.secondary, borderRadius: "10px", "&:hover": { borderColor: "#D1D5DB", backgroundColor: "#F9FAFB" } }}>
            Back
          </Button>
        )}
        {step === 0 ? (
          <Button fullWidth variant="contained" endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />} onClick={handleNext}
            sx={{ textTransform: "none", fontWeight: 600, fontSize: 13, backgroundColor: C.accent,
              borderRadius: "10px", boxShadow: "none", "&:hover": { backgroundColor: "#E54E10", boxShadow: "none" } }}>
            Next — Employment
          </Button>
        ) : (
          <Button fullWidth variant="contained" onClick={handleSubmit} disabled={creating}
            startIcon={creating ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <PersonAddOutlinedIcon sx={{ fontSize: 14 }} />}
            sx={{ textTransform: "none", fontWeight: 600, fontSize: 13, backgroundColor: C.accent,
              borderRadius: "10px", boxShadow: "none", "&:hover": { backgroundColor: "#E54E10", boxShadow: "none" },
              "&:disabled": { backgroundColor: "#F3F4F6", color: C.tertiary } }}>
            {creating ? "Creating…" : "Create User"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

/* ════════════════════════════════════════════
   ASSIGN ORG DIALOG  (unchanged)
════════════════════════════════════════════ */
function AssignOrgDialog({ user, onClose }) {
  const [orgSearch, setOrgSearch]   = useState("");
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const { data: orgData, isLoading: orgsLoading } = useGetMyOrganisationsQuery(undefined, { skip: !user });
  const [assignOrg, { isLoading: assigning }] = useAssignOrganisationMutation();

  const orgs = orgData?.data ?? [];
  const orgName = (o) => o.organisation_name ?? o.name ?? "—";
  const orgId   = (o) => o.organisation_id   ?? o.id;
  const assignedIds = new Set((user?.organisations ?? []).map((o) => o.organisation_id));
  const filteredOrgs = orgs.filter((o) => orgName(o).toLowerCase().includes(orgSearch.toLowerCase()));

  const handleAssign = async () => {
    if (!selectedOrg || !user) return;
    try {
      await assignOrg({ user_id: user.id, organisation_id: orgId(selectedOrg) }).unwrap();
      setSuccessMsg(`Successfully assigned to ${orgName(selectedOrg)}`);
      setSelectedOrg(null);
      setTimeout(() => { setSuccessMsg(""); onClose(); }, 1800);
    } catch (err) { console.error("Assign failed:", err); }
  };

  const handleClose = () => { setOrgSearch(""); setSelectedOrg(null); setSuccessMsg(""); onClose(); };

  return (
    <Dialog open={!!user} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden" } }}>
      <DialogTitle sx={{ px: "24px", pt: "24px", pb: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: C.primary }}>Assign Organisation</Typography>
            <Typography sx={{ ...T.meta, mt: "2px" }}>Select an organisation to assign to this user</Typography>
          </Box>
          <IconButton size="small" onClick={handleClose} sx={{ color: C.tertiary, mt: "-4px" }}>
            <CloseIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: "10px 12px", mt: "14px",
          backgroundColor: C.accentSoft, borderRadius: "10px" }}>
          <Avatar sx={{ width: 30, height: 30, bgcolor: C.accent, fontSize: 11, fontWeight: 700 }}>
            {getInitials(user?.full_name ?? "")}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={T.valueSm}>{user?.full_name}</Typography>
            <Typography sx={T.meta}>{user?.email}</Typography>
          </Box>
          <Typography sx={{ ...T.meta, whiteSpace: "nowrap" }}>
            {user?.organisations_count} org{user?.organisations_count !== 1 ? "s" : ""}
          </Typography>
        </Box>
        {user?.organisations?.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6, mt: "8px" }}>
            {user.organisations.map((o) => (
              <Box key={o.organisation_id} sx={{ fontSize: 10, fontWeight: 600, px: "7px", py: "2px",
                borderRadius: "6px", backgroundColor: "#F3F4F6", color: C.secondary }}>
                {o.organisation_name}
              </Box>
            ))}
          </Box>
        )}
      </DialogTitle>

      <DialogContent sx={{ px: "24px", pt: "18px", pb: 0 }}>
        {successMsg && <Alert severity="success" sx={{ mb: "12px", fontSize: 12, borderRadius: "8px" }}>{successMsg}</Alert>}
        <Typography sx={{ ...T.label, mb: "8px" }}>Select Organisation</Typography>
        <TextField size="small" fullWidth placeholder="Search organisations…" value={orgSearch}
          onChange={(e) => setOrgSearch(e.target.value)}
          sx={{ mb: "10px", "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: 13,
            "& fieldset": { borderColor: C.border }, "&.Mui-focused fieldset": { borderColor: C.accent } } }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 15, color: C.tertiary }} /></InputAdornment> }}
        />
        <Box sx={{ border: `1px solid ${C.border}`, borderRadius: "10px", maxHeight: 260, overflowY: "auto" }}>
          {orgsLoading ? (
            <Box display="flex" justifyContent="center" py={4}><CircularProgress size={20} sx={{ color: C.accent }} /></Box>
          ) : filteredOrgs.length === 0 ? (
            <Box py={4} textAlign="center"><Typography sx={T.meta}>No organisations found.</Typography></Box>
          ) : (
            filteredOrgs.map((org, idx) => {
              const id = orgId(org), name = orgName(org);
              const isSelected = selectedOrg && orgId(selectedOrg) === id;
              const isAssigned = assignedIds.has(id);
              return (
                <ListItemButton key={id} disabled={isAssigned} onClick={() => setSelectedOrg(isSelected ? null : org)}
                  sx={{ px: "14px", py: "9px",
                    borderBottom: idx < filteredOrgs.length - 1 ? "1px solid #F3F4F6" : "none",
                    backgroundColor: isSelected ? C.accentSoft : "transparent",
                    "&:hover": { backgroundColor: isSelected ? C.accentSoft : "#F9FAFB" },
                    opacity: isAssigned ? 0.5 : 1 }}>
                  <Checkbox checked={!!isSelected || isAssigned} disabled={isAssigned} size="small"
                    sx={{ p: 0, mr: "10px", color: "#D1D5DB", "&.Mui-checked": { color: C.accent } }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ ...T.valueSm, fontWeight: isSelected ? 600 : 400 }}>{name}</Typography>
                    <Typography sx={T.meta}>{id?.slice(0, 8)}…</Typography>
                  </Box>
                  {isAssigned && (
                    <Box sx={{ fontSize: 10, fontWeight: 600, px: "6px", py: "2px", borderRadius: "6px",
                      backgroundColor: C.greenSoft, color: C.green }}>Assigned</Box>
                  )}
                </ListItemButton>
              );
            })
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: "24px", py: "18px", gap: 1.5 }}>
        <Button fullWidth variant="outlined" onClick={handleClose}
          sx={{ textTransform: "none", fontWeight: 600, fontSize: 13, borderColor: C.border,
            color: C.secondary, borderRadius: "10px", "&:hover": { borderColor: "#D1D5DB", backgroundColor: "#F9FAFB" } }}>
          Cancel
        </Button>
        <Button fullWidth variant="contained" onClick={handleAssign} disabled={!selectedOrg || assigning}
          sx={{ textTransform: "none", fontWeight: 600, fontSize: 13, backgroundColor: C.accent,
            borderRadius: "10px", boxShadow: "none", "&:hover": { backgroundColor: "#E54E10", boxShadow: "none" },
            "&:disabled": { backgroundColor: "#F3F4F6", color: C.tertiary } }}>
          {assigning ? <CircularProgress size={15} sx={{ color: "#fff" }} />
            : `Assign${selectedOrg ? ` · ${orgName(selectedOrg).split(" ")[0]}` : ""}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}