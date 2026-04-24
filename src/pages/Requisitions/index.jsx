import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";

const Requisitions = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requisitions, setRequisitions] = useState([]);

  // Optional: If you want to store in Redux (recommended for larger apps)
  // const dispatch = useDispatch();
  // const requisitions = useSelector((state) => state.requisitions.data);

  const token = "eyJraWQiOiJSWnVUcjMzVjY3ZXU3ZFl6VE9Ba2ZUd1ZDenNOV2R0UDNacVV1S1F4bmc0PSIsImFsZyI6IlJTMjU2In0..."; // Put your real token here (from Redux/Auth context)

  useEffect(() => {
    const fetchRequisitions = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://dev-backend.invotrx.com/acc/get_assigned_org_requisitions?status=all",
          {
            method: "GET",
            headers: {
              "accept": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch requisitions");

        const result = await response.json();

        if (result.success) {
          setRequisitions(result.data || []);
        } else {
          setError(result.message || "Something went wrong");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequisitions();
  }, [token]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Assigned Organization Requisitions ({requisitions.length})
      </Typography>

      <Grid container spacing={3}>
        {requisitions.map((job) => (
          <Grid item xs={12} md={6} lg={4} key={job.job_id}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {job.job_title}
                </Typography>

                <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                  <Chip label={job.organisation_name} color="primary" size="small" />
                  <Chip label={job.job_type} size="small" />
                  <Chip label={`${job.min_years}-${job.max_years} yrs`} size="small" />
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Function:</strong> {job.function} → {job.sub_function}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Positions:</strong> {job.no_of_positions} | 
                  <strong> Closing:</strong> {new Date(job.closing_date).toLocaleDateString()}
                </Typography>

                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Skills:</strong> {job.skills}
                </Typography>

                <Chip
                  label={job.status.toUpperCase()}
                  color={job.status === "open" ? "success" : "default"}
                  sx={{ mt: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {requisitions.length === 0 && (
        <Typography sx={{ mt: 4, textAlign: "center", color: "#666" }}>
          No requisitions found.
        </Typography>
      )}
    </Box>
  );
};

export default Requisitions;