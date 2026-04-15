import { Card, CardContent, Typography, Box } from "@mui/material";
import { Fragment } from "react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = ["2am", "4am", "6am", "8am", "10am", "12pm"];

export default function InterviewHeatmap() {
  return (
    <Card>
      <CardContent>
        <Typography fontWeight={600} mb={2}>
          Interviews this week
        </Typography>

        <Box
          display="grid"
          gridTemplateColumns="60px repeat(7, 1fr)"
          gap={1}
        >
          <Box />

          {days.map((d) => (
            <Typography key={d} fontSize={12} textAlign="center">
              {d}
            </Typography>
          ))}

          {hours.map((h) => (
            <Fragment key={h}>
              <Typography fontSize={12}>{h}</Typography>

              {days.map((_, i) => (
                <Box
                  key={`${h}-${i}`}
                  height={18}
                  borderRadius={1}
                  sx={{
                    bgcolor: Math.random() > 0.6 ? "#FB923C" : "#FED7AA",
                  }}
                />
              ))}
            </Fragment>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}