
export const sendResetEmail = async (email) => {
  console.log("Sending reset email to", email);
  return new Promise((res) => setTimeout(res, 1000));
};

export const verifyOtp = async (otp) => {
  console.log("Verifying OTP", otp);
  return new Promise((res) => setTimeout(res, 1000));
};

export const resendOtp = async () => {
  console.log("Resending OTP");
};

export const resetPassword = async (password) => {
  console.log("Reset password", password);
  return new Promise((res) => setTimeout(res, 1000));
};