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
    if (isSubmitting) return; 
    setIsSubmitting(true);
    const otpValue = otp.join("");
    if (!email || otpValue.length !== 6) {
      toast.error("Enter valid email and Otp ");
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
      background: "#f4f6f8",
    }}
  >
    <Box
      sx={{
        width: "100%",
        maxWidth: 420,
        p: 5,
        borderRadius: "28px",
        background: "#ffffff",
        boxShadow: "0px 10px 40px rgba(0,0,0,0.08)",
      }}
    >
      {/* Header */}
      <Box textAlign="center" mb={3}>
        <Typography fontSize="28px" fontWeight={700}>
          Verify OTP
        </Typography>
        <Typography fontSize="14px" color="#8E8E8E" mt={1}>
          Enter the 6-digit code sent to your email
        </Typography>
      </Box>

      <Stack spacing={2.5}>
        {/* Email */}
        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "14px",
              backgroundColor: "#fafafa",
              height: "52px",
            },
          }}
        />

        {/* OTP BOXES */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputs.current[index] = el)}
              value={digit}
              onChange={(e) => handleOtpChange(e.target.value, index)}
              maxLength={1}
              style={{
                width: "52px",
                height: "58px",
                textAlign: "center",
                fontSize: "20px",
                borderRadius: "14px",
                border: "1px solid #e0e0e0",
                background: "#fafafa",
                outline: "none",
                transition: "0.2s",
              }}
              onFocus={(e) => (e.target.style.border = "1.5px solid #FE9F43")}
              onBlur={(e) => (e.target.style.border = "1px solid #e0e0e0")}
            />
          ))}
        </Box>

        {/* Verify Button */}
        <Button
          fullWidth
          onClick={handleVerify}
          disabled={isLoading || isSubmitting}
          sx={{
            height: "52px",
            background: "#FE9F43",
            borderRadius: "14px",
            fontWeight: 600,
            fontSize: "16px",
            textTransform: "none",
            color: "#fff",
            mt: 1,
            "&:hover": {
              background: "#f78b1f",
            },
          }}
        >
          {isLoading ? "Verifying..." : "Verify OTP"}
        </Button>

        {/* Resend */}
        <Typography
          textAlign="center"
          fontSize="13px"
          color="#8E8E8E"
        >
          Didn’t receive code?{" "}
          <span
            style={{
              color: "#FE9F43",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Resend
          </span>
        </Typography>
      </Stack>
    </Box>
  </Box>
);
};
export default VerifySignupOTP;
