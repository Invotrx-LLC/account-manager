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
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import BusinessIcon from "@mui/icons-material/Business";
import Person2OutlinedIcon from "@mui/icons-material/Person2Outlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";

import {
  useAssignOrganisationMutation,
  useGetAllInternalUsersQuery,
  useGetMyOrganisationsQuery,
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
} from "../../redux/services/requisition/requisition";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import WcOutlinedIcon from "@mui/icons-material/WcOutlined";

const C = {
  accent: "#FF5F1F",
  accentSoft: "#FFF0E8",
  border: "#E8E8EC",
  textPrimary: "#111118",
  textSecondary: "#5C5C70",
};

const editFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
    fontSize: 14,
    background: "#FFF7F2",
    transition: "all 0.25s ease",

    "& fieldset": {
      borderColor: "#FFD6BF",
      borderWidth: "1.5px",
    },

    "&:hover": {
      background: "#FFF1E8",
    },

    "&:hover fieldset": {
      borderColor: "#FF8A4C",
    },

    "&.Mui-focused": {
      background: "#FFFFFF",
      boxShadow: "0 0 0 4px rgba(255,95,31,0.12)",
    },

    "&.Mui-focused fieldset": {
      borderColor: "#FF5F1F",
      borderWidth: "2px",
    },
  },

  "& .MuiInputBase-input": {
    py: 1.4,
    fontWeight: 500,
    color: "#111827",
  },
};

const DIAL_CODES = [
  { code: "+91", label: "🇮🇳 +91" },
  { code: "+1", label: "🇺🇸 +1" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+61", label: "🇦🇺 +61" },
  { code: "+971", label: "🇦🇪 +971" },
  { code: "+65", label: "🇸🇬 +65" },
  { code: "+49", label: "🇩🇪 +49" },
  { code: "+33", label: "🇫🇷 +33" },
  { code: "+81", label: "🇯🇵 +81" },
  { code: "+86", label: "🇨🇳 +86" },
];

function splitPhone(fullPhone = "") {
  if (!fullPhone) return { dialCode: "+91", local: "" };
  const match = DIAL_CODES.find((d) => fullPhone.startsWith(d.code));
  if (match)
    return { dialCode: match.code, local: fullPhone.slice(match.code.length) };
  return { dialCode: "+91", local: fullPhone.replace(/^\+/, "") };
}

function getInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function roleLabel(role = "") {
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ── Field components at module level ── */
function ReadField({ label, value }) {
  return (
    <Box>
      <Typography
        fontSize={10}
        fontWeight={700}
        color="#9CA3AF"
        letterSpacing="0.07em"
        sx={{ textTransform: "capitalize", mb: "3px" }}
      >
        {label}
      </Typography>
      <Typography fontSize={13} color={value ? C.textPrimary : "#C4C4CC"}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

function EditField({ label, fieldKey, select, options = [], form, setForm }) {
  return (
    <Box>
      <Typography
        fontSize={10}
        fontWeight={700}
        color="#9CA3AF"
        letterSpacing="0.07em"
        sx={{ textTransform: "capitalize", mb: "5px" }}
      >
        {label}
      </Typography>
      {select ? (
        <TextField
          select
          size="small"
          fullWidth
          value={form[fieldKey] ?? ""}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, [fieldKey]: e.target.value }))
          }
          sx={editFieldSx}
        >
          <MenuItem value="">
            <em style={{ color: "#9CA3AF", fontStyle: "normal" }}>—</em>
          </MenuItem>
          {options.map((o) => (
            <MenuItem key={o} value={o}>
              {o}
            </MenuItem>
          ))}
        </TextField>
      ) : (
        <TextField
          size="small"
          fullWidth
          value={form[fieldKey] ?? ""}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, [fieldKey]: e.target.value }))
          }
          sx={editFieldSx}
        />
      )}
    </Box>
  );
}

