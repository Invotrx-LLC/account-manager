import React from "react";
import { Stack, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const SuccessStep = () => {
  return (
    <Stack spacing={3} alignItems="center">
      <CheckCircleIcon sx={{ fontSize: 70, color: "#4CAF50" }} />
      <Typography fontSize={22} fontWeight={600}>
        Password Updated Successfully!
      </Typography>
      <Typography fontSize={14} color="#8E8E8E">
        You can now login with your new password.
      </Typography>
    </Stack>
  );
};

export default SuccessStep;