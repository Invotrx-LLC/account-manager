import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Stack,
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

  const [signup, { isLoading }] = useSignupMutation();

  // ✅ FORM STATE
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    password: "",
    confirm_password: "",
  });
const navigate = useNavigate();
  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  // ✅ SUBMIT
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

  // ✅ FIX PHONE FORMAT (India)
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

    if(res?.success){
      toast.success(res?.message || "Signup successful ✅");
      navigate("/signup/verify-otp", { state: { email } });
    }
  } catch (err) {
    toast.error(err?.data?.message || "Signup failed");
  }
};
// const handleSignup = async()=>{
//   navigate("/signup/verify-otp")
// }

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
          width: "380px",
          p: 4,
          borderRadius: "24px",
          backgroundColor: "#ffffff",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        {/* Title */}
        <Box textAlign="center">
          <Typography fontSize="22px" fontWeight={600}>
            Sign up
          </Typography>

          <Typography fontSize="13px" color="#8E8E8E" mt={1}>
            Your All-in-One Client Hiring Command Center
          </Typography>
        </Box>

        <Stack spacing={2.5} mt={3}>
          {/* First Name */}
          <TextField
            fullWidth
            placeholder="First Name"
            value={form.first_name}
            onChange={handleChange("first_name")}
          />

          {/* Last Name */}
          <TextField
            fullWidth
            placeholder="Last Name"
            value={form.last_name}
            onChange={handleChange("last_name")}
          />

          {/* Phone */}
          <TextField
            fullWidth
            placeholder="Phone Number"
            value={form.phone_number}
            onChange={handleChange("phone_number")}
          />

          {/* Email */}
          <TextField
            fullWidth
            placeholder="E-mail"
            value={form.email}
            onChange={handleChange("email")}
          />

          {/* Password */}
          <TextField
            fullWidth
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={handleChange("password")}
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

          {/* Confirm Password */}
          <TextField
            fullWidth
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            value={form.confirm_password}
            onChange={handleChange("confirm_password")}
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

          {/* Button */}
          <Button
            fullWidth
            onClick={handleSignup}
            disabled={isLoading}
            sx={{
              height: "48px",
              backgroundColor: "#FE9F43",
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              color: "#fff",
            }}
          >
            {isLoading ? "Signing up..." : "Sign Up"}
          </Button>

          {/* Social */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button fullWidth variant="outlined">
              Google
            </Button>
            <Button fullWidth variant="outlined" startIcon={<LinkedInIcon />}>
              Linkedin
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default AmSignup;