import React, { useState } from "react";
import EmailStep from "./EmailStep";
import OtpStep from "./OtpStep";
import ResetStep from "./ResetStep";
import SuccessStep from "./SuccessStep";
import { Box } from "@mui/material";

const AmForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(""); // ✅ store email

  return (
    <Box>
      {step === 1 && (
        <EmailStep
          onNext={(emailValue) => {
            setEmail(emailValue);  // ✅ save email
            setStep(2);
          }}
        />
      )}

      {step === 2 && (
        <OtpStep
          email={email}           // ✅ pass email
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && <ResetStep onNext={() => setStep(4)} />}
      {step === 4 && <SuccessStep />}
    </Box>
  );
};

export default AmForgotPassword;