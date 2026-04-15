import React, { useState } from "react";
import { Stack, Typography, TextField, Button } from "@mui/material";
import { sendResetEmail } from "./forgotApi";

const EmailStep = ({ onNext }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    await sendResetEmail(email);
    setLoading(false);
    onNext();
  };

  return (
    <Stack spacing={3}>
      <Typography fontSize={22} fontWeight={600} textAlign="center">
        Forgot Password
      </Typography>

      <TextField
        fullWidth
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            backgroundColor: "#FAFAFA",
            height: "48px",
          },
        }}
      />

      <Button
        fullWidth
        onClick={handleSend}
        disabled={loading}
        sx={{
          height: "48px",
          backgroundColor: "#FE9F43",
          borderRadius: "10px",
          color: "#fff",
        }}
      >
        {loading ? "Sending..." : "Send Otp to Email"}
      </Button>
    </Stack>
  );
};

export default EmailStep;