import { Grid, Card, CardContent, Typography } from "@mui/material";

export default function StatsCards({ statusCards = [] }) {
  return (
    <Grid container spacing={2} sx={{ width: "100%" }}>
      {statusCards.map((s, i) => (
        <Grid
          key={i}
          item
          size={{ xs: 12, sm: 6, md: 3 }}
          sx={{
            display: "flex",
            alignItems: "stretch",
          }}
        >
          <Card
            sx={{
              bgcolor: s.color,
              color: "#fff",
              flex: 1,        // 🔑 stretch horizontally
              width: "100%", // 🔑 required
              height: "100%",
              minWidth: 0,    // 🔑 prevents overflow
            }}
          >
            <CardContent>
              <Typography fontSize={13} noWrap>
                {s.title}
              </Typography>
              <Typography fontWeight={700} fontSize={18} noWrap>
                {s.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}