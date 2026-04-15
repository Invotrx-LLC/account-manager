import React, { useRef, useState, useEffect } from "react";
import { Stack, Typography, Box, Button } from "@mui/material";
import { verifyOtp, resendOtp } from "./forgotApi";

const OtpStep = ({ onNext }) => {
  const inputs = useRef([]);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleVerify = async () => {
    await verifyOtp(otp.join(""));
    onNext();
  };

  return (
    <Stack spacing={3}>
      <Typography fontSize={22} fontWeight={600} textAlign="center">
        Verify OTP
      </Typography>

      <Box display="flex" justifyContent="space-between">
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

      <Button
        fullWidth
        onClick={handleVerify}
        sx={{
          height: "48px",
          backgroundColor: "#FE9F43",
          borderRadius: "10px",
          color: "#fff",
        }}
      >
        Verify OTP
      </Button>

      <Typography textAlign="center">
        {timer > 0 ? `Resend in ${timer}s` : (
          <span
            style={{ color: "#FE9F43", cursor: "pointer" }}
            onClick={() => {
              resendOtp();
              setTimer(30);
            }}
          >
            Resend OTP
          </span>
        )}
      </Typography>
    </Stack>
  );
};

export default OtpStep;