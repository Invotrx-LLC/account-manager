import { Tabs, Tab, Box } from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";

export default function JobDetailTabs() {
  const navigate = useNavigate();
  const { orgId, jobId } = useParams();
  const location = useLocation();

  const tabValue = (() => {
    if (location.pathname.includes("candidates")) return 1;
    if (location.pathname.includes("interviews")) return 2;
    return 0;
  })();

  return (
    <Box mb={2}>
      <Tabs value={tabValue}>
        <Tab
          label="Job Overview"
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
    </Box>
  );
}