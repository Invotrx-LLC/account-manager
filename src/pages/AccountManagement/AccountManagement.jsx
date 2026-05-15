import React, { useState } from "react";
import {
  Box, Typography, CircularProgress, Alert, Avatar, Button,
  TextField, InputAdornment, ListItemButton, Checkbox, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Tab, Tabs, Grid, MenuItem, Snackbar, Select, FormControl,
} from "@mui/material";
import SearchIcon                      from "@mui/icons-material/Search";
import CloseIcon                       from "@mui/icons-material/Close";
import BusinessIcon                    from "@mui/icons-material/Business";
import Person2OutlinedIcon             from "@mui/icons-material/Person2Outlined";
import EditOutlinedIcon                from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon                from "@mui/icons-material/SaveOutlined";
import GroupOutlinedIcon               from "@mui/icons-material/GroupOutlined";
import AdminPanelSettingsOutlinedIcon  from "@mui/icons-material/AdminPanelSettingsOutlined";
import PersonOutlineOutlinedIcon       from "@mui/icons-material/PersonOutlineOutlined";
import PhoneOutlinedIcon               from "@mui/icons-material/PhoneOutlined";
import BadgeOutlinedIcon               from "@mui/icons-material/BadgeOutlined";
import WorkOutlineOutlinedIcon         from "@mui/icons-material/WorkOutlineOutlined";
import PublicOutlinedIcon              from "@mui/icons-material/PublicOutlined";
import WcOutlinedIcon                  from "@mui/icons-material/WcOutlined";

import {
  useAssignOrganisationMutation,
  useGetAllInternalUsersQuery,
  useGetMyOrganisationsQuery,
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
} from "../../redux/services/requisition/requisition";

/* ─────────────────────── Design tokens ─────────────────────── */
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
};

/*
  Typography contract — used consistently throughout:
  ┌─────────────┬──────────────────────────────────────────────┐
  │ LABEL       │ 10px · 700 · uppercase · #9696A6             │
  │ VALUE       │ 14px · 600 · #111118                         │
  │ VALUE-SM    │ 13px · 500 · #111118  (table cells, chips)   │
  │ META        │ 11px · 400 · #9696A6  (email, helper text)   │
  └─────────────┴──────────────────────────────────────────────┘
*/
const T = {
  label:   { fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.tertiary },
  value:   { fontSize: 14, fontWeight: 600, color: C.primary },
  valueSm: { fontSize: 13, fontWeight: 500, color: C.primary },
  meta:    { fontSize: 11, fontWeight: 400, color: C.tertiary },
};

