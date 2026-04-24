// src/pages/OrganizationLayout.jsx

import { Box, Tabs, Tab, Typography } from "@mui/material";
import { Outlet, useNavigate, useParams, useLocation } from "react-router-dom";

const tabs = [
  { label: "Overview", path: "overview" },
  { label: "Requisitions", path: "requisitions" },
  { label: "Candidates", path: "candidates" },
  { label: "Interviews", path: "interviews" },
  { label: "Billing", path: "billing" },
];

export default function OrganizationLayout() {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab = tabs.findIndex((tab) =>
    location.pathname.includes(tab.path)
  );

  return (
    <Box sx={{ p: 2 }}>
      
      {/* Org Name */}
      <Typography sx={{ fontSize: 24, fontWeight: 700, mb: 2 }}>
        {orgId?.toUpperCase()}
      </Typography>

      {/* Tabs */}
      <Tabs
        value={currentTab === -1 ? 0 : currentTab}
        onChange={(e, newValue) => {
          navigate(`/account-manager/organization/${orgId}/${tabs[newValue].path}`);
        }}
      >
        {tabs.map((tab) => (
          <Tab key={tab.path} label={tab.label} />
        ))}
      </Tabs>

      {/* Content */}
      <Box sx={{ mt: 2 }}>
        <Outlet />
      </Box>
    </Box>
  );
}