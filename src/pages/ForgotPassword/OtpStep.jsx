import React, { useRef, useState, useEffect } from "react";
import { Typography, Box, Button, TextField } from "@mui/material";
import {
  useForgotVerifyOTPMutation,
  useForgotPasswordMutation,
  useForgotResendOTPMutation,
} from "../../redux/services/auth/auth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const OtpStep = ({ onNext, email }) => {
  const inputs = useRef([]);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(30);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [verifyOTP, { isLoading: verifying }] = useForgotVerifyOTPMutation();

  const [forgotPassword] = useForgotPasswordMutation();
  const navigate = useNavigate();
  const [resendOtp, { isLoading: resending }] = useForgotResendOTPMutation();

  // ⏱ Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 🔢 OTP input
  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  // ✅ VERIFY + RESET PASSWORD
  const handleVerify = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      toast.error("Enter valid OTP");
      return;
    }

    if (!password || password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await verifyOTP({
        otp: finalOtp,
        password,
        confirmPassword,
      }).unwrap();

      toast.success("Password reset successful ✅");
      navigate("/login");
    } catch (err) {
      toast.error(err?.data?.message || "Verification failed");
    }
  };

  // 🔁 RESEND OTP
  const handleResend = async () => {
    try {
      await resendOtp({ email }).unwrap();
      toast.success("OTP resent successfully");
      setTimer(30);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to resend OTP");
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
      <Box
        sx={{
          width: 360,
          p: 4,
          borderRadius: "20px",
          backgroundColor: "#ffffff",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <Typography fontSize={22} fontWeight={600} textAlign="center" mb={3}>
          Verify OTP
        </Typography>

        {/* OTP */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputs.current[index] = el)}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              style={{
                width: 45,
                height: 45,
                textAlign: "center",
                fontSize: 18,
                borderRadius: 8,
                border: "1px solid #ccc",
              }}
            />
          ))}
        </Box>

        {/* PASSWORD */}
        <TextField
          fullWidth
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={{ mb: 3 }}
        />

        {/* BUTTON */}
        <Button
          fullWidth
          onClick={handleVerify}
          disabled={verifying}
          sx={{
            height: "48px",
            backgroundColor: "#FE9F43",
            borderRadius: "10px",
            color: "#fff",
            mb: 2,
          }}
        >
          {verifying ? "Processing..." : "Verify & Reset"}
        </Button>

        {/* RESEND */}
        <Typography textAlign="center">
          {timer > 0 ? (
            `Resend in ${timer}s`
          ) : (
            <span
              style={{
                color: resending ? "#ccc" : "#FE9F43",
                cursor: resending ? "not-allowed" : "pointer",
              }}
              onClick={!resending ? handleResend : undefined}
            >
              {resending ? "Sending..." : "Resend OTP"}
            </span>
          )}
        </Typography>
      </Box>
    </Box>
  );
};

export default OtpStep;
