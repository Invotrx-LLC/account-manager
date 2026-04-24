// src/pages/Organizations/OrgJobDetailLayout.jsx

import React from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { useNavigate, useParams, useLocation, Outlet } from "react-router-dom";

const TAB_SX = {
  borderBottom: "1px solid #E5E7EB",
  mb: "24px",
  "& .MuiTab-root": {
    textTransform: "none",
    fontSize: 13,
    fontWeight: 500,
    color: "#6B7280",
    mr: "24px",
  },
  "& .Mui-selected": {
    color: "#FF5F1F !important",
    fontWeight: 600,
  },
  "& .MuiTabs-indicator": {
    backgroundColor: "#FF5F1F",
  },
};

export default function OrgJobDetailLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orgId, jobId } = useParams();

  const tabValue = React.useMemo(() => {
    if (location.pathname.includes("candidates")) return 1;
    if (location.pathname.includes("interviews")) return 2;
    return 0;
  }, [location.pathname]);

  return (
    <Box sx={{ p: 1 }}>
      <Tabs value={tabValue} sx={TAB_SX}>
        <Tab
          label="Job Overvi"
          onClick={() =>
            navigate(`/account-manager/org/${orgId}/requisitions/${jobId}`)
          }
        />
        <Tab
          label="Matched Candidates"
          onClick={() =>
            navigate(`/account-manager/org/${orgId}/requisitions/${jobId}/candidates`)
          }
        />
        <Tab
          label="Interviews"
          onClick={() =>
            navigate(`/account-manager/org/${orgId}/requisitions/${jobId}/interviews`)
          }
        />
      </Tabs>

      <Outlet />
    </Box>
  );
}