import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
} from "@mui/material";
import {
  Dashboard,
  Business,
  People,
  Work,
  Search,
  NotificationsNone,
  Menu as MenuIcon,
} from "@mui/icons-material";
import ri8fitLogo from "../assets/ri8fitLogo.png";
import Logout from "@mui/icons-material/Logout";

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
    title: "Dashboard",
    items: [
      {
        label: "Organization",
        icon: <Business />,
        path: "/account-manager/organization",
         disabled: true
      },
      {
        label: "Requisitions",
        icon: <Work />,
        path: "/account-manager/requisitions",
      },
      {
        label: "Interviews",
        icon: <People />,
        path: "/account-manager/interviews",
        disabled: false
      },
      {
        label: "Candidates",
        icon: <People />,
        path: "/account-manager/candidates",
        disabled: true
      },
    ],
  },
  {
    title: "Help",
    items: [
      {
        label: "Settings",
        icon: <Work />,
        path: "/account-manager/settings",
        disabled: true
      },
    ],
  },
  // {
  //   title: "Purchases",
  //   items: [
  //     {
  //       label: "Purchases",
  //       icon: <Work />,
  //       path: "/account-manager/purchases",
  //       disabled: true
  //     },
  //     {
  //       label: "Purchase Order",
  //       icon: <Work />,
  //       path: "/account-manager/purchase-order",
  //       disabled: true
  //     },
  //     {
  //       label: "Purchase Return",
  //       icon: <Work />,
  //       path: "/account-manager/purchase-return",
  //       disabled: true
  //     },
  //   ],
  // },
  // {
  //   title: "User Management",
  //   items: [
  //     {
  //       label: "Users",
  //       icon: <People />,
  //       path: "/account-manager/users",
  //       disabled: true
  //     },
  //     {
  //       label: "Delete Account Request",
  //       icon: <People />,
  //       path: "/account-manager/delete-account",
  //       disabled: true
  //     },
  //   ],
  // },
];

const DrawerLayout = () => {
  const [open, setOpen] = useState(true);

  return (
    <Box sx={{ display: "flex", height: "100vh", }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: open ? drawerWidth : collapsedWidth,
          transition: "width 0.3s",
          "& .MuiDrawer-paper": {
            width: open ? drawerWidth : collapsedWidth,
            transition: "width 0.3s",
            overflowX: "hidden",
            borderRight: "1px solid #eee",            
          },
        }}
      >
        {/* Logo + Toggle */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: 1,
            gap: 1,
          }}
        >
          <IconButton onClick={() => setOpen(!open)}>
            <MenuIcon />
          </IconButton>

          {open && (
            <Box
              component="img"
              src={ri8fitLogo} // ← your logo path
              alt="RI8FIT"
              sx={{
                height: 15,
                objectFit: "contain",
              }}
            />
          )}
        </Box>

        {/* Menu */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 64px)"
          }}
        >
          {/* Menu */}
          <Box
            sx={{
              px: 1,
              overflowY: "scroll",
              // Optional: custom scrollbar
              "&::-webkit-scrollbar": { width: "6px", height: "8px" },
              "&::-webkit-scrollbar-track": { background: "transparent" },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#bcc3c3ff",
                borderRadius: "6px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                // backgroundColor: "#00A1A7",
                backgroundColor: "#bcc3c3ff",
              },
            }}
          >
            {sidebarSections.map((section) => (
              <Box key={section.title} sx={{ mb: 1.5 }}>
                {/* Section Heading */}
                {open && (
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#64748B",
                      px: 1.5,
                      mb: 0.5,
                      textTransform: "uppercase",
                    }}
                  >
                    {section.title}
                  </Typography>
                )}

                {/* Section Items */}
                <List disablePadding>
                  {section.items.map((item) => (
                    <ListItemButton
                      key={item.label}
                      component={NavLink}
                      to={item.path}
                      disabled={item.disabled}
                      sx={{
                        mx: 0.5,
                        mb: 0.5,
                        borderRadius: 2,
                        justifyContent: open ? "flex-start" : "center",
                        "&.active": {
                          backgroundColor: "#FFF1E6",
                          color: "#F97316",
                        },
                        "&.active .MuiListItemIcon-root": {
                          color: "#F97316",
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 2 : "auto",
                          justifyContent: "center",
                          color: "#64748B",
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>

                      {open && (
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontSize: 14,
                          }}
                        />
                      )}
                    </ListItemButton>
                  ))}
                </List>

                {/* Divider */}
                {open && (
                  <Box
                    sx={{
                      height: 1,
                      backgroundColor: "#E5E7EB",
                      mx: 1,
                      mt: 1,
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>

          {/* Logout (BOTTOM) */}
          <Box sx={{ mt: "auto", mb: 1 }}>
            <ListItemButton
              onClick={() => {
                console.log("Logout clicked");
                // call logout logic here
              }}
              sx={{
                mx: 1,
                borderRadius: 2,
                justifyContent: open ? "flex-start" : "center",
                color: "#F97316",
                "&:hover": {
                  backgroundColor: "#FEE2E2",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : "auto",
                  justifyContent: "center",
                  color: "#F97316",
                }}
              >
                <Logout />
              </ListItemIcon>

              {open && <ListItemText primary="Logout" />}
            </ListItemButton>
          </Box>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1 }}>
        {/* Top Bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backgroundColor: "#fff",
            color: "#000",
            borderBottom: "1px solid #eee",
            height: "50px !important",
          }}
        >
          <Box
            disableGutters
            sx={{
              justifyContent: "space-between",
              height: "50px !important",
              display: "flex",
              alignItems: "center",
              px: 2,
            }}
          >
            {/* Search */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#f5f5f5",
                px: 2,
                py: 0.5,
                borderRadius: 1,
                width: 300,
              }}
            >
              <Search fontSize="small" />
              <InputBase
                placeholder="Search"
                sx={{
                  ml: 1,
                  flex: 1,
                  "& input": {
                    padding: "2px 4px",
                    borderRadius: 0,
                  },
                }}
              />
            </Box>

            {/* Right icons */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton>
                <Badge badgeContent={5} color="error">
                  <NotificationsNone />
                </Badge>
              </IconButton>
              <Avatar src="https://i.pravatar.cc/150" />
            </Box>
          </Box>
        </AppBar>

        {/* Page Content */}
        <Box
          sx={{
            p: 3,
            backgroundColor: "#fafafa",
            height: "calc(100vh - 50px)",
             boxSizing: "border-box",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DrawerLayout;