function PhoneEditField({
  dialCode,
  setDialCode,
  localPhone,
  setLocalPhone,
  error,
}) {
  return (
    <Box>
      <Typography
        fontSize={10}
        fontWeight={700}
        color="#9CA3AF"
        letterSpacing="0.07em"
        sx={{ textTransform: "capitalize", mb: "5px" }}
      >
        Phone
      </Typography>
      <Box sx={{ display: "flex", gap: 1 }}>
        <FormControl size="small" sx={{ minWidth: 110 }}>
          <Select
            value={dialCode}
            onChange={(e) => setDialCode(e.target.value)}
            sx={{
              borderRadius: "8px",
              fontSize: 13,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: error ? "#EF4444" : C.border,
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#D1D5DB",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: C.accent,
              },
            }}
          >
            {DIAL_CODES.map((d) => (
              <MenuItem key={d.code} value={d.code}>
                {d.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          size="small"
          fullWidth
          placeholder="9876543210"
          value={localPhone}
          onChange={(e) => setLocalPhone(e.target.value.replace(/\D/g, ""))}
          error={!!error}
          helperText={error}
          inputProps={{ inputMode: "numeric", maxLength: 15 }}
          sx={editFieldSx}
        />
      </Box>
    </Box>
  );
}

/* ══════════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════════ */
export default function AccountManagement() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: 1 }}>
      <Typography fontSize={12} color="#9CA3AF" mb="16px">
        Manage your profile and internal user organisation assignments
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: "20px",
          minHeight: 36,
          "& .MuiTabs-indicator": {
            backgroundColor: C.accent,
            height: 2,
            borderRadius: 1,
          },
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 600,
            fontSize: 13,
            minHeight: 36,
            px: "14px",
            color: C.textSecondary,
            "&.Mui-selected": { color: C.accent },
          },
        }}
      >
        <Tab
          icon={<Person2OutlinedIcon sx={{ fontSize: 16 }} />}
          iconPosition="start"
          label="My Profile"
        />
        <Tab
          icon={<GroupOutlinedIcon sx={{ fontSize: 16 }} />}
          iconPosition="start"
          label="Users"
        />
      </Tabs>

      {tab === 0 && <MyProfileTab />}
      {tab === 1 && <UsersTab />}
    </Box>
  );
}

