import { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
const settingsCards = [
  {
    title: "Profile Settings",
    description: "Manage and maintain your personal account information used across the Ri8Fit platform. Users can update details such as name, email address, phone number",
    icon: (<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" /><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>),
  },
  {
    title: "Change Password",
    description: "Protect your account by updating your password whenever required. This section allows users to securely change their current password, create stronger credentials",
    icon: (<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="16" r="1.5" fill="currentColor" /></svg>),
  },
  {
    title: "Organization Settings",
    description: "Configure and maintain core organizational information including company name, industry, business location, time zone, contact details, and organizational",
    icon: (<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="18" rx="1" stroke="currentColor" strokeWidth="1.8" /><rect x="14" y="3" width="7" height="10" rx="1" stroke="currentColor" strokeWidth="1.8" /><rect x="14" y="17" width="7" height="4" rx="1" stroke="currentColor" strokeWidth="1.8" /></svg>),
  },
  {
    title: "User Management",
    description: "Manage employees and platform users from a centralized location. Administrators can invite new users, update employee information, activate or deactivate accounts",
    icon: (<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" /><path d="M2 20c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M17 10l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>),
  },
  {
    title: "Roles & Permissions",
    description: "Define and control access levels for different users within the platform. Administrators can assign permissions based on responsibilities, ensuring that users only have access",
    icon: (<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M12 2l2.5 4.5H20l-4 3.5 1.5 5L12 12.5 6.5 15l1.5-5L4 6.5h5.5L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>),
  },
  {
    title: "Notification Preferences",
    description: "Customize how and when notifications are received across the platform. Users can manage alerts related to job requisitions, candidate activities, interview schedules,",
    icon: (<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="18" cy="5" r="3" fill="#ef4444" /></svg>),
  },
  {
    title: "Availability Management",
    description: "Set and manage working hours, interview availability, and scheduling preferences. Users can define available time slots, mark unavailable days, and configure time-zone-specific",
    icon: (<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="18" cy="18" r="4" fill="#ef4444" /><path d="M16.5 18h3M18 16.5v3" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>),
  },
  {
    title: "Interview Integrations",
    description: "Connect and manage third-party video conferencing platforms used for conducting interviews. This section allows administrators and users to configure integrations",
    icon: (<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><rect x="2" y="7" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M16 10.5l6-3.5v10l-6-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>),
  },
  {
    title: "Security & Access",
    description: "Strengthen account protection through advanced security controls. Users can manage active login sessions, review account activity, enable multi-factor authentication",
    icon: (<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M12 2l8 3v7c0 5-3.5 9-8 10C7.5 21 4 17 4 12V5l8-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>),
  },
  {
    title: "Billing & Subscription",
    description: "Access all subscription-related information in one place. Organizations can view current plans, monitor usage, manage payment methods, review invoices, track renewal dates",
    icon: (<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M2 10h20" stroke="currentColor" strokeWidth="1.8" /><rect x="6" y="14" width="4" height="2" rx="0.5" fill="currentColor" /></svg>),
  },
  {
    title: "Audit Logs",
    description: "Maintain complete visibility into system activities and user actions. Audit logs provide a detailed history of changes made across jobs, candidates, interviews, permissions",
    icon: (<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" /><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M17 13l1.5 1.5L21 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>),
  },
  {
    title: "Data & Privacy",
    description: "Manage organizational data governance and privacy preferences. Users can configure data retention policies, export recruitment records, control access to sensitive information",
    icon: (<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="M12 3v9l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>),
  },
];

/* ─── Password strength helper ─── */
function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
}
const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];

/* ─── Change Password Page ─── */
const ChangePasswordPage = ({ onBack }) => {
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const strength = getStrength(newPw);
  const match = newPw && confirmPw && newPw === confirmPw;
  const mismatch = confirmPw && newPw !== confirmPw;

  const handleSubmit = () => {
    if (!newPw || !confirmPw) { setError("Please fill in all fields."); return; }
    if (newPw !== confirmPw) { setError("Passwords do not match."); return; }
    if (newPw.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError("");
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "#ffff", display: "flex", flexDirection: "column" }}>
        <style>{sharedStyles}</style>
        <div className="cp-header">
          <button className="back-btn" onClick={onBack}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Back to Settings
          </button>
          <div className="date-pill">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#555" strokeWidth="1.8" /><path d="M3 9h18M8 2v4M16 2v4" stroke="#555" strokeWidth="1.8" strokeLinecap="round" /></svg>
            01 Jan 2026 - 07 Jan 2026
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="success-box">
            <div className="success-icon">
              <svg width="38" height="38" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#000" /><path d="M7 12l3.5 3.5L17 9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <h2 className="success-title">Password Updated!</h2>
            <p className="success-sub">Your new password has been saved successfully. You can now use it to log in.</p>
            <button className="submit-btn" onClick={onBack}>Back to Settings</button>
          </div>
        </div>
        <div className="footer">
          <span>2025-2026 © Ri8Fit. All Right Reserved</span>
          <span>Designed &amp; Developed By <span className="footer-brand">Ri8Fit</span></span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#ffff", display: "flex", flexDirection: "column" }}>
      <style>{sharedStyles}</style>
      {/* Form card */}
      <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "20px 16px 32px" }}>
        <div className="cp-card">
          {/* Lock icon header */}
          <div className="cp-card-icon-wrap">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2" stroke="#2d6a4f" strokeWidth="1.8" /><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#2d6a4f" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="16" r="1.5" fill="#2d6a4f" /></svg>
          </div>
          <h2 className="cp-card-title">Set New Password</h2>
          <p className="cp-card-sub">Choose a strong password to keep your account safe.</p>

          {error && (
            <div className="cp-error">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="#b91c1c" strokeWidth="1.8" /><path d="M12 8v4M12 16h.01" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" /></svg>
              {error}
            </div>
          )}

          {/* New Password */}
          <div className="field-group">
            <label className="field-label">New Password</label>
            <div className="input-wrap">
              <svg className="input-icon" width="16" height="16" fill="none" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2" stroke="#999" strokeWidth="1.8" /><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#999" strokeWidth="1.8" strokeLinecap="round" /></svg>
              <input
                className="field-input"
                type={showNew ? "text" : "password"}
                placeholder="Enter new password"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
              />
              <button className="eye-btn" onClick={() => setShowNew(v => !v)} tabIndex={-1}>
                {showNew
                  ? <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="#999" strokeWidth="1.8" strokeLinecap="round" /><line x1="1" y1="1" x2="23" y2="23" stroke="#999" strokeWidth="1.8" strokeLinecap="round" /></svg>
                  : <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#999" strokeWidth="1.8" /><circle cx="12" cy="12" r="3" stroke="#999" strokeWidth="1.8" /></svg>
                }
              </button>
            </div>
            {/* Strength bar */}
            {newPw.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= strength ? strengthColor[strength] : "#e5e7eb", transition: "background 0.3s" }} />
                  ))}
                </div>
                <div style={{ fontSize: 11.5, marginTop: 4, color: strengthColor[strength], fontFamily: "sans-serif", fontWeight: 600 }}>
                  {strengthLabel[strength]}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="field-group">
            <label className="field-label">Confirm New Password</label>
            <div className="input-wrap" style={{ borderColor: mismatch ? "#ef4444" : match ? "#22c55e" : undefined }}>
              <svg className="input-icon" width="16" height="16" fill="none" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2" stroke="#999" strokeWidth="1.8" /><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#999" strokeWidth="1.8" strokeLinecap="round" /></svg>
              <input
                className="field-input"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter new password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
              />
              <button className="eye-btn" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                {showConfirm
                  ? <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="#999" strokeWidth="1.8" strokeLinecap="round" /><line x1="1" y1="1" x2="23" y2="23" stroke="#999" strokeWidth="1.8" strokeLinecap="round" /></svg>
                  : <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#999" strokeWidth="1.8" /><circle cx="12" cy="12" r="3" stroke="#999" strokeWidth="1.8" /></svg>
                }
              </button>
            </div>
            {mismatch && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 5, fontFamily: "sans-serif" }}>Passwords do not match</div>}
            {match && <div style={{ fontSize: 12, color: "#22c55e", marginTop: 5, fontFamily: "sans-serif" }}>✓ Passwords match</div>}
          </div>
          {/* Actions */}
          <div className="cp-actions">
            <button className="cancel-btn" onClick={onBack}>Cancel</button>
            <button className="submit-btn" onClick={handleSubmit}>Update Password</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Shared CSS ─── */
const sharedStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0;background:"#fff" }
  .settings-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    padding: 28px 32px 20px; background: #fff;
  }
  .settings-title { font-size: 28px; font-weight: 700; color: #000; font-family: 'Georgia', serif; letter-spacing: -0.5px; }
  .settings-subtitle { font-size: 13.5px; color: #666; margin-top: 4px; font-family: sans-serif; }
  .date-pill {
    display: flex; align-items: center; gap: 8px; border: 1.5px solid #ccc;
    border-radius: 8px; padding: 8px 16px; background: #fff;
    font-size: 13px; color: #333; font-family: sans-serif; white-space: nowrap;
  }
  .alert-banner {
    margin: 0 32px 16px; background: #fff5f5; border: 1.5px solid #fca5a5;
    border-radius: 8px; padding: 12px 16px; display: flex; align-items: center;
    gap: 10px; font-size: 13.5px; color: #b91c1c; font-family: sans-serif;
  }
  .alert-close { margin-left: auto; background: none; border: none; cursor: pointer; color: #b91c1c; font-size: 18px; line-height: 1; padding: 0 4px; }
  .cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 0 32px 24px; }
  .card {
    background: #fff; border-radius: 10px; padding: 22px 22px 28px;
    border: 1.5px solid #e8e8e3; cursor: pointer;
    transition: box-shadow 0.18s ease, transform 0.15s ease, border-color 0.18s ease;
  }
  .card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.10); transform: translateY(-2px); border-color: #c5c5bb; }
  .card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
  .card-title { font-size: 15.5px; font-weight: 700; color: #1a1a1a; font-family: sans-serif; letter-spacing: -0.2px; }
  .card-icon { color: #1a1a1a; flex-shrink: 0; margin-top: 1px; }
  .card-desc { font-size: 12.8px; color: #666; line-height: 1.6; font-family: sans-serif; }
  .footer {
    display: flex; justify-content: space-between; align-items: center;
    padding: 18px 32px; border-top: 1px solid #e0e0db; background: #f5f5f0;
    font-size: 12.5px; color: #888; font-family: sans-serif;
  }
  .footer-brand { color: #FF5722; font-weight: 600; }

  /* Change password page */
  .cp-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 32px 14px; background: #f5f5f0;
  }
  .back-btn {
    display: flex; align-items: center; gap: 7px;
    background: #fff; border: 1.5px solid #e0e0db; border-radius: 8px;
    padding: 8px 16px; font-size: 13.5px; font-family: sans-serif;
    color: #333; cursor: pointer; font-weight: 500;
    transition: border-color 0.15s, background 0.15s;
  }
  .back-btn:hover { border-color: #FF5722; color: #FF5722; background: #f0faf5; }
  .breadcrumb {
    display: flex; align-items: center; gap: 6px;
    padding: 4px 32px 16px; font-size: 12.5px; font-family: sans-serif; color: #888;
  }
  .breadcrumb-link { color: #FF5722; cursor: pointer; font-weight: 500; }
  .breadcrumb-link:hover { text-decoration: underline; }
  .breadcrumb-current { color: #555; }
  .cp-card {
    background: #fff; border-radius: 14px; border: 1.5px solid #e8e8e3;
    padding: 36px 40px; width: 100%; max-width: 480px;
    box-shadow: 0 2px 16px rgba(0,0,0,0.06);
  }
  .cp-card-icon-wrap {
    width: 56px; height: 56px; background: #f0faf5; border-radius: 14px;
    display: flex; align-items: center; justify-content: center; margin-bottom: 16px;
  }
  .cp-card-title { font-size: 20px; font-weight: 700; color: #1a1a1a; font-family: sans-serif; margin-bottom: 6px; }
  .cp-card-sub { font-size: 13px; color: #888; font-family: sans-serif; margin-bottom: 24px; line-height: 1.5; }
  .cp-error {
    display: flex; align-items: center; gap: 8px;
    background: #fff5f5; border: 1.5px solid #fca5a5; border-radius: 8px;
    padding: 10px 14px; font-size: 13px; color: #b91c1c; font-family: sans-serif;
    margin-bottom: 18px;
  }
  .field-group { margin-bottom: 20px; }
  .field-label { display: block; font-size: 13px; font-weight: 600; color: #374151; font-family: sans-serif; margin-bottom: 7px; }
  .input-wrap {
    display: flex; align-items: center; gap: 10px;
    border: 1.5px solid #e5e7eb; border-radius: 8px;
    padding: 0 14px; background: #fafafa; transition: border-color 0.2s;
  }
  .input-wrap:focus-within { border-color: #FF5722; background: #fff; }
  .input-icon { flex-shrink: 0; }
  .field-input {
    flex: 1; border: none; background: transparent; outline: none;
    font-size: 14px; color: #1a1a1a; font-family: sans-serif;
    padding: 11px 0; min-width: 0;
  }
  .field-input::placeholder { color: #bbb; }
  .eye-btn { background: none; border: none; cursor: pointer; padding: 0; display: flex; align-items: center; }
  .requirements {
    background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 8px;
    padding: 14px 16px; margin-bottom: 24px;
  }
  .req-title { font-size: 12px; font-weight: 600; color: #555; font-family: sans-serif; margin-bottom: 10px; }
  .req-item { display: flex; align-items: center; gap: 8px; font-size: 12px; font-family: sans-serif; margin-bottom: 6px; }
  .req-item:last-child { margin-bottom: 0; }
  .cp-actions { display: flex; gap: 12px; }
  .cancel-btn {
    flex: 1; padding: 11px; border: 1.5px solid #e5e7eb; border-radius: 8px;
    background: #fff; font-size: 14px; font-family: sans-serif; font-weight: 600;
    color: #555; cursor: pointer; transition: border-color 0.15s, color 0.15s;
  }
  .cancel-btn:hover { border-color: #aaa; color: #333; }
  .submit-btn {
    flex: 1; padding: 11px; border: none; border-radius: 8px;
    background: #FF5722; font-size: 14px; font-family: sans-serif; font-weight: 600;
    color: #fff; cursor: pointer; transition: background 0.15s;
  }
  .submit-btn:hover { background: #FF5722; }
  .success-box {
    background: #fff; border-radius: 14px; border: 1.5px solid #e8e8e3;
    padding: 48px 44px; width: 100%; max-width: 420px; text-align: center;
    box-shadow: 0 2px 16px rgba(0,0,0,0.06);
  }
  .success-icon { display: flex; justify-content: center; margin-bottom: 18px; }
  .success-title { font-size: 22px; font-weight: 700; color: #1a1a1a; font-family: sans-serif; margin-bottom: 10px; }
  .success-sub { font-size: 13.5px; color: #888; font-family: sans-serif; line-height: 1.6; margin-bottom: 28px; }
  @media (max-width: 900px) { .cards-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 600px) {
    .cards-grid { grid-template-columns: 1fr; padding: 0 16px 20px; }
    .settings-header, .cp-header { padding: 20px 16px 14px; flex-direction: column; gap: 12px; }
    .alert-banner { margin: 0 16px 12px; }
    .footer { padding: 14px 16px; flex-direction: column; gap: 4px; text-align: center; }
    .cp-card { padding: 24px 20px; }
    .breadcrumb { padding: 4px 16px 12px; }
  }
`;

/* ─── Main Settings Component ─── */
const Settings = () => {
  const [alertVisible, setAlertVisible] = useState(true);
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff", fontFamily: "'Georgia', serif" }}>
      <style>{sharedStyles}</style>

      <div className="settings-header">
        <div>
          <div className="settings-title">Settings</div>
          <div className="settings-subtitle">Here's the latest on your team's hires, shifts, and top performers</div>
        </div>
      </div>

      <div className="cards-grid">
        {settingsCards.map((card) => (
          <div
            className="card"
            key={card.title}
           onClick={() => {
  if (card.title === "Change Password") {
    navigate("/account-manager/settings/change-password");
  }
}}
          >
            <div className="card-top">
              <div className="card-title">{card.title}</div>
              <div className="card-icon">{card.icon}</div>
            </div>
            <div className="card-desc">{card.description}</div>
          </div>
        ))}
      </div>

      <div className="footer">
        <span>2025-2026 © Ri8Fit. All Right Reserved</span>
        <span>Designed &amp; Developed By <span className="footer-brand">Ri8Fit</span></span>
      </div>
    </div>
  );
};

export default Settings;