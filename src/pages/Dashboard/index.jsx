import { useEffect } from "react";
import { Box, Grid } from "@mui/material";
import Header from "./Header";
import AlertBanner from "./AlertBanner";
import RecentlyHired from "./RecentlyHired";
import ExperienceDonut from "./ExperienceDonut";
import InterviewHeatmap from "./InterviewHeatmap";
import StatsCards from "./StatsCards";
import TalentQualityChart from "./TalentQualityChart";
import HiringRisk from "./HiringRisk";
import KpiCards from "./Kpi.jsx";


export default function AmDashboard() {
  const stats = [
    { title: "Avg Time to Hire", value: "8888838", color: "#FB923C" },
    { title: "Avg Time to Fill", value: "7373737373", color: "#1D4ED8" },
    { title: "Total Hiring Cost (Org)", value: "82282828", color: "#059669" },
    { title: "Cost per Hire", value: "33333333", color: "#2563EB" },
  ];

  return (
    <Box p={1}>
      <Header />
      {/* <AlertBanner /> */}

      <Grid container spacing={2} mt={1}>
        <Grid item size={{ xs: 12, md: 4 }}>
          <RecentlyHired />
        </Grid>

        <Grid item size={{ xs: 12, md: 4 }}>
          <ExperienceDonut />
        </Grid>

        <Grid item size={{ xs: 12, md: 4 }}>
          <InterviewHeatmap />
        </Grid>
      </Grid>
      <Grid container size={{ xs: 12, md: 12 }} sx={{mt:2}}>
        <StatsCards statusCards={stats} />
      </Grid>
      <Grid container size={{ xs: 12, md: 12 }} sx={{mt:2}}>
        <KpiCards />
      </Grid>
      <Grid container spacing={2} mt={2}>
        <Grid item size={{ xs: 12, md: 8 }}>
          <TalentQualityChart />
        </Grid>
        <Grid item size={{ xs: 12, md: 4 }}>
          <HiringRisk />
        </Grid>
      </Grid>
    </Box>
  );
}
