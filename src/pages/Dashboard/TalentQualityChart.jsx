import { Bar } from "react-chartjs-2";
import { Card, CardContent, Typography, Box } from "@mui/material";

const data = {
  labels: [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ],
  datasets: [
    {
      label: "Matched",
      data: [90,65,35,85,70,90,35,45,75,55,80,50],
      backgroundColor: "#FDBA74",
      borderRadius: 6,
    },
    {
      label: "Hired",
      data: [15,35,10,15,40,15,10,25,70,5,45,15],
      backgroundColor: "#F97316",
      borderRadius: 6,
    },
  ],
};

const options = {
  maintainAspectRatio: false,
  responsive: true,
};

export default function TalentQualityChart() {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography fontWeight={600} mb={1}>
          Talent Quality Chart
        </Typography>

        <Box sx={{ flex: 1, minHeight: 0, position: "relative" }}>
          <Bar data={data} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
}