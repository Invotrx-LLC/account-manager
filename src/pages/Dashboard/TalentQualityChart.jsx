import { Bar } from "react-chartjs-2";
import { Card, CardContent, Typography } from "@mui/material";

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

export default function TalentQualityChart() {
  return (
    <Card>
      <CardContent>
        <Typography fontWeight={600}>Talent Quality Chart</Typography>
        <Bar data={data} />
      </CardContent>
    </Card>
  );
}