/* ─────────────────────── Helpers ─────────────────────── */
function getInitials(name = "") {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}
function roleLabel(role = "") {
  return role.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

const DIAL_CODES = [
  { code: "+91",  label: "🇮🇳 +91"  },
  { code: "+1",   label: "🇺🇸 +1"   },
  { code: "+44",  label: "🇬🇧 +44"  },
  { code: "+61",  label: "🇦🇺 +61"  },
  { code: "+971", label: "🇦🇪 +971" },
  { code: "+65",  label: "🇸🇬 +65"  },
  { code: "+49",  label: "🇩🇪 +49"  },
  { code: "+33",  label: "🇫🇷 +33"  },
  { code: "+81",  label: "🇯🇵 +81"  },
  { code: "+86",  label: "🇨🇳 +86"  },
];
function splitPhone(fullPhone = "") {
  if (!fullPhone) return { dialCode: "+91", local: "" };
  const match = DIAL_CODES.find(d => fullPhone.startsWith(d.code));
  if (match) return { dialCode: match.code, local: fullPhone.slice(match.code.length) };
  return { dialCode: "+91", local: fullPhone.replace(/^\+/, "") };
}

const GENDER_OPTIONS     = ["Male", "Female", "Other", "Prefer not to say"];
const EMP_TYPE_OPTIONS   = ["Full-time", "Part-time", "Contract", "Intern"];
const EMP_STATUS_OPTIONS = ["Active", "Inactive", "On Leave", "Terminated"];
const TZ_OPTIONS = ["UTC","Asia/Kolkata","America/New_York","America/Los_Angeles","Europe/London","Europe/Paris","Asia/Tokyo","Australia/Sydney"];

/* ─────────────────────── Edit field style ─────────────────────── */
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

/* ─────────────────────── Read field ─────────────────────── */
/* Label: 10px uppercase | Value: 14px semibold — clear hierarchy */
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

/* ─────────────────────── Edit field ─────────────────────── */
function EditField({ label, fieldKey, select, options = [], form, setForm }) {
  return (
    <Box>
      <Typography sx={{ ...T.label, mb: "5px" }}>{label}</Typography>
      {select ? (
        <TextField select size="small" fullWidth value={form[fieldKey] ?? ""}
          onChange={e => setForm(p => ({ ...p, [fieldKey]: e.target.value }))} sx={editFieldSx}>
          <MenuItem value=""><em style={{ color: C.tertiary, fontStyle: "normal" }}>—</em></MenuItem>
          {options.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </TextField>
      ) : (
        <TextField size="small" fullWidth value={form[fieldKey] ?? ""}
          onChange={e => setForm(p => ({ ...p, [fieldKey]: e.target.value }))} sx={editFieldSx} />
      )}
    </Box>
  );
}

/* ─────────────────────── Phone edit field ─────────────────────── */
function PhoneEditField({ dialCode, setDialCode, localPhone, setLocalPhone, error }) {
  return (
    <Box>
      <Typography sx={{ ...T.label, mb: "5px" }}>Phone</Typography>
      <Box sx={{ display: "flex", gap: 1 }}>
        <FormControl size="small" sx={{ minWidth: 108 }}>
          <Select value={dialCode} onChange={e => setDialCode(e.target.value)}
            sx={{
              borderRadius: "10px", fontSize: 13,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: error ? "#EF4444" : C.border },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#D1D5DB" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: C.accent },
            }}>
            {DIAL_CODES.map(d => <MenuItem key={d.code} value={d.code}>{d.label}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField size="small" fullWidth placeholder="9876543210"
          value={localPhone}
          onChange={e => setLocalPhone(e.target.value.replace(/\D/g, ""))}
          error={!!error} helperText={error}
          inputProps={{ inputMode: "numeric", maxLength: 15 }}
          sx={editFieldSx} />
      </Box>
    </Box>
  );
}

/* ─────────────────────── Profile info card ─────────────────────── */
/*
  LABEL  → 10px · 700 · uppercase · tertiary   (smaller, quiet)
  VALUE  → 14px · 600 · primary               (larger, prominent)
  Tight padding + smaller icon circle to reduce card height.
*/
function ProfileInfoCard({ label, value, icon }) {
  return (
    <Box sx={{
      p: "12px 14px",
      borderRadius: "12px",
      background: C.white,
      border: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", gap: 1.5,
      transition: "0.2s ease",
      "&:hover": { borderColor: "#FFB38A", boxShadow: "0 4px 14px rgba(255,95,31,0.07)" },
    }}>
      {/* Icon circle — 36px, down from 48px */}
      <Box sx={{
        width: 36, height: 36, borderRadius: "9px", flexShrink: 0,
        background: "#F3F4F6",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        {/* LABEL — 10px uppercase */}
        <Typography sx={{ ...T.label, mb: "2px" }}>{label}</Typography>
        {/* VALUE — 14px semibold */}
        <Typography sx={{
          ...T.value,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          color: value ? C.primary : C.tertiary,
        }}>
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
        "& .MuiTab-root": {
          textTransform: "none", fontWeight: 600, fontSize: 13,
          minHeight: 36, px: "14px", color: C.secondary,
          "&.Mui-selected": { color: C.accent },
        },
      }}>
        <Tab icon={<Person2OutlinedIcon sx={{ fontSize: 15 }} />} iconPosition="start" label="My Profile" />
        <Tab icon={<GroupOutlinedIcon  sx={{ fontSize: 15 }} />} iconPosition="start" label="Users" />
      </Tabs>
      {tab === 0 && <MyProfileTab />}
      {tab === 1 && <UsersTab />}
    </Box>
  );
}

/* ════════════════════════════════════════════
   MY PROFILE TAB
════════════════════════════════════════════ */
function MyProfileTab() {
  const { data, isLoading, isError, refetch } = useGetMyProfileQuery();
  const [updateProfile, { isLoading: saving }] = useUpdateMyProfileMutation();
  const profile = data?.data ?? {};

  const [editing,    setEditing]    = useState(false);
  const [form,       setForm]       = useState({});
  const [dialCode,   setDialCode]   = useState("+91");
  const [localPhone, setLocalPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });

  const startEdit = () => {
    const { dialCode: dc, local } = splitPhone(profile.phone);
    setDialCode(dc); setLocalPhone(local); setPhoneError("");
    setForm({
      first_name:       profile.first_name      ?? "",
      last_name:        profile.last_name       ?? "",
      emp_id:           profile.emp_id          ?? "",
      department:       profile.department      ?? "",
      emp_type:         profile.emp_type        ?? "",
      emp_status:       profile.emp_status      ?? "",
      gender:           profile.gender          ?? "",
      emp_designation:  profile.emp_designation ?? "",
      time_zone:        profile.time_zone       ?? "",
    });
    setEditing(true);
  };

  const handleSave = async () => {
    if (localPhone && (localPhone.length < 7 || localPhone.length > 15)) {
      setPhoneError("Enter a valid phone number (7–15 digits)"); return;
    }
    setPhoneError("");
    const nn = v => v === "" ? null : v;
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

  /* Section label style */
  const SecLabel = ({ children }) => (
    <Typography sx={{ ...T.label, mb: "12px" }}>{children}</Typography>
  );

  return (
    <Box sx={{ backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: "14px", overflow: "hidden" }}>

      {/* ── Header ── */}
      <Box sx={{ p: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: C.accent, fontSize: 16, fontWeight: 700 }}>
            {getInitials(profile.full_name)}
          </Avatar>
          <Box>
            {/* Name — 15px semibold */}
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: C.primary, lineHeight: 1.2 }}>
              {profile.full_name || "—"}
            </Typography>
            {/* Email — 11px meta */}
            <Typography sx={T.meta}>{profile.email}</Typography>
          </Box>
        </Box>

        {!editing ? (
          <Button size="small" startIcon={<EditOutlinedIcon sx={{ fontSize: 13 }} />} onClick={startEdit}
            sx={{ textTransform: "none", fontSize: 12, fontWeight: 600, color: C.accent,
              border: `1px solid ${C.accent}`, borderRadius: "8px",
              "&:hover": { backgroundColor: C.accentSoft } }}>
            Edit Profile
          </Button>
        ) : (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button size="small" onClick={() => { setEditing(false); setPhoneError(""); }}
              sx={{ textTransform: "none", fontSize: 12, fontWeight: 600, color: C.secondary,
                border: `1px solid ${C.border}`, borderRadius: "8px",
                "&:hover": { backgroundColor: "#F9FAFB" } }}>
              Cancel
            </Button>
            <Button size="small" onClick={handleSave} disabled={saving}
              startIcon={saving ? <CircularProgress size={12} sx={{ color: "#fff" }} /> : <SaveOutlinedIcon sx={{ fontSize: 13 }} />}
              sx={{ textTransform: "none", fontSize: 12, fontWeight: 600, color: "#fff",
                backgroundColor: C.accent, borderRadius: "8px",
                "&:hover": { backgroundColor: "#E54E10" },
                "&:disabled": { backgroundColor: "#F3F4F6", color: C.tertiary } }}>
              Save Changes
            </Button>
          </Box>
        )}
      </Box>

      {/* ── Body ── */}
      <Box sx={{ p: "20px 24px" }}>

        {/* Basic info */}
        <SecLabel>Basic Information</SecLabel>
        {/* spacing={2} instead of spacing={3} — tighter grid */}
        <Grid container spacing={2} mb="20px">
          {editing ? (
            <>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <EditField label="First Name"  fieldKey="first_name" form={form} setForm={setForm} />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <EditField label="Last Name"   fieldKey="last_name"  form={form} setForm={setForm} />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <PhoneEditField dialCode={dialCode} setDialCode={setDialCode}
                  localPhone={localPhone} setLocalPhone={setLocalPhone} error={phoneError} />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <EditField label="Gender" fieldKey="gender" form={form} setForm={setForm} select options={GENDER_OPTIONS} />
              </Grid>
            </>
          ) : (
            <>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <ProfileInfoCard label="First Name" value={profile.first_name}
                  icon={<PersonOutlineOutlinedIcon sx={{ color: "#FF6B2C", fontSize: 18 }} />} />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <ProfileInfoCard label="Last Name"  value={profile.last_name}
                  icon={<PersonOutlineOutlinedIcon sx={{ color: "#FF6B2C", fontSize: 18 }} />} />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <ProfileInfoCard label="Phone"  value={profile.phone}
                  icon={<PhoneOutlinedIcon sx={{ color: "#10B981", fontSize: 18 }} />} />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <ProfileInfoCard label="Gender" value={profile.gender}
                  icon={<WcOutlinedIcon sx={{ color: "#8B5CF6", fontSize: 18 }} />} />
              </Grid>
            </>
          )}
        </Grid>

        <Box sx={{ borderTop: `1px solid ${C.border}`, mb: "20px" }} />

        {/* Employment */}
        <SecLabel>Employment Details</SecLabel>
        <Grid container spacing={2}>
          {editing ? (
            <>
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
                <EditField label="Employee Type" fieldKey="emp_type"        form={form} setForm={setForm} select options={EMP_TYPE_OPTIONS} />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <EditField label="Status"        fieldKey="emp_status"      form={form} setForm={setForm} select options={EMP_STATUS_OPTIONS} />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <EditField label="Time Zone"     fieldKey="time_zone"       form={form} setForm={setForm} select options={TZ_OPTIONS} />
              </Grid>
            </>
          ) : (
            <>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <ProfileInfoCard label="Employee ID"   value={profile.emp_id}
                  icon={<BadgeOutlinedIcon       sx={{ color: "#3B82F6", fontSize: 18 }} />} />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <ProfileInfoCard label="Department"    value={profile.department}
                  icon={<WorkOutlineOutlinedIcon sx={{ color: "#F59E0B", fontSize: 18 }} />} />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <ProfileInfoCard label="Designation"   value={profile.emp_designation}
                  icon={<WorkOutlineOutlinedIcon sx={{ color: "#EF4444", fontSize: 18 }} />} />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <ProfileInfoCard label="Employee Type" value={profile.emp_type}
                  icon={<BadgeOutlinedIcon       sx={{ color: "#14B8A6", fontSize: 18 }} />} />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <ProfileInfoCard label="Status"        value={profile.emp_status}
                  icon={<BadgeOutlinedIcon       sx={{ color: "#6366F1", fontSize: 18 }} />} />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <ProfileInfoCard label="Time Zone"     value={profile.time_zone}
                  icon={<PublicOutlinedIcon      sx={{ color: "#EC4899", fontSize: 18 }} />} />
              </Grid>
            </>
          )}
        </Grid>
      </Box>

      <Snackbar open={toast.open} autoHideDuration={3500}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={toast.severity} sx={{ borderRadius: "10px", fontSize: 13 }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

/* ════════════════════════════════════════════
   USERS TAB
════════════════════════════════════════════ */
function UsersTab() {
  const [search, setSearch]       = useState("");
  const [drawerUser, setDrawerUser] = useState(null);

  const { data, isLoading, isError } = useGetAllInternalUsersQuery();
  const users = data?.data ?? [];

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress sx={{ color: C.accent }} /></Box>;
  if (isError)   return <Alert severity="error">Failed to load users.</Alert>;

  return (
    <>
      <TextField size="small" placeholder="Search by name or email…"
        value={search} onChange={e => setSearch(e.target.value)}
        sx={{
          mb: "12px", width: 300,
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px", fontSize: 13,
            "& fieldset": { borderColor: C.border },
            "&:hover fieldset": { borderColor: "#D1D5DB" },
            "&.Mui-focused fieldset": { borderColor: C.accent },
          },
        }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 15, color: C.tertiary }} /></InputAdornment> }}
      />

      <Box sx={{ border: `1px solid ${C.border}`, borderRadius: "12px", overflow: "hidden", backgroundColor: C.white }}>
        {/* Table header */}
        <Box sx={{
          display: "grid", gridTemplateColumns: "2fr 1.2fr 1.5fr 120px",
          px: "16px", py: "9px",
          backgroundColor: "#F9FAFB", borderBottom: `1px solid ${C.border}`,
        }}>
          {["User", "Role", "Organisations", "Action"].map(h => (
            /* Column header — same T.label style */
            <Typography key={h} sx={T.label}>{h}</Typography>
          ))}
        </Box>

        {filtered.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography sx={T.meta}>No users found.</Typography>
          </Box>
        ) : filtered.map((user, idx) => {
          const orgs = user.organisations ?? [];
          return (
            <Box key={user.id} sx={{
              display: "grid", gridTemplateColumns: "2fr 1.2fr 1.5fr 120px",
              px: "16px", py: "12px", alignItems: "center",
              borderBottom: idx < filtered.length - 1 ? `1px solid #F3F4F6` : "none",
              "&:hover": { backgroundColor: "#FAFAFA" },
            }}>
              {/* User — name 13px, email 11px */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar sx={{ width: 34, height: 34, bgcolor: C.accent, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {getInitials(user.full_name)}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ ...T.valueSm, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user.full_name}
                  </Typography>
                  <Typography sx={{ ...T.meta, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user.email}
                  </Typography>
                </Box>
              </Box>

              {/* Role — 12px */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 13, color: C.accent, flexShrink: 0 }} />
                <Typography sx={{ fontSize: 12, fontWeight: 500, color: C.secondary, textTransform: "capitalize", whiteSpace: "nowrap" }}>
                  {roleLabel(user.user_role)}
                </Typography>
              </Box>

              {/* Orgs */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, mr: "3px" }}>
                  <BusinessIcon sx={{ fontSize: 12, color: C.tertiary }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: C.secondary }}>{user.organisations_count}</Typography>
                </Box>
                {orgs.slice(0, 2).map(o => (
                  <Box key={o.organisation_id} sx={{
                    fontSize: 10, fontWeight: 600, px: "7px", py: "2px",
                    borderRadius: "6px", backgroundColor: C.accentSoft, color: C.accent, whiteSpace: "nowrap",
                  }}>{o.organisation_name}</Box>
                ))}
                {orgs.length > 2 && (
                  <Box sx={{
                    fontSize: 10, fontWeight: 600, px: "7px", py: "2px",
                    borderRadius: "6px", backgroundColor: "#F3F4F6", color: C.tertiary,
                  }}>+{orgs.length - 2}</Box>
                )}
              </Box>

              {/* Action */}
              <Button size="small" startIcon={<Person2OutlinedIcon sx={{ fontSize: 12 }} />}
                onClick={() => setDrawerUser(user)}
                sx={{ textTransform: "none", fontSize: 11, fontWeight: 600,
                  color: C.accent, border: `1px solid ${C.accent}`, borderRadius: "8px",
                  width: "fit-content", "&:hover": { backgroundColor: C.accentSoft } }}>
                Assign Org
              </Button>
            </Box>
          );
        })}
      </Box>

      <AssignOrgDialog user={drawerUser} onClose={() => setDrawerUser(null)} />
    </>
  );
}

