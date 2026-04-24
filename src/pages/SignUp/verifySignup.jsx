import React, { useState, useRef, useEffect } from "react";
import { TextField, Button, Typography, Box, Stack } from "@mui/material";
import { useSignupVerifyOTPMutation } from "../../redux/services/auth/auth";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { AC_ACCESS_TOKEN, AC_REFRESH_TOKEN, setItem } from "../../utils/constants";

const VerifySignupOTP = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const emailFromState = state?.email || "";

  // ✅ correct hook
  const [signupVerifyOTP, { isLoading }] = useSignupVerifyOTPMutation();

  const inputs = useRef([]);

  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // OTP handler
  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  // Submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerify = async () => {
    if (isSubmitting) return; // 🚫 prevent duplicate calls
    setIsSubmitting(true);

    const otpValue = otp.join("");

    if (!email || otpValue.length !== 6) {
      toast.error("Enter valid email and OTP");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await signupVerifyOTP({
        email,
        otp: otpValue,
      }).unwrap();

      if (res?.success) {
        toast.success(res.message || "Verified successfully");

        setItem(AC_ACCESS_TOKEN, res.data.access_token);
        setItem(AC_REFRESH_TOKEN, res.data.refresh_token);

        navigate("/account-manager/dashboard");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    if (emailFromState) {
      setEmail(emailFromState);
    }
  }, [emailFromState]);
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #f6f8fc, #eef1f6)",
      }}
    >
      <Box
        sx={{
          width: 380,
          p: 4,
          borderRadius: 4,
          backgroundColor: "#fff",
          boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
        }}
      >
        <Typography align="center" fontWeight={700} fontSize={24}>
          Verify OTP
        </Typography>

        <Stack spacing={2}>
          {/* Email */}
          <TextField
            fullWidth
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* OTP */}
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputs.current[index] = el)}
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                style={{
                  width: 48,
                  height: 50,
                  textAlign: "center",
                  fontSize: 18,
                  borderRadius: 10,
                  border: "1px solid #ddd",
                }}
              />
            ))}
          </Box>

          {/* Button */}
          <Button
            fullWidth
            onClick={handleVerify}
            disabled={isLoading || isSubmitting}
            sx={{
              height: 48,
              background: "linear-gradient(90deg, #FE9F43, #ff7b00)",
              borderRadius: "10px",
              fontWeight: 600,
              textTransform: "none",
              color: "#fff",
            }}
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default VerifySignupOTP;
