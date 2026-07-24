import { Doughnut } from "react-chartjs-2";
import { Card, CardContent, Typography, Box } from "@mui/material";

const data = {
  labels: ["3-5 Years", "6-10 Years", "10-12 Years"],
  datasets: [
    {
      data: [12, 25, 22],
      backgroundColor: ["#1E3A8A", "#F97316", "#FDBA74"],
      borderWidth: 0,
    },
  ],
};

const options = {
  maintainAspectRatio: false,
  responsive: true,
};

export default function ExperienceDonut() {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent
        sx={{
          pb: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography fontWeight={600} mb={1}>
          Candidates Experience
        </Typography>

        <Box sx={{ flex: 1, minHeight: 0, position: "relative" }}>
          <Doughnut data={data} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
}