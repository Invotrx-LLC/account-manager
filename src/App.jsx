// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layouts
import AmLayout     from "./layout";
import DrawerLayout from "./layout/Drawer";

// Auth Pages
import AmLogin          from "./pages/Login";
import AmSignup         from "./pages/SignUp";
import AmForgotPassword from "./pages/ForgotPassword";

// App Pages
// import AmDashboard       from "./pages/Dashboard";
// import AmOrganizations   from "./pages/Organizations";
// import OrgDetail         from "./pages/Organizations/OrgDetail";
import RequisitionDetail from "./pages/OrgRequisitions/RequisitionDetail";
import CandidateDetail   from "./pages/OrgCandidates/CandidateDetail";
import AmOrganizations from "./pages/Organizations";
import OrgDetail from "./pages/Organizations/orgDetails";
import AmDashboard from "./pages/Dashboard";
import AccountManagement from "./pages/AccountManagement/AccountManagement";

const App = () => {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <BrowserRouter>
        <Routes>

          {/* ── Default ── */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ── Public Routes ── */}
          <Route element={<AmLayout />}>
            <Route path="/login"           element={<AmLogin />} />
            <Route path="/signup"          element={<AmSignup />} />
            <Route path="/forgot-password" element={<AmForgotPassword />} />
          </Route>

          {/* ── Protected Routes ── */}
          <Route path="/account-manager" element={<DrawerLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />

            {/* Dashboard */}
            <Route path="dashboard" element={<AmDashboard />} />

            {/* ─────────────────────────────────────────────
                Org List
                URL: /account-manager/organization
            ───────────────────────────────────────────── */}
            <Route path="organization" element={<AmOrganizations />} />
              <Route path="account-management" element={<AccountManagement />} />
            {/* ─────────────────────────────────────────────
                LEVEL 1 — Org Detail
                URL: /account-manager/org/:orgId
                Tabs (internal useState):
                  0 - Overview
                  1 - Requisitions
                  2 - Candidates
                  3 - Interviews
                  4 - Billing
            ───────────────────────────────────────────── */}
            <Route path="org/:orgId" element={<OrgDetail />} />

            {/* ─────────────────────────────────────────────
                LEVEL 2 — Requisition Detail
                URL: /account-manager/org/:orgId/requisitions/:jobId
                Tabs (internal useState):
                  0 - Overview
                  1 - Candidates
                  2 - Interviews
                  3 - Activity
            ───────────────────────────────────────────── */}
            <Route path="org/:orgId/requisitions/:jobId" element={<RequisitionDetail />} />

            {/* ─────────────────────────────────────────────
                LEVEL 3 — Candidate Detail
                URL: /account-manager/candidate/:candidateId
                Tabs (internal useState):
                  0 - Profile
                  1 - Timeline
                  2 - Interviews
                  3 - Documents
            ───────────────────────────────────────────── */}
            <Route path="candidate/:candidateId" element={<CandidateDetail />} />

            {/* Catch-all inside account-manager */}
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* ── Global Catch-all ── */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;