import { Card, CardContent, Typography, Box } from "@mui/material";
import { Fragment, useMemo } from "react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const timeSlots = [
  "12 mp", "12 pm", "02 pm", "12 am",
  "10 am", "8 am", "6 am", "4 am", "2 am",
];

export default function InterviewHeatmap() {
  const grid = useMemo(
    () =>
      timeSlots.map((h) => ({
        label: h,
        cells: days.map(() => Math.random() > 0.55),
      })),
    []
  );

  return (
    <Card sx={{ borderRadius: 3, boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
      <CardContent>
        {/* Header */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography fontSize={14} fontWeight={600}>
            🗓 Interviews this week
          </Typography>
          <Box
            sx={{
              border: "1px solid #e5e7eb",
              borderRadius: 2,
              px: 1.5,
              py: 0.4,
              fontSize: 12,
              color: "#374151",
              cursor: "pointer",
            }}
          >
            📅 Weekly ▾
          </Box>
        </Box>

        {/* ✅ Use native style prop — bypasses MUI sx grid issues */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "52px repeat(7, 1fr)",
            rowGap: "6px",
            columnGap: "4px",
          }}
        >
          {/* Day headers */}
          <div /> {/* empty top-left corner */}
          {days.map((d) => (
            <div
              key={d}
              style={{
                fontSize: 11,
                textAlign: "center",
                color: "#6b7280",
                fontWeight: 500,
              }}
            >
              {d}
            </div>
          ))}

          {/* Time rows */}
          {grid.map(({ label, cells }) => (
            <Fragment key={label}>
              <div
                style={{
                  fontSize: 11,
                  color: "#6b7280",
                  lineHeight: "20px",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </div>
              {cells.map((occupied, i) => (
                <div
                  key={i}
                  style={{
                    height: 20,
                    borderRadius: 4,
                    backgroundColor: occupied ? "#FB923C" : "#FEE9D7",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = occupied
                      ? "#EA7315"
                      : "#FDDCBC")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = occupied
                      ? "#FB923C"
                      : "#FEE9D7")
                  }
                />
              ))}
            </Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}