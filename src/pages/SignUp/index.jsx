import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Stack,
  Grid,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import AuthLayout from "../../layout/index";
import GoogleIcon from "@mui/icons-material/Google";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
const AmSignup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <AuthLayout>
      <Stack spacing={2}>
        {/* Title */}
        <Box textAlign="center">
          <Typography
            sx={{
              fontSize: "22px",
              fontWeight: 600,
            }}
          >
            Sign up
          </Typography>

          <Typography
            sx={{
              fontSize: "13px",
              color: "#8E8E8E",
              mt: 1,
            }}
          >
            Your All-in-One Client Hiring Command Center
          </Typography>
        </Box>

        {/* Name */}
        <TextField
          fullWidth
          placeholder="Your name"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              backgroundColor: "#FAFAFA",
              height: "48px",
            },
          }}
        />

        {/* Email */}
        <TextField
          fullWidth
          placeholder="E-mail"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              backgroundColor: "#FAFAFA",
              height: "48px",
            },
          }}
        />

        {/* Password Row */}
        <Grid container spacing={2}>
          <Grid item size ={{xs: 12, sm: 6}}>
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  backgroundColor: "#FAFAFA",
                  height: "48px",
                },
              }}
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

          <Grid item size ={{xs: 12, sm: 6}}>
            <TextField
              fullWidth
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  backgroundColor: "#FAFAFA",
                  height: "48px",
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        {/* Sign Up Button */}
        <Button
          fullWidth
          sx={{
            height: "48px",
            backgroundColor: "#FE9F43",
            borderRadius: "10px",
            textTransform: "none",
            fontSize: "14px",
            fontWeight: 600,
            color: "#ffffff",
            mt: 1,
            "&:hover": {
              backgroundColor: "#E68E36",
            },
          }}
        >
          Sign Up
        </Button>

        {/* Social Buttons */}
        <Stack
  direction={{ xs: "column", sm: "row" }}
  spacing={2}
>
  <Button
    fullWidth
    variant="outlined"
    startIcon={
  <img
    src="https://www.svgrepo.com/show/475656/google-color.svg"
    alt="google"
    width="18"
  />
}
    sx={{
      borderRadius: "10px",
      textTransform: "none",
      fontSize: "14px",
      height: "44px",
      borderColor: "#E0E0E0",
      color: "#111827",
      "&:hover": {
        borderColor: "#DB4437",
        backgroundColor: "#FFF5F5",
      },
    }}
  >
    Sign up with Google
  </Button>

  <Button
    fullWidth
    variant="outlined"
    startIcon={
      <LinkedInIcon sx={{ color: "#0A66C2" }} />
    }
    sx={{
      borderRadius: "10px",
      textTransform: "none",
      fontSize: "14px",
      height: "44px",
      borderColor: "#E0E0E0",
      color: "#111827",
      "&:hover": {
        borderColor: "#0A66C2",
        backgroundColor: "#F0F7FF",
      },
    }}
  >
    Sign up with Linkedin
  </Button>
</Stack>
      </Stack>
    </AuthLayout>
  );
};

export default AmSignup;