import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Divider,
  Button,
} from "@mui/material";

const data = [
  { name: "Jhon", country: "USA", role: "Stats Programmer", salary: "₹74000" },
  { name: "Rohith Janee", country: "UAE", role: "Stats Programmer", salary: "₹74000" },
  { name: "Rishabh Jain", country: "Germany", role: "Stats Programmer", salary: "₹74000" },
];

export default function RecentlyHired() {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ pt: 1.5, pb: 1.5 }}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          minHeight={36}
        >
          <Typography fontWeight={600}>Latest Hired</Typography>
          <Button size="small">View All</Button>
        </Box>

        {data.map((item, i) => (
          <Box key={i}>
            <Box
              display="flex"
              alignItems="center"
              py={1}
              minHeight={56}
            >
              <Avatar sx={{ mr: 2 }}>{item.name[0]}</Avatar>

              <Box flex={1} minWidth={0}>
                <Typography fontWeight={500} noWrap>
                  {item.name}
                </Typography>
                <Typography
                  fontSize={12}
                  color="text.secondary"
                  noWrap
                >
                  {item.country} • {item.role}
                </Typography>
              </Box>

              <Typography fontWeight={600} noWrap>
                {item.salary}
              </Typography>
            </Box>

            {i < data.length - 1 && <Divider />}
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}