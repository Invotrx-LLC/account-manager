// src/layout/DrawerLayout.jsx
import React, { useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Typography,
} from "@mui/material";
import {
  Dashboard,
  Business,
  People,
  Work,
  NotificationsNone,
  Menu as MenuIcon,
  Logout,
  ManageAccountsOutlined,
} from "@mui/icons-material";
import NavigateNextIcon from "@mui/icons-material/NavigateNextRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import { getTrailForPath, resolveTrail } from "../components/Breadcrumbconf";
import { selectDynamicLabels } from "../redux/slices/breadcrumbSlice";
import { useLazyLogoutQuery } from "../redux/services/auth/auth";
import { candidateClearLocalStorage } from "../utils/constants";
// import { selectDynamicLabels } from "../redux/slices/breadcrumbSlice"; // 👈

const drawerWidth = 220;
const collapsedWidth = 72;

const sidebarSections = [
  {
    title: "Main",
    items: [
      {
        label: "Dashboard",
        icon: <Dashboard />,
        path: "/account-manager/dashboard",
      },
    ],
  },
  {
    title: "Workspace",
    items: [
      // {
      //   label: "Dashboard",
      //   icon: <Dashboard />,
      //   path: "/account-manager/dashboard",
      // },
      {
        label: "Organization",
        icon: <Business />,
        path: "/account-manager/organization",
      },
      // {
      //   label: "Requisitions",
      //   icon: <Work />,
      //   path: "/account-manager/requisitions",
      // },
      // {
      //   label: "Interviews",
      //   icon: <People />,
      //   path: "/account-manager/interviews",
      // },
      {
        label: "User Management",
        icon: <ManageAccountsOutlined />,
        path: "/account-manager/account-management",
      }, // 👈 new
      {
        label: "Candidates",
        icon: <People />,
        path: "/account-manager/candidates",
        disabled: true,
      },
      // {
      //   label: "Upload Candidates",
      //   icon: <People />,
      //   path: "/account-manager/upload-candidates",
      //   disabled: true,
      // },
    ],
  },
  {
    title: "Help",
    items: [
      {
        label: "Settings",
        icon: <Work />,
        path: "/account-manager/settings",
        disabled: true,
      },
    ],
  },
];

/* ── TopBarBreadcrumb ── */
function TopBarBreadcrumb() {
  const location = useLocation();
  const navigate = useNavigate();
  const dynamicLabels = useSelector(selectDynamicLabels); // 👈 reads from Redux

  const rawTrail = getTrailForPath(location.pathname);
  if (!rawTrail) return null;

  const crumbs = resolveTrail(rawTrail, dynamicLabels);
  if (crumbs.length === 0) return null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        overflow: "hidden",
        flexShrink: 1,
      }}
    >
      <Box
        onClick={() => navigate("/account-manager/dashboard")}
        sx={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          px: 0.8,
          py: 0.4,
          borderRadius: "6px",
          "&:hover": { backgroundColor: "#f5f5f0" },
        }}
      >
        <HomeRoundedIcon sx={{ fontSize: 15, color: "#bbb" }} />
      </Box>

      {crumbs.map((c, idx) => {
        const IconComp = c.icon;
        return (
          <React.Fragment key={idx}>
            <NavigateNextIcon
              sx={{ fontSize: 15, color: "#ddd", flexShrink: 0 }}
            />
            <Box
              onClick={!c.isLast && c.path ? () => navigate(c.path) : undefined}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                px: 0.8,
                py: 0.4,
                borderRadius: "6px",
                cursor: c.isLast || !c.path ? "default" : "pointer",
                backgroundColor: c.isLast ? "#fff5f0" : "transparent",
                "&:hover":
                  !c.isLast && c.path ? { backgroundColor: "#f5f5f0" } : {},
              }}
            >
              {IconComp && (
                <IconComp
                  sx={{ fontSize: 13, color: c.isLast ? "#FF5F1F" : "#aaa" }}
                />
              )}
              <Typography
                sx={{
                  fontSize: "12.5px",
                  fontWeight: c.isLast ? 600 : 500,
                  color: c.isLast ? "#FF5F1F" : "#888",
                  whiteSpace: "nowrap",
                }}
              >
                {c.label}
              </Typography>
            </Box>
          </React.Fragment>
        );
      })}
    </Box>
  );
}