/* ════════════════════════════════════════════
   ASSIGN ORG DIALOG
════════════════════════════════════════════ */
function AssignOrgDialog({ user, onClose }) {
  const [orgSearch,   setOrgSearch]   = useState("");
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [successMsg,  setSuccessMsg]  = useState("");

  const { data: orgData, isLoading: orgsLoading } = useGetMyOrganisationsQuery(undefined, { skip: !user });
  const [assignOrg, { isLoading: assigning }]     = useAssignOrganisationMutation();

  const orgs       = orgData?.data ?? [];
  const orgName    = o => o.organisation_name ?? o.name ?? "—";
  const orgId      = o => o.organisation_id   ?? o.id;
  const assignedIds = new Set((user?.organisations ?? []).map(o => o.organisation_id));
  const filteredOrgs = orgs.filter(o => orgName(o).toLowerCase().includes(orgSearch.toLowerCase()));

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
    <Dialog open={!!user} onClose={handleClose} fullWidth maxWidth="sm"
      PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden" } }}>

      <DialogTitle sx={{ px: "24px", pt: "24px", pb: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            {/* Dialog title — 15px */}
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: C.primary }}>Assign Organisation</Typography>
            {/* Sub — 12px meta */}
            <Typography sx={{ ...T.meta, mt: "2px" }}>Select an organisation to assign to this user</Typography>
          </Box>
          <IconButton size="small" onClick={handleClose} sx={{ color: C.tertiary, mt: "-4px" }}>
            <CloseIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Box>

        {/* User pill */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: "10px 12px", mt: "14px", backgroundColor: C.accentSoft, borderRadius: "10px" }}>
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

        {/* Already-assigned chips */}
        {user?.organisations?.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6, mt: "8px" }}>
            {user.organisations.map(o => (
              <Box key={o.organisation_id} sx={{
                fontSize: 10, fontWeight: 600, px: "7px", py: "2px",
                borderRadius: "6px", backgroundColor: "#F3F4F6", color: C.secondary,
              }}>{o.organisation_name}</Box>
            ))}
          </Box>
        )}
      </DialogTitle>

      <DialogContent sx={{ px: "24px", pt: "18px", pb: 0 }}>
        {successMsg && (
          <Alert severity="success" sx={{ mb: "12px", fontSize: 12, borderRadius: "8px" }}>{successMsg}</Alert>
        )}
        <Typography sx={{ ...T.label, mb: "8px" }}>Select Organisation</Typography>
        <TextField size="small" fullWidth placeholder="Search organisations…"
          value={orgSearch} onChange={e => setOrgSearch(e.target.value)}
          sx={{
            mb: "10px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px", fontSize: 13,
              "& fieldset": { borderColor: C.border },
              "&.Mui-focused fieldset": { borderColor: C.accent },
            },
          }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 15, color: C.tertiary }} /></InputAdornment> }}
        />

        <Box sx={{ border: `1px solid ${C.border}`, borderRadius: "10px", maxHeight: 260, overflowY: "auto" }}>
          {orgsLoading ? (
            <Box display="flex" justifyContent="center" py={4}><CircularProgress size={20} sx={{ color: C.accent }} /></Box>
          ) : filteredOrgs.length === 0 ? (
            <Box py={4} textAlign="center"><Typography sx={T.meta}>No organisations found.</Typography></Box>
          ) : filteredOrgs.map((org, idx) => {
            const id         = orgId(org);
            const name       = orgName(org);
            const isSelected = selectedOrg && orgId(selectedOrg) === id;
            const isAssigned = assignedIds.has(id);
            return (
              <ListItemButton key={id} disabled={isAssigned}
                onClick={() => setSelectedOrg(isSelected ? null : org)}
                sx={{
                  px: "14px", py: "9px",
                  borderBottom: idx < filteredOrgs.length - 1 ? "1px solid #F3F4F6" : "none",
                  backgroundColor: isSelected ? C.accentSoft : "transparent",
                  "&:hover": { backgroundColor: isSelected ? C.accentSoft : "#F9FAFB" },
                  opacity: isAssigned ? 0.5 : 1,
                }}>
                <Checkbox checked={!!isSelected || isAssigned} disabled={isAssigned} size="small"
                  sx={{ p: 0, mr: "10px", color: "#D1D5DB", "&.Mui-checked": { color: C.accent } }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ ...T.valueSm, fontWeight: isSelected ? 600 : 400 }}>{name}</Typography>
                  <Typography sx={T.meta}>{id?.slice(0, 8)}…</Typography>
                </Box>
                {isAssigned && (
                  <Box sx={{
                    fontSize: 10, fontWeight: 600, px: "6px", py: "2px",
                    borderRadius: "6px", backgroundColor: C.greenSoft, color: C.green,
                  }}>Assigned</Box>
                )}
              </ListItemButton>
            );
          })}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: "24px", py: "18px", gap: 1.5 }}>
        <Button fullWidth variant="outlined" onClick={handleClose} sx={{
          textTransform: "none", fontWeight: 600, fontSize: 13,
          borderColor: C.border, color: C.secondary, borderRadius: "10px",
          "&:hover": { borderColor: "#D1D5DB", backgroundColor: "#F9FAFB" },
        }}>Cancel</Button>
        <Button fullWidth variant="contained" onClick={handleAssign} disabled={!selectedOrg || assigning} sx={{
          textTransform: "none", fontWeight: 600, fontSize: 13,
          backgroundColor: C.accent, borderRadius: "10px", boxShadow: "none",
          "&:hover": { backgroundColor: "#E54E10", boxShadow: "none" },
          "&:disabled": { backgroundColor: "#F3F4F6", color: C.tertiary },
        }}>
          {assigning
            ? <CircularProgress size={15} sx={{ color: "#fff" }} />
            : `Assign${selectedOrg ? ` · ${orgName(selectedOrg).split(" ")[0]}` : ""}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}