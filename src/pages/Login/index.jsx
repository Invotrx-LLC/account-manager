import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Box,
  Stack,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../redux/services/auth/auth";
import { toast } from "react-toastify";
import { AC_ACCESS_TOKEN, AC_REFRESH_TOKEN, setItem } from "../../utils/constants";

const AmLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ error states
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    // 🔥 Reset errors
    setEmailError("");
    setPasswordError("");

    // ✅ VALIDATION
    let isValid = true;

    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    }

    if (!isValid) return;

    try {
      const res = await login({ email, password }).unwrap();
      console.log("Login response:", res);
      if (res.success) {
        toast.success(res?.message || "Login successful ✅");
        setItem(AC_ACCESS_TOKEN,res?.data?.access_token);
        setItem(AC_REFRESH_TOKEN,res?.data?.refresh_token);
        navigate("/account-manager/dashboard");
      }
    } catch (err) {
      const message =
        err?.data?.message || err?.data?.detail || "Invalid email or password";

      // 🔥 show API error under password
      setPasswordError(message);

      toast.error(message);
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
        component="form"
        onSubmit={handleLogin}
        sx={{
          p: 4,
          borderRadius: "24px",
          backgroundColor: "#ffffff",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <Stack spacing={3}>
          {/* Title */}
          <Box textAlign="center">
            <Typography sx={{ fontSize: 30, fontWeight: 600 }}>
              Sign In
            </Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 500, mt: 1 }}>
              Your All-in-One Client Hiring Command Center
            </Typography>
          </Box>

          {/* Email */}
          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!emailError} // 🔥
            helperText={emailError} // 🔥
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "14px",
                backgroundColor: "#E5E7EB",
                height: "52px",
              },
            }}
          />

          {/* Password */}
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!passwordError} // 🔥
            helperText={passwordError} // 🔥
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "14px",
                backgroundColor: "#E5E7EB",
                height: "52px",
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Login Button */}
          <Button
            type="submit"
            fullWidth
            disabled={isLoading}
            sx={{
              height: "52px",
              borderRadius: "14px",
              backgroundColor: "#F59E0B",
              fontWeight: 600,
              fontSize: "16px",
              color: "#fff",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#D97706",
              },
            }}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>

          {/* Forgot Password */}
          <Box textAlign="right">
            <Typography
              sx={{
                fontSize: "14px",
                color: "#2563EB",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Forgot Password?
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default AmLogin;