/* ── DrawerLayout ── */
const DrawerLayout = () => {
  const [open, setOpen] = useState(true);
  const [triggerLogout, { isLoading: logoutLoading }] = useLazyLogoutQuery();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await triggerLogout().unwrap();

      candidateClearLocalStorage();
      toast.success("Logged out successfully ✅");

      navigate("/login");
    } catch (err) {
      console.log("Logout error:", err);

      // fallback logout
      candidateClearLocalStorage();
      navigate("/login");
    }
  };
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* SIDEBAR */}
      <Drawer
        variant="permanent"
        sx={{
          width: open ? drawerWidth : collapsedWidth,
          flexShrink: 0,
          transition: "width 0.3s",
          "& .MuiDrawer-paper": {
            width: open ? drawerWidth : collapsedWidth,
            transition: "width 0.3s",
            overflowX: "hidden",
            borderRight: "1px solid #e8e8e0",
            backgroundColor: "#fff",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: 2,
            borderBottom: "1px solid #f0f0e8",
            minHeight: 52,
          }}
        >
          <IconButton onClick={() => setOpen(!open)} sx={{ mr: open ? 1 : 0 }}>
            <MenuIcon />
          </IconButton>
          {open && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                letterSpacing: "-0.5px",
                color: "#1a1a1a",
              }}
            >
              RI<span style={{ color: "#ff5722" }}>8</span>FIT
            </Typography>
          )}
        </Box>

        <Box sx={{ flexGrow: 1, overflowY: "auto", py: 1 }}>
          {sidebarSections.map((section, si) => (
            <Box key={si} sx={{ mb: 1.5 }}>
              {open && (
                <Typography
                  sx={{
                    px: 3,
                    py: 1,
                    fontSize: "10.5px",
                    fontWeight: 600,
                    color: "#bbb",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                  }}
                >
                  {section.title}
                </Typography>
              )}
              <List disablePadding>
                {section.items.map((item, idx) => (
                  <ListItemButton
                    key={idx}
                    component={NavLink}
                    to={item.path}
                    disabled={item.disabled}
                    className={
                      location.pathname.includes("/org") &&
                      item.label === "Organization"
                        ? "active"
                        : location.pathname.startsWith(item.path)
                          ? "active"
                          : ""
                    }
                    sx={{
                      mx: 1.5,
                      my: 0.3,
                      borderRadius: "8px",
                      color: "#555",

                      "&.active": {
                        backgroundColor: "#fff0eb",
                        color: "#ff5722",
                        fontWeight: 500,
                      },

                      "&:hover": {
                        backgroundColor: "#fff5f0",
                        color: "#ff5722",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 2 : "auto",
                        color: "inherit",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {open && (
                      <ListItemText
                        primary={item.label}
                        sx={{
                          "& .MuiTypography-root": {
                            fontSize: "13.5px",
                          },
                        }}
                      />
                    )}
                  </ListItemButton>
                ))}
              </List>
            </Box>
          ))}
        </Box>

        <Box sx={{ p: 2, borderTop: "1px solid #f0f0e8" }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: "8px",
              color: "#e03",
              "&:hover": { backgroundColor: "#fef0f0" },
            }}
          >
            <ListItemIcon
              sx={{ minWidth: 0, mr: open ? 2 : "auto", color: "inherit" }}
            >
              <Logout />
            </ListItemIcon>

            {open && (
              <ListItemText
                primary="Logout"
                sx={{
                  "& .MuiTypography-root": {
                    fontSize: "14px",
                    fontWeight: 500,
                  },
                }}
              />
            )}
          </ListItemButton>
        </Box>
      </Drawer>

      {/* MAIN COLUMN */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backgroundColor: "#fff",
            color: "#000",
            borderBottom: "1px solid #e8e8e0",
            height: "52px",
          }}
        >
          <Toolbar
            disableGutters
            sx={{ px: 2, height: "52px", minHeight: "52px", gap: 2 }}
          >
            <TopBarBreadcrumb />{" "}
            {/* 👈 no props needed — reads Redux directly */}
            <Box sx={{ flexGrow: 1 }} />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexShrink: 0,
              }}
            >
              <IconButton size="small">
                <Badge badgeContent={5} color="error">
                  <NotificationsNone sx={{ fontSize: 20 }} />
                </Badge>
              </IconButton>
              <Avatar
                sx={{
                  bgcolor: "#ff5722",
                  width: 32,
                  height: 32,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                SK
              </Avatar>
            </Box>
          </Toolbar>
        </AppBar>

        <Box
          sx={{ flex: 1, p: 3, backgroundColor: "#fff", overflow: "auto" }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DrawerLayout;
