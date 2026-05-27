import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useChangePasswordMutation } from "../../redux/services/auth/auth";

function getStrength(password) {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return score;
}

const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];

const strengthColor = [
  "",
  "#ef4444",
  "#f59e0b",
  "#3b82f6",
  "#22c55e",
];

const styles = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .cp-page {
    min-height: 100vh;
    background: #fff;
    display: flex;
    flex-direction: column;
  }

  .cp-container {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 22px 16px;
  }

  .cp-card {
    width: 100%;
    max-width: 520px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    padding: 36px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  }

  .cp-card-icon-wrap {
    width: 64px;
    height: 64px;
    margin: 0 auto 18px;
    border-radius: 16px;
    background: #fff1eb;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cp-title {
    text-align: center;
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 8px;
    font-family: sans-serif;
  }

  .cp-sub {
    text-align: center;
    font-size: 13px;
    color: #6b7280;
    line-height: 1.6;
    margin-bottom: 28px;
    font-family: sans-serif;
  }

  .cp-error {
    background: #fff5f5;
    border: 1px solid #fecaca;
    color: #b91c1c;
    padding: 12px 14px;
    border-radius: 10px;
    font-size: 13px;
    margin-bottom: 20px;
    font-family: sans-serif;
  }

  .field-group {
    margin-bottom: 20px;
  }

  .field-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
    font-family: sans-serif;
  }

  .input-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1.5px solid #e5e7eb;
    border-radius: 12px;
    padding: 0 14px;
    background: #fafafa;
    transition: all 0.2s ease;
  }

  .input-wrap:focus-within {
    border-color: #ff5722;
    background: #fff;
  }

  .field-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    padding: 13px 0;
    font-size: 14px;
    color: #111827;
    font-family: sans-serif;
  }

  .field-input::placeholder {
    color: #9ca3af;
  }

  .eye-btn {
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 16px;
  }

  .strength-wrap {
    margin-top: 10px;
  }

  .strength-bars {
    display: flex;
    gap: 5px;
  }

  .strength-bar {
    flex: 1;
    height: 5px;
    border-radius: 999px;
    background: #e5e7eb;
  }

  .strength-text {
    margin-top: 6px;
    font-size: 12px;
    font-weight: 600;
    font-family: sans-serif;
  }

  .match-text {
    margin-top: 6px;
    font-size: 12px;
    font-family: sans-serif;
  }

  .cp-actions {
    display: flex;
    gap: 12px;
    margin-top: 10px;
  }

  .cancel-btn {
    flex: 1;
    padding: 12px;
    border-radius: 12px;
    border: 1.5px solid #e5e7eb;
    background: #fff;
    color: #555;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }

  .cancel-btn:hover {
    border-color: #cfcfcf;
  }

  .submit-btn {
    flex: 1;
    padding: 12px;
    border-radius: 12px;
    border: none;
    background: #ff5722;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }

  .submit-btn:hover {
    background: #e64a19;
  }

  .submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .success-box {
    width: 100%;
    max-width: 450px;
    margin: auto;
    background: #fff;
    border-radius: 18px;
    padding: 50px 40px;
    text-align: center;
    border: 1px solid #e5e7eb;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  }

  .success-title {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 10px;
    color: #111827;
    font-family: sans-serif;
  }

  .success-sub {
    font-size: 14px;
    line-height: 1.7;
    color: #6b7280;
    margin-bottom: 28px;
    font-family: sans-serif;
  }

  @media (max-width: 600px) {
    .cp-card {
      padding: 24px 20px;
    }

    .cp-actions {
      flex-direction: column;
    }
  }
`;

const PasswordField = ({
  label,
  value,
  setValue,
  show,
  setShow,
  placeholder,
  borderColor,
}) => {
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>

      <div
        className="input-wrap"
        style={{ borderColor }}
      >
        <span>🔒</span>

        <input
          className="field-input"
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <button
          type="button"
          className="eye-btn"
          onClick={() => setShow((v) => !v)}
        >
          {show ? "🙈" : "👁️"}
        </button>
      </div>
    </div>
  );
};

const ChangePasswordPage = () => {
  const navigate = useNavigate();

  const [changePassword, { isLoading }] =
    useChangePasswordMutation();

  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const strength = getStrength(newPw);

  const match =
    newPw &&
    confirmPw &&
    newPw === confirmPw;

  const mismatch =
    confirmPw &&
    newPw !== confirmPw;

  const handleSubmit = async () => {
    if (!oldPw || !newPw || !confirmPw) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPw !== confirmPw) {
      setError("Passwords do not match.");
      return;
    }

    if (newPw.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    try {
      setError("");

      await changePassword({
        old_password: oldPw,
        new_password: newPw,
      }).unwrap();

      toast.success(
        "Password updated successfully ✅"
      );

      setSubmitted(true);
    } catch (err) {
      setError(
        err?.data?.detail ||
          err?.data?.message ||
          "Failed to update password"
      );
    }
  };

  if (submitted) {
    return (
      <div className="cp-page">
        <style>{styles}</style>

        <div className="success-box">
          <div
            style={{
              fontSize: 60,
              marginBottom: 20,
            }}
          >
            ✅
          </div>

          <h2 className="success-title">
            Password Updated
          </h2>

          <p className="success-sub">
            Your password has been updated
            successfully.
          </p>

          <button
            className="submit-btn"
            onClick={() =>
              navigate(
                "/account-manager/settings"
              )
            }
          >
            Back to Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-page">
      <style>{styles}</style>

      <div className="cp-container">
        <div className="cp-card">
          <div className="cp-card-icon-wrap">
            <span style={{ fontSize: 28 }}>
              🔐
            </span>
          </div>

          <h1 className="cp-title">
            Change Password
          </h1>

          <p className="cp-sub">
            Update your password to keep your
            account secure.
          </p>

          {error && (
            <div className="cp-error">
              ⚠️ {error}
            </div>
          )}

          {/* Current Password */}
          <PasswordField
            label="Current Password"
            value={oldPw}
            setValue={setOldPw}
            show={showOld}
            setShow={setShowOld}
            placeholder="Enter current password"
          />

          {/* New Password */}
          <PasswordField
            label="New Password"
            value={newPw}
            setValue={setNewPw}
            show={showNew}
            setShow={setShowNew}
            placeholder="Enter new password"
          />

          {/* Strength */}
          {newPw.length > 0 && (
            <div className="strength-wrap">
              <div className="strength-bars">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="strength-bar"
                    style={{
                      background:
                        i <= strength
                          ? strengthColor[
                              strength
                            ]
                          : "#e5e7eb",
                    }}
                  />
                ))}
              </div>

              <div
                className="strength-text"
                style={{
                  color:
                    strengthColor[
                      strength
                    ],
                }}
              >
                {
                  strengthLabel[
                    strength
                  ]
                }
              </div>
            </div>
          )}

          {/* Confirm Password */}
          <PasswordField
            label="Confirm Password"
            value={confirmPw}
            setValue={setConfirmPw}
            show={showConfirm}
            setShow={setShowConfirm}
            placeholder="Confirm new password"
            borderColor={
              mismatch
                ? "#ef4444"
                : match
                  ? "#22c55e"
                  : undefined
            }
          />

          {mismatch && (
            <div
              className="match-text"
              style={{ color: "#ef4444" }}
            >
              Passwords do not match
            </div>
          )}

          {match && (
            <div
              className="match-text"
              style={{ color: "#22c55e" }}
            >
              ✓ Passwords match
            </div>
          )}

          <div className="cp-actions">
            <button
              className="cancel-btn"
              onClick={() =>
                navigate(
                  "/account-manager/settings"
                )
              }
            >
              Cancel
            </button>

            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading
                ? "Updating..."
                : "Update Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;