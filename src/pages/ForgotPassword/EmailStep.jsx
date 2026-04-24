import React, { useState } from "react";
import { Typography, TextField, Button, Box } from "@mui/material";
import { useForgotPasswordMutation } from "../../redux/services/auth/auth";
import { toast } from "react-toastify";
import { AC_ACCESS_TOKEN, ACCESS_TOKEN, setItem } from "../../utils/constants";

const EmailStep = ({ onNext }) => {
  const [email, setEmail] = useState("");

  const [forgotPassword, { isLoading }] =
    useForgotPasswordMutation();

  const handleSend = async () => {
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    try {
      const res = await forgotPassword({ email }).unwrap();
      toast.success("OTP sent to email ✅");
      console.log("Forgot Password Response:", res.data);
      if(res?.success){
        setItem(AC_ACCESS_TOKEN, res.data.temp_access_token);
        onNext(email);
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to send OTP");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f3f4f6",
      }}
    >
      {/* CARD */}
      <Box
        sx={{
          width: 360,
          p: 4,
          borderRadius: "20px",
          backgroundColor: "#ffffff",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: 2, // ✅ proper spacing instead of spacing prop
        }}
      >
        {/* TITLE */}
        <Typography
          fontSize={22}
          fontWeight={600}
          textAlign="center"
        >
          Forgot Password
        </Typography>

        {/* EMAIL */}
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

        {/* BUTTON */}
        <Button
          fullWidth
          onClick={handleSend}
          disabled={isLoading}
          sx={{
            height: "48px",
            backgroundColor: "#FE9F43",
            borderRadius: "10px",
            color: "#fff",
            textTransform: "none",
          }}
        >
          {isLoading ? "Sending..." : "Send OTP"}
        </Button>
      </Box>
    </Box>
  );
};

export default EmailStep;