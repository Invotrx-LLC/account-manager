import * as React from "react";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Box from "@mui/material/Box";

const steps = [
  "Job Details",
  // "Job type & Info",
  // "Recruitement Steps",
  "Summary",
];

const StepperComponent = ({ activeStep, handleStepClick }) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  const handleStep = (step) => () => {
    handleStepClick(step);
  };

  const isStepCompleted = (index) => index < activeStep;

  return (
    <Stepper
      nonLinear
      activeStep={activeStep}
      orientation="horizontal"
      sx={{
        display: { xs: "none", sm: "flex", lg: "flex", xl: "flex" },
        mt: 0.5,
        position: "sticky",
        zIndex: 1100,
        width: "100%",

        /* ↓↓↓ Decreased padding & height ↓↓↓ */
        padding: { xs: 0.5, sm: 0.75, md: 1, lg: 1, xl: 1 },
        minHeight: "48px",

        backgroundColor: theme.palette.background.paper,
        boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.08)",

        "& .MuiStepConnector-root": {
          marginLeft: { xs: "4px", sm: "6px", lg: "8px", xl: "10px" },
          marginTop: { xs: "1px", sm: "2px", lg: "3px", xl: "3px" },
        },

        "& .MuiStepConnector-line": {
          borderTopWidth: 1.5,
          width: "calc(100% - 10px)",
          margin: "4px auto",
        },
      }}
    >
      {steps.map((label, index) => (
        // <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
        <Step
          key={label}
          sx={{
            flex: 1,
            padding: { xs: "2px 0", sm: "3px 0", md: "4px 0" }, // reduced
          }}
        >
          <StepButton
            color="inherit"
            onClick={handleStep(index)}
            icon={
              isStepCompleted(index) ? (
                <CheckCircleIcon
                  sx={{
                    color: "#4CAF50",
                    fontSize: {
                      xs: "0.7rem",
                      sm: "0.85rem",
                      md: "1rem",
                      lg: "1rem",
                    }, // reduced
                  }}
                />
              ) : index === activeStep ? (
                <Box
                  sx={{
                    width: { xs: "5px", sm: "6px", md: "8px" },
                    height: { xs: "5px", sm: "6px", md: "8px" },
                    borderRadius: "50%",
                    backgroundColor: "#00BBD4",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: { xs: "16px", sm: "18px", md: "22px" },
                    height: { xs: "16px", sm: "18px", md: "22px" },
                    borderRadius: "50%",
                    backgroundColor:
                      index === activeStep ? "#00BBD4" : "#B0BEC5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    fontSize: {
                      xs: "0.75rem",
                      sm: "0.875rem",
                      md: "1rem",
                      lg: "1.125rem",
                    },
                    fontWeight: "bold",
                  }}
                >
                  {index + 1}
                </Box>
              )
            }
            sx={{
              "& .MuiStepLabel-label": {
                fontSize: {
                  xs: "0.625rem",
                  sm: "0.65rem",
                  md: "0.875rem",
                  lg: "1rem",
                },
                color:
                  index === activeStep
                    ? "#00BBD4"
                    : isStepCompleted(index)
                    ? "#4CAF50"
                    : "#B0BEC5",
                fontWeight: index === activeStep ? "bold" : "normal",
                marginLeft: "4px",
                marginRight: { xs: "8px", sm: "12px" },
                whiteSpace: "nowrap",
              },
            }}
          >
            {label}
          </StepButton>
        </Step>
        // </Grid>
      ))}
    </Stepper>
  );
};
export default StepperComponent;