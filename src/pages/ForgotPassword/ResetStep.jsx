import React, { useState } from "react";
import {
  Stack,
  Typography,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { resetPassword } from "./forgotApi";

const checkStrength = (password) => {
  let score = 0;

  if (password.length >= 6) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: "Weak", color: "#E53935", width: "33%" };
  if (score === 2 || score === 3)
    return { label: "Medium", color: "#FBC02D", width: "66%" };
  return { label: "Strong", color: "#43A047", width: "100%" };
};

const AmResetPassword = ({ onNext }) => {
  const [password, setPassword] = useState("");

  const strength = checkStrength(password);

  const handleReset = async () => {
    await resetPassword(password);
    onNext();
  };

  return (
    <Stack spacing={3}>
      <Typography fontSize={22} fontWeight={600} textAlign="center">
        Reset Password
      </Typography>

      <TextField
        fullWidth
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            backgroundColor: "#FAFAFA",
            height: "48px",
          },
        }}
      />

      {/* Strength Bar */}
      {password && (
        <Box>
          <Box
            sx={{
              height: 8,
              width: "100%",
              backgroundColor: "#E0E0E0",
              borderRadius: 5,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                height: "100%",
                width: strength.width,
                backgroundColor: strength.color,
                transition: "0.3s ease",
              }}
            />
          </Box>

          <Typography
            sx={{
              fontSize: 13,
              mt: 1,
              color: strength.color,
              fontWeight: 500,
            }}
          >
            {strength.label} Password
          </Typography>
        </Box>
      )}

      <Button
        fullWidth
        onClick={handleReset}
        sx={{
          height: "48px",
          backgroundColor: "#FE9F43",
          borderRadius: "10px",
          color: "#fff",
          "&:hover": { backgroundColor: "#E68E36" },
        }}
      >
        Update Password
      </Button>
    </Stack>
  );
};

export default AmResetPassword;