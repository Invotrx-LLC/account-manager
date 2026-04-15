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
  maintainAspectRatio: false, // 🔑 allows height control
};

export default function ExperienceDonut() {
  return (
    <Card>
      <CardContent sx={{ pb: 1 }}> {/* reduce bottom padding */}
        <Typography fontWeight={600} mb={1}>
          Candidates Experience
        </Typography>

        <Box height={183}> {/* 👈 control card height here */}
          <Doughnut data={data} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
}