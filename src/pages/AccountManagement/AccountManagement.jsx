import React, { useState } from "react";
import {
  Box, Typography, CircularProgress, Alert, Avatar,
  Chip, Button, Drawer, Divider, TextField, InputAdornment,
  List, ListItem, ListItemText, ListItemButton, Checkbox,
  IconButton, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import SearchIcon        from "@mui/icons-material/Search";
import CloseIcon         from "@mui/icons-material/Close";
import BusinessIcon      from "@mui/icons-material/Business";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";


import { useAssignOrganisationMutation, useGetAllInternalUsersQuery, useGetMyOrganisationsQuery } from "../../redux/services/requisition/requisition";

const C = {
  accent:      "#FF5F1F",
  accentSoft:  "#FFF0E8",
  border:      "#E8E8EC",
  textPrimary: "#111118",
  textSecondary:"#5C5C70",
};

function getInitials(name = "") {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
export default function AccountManagement() {
  const [search, setSearch]         = useState("");
  const [drawerUser, setDrawerUser] = useState(null); // user object

  const { data, isLoading, isError } = useGetAllInternalUsersQuery();
  const users = data?.data ?? [];

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress sx={{ color: C.accent }} />
      </Box>
    );
  }

  if (isError) {
    return <Alert severity="error" sx={{ m: 3 }}>Failed to load users.</Alert>;
  }

  return (
    <Box sx={{ p: 1 }}>

      {/* Header */}
      <Typography fontSize={20} fontWeight={700} color={C.textPrimary} mb="4px">
        Account Management
      </Typography>
      <Typography fontSize={12} color="#9CA3AF" mb="20px">
        Manage internal users and their organisation assignments
      </Typography>

      {/* Search */}
      <TextField
        size="small"
        placeholder="Search users..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        sx={{
          mb: "16px", width: 300,
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px", fontSize: 13,
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

      {/* Users table */}
      <Box sx={{ border: `1px solid ${C.border}`, borderRadius: "12px", overflow: "hidden", backgroundColor: "#fff" }}>

        {/* Table header */}
        <Box sx={{
          display: "grid", gridTemplateColumns: "1fr 160px 140px",
          px: "16px", py: "10px", backgroundColor: "#F9FAFB",
          borderBottom: `1px solid ${C.border}`,
        }}>
          {["User", "Organisations", "Action"].map(h => (
            <Typography key={h} fontSize={11} fontWeight={700} color="#9CA3AF"
              sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {h}
            </Typography>
          ))}
        </Box>

        {/* Rows */}
        {filtered.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography fontSize={13} color={C.textSecondary}>No users found.</Typography>
          </Box>
        ) : (
          filtered.map((user, idx) => (
            <Box
              key={user.id}
              sx={{
                display: "grid", gridTemplateColumns: "1fr 160px 140px",
                px: "16px", py: "14px", alignItems: "center",
                borderBottom: idx < filtered.length - 1 ? `1px solid #F3F4F6` : "none",
                "&:hover": { backgroundColor: "#FAFAFA" },
              }}
            >
              {/* User */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar sx={{ width: 34, height: 34, bgcolor: C.accent, fontSize: 12, fontWeight: 700 }}>
                  {getInitials(user.full_name)}
                </Avatar>
                <Box>
                  <Typography fontSize={13} fontWeight={600} color={C.textPrimary}>
                    {user.full_name}
                  </Typography>
                  <Typography fontSize={11} color="#9CA3AF">{user.id.slice(0, 8)}…</Typography>
                </Box>
              </Box>

              {/* Org count */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <BusinessIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />
                <Typography fontSize={13} color={C.textSecondary}>
                  {user.organisations_count}{" "}
                  <span style={{ color: "#9CA3AF" }}>org{user.organisations_count !== 1 ? "s" : ""}</span>
                </Typography>
              </Box>

              {/* Action */}
              <Button
                size="small"
                startIcon={<PersonAddOutlinedIcon sx={{ fontSize: 14 }} />}
                onClick={() => setDrawerUser(user)}
                sx={{
                  textTransform: "none", fontSize: 12, fontWeight: 600,
                  color: C.accent, borderColor: C.accent, borderRadius: "8px",
                  border: "1px solid",
                  "&:hover": { backgroundColor: C.accentSoft, borderColor: C.accent },
                  width: "fit-content",
                }}
              >
                Assign Org
              </Button>
            </Box>
          ))
        )}
      </Box>

      {/* Drawer */}
      <AssignOrgDrawer
        user={drawerUser}
        onClose={() => setDrawerUser(null)}
      />
    </Box>
  );
}

/* ═══════════════════════════════════════════════
   ASSIGN ORG DRAWER
═══════════════════════════════════════════════ */
function AssignOrgDrawer({ user, onClose }) {
  const [orgSearch, setOrgSearch]     = useState("");
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [successMsg, setSuccessMsg]   = useState("");

  const { data: orgData, isLoading: orgsLoading } = useGetMyOrganisationsQuery(undefined, {
    skip: !user,
  });

  const [assignOrg, { isLoading: assigning }] = useAssignOrganisationMutation();

  const orgs        = orgData?.data ?? [];
  const orgName     = (o) => o.organisation_name ?? o.name ?? "—";
  const orgId       = (o) => o.organisation_id   ?? o.id;

  const filteredOrgs = orgs.filter(o =>
    orgName(o).toLowerCase().includes(orgSearch.toLowerCase())
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
      setTimeout(() => { setSuccessMsg(""); onClose(); }, 1800);
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
      PaperProps={{
        sx: { borderRadius: "16px", overflow: "hidden" },
      }}
    >
      {/* ── Title ── */}
      <DialogTitle sx={{ px: "24px", pt: "24px", pb: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography fontSize={16} fontWeight={700} color={C.textPrimary}>
              Assign Organisation
            </Typography>
            <Typography fontSize={12} color="#9CA3AF" mt="2px">
              Select an organisation to assign to this user
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleClose} sx={{ color: "#9CA3AF", mt: "-4px" }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* User pill */}
        <Box sx={{
          display: "flex", alignItems: "center", gap: 1.5,
          p: "12px", mt: "16px",
          backgroundColor: C.accentSoft, borderRadius: "10px",
        }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: C.accent, fontSize: 12, fontWeight: 700 }}>
            {getInitials(user?.full_name ?? "")}
          </Avatar>
          <Box>
            <Typography fontSize={13} fontWeight={600} color={C.textPrimary}>
              {user?.full_name}
            </Typography>
            <Typography fontSize={11} color={C.textSecondary}>
              {user?.organisations_count} org{user?.organisations_count !== 1 ? "s" : ""} currently assigned
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      {/* ── Content ── */}
      <DialogContent sx={{ px: "24px", pt: "20px", pb: 0 }}>

        {successMsg && (
          <Alert severity="success" sx={{ mb: "14px", fontSize: 12, borderRadius: "8px" }}>
            {successMsg}
          </Alert>
        )}

        <Typography fontSize={11} fontWeight={700} color="#9CA3AF"
          letterSpacing="0.08em" mb="10px" sx={{ textTransform: "uppercase" }}>
          Select Organisation
        </Typography>

        {/* Search */}
        <TextField
          size="small"
          fullWidth
          placeholder="Search organisations..."
          value={orgSearch}
          onChange={e => setOrgSearch(e.target.value)}
          sx={{
            mb: "12px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px", fontSize: 13,
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

        {/* Org list — fixed height, scrollable */}
        <Box sx={{
          border: `1px solid ${C.border}`, borderRadius: "10px",
          maxHeight: 280, overflowY: "auto",
        }}>
          {orgsLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={20} sx={{ color: C.accent }} />
            </Box>
          ) : filteredOrgs.length === 0 ? (
            <Box py={4} textAlign="center">
              <Typography fontSize={13} color={C.textSecondary}>No organisations found.</Typography>
            </Box>
          ) : (
            filteredOrgs.map((org, idx) => {
              const id         = orgId(org);
              const name       = orgName(org);
              const isSelected = selectedOrg && orgId(selectedOrg) === id;

              return (
                <ListItemButton
                  key={id}
                  onClick={() => setSelectedOrg(isSelected ? null : org)}
                  sx={{
                    px: "14px", py: "10px",
                    borderBottom: idx < filteredOrgs.length - 1 ? "1px solid #F3F4F6" : "none",
                    backgroundColor: isSelected ? C.accentSoft : "transparent",
                    "&:hover": { backgroundColor: isSelected ? C.accentSoft : "#F9FAFB" },
                  }}
                >
                  <Checkbox
                    checked={!!isSelected}
                    size="small"
                    sx={{
                      p: 0, mr: "10px", color: "#D1D5DB",
                      "&.Mui-checked": { color: C.accent },
                    }}
                  />
                  <Box>
                    <Typography fontSize={13} fontWeight={isSelected ? 600 : 400} color={C.textPrimary}>
                      {name}
                    </Typography>
                    <Typography fontSize={11} color="#9CA3AF">{id?.slice(0, 8)}…</Typography>
                  </Box>
                </ListItemButton>
              );
            })
          )}
        </Box>
      </DialogContent>

      {/* ── Actions ── */}
      <DialogActions sx={{ px: "24px", py: "20px", gap: 1.5 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleClose}
          sx={{
            textTransform: "none", fontWeight: 600, fontSize: 13,
            borderColor: C.border, color: C.textSecondary, borderRadius: "10px",
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
            textTransform: "none", fontWeight: 600, fontSize: 13,
            backgroundColor: C.accent, borderRadius: "10px", boxShadow: "none",
            "&:hover": { backgroundColor: "#E54E10", boxShadow: "none" },
            "&:disabled": { backgroundColor: "#F3F4F6", color: "#9CA3AF" },
          }}
        >
          {assigning
            ? <CircularProgress size={16} sx={{ color: "#fff" }} />
            : `Assign${selectedOrg ? ` · ${orgName(selectedOrg).split(" ")[0]}` : ""}`
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
}