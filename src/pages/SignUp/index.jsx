import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { useSignupMutation } from "../../redux/services/auth/auth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AmSignup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const [signup, { isLoading }] = useSignupMutation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSignup = async () => {
    let {
      first_name,
      last_name,
      phone_number,
      email,
      password,
      confirm_password,
    } = form;

    if (
      !first_name ||
      !last_name ||
      !phone_number ||
      !email ||
      !password ||
      !confirm_password
    ) {
      toast.error("All fields are required");
      return;
    }

    if (password !== confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    if (!phone_number.startsWith("+")) {
      phone_number = `+91${phone_number}`;
    }

    try {
      const res = await signup({
        first_name,
        last_name,
        phone_number,
        email,
        password,
        confirm_password,
      }).unwrap();

      if (res?.success) {
        toast.success(res?.message || "Signup successful ✅");
        navigate("/signup/verify-otp", { state: { email } });
      }
    } catch (err) {
      toast.error(err?.data?.message || "Signup failed");
    }
  };

  // ✅ COMMON INPUT STYLE
  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "14px",
      backgroundColor: "#fafafa",
      height: "52px",
      "& fieldset": {
        borderColor: "#e0e0e0",
      },
      "&:hover fieldset": {
        borderColor: "#bdbdbd",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#FE9F43",
        borderWidth: "1.5px",
      },
    },
    "& .MuiInputLabel-root": {
      color: "#9e9e9e",
      fontSize: "14px",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#FE9F43",
    },
  };

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
          maxWidth: 540,
          p: 5,
          borderRadius: "28px",
          background: "#ffffff",
          boxShadow: "0px 10px 40px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
        <Box textAlign="center" mb={3}>
  <Typography
    sx={{
      fontSize: "32px",
      fontWeight: 700,
      color: "#1c1c1c",
    }}
  >
    Sign up
  </Typography>

  <Typography
    sx={{
      fontSize: "15px",
      color: "#8E8E8E",
      mt: 1,
    }}
  >
    {/* Your All-in-One Client Hiring Command Center */}
  </Typography>
</Box>

        <Grid container spacing={2.5}>
          {/* First Name */}
          <Grid item size={{xs:12 ,sm:6}} >
            <TextField
              fullWidth
              label="First Name"
              variant="outlined"
              value={form.first_name}
              onChange={handleChange("first_name")}
              sx={inputStyle}
            />
          </Grid>

          {/* Last Name */}
          <Grid item size={{xs:12 ,sm:6}} >
            <TextField
              fullWidth
              label="Last Name"
              variant="outlined"
              value={form.last_name}
              onChange={handleChange("last_name")}
              sx={inputStyle}
            />
          </Grid>

          {/* Email */}
          <Grid item size={{xs:12 }} >
            <TextField
              fullWidth
              label="E-mail"
              value={form.email}
              onChange={handleChange("email")}
              sx={inputStyle}
            />
          </Grid>

          {/* Phone */}
          <Grid item size={{xs:12 }} >
           
  <TextField
    fullWidth
    label="Phone Number"
    value={form.phone_number}
    onChange={(e) => {
      // allow only numbers
      const value = e.target.value.replace(/\D/g, "");

      // limit to 10 digits (change if needed)
      if (value.length <= 10) {
        setForm({ ...form, phone_number: value });
      }
    }}
    sx={inputStyle}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <Typography sx={{ color: "#555", fontWeight: 500 }}>
            +91
          </Typography>
        </InputAdornment>
      ),
    }}
    inputProps={{
      inputMode: "numeric",
      pattern: "[0-9]*",
    }}
  />
</Grid>

          {/* Password */}
          <Grid item size={{xs:12 ,sm:6}} >
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange("password")}
              sx={inputStyle}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Confirm Password */}
          <Grid item size={{xs:12 ,sm:6}} >
          
  <TextField
    fullWidth
    label="Confirm Password"
    type={showConfirm ? "text" : "password"}
    value={form.confirm_password}
    onChange={(e) => {
      const value = e.target.value;

      setForm({ ...form, confirm_password: value });

      // 🔥 LIVE CHECK
      if (value === "") {
        setConfirmError("");
      } else if (value !== form.password) {
        setConfirmError("Passwords do not match ❌");
      } else {
        setConfirmError("Passwords match ✅");
      }
    }}
    sx={inputStyle}
    error={confirmError.includes("not match")}
    helperText={confirmError}
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          <IconButton onClick={() => setShowConfirm(!showConfirm)}>
            {showConfirm ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      ),
    }}
  />
</Grid>

          {/* Signup Button */}
          <Grid item size={{xs:12 }} >
            <Button
              fullWidth
              onClick={handleSignup}
              disabled={isLoading}
              sx={{
                height: "52px",
                background: "#FE9F43",
                borderRadius: "14px",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "16px",
                color: "#fff",
                mt: 1,
                "&:hover": {
                  background: "#f78b1f",
                },
              }}
            >
              {isLoading ? "Signing up..." : "Sign Up"}
            </Button>
          </Grid>

          {/* Social */}
          {/* <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="outlined"
              sx={{
                height: "48px",
                borderRadius: "12px",
                textTransform: "none",
              }}
            >
              Sign up with Google
            </Button>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<LinkedInIcon />}
              sx={{
                height: "48px",
                borderRadius: "12px",
                textTransform: "none",
              }}
            >
              Sign up with Linkedin
            </Button>
          </Grid> */}
        </Grid>
      </Box>
    </Box>
  );
};

export default AmSignup;