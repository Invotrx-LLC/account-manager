import React, { useState } from "react";
import AuthLayout from "../../layout/index";
import EmailStep from "./EmailStep";
import OtpStep from "./OtpStep";
import ResetStep from "./ResetStep";
import SuccessStep from "./SuccessStep";
 
const AmForgotPassword = () => {
  const [step, setStep] = useState(1);
 
  return (
    <AuthLayout>
      {step === 1 && <EmailStep onNext={() => setStep(2)} />}
      {step === 2 && <OtpStep onNext={() => setStep(3)} />}
      {step === 3 && <ResetStep onNext={() => setStep(4)} />}
      {step === 4 && <SuccessStep />}
    </AuthLayout>
  );
};
 
export default AmForgotPassword;