/* ══════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════ */
const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];
const EMP_TYPE_OPTIONS = ["Full-time", "Part-time", "Contract", "Intern"];
const EMP_STATUS_OPTIONS = ["Active", "Inactive", "On Leave", "Terminated"];
const TZ_OPTIONS = [
  "UTC",
  "Asia/Kolkata",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Australia/Sydney",
];
const ProfileInfoCard = ({ label, value, icon }) => (
  <Box
    sx={{
      p: 2,
      borderRadius: "16px",
      background: "#fff",
      border: "1px solid #ECECEC",
      boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
      transition: "0.25s ease",
      display: "flex",
      alignItems: "center",
      gap: 1.8,

      "&:hover": {
        borderColor: "#FFB38A",
        boxShadow: "0 8px 22px rgba(255,95,31,0.08)",
      },
    }}
  >
    {/* Left Icon */}
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        background: "#F3F4F6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>

    {/* Right Text */}
    <Box>
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 500,
          color: "#9CA3AF",
          mb: "2px",
          textTransform: "capitalize",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: 15,
          fontWeight: 600,
          color: "#111827",
          textTransform: "capitalize",
        }}
      >
        {value || "—"}
      </Typography>
    </Box>
  </Box>
);
/* ══════════════════════════════════════════════════
   MY PROFILE TAB
══════════════════════════════════════════════════ */
function MyProfileTab() {
  const { data, isLoading, isError, refetch } = useGetMyProfileQuery();
  const [updateProfile, { isLoading: saving }] = useUpdateMyProfileMutation();

  const profile = data?.data ?? {};

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [dialCode, setDialCode] = useState("+91");
  const [localPhone, setLocalPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [toast, setToast] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  const startEdit = () => {
    const { dialCode: dc, local } = splitPhone(profile.phone);
    setDialCode(dc);
    setLocalPhone(local);
    setPhoneError("");
    setForm({
      first_name: profile.first_name ?? "",
      last_name: profile.last_name ?? "",
      emp_id: profile.emp_id ?? "",
      department: profile.department ?? "",
      emp_type: profile.emp_type ?? "",
      emp_status: profile.emp_status ?? "",
      gender: profile.gender ?? "",
      emp_designation: profile.emp_designation ?? "",
      time_zone: profile.time_zone ?? "",
    });
    setEditing(true);
  };

  const handleSave = async () => {
    if (localPhone && (localPhone.length < 7 || localPhone.length > 15)) {
      setPhoneError("Enter a valid phone number (7–15 digits)");
      return;
    }
    setPhoneError("");
    const toNullIfEmpty = (v) => (v === "" ? null : v);
    const payload = {
      first_name: toNullIfEmpty(form.first_name),
      last_name: toNullIfEmpty(form.last_name),
      phone: localPhone ? `${dialCode}${localPhone}` : null,
      emp_id: toNullIfEmpty(form.emp_id),
      department: toNullIfEmpty(form.department),
      emp_type: toNullIfEmpty(form.emp_type),
      emp_status: toNullIfEmpty(form.emp_status),
      gender: toNullIfEmpty(form.gender),
      emp_designation: toNullIfEmpty(form.emp_designation),
      time_zone: toNullIfEmpty(form.time_zone),
    };
    try {
      await updateProfile(payload).unwrap();
      await refetch();
      setToast({
        open: true,
        msg: "Profile updated successfully!",
        severity: "success",
      });
      setEditing(false);
    } catch (err) {
      setToast({
        open: true,
        msg: err?.data?.message ?? "Failed to update profile.",
        severity: "error",
      });
    }
  };

  if (isLoading && !profile?.full_name) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress sx={{ color: C.accent }} />
      </Box>
    );
  }
  if (isError)
    return (
      <Alert severity="error" sx={{ borderRadius: "10px" }}>
        Failed to load profile.
      </Alert>
    );

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        border: `1px solid ${C.border}`,
        borderRadius: "14px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: "24px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              width: 52,
              height: 52,
              bgcolor: C.accent,
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            {getInitials(profile.full_name)}
          </Avatar>
          <Box>
            <Typography fontSize={16} fontWeight={700} color={C.textPrimary}>
              {profile.full_name || "—"}
            </Typography>
            <Typography fontSize={12} color="#9CA3AF">
              {profile.email}
            </Typography>
          </Box>
        </Box>
        {!editing ? (
          <Button
            size="small"
            startIcon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
            onClick={startEdit}
            sx={{
              textTransform: "none",
              fontSize: 12,
              fontWeight: 600,
              color: C.accent,
              border: `1px solid ${C.accent}`,
              borderRadius: "8px",
              "&:hover": { backgroundColor: C.accentSoft },
            }}
          >
            Edit Profile
          </Button>
        ) : (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              size="small"
              onClick={() => {
                setEditing(false);
                setPhoneError("");
              }}
              sx={{
                textTransform: "none",
                fontSize: 12,
                fontWeight: 600,
                color: C.textSecondary,
                border: `1px solid ${C.border}`,
                borderRadius: "8px",
                "&:hover": { backgroundColor: "#F9FAFB" },
              }}
            >
              Cancel
            </Button>
            <Button
              size="small"
              onClick={handleSave}
              disabled={saving}
              startIcon={
                saving ? (
                  <CircularProgress size={12} sx={{ color: "#fff" }} />
                ) : (
                  <SaveOutlinedIcon sx={{ fontSize: 14 }} />
                )
              }
              sx={{
                textTransform: "none",
                fontSize: 12,
                fontWeight: 600,
                color: "#fff",
                backgroundColor: C.accent,
                borderRadius: "8px",
                "&:hover": { backgroundColor: "#E54E10" },
                "&:disabled": { backgroundColor: "#F3F4F6", color: "#9CA3AF" },
              }}
            >
              Save Changes
            </Button>
          </Box>
        )}
      </Box>

      {/* Body */}
      <Box sx={{ p: "24px" }}>
        <Typography
          fontSize={11}
          fontWeight={700}
          color="#9CA3AF"
          letterSpacing="0.08em"
          sx={{ textTransform: "capitalize", mb: "16px" }}
        >
          Basic Information
        </Typography>
        <Grid container spacing={3} mb="28px">
          {editing ? (
            <>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <EditField
                  label="First Name"
                  fieldKey="first_name"
                  form={form}
                  setForm={setForm}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <EditField
                  label="Last Name"
                  fieldKey="last_name"
                  form={form}
                  setForm={setForm}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <PhoneEditField
                  dialCode={dialCode}
                  setDialCode={setDialCode}
                  localPhone={localPhone}
                  setLocalPhone={setLocalPhone}
                  error={phoneError}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <EditField
                  label="Gender"
                  fieldKey="gender"
                  form={form}
                  setForm={setForm}
                  select
                  options={GENDER_OPTIONS}
                />
              </Grid>
            </>
          ) : (
            <>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <ProfileInfoCard
                  label="First Name"
                  value={profile.first_name}
                  icon={
                    <PersonOutlineOutlinedIcon
                      sx={{ color: "#FF6B2C", fontSize: 20 }}
                    />
                  }
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                {" "}
                <ProfileInfoCard
                  label="Last Name"
                  value={profile.last_name}
                  icon={<PersonOutlineOutlinedIcon sx={{ color: "#FF6B2C" }} />}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                {" "}
                <ProfileInfoCard
                  label="Phone"
                  value={profile.phone}
                  icon={<PhoneOutlinedIcon sx={{ color: "#10B981" }} />}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                {" "}
                <ProfileInfoCard
                  label="Gender"
                  value={profile.gender}
                  icon={<WcOutlinedIcon sx={{ color: "#8B5CF6" }} />}
                />
              </Grid>
            </>
          )}
        </Grid>

        <Box sx={{ borderTop: "1px solid #F3F4F6", mb: "24px" }} />

        <Typography
          fontSize={11}
          fontWeight={700}
          color="#9CA3AF"
          letterSpacing="0.08em"
          sx={{ textTransform: "capitalize", mb: "16px" }}
        >
          Employment Details
        </Typography>
        <Grid container spacing={3}>
          {editing ? (
            <>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <EditField
                  label="Employee ID"
                  fieldKey="emp_id"
                  form={form}
                  setForm={setForm}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <EditField
                  label="Department"
                  fieldKey="department"
                  form={form}
                  setForm={setForm}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <EditField
                  label="Designation"
                  fieldKey="emp_designation"
                  form={form}
                  setForm={setForm}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <EditField
                  label="Employee Type"
                  fieldKey="emp_type"
                  form={form}
                  setForm={setForm}
                  select
                  options={EMP_TYPE_OPTIONS}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <EditField
                  label="Status"
                  fieldKey="emp_status"
                  form={form}
                  setForm={setForm}
                  select
                  options={EMP_STATUS_OPTIONS}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <EditField
                  label="Time Zone"
                  fieldKey="time_zone"
                  form={form}
                  setForm={setForm}
                  select
                  options={TZ_OPTIONS}
                />
              </Grid>
            </>
          ) : (
            <>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <ProfileInfoCard
                  label="Employee ID"
                  value={profile.emp_id}
                  icon={<BadgeOutlinedIcon sx={{ color: "#3B82F6" }} />}
                />
              </Grid>

              <Grid item size={{ xs: 12, sm: 6 }}>
                <ProfileInfoCard
                  label="Department"
                  value={profile.department}
                  icon={<WorkOutlineOutlinedIcon sx={{ color: "#F59E0B" }} />}
                />
              </Grid>

              <Grid item size={{ xs: 12, sm: 6 }}>
                <ProfileInfoCard
                  label="Designation"
                  value={profile.emp_designation}
                  icon={<WorkOutlineOutlinedIcon sx={{ color: "#EF4444" }} />}
                />
              </Grid>

              <Grid item size={{ xs: 12, sm: 6 }}>
                <ProfileInfoCard
                  label="Employee Type"
                  value={profile.emp_type}
                  icon={<BadgeOutlinedIcon sx={{ color: "#14B8A6" }} />}
                />
              </Grid>

              <Grid item size={{ xs: 12, sm: 6 }}>
                <ProfileInfoCard
                  label="Status"
                  value={profile.emp_status}
                  icon={<BadgeOutlinedIcon sx={{ color: "#6366F1" }} />}
                />
              </Grid>

              <Grid item size={{ xs: 12, sm: 6 }}>
                <ProfileInfoCard
                  label="Time Zone"
                  value={profile.time_zone}
                  icon={<PublicOutlinedIcon sx={{ color: "#EC4899" }} />}
                />
              </Grid>
            </>
          )}
        </Grid>
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          sx={{ borderRadius: "10px", fontSize: 13 }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

/* ══════════════════════════════════════════════════
   USERS TAB  — matches actual API response shape
══════════════════════════════════════════════════ */
function UsersTab() {
  const [search, setSearch] = useState("");
  const [drawerUser, setDrawerUser] = useState(null);

  const { data, isLoading, isError } = useGetAllInternalUsersQuery();
  const users = data?.data ?? [];

  const filtered = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading)
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress sx={{ color: C.accent }} />
      </Box>
    );
  if (isError) return <Alert severity="error">Failed to load users.</Alert>;

  return (
    <>
      <TextField
        size="small"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{
          mb: "16px",
          width: 320,
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            fontSize: 13,
            "& fieldset": { borderColor: C.border },
            "&:hover fieldset": { borderColor: "#D1D5DB" },
            "&.Mui-focused fieldset": { borderColor: C.accent },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Table */}
      <Box
        sx={{
          border: `1px solid ${C.border}`,
          borderRadius: "12px",
          overflow: "hidden",
          backgroundColor: "#fff",
        }}
      >
        {/* Header row */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "2fr 1.2fr 1.5fr 120px",
            px: "16px",
            py: "10px",
            backgroundColor: "#F9FAFB",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          {["User", "Role", "Organisations", "Action"].map((h) => (
            <Typography
              key={h}
              fontSize={11}
              fontWeight={700}
              color="#9CA3AF"
              sx={{ textTransform: "capitalize", letterSpacing: "0.06em" }}
            >
              {h}
            </Typography>
          ))}
        </Box>

        {filtered.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography fontSize={13} color={C.textSecondary}>
              No users found.
            </Typography>
          </Box>
        ) : (
          filtered.map((user, idx) => {
            const orgs = user.organisations ?? [];

            return (
              <Box
                key={user.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1.2fr 1.5fr 120px",
                  px: "16px",
                  py: "14px",
                  alignItems: "center",
                  borderBottom:
                    idx < filtered.length - 1 ? "1px solid #F3F4F6" : "none",
                  "&:hover": { backgroundColor: "#FAFAFA" },
                }}
              >
                {/* ── User: avatar + name + email ── */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: C.accent,
                      fontSize: 13,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(user.full_name)}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      fontSize={13}
                      fontWeight={600}
                      color={C.textPrimary}
                      sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {user.full_name}
                    </Typography>
                    <Typography
                      fontSize={11}
                      color="#9CA3AF"
                      sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {user.email}
                    </Typography>
                  </Box>
                </Box>

                {/* ── Role ── */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                  <AdminPanelSettingsOutlinedIcon
                    sx={{ fontSize: 14, color: C.accent, flexShrink: 0 }}
                  />
                  <Typography
                    fontSize={12}
                    color={C.textSecondary}
                    sx={{ textTransform: "capitalize", whiteSpace: "nowrap" }}
                  >
                    {roleLabel(user.user_role)}
                  </Typography>
                </Box>

                {/* ── Organisations: count + first 2 as chips ── */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.6,
                    flexWrap: "wrap",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.4,
                      mr: "4px",
                    }}
                  >
                    <BusinessIcon sx={{ fontSize: 13, color: "#9CA3AF" }} />
                    <Typography
                      fontSize={12}
                      color={C.textSecondary}
                      fontWeight={600}
                    >
                      {user.organisations_count}
                    </Typography>
                  </Box>
                  {orgs.slice(0, 2).map((o) => (
                    <Box
                      key={o.organisation_id}
                      sx={{
                        fontSize: 10,
                        fontWeight: 600,
                        px: "7px",
                        py: "2px",
                        borderRadius: "6px",
                        backgroundColor: C.accentSoft,
                        color: C.accent,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {o.organisation_name}
                    </Box>
                  ))}
                  {orgs.length > 2 && (
                    <Box
                      sx={{
                        fontSize: 10,
                        fontWeight: 600,
                        px: "7px",
                        py: "2px",
                        borderRadius: "6px",
                        backgroundColor: "#F3F4F6",
                        color: "#9CA3AF",
                      }}
                    >
                      +{orgs.length - 2}
                    </Box>
                  )}
                </Box>

                {/* ── Action ── */}
                <Button
                  size="small"
                  startIcon={<Person2OutlinedIcon sx={{ fontSize: 13 }} />}
                  onClick={() => setDrawerUser(user)}
                  sx={{
                    textTransform: "none",
                    fontSize: 11,
                    fontWeight: 600,
                    color: C.accent,
                    border: `1px solid ${C.accent}`,
                    borderRadius: "8px",
                    width: "fit-content",
                    "&:hover": { backgroundColor: C.accentSoft },
                  }}
                >
                  Assign Org
                </Button>
              </Box>
            );
          })
        )}
      </Box>

      <AssignOrgDialog user={drawerUser} onClose={() => setDrawerUser(null)} />
    </>
  );
}

/* ══════════════════════════════════════════════════
   ASSIGN ORG DIALOG
══════════════════════════════════════════════════ */
function AssignOrgDialog({ user, onClose }) {
  const [orgSearch, setOrgSearch] = useState("");
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const { data: orgData, isLoading: orgsLoading } = useGetMyOrganisationsQuery(
    undefined,
    { skip: !user },
  );
  const [assignOrg, { isLoading: assigning }] = useAssignOrganisationMutation();

  const orgs = orgData?.data ?? [];
  const orgName = (o) => o.organisation_name ?? o.name ?? "—";
  const orgId = (o) => o.organisation_id ?? o.id;

  // Already-assigned org IDs for this user
  const assignedIds = new Set(
    (user?.organisations ?? []).map((o) => o.organisation_id),
  );

  const filteredOrgs = orgs.filter((o) =>
    orgName(o).toLowerCase().includes(orgSearch.toLowerCase()),
  );

  const handleAssign = async () => {
    if (!selectedOrg || !user) return;
    try {
      await assignOrg({
        user_id: user.id,
        organisation_id: orgId(selectedOrg),
      }).unwrap();
      setSuccessMsg(`Successfully assigned to ${orgName(selectedOrg)}`);
      setSelectedOrg(null);
      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 1800);
    } catch (err) {
      console.error("Assign failed:", err);
    }
  };

  const handleClose = () => {
    setOrgSearch("");
    setSelectedOrg(null);
    setSuccessMsg("");
    onClose();
  };

  return (
    <Dialog
      open={!!user}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden" } }}
    >
      <DialogTitle sx={{ px: "24px", pt: "24px", pb: 0 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography fontSize={16} fontWeight={700} color={C.textPrimary}>
              Assign Organisation
            </Typography>
            <Typography fontSize={12} color="#9CA3AF" mt="2px">
              Select an organisation to assign to this user
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={handleClose}
            sx={{ color: "#9CA3AF", mt: "-4px" }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* User pill */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: "12px",
            mt: "16px",
            backgroundColor: C.accentSoft,
            borderRadius: "10px",
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: C.accent,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {getInitials(user?.full_name ?? "")}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontSize={13} fontWeight={600} color={C.textPrimary}>
              {user?.full_name}
            </Typography>
            <Typography fontSize={11} color={C.textSecondary}>
              {user?.email}
            </Typography>
          </Box>
          <Box
            sx={{
              fontSize: 11,
              fontWeight: 600,
              color: C.accent,
              whiteSpace: "nowrap",
            }}
          >
            {user?.organisations_count} org
            {user?.organisations_count !== 1 ? "s" : ""}
          </Box>
        </Box>

        {/* Already assigned org chips */}
        {user?.organisations?.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6, mt: "10px" }}>
            {user.organisations.map((o) => (
              <Box
                key={o.organisation_id}
                sx={{
                  fontSize: 10,
                  fontWeight: 600,
                  px: "8px",
                  py: "3px",
                  borderRadius: "6px",
                  backgroundColor: "#F3F4F6",
                  color: C.textSecondary,
                }}
              >
                {o.organisation_name}
              </Box>
            ))}
          </Box>
        )}
      </DialogTitle>

      <DialogContent sx={{ px: "24px", pt: "20px", pb: 0 }}>
        {successMsg && (
          <Alert
            severity="success"
            sx={{ mb: "14px", fontSize: 12, borderRadius: "8px" }}
          >
            {successMsg}
          </Alert>
        )}

        <Typography
          fontSize={11}
          fontWeight={700}
          color="#9CA3AF"
          letterSpacing="0.08em"
          mb="10px"
          sx={{ textTransform: "capitalize" }}
        >
          Select Organisation
        </Typography>

        <TextField
          size="small"
          fullWidth
          placeholder="Search organisations..."
          value={orgSearch}
          onChange={(e) => setOrgSearch(e.target.value)}
          sx={{
            mb: "12px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              fontSize: 13,
              "& fieldset": { borderColor: C.border },
              "&.Mui-focused fieldset": { borderColor: C.accent },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
              </InputAdornment>
            ),
          }}
        />

        <Box
          sx={{
            border: `1px solid ${C.border}`,
            borderRadius: "10px",
            maxHeight: 280,
            overflowY: "auto",
          }}
        >
          {orgsLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={20} sx={{ color: C.accent }} />
            </Box>
          ) : filteredOrgs.length === 0 ? (
            <Box py={4} textAlign="center">
              <Typography fontSize={13} color={C.textSecondary}>
                No organisations found.
              </Typography>
            </Box>
          ) : (
            filteredOrgs.map((org, idx) => {
              const id = orgId(org);
              const name = orgName(org);
              const isSelected = selectedOrg && orgId(selectedOrg) === id;
              const isAssigned = assignedIds.has(id);

              return (
                <ListItemButton
                  key={id}
                  disabled={isAssigned}
                  onClick={() => setSelectedOrg(isSelected ? null : org)}
                  sx={{
                    px: "14px",
                    py: "10px",
                    borderBottom:
                      idx < filteredOrgs.length - 1
                        ? "1px solid #F3F4F6"
                        : "none",
                    backgroundColor: isSelected ? C.accentSoft : "transparent",
                    "&:hover": {
                      backgroundColor: isSelected ? C.accentSoft : "#F9FAFB",
                    },
                    opacity: isAssigned ? 0.5 : 1,
                  }}
                >
                  <Checkbox
                    checked={!!isSelected || isAssigned}
                    disabled={isAssigned}
                    size="small"
                    sx={{
                      p: 0,
                      mr: "10px",
                      color: "#D1D5DB",
                      "&.Mui-checked": { color: C.accent },
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      fontSize={13}
                      fontWeight={isSelected ? 600 : 400}
                      color={C.textPrimary}
                    >
                      {name}
                    </Typography>
                    <Typography fontSize={11} color="#9CA3AF">
                      {id?.slice(0, 8)}…
                    </Typography>
                  </Box>
                  {isAssigned && (
                    <Box
                      sx={{
                        fontSize: 10,
                        fontWeight: 600,
                        px: "6px",
                        py: "2px",
                        borderRadius: "6px",
                        backgroundColor: C.greenSoft ?? "#E7F8EE",
                        color: "#0F6E56",
                      }}
                    >
                      Assigned
                    </Box>
                  )}
                </ListItemButton>
              );
            })
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: "24px", py: "20px", gap: 1.5 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleClose}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: 13,
            borderColor: C.border,
            color: C.textSecondary,
            borderRadius: "10px",
            "&:hover": { borderColor: "#D1D5DB", backgroundColor: "#F9FAFB" },
          }}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={handleAssign}
          disabled={!selectedOrg || assigning}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: 13,
            backgroundColor: C.accent,
            borderRadius: "10px",
            boxShadow: "none",
            "&:hover": { backgroundColor: "#E54E10", boxShadow: "none" },
            "&:disabled": { backgroundColor: "#F3F4F6", color: "#9CA3AF" },
          }}
        >
          {assigning ? (
            <CircularProgress size={16} sx={{ color: "#fff" }} />
          ) : (
            `Assign${selectedOrg ? ` · ${orgName(selectedOrg).split(" ")[0]}` : ""}`
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
