import { Box, Grid } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useGetOrganisationJobsQuery } from "../../redux/services/requisition/requisition";
import { RequisitionCard } from "../OrgRequisitions";

export default function OrgRequisitionsList() {
  const { orgId } = useParams(); //  FIX
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    isError,
    error,
  } = useGetOrganisationJobsQuery(
    { orgId, status: "all" },
    {
      skip: !orgId,
    }
  );

  const jobs = data?.data ?? [];

  if (!orgId) return null;

  if (isError) return <div>Error: {error?.data?.message}</div>;

  return (
    <Grid container spacing={1.5}>
      {jobs.map((job) => {
        const id = job.job_id ?? job.id;

        return (
          <Grid size={{ xs: 12, sm: 6, md: 4, xl: 3 }} key={id}>
            <RequisitionCard
              job={job}
              onOpen={() =>
                navigate(`/account-manager/org/${orgId}/requisitions/${id}`)
              }
            />
          </Grid>
        );
      })}
    </Grid>
  );
}