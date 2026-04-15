import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AmLogin from "./pages/Login";
import AmSignup from "./pages/SignUp";
import AmForgotPassword from "./pages/ForgotPassword";
import AmDashboard from "./pages/Dashboard";
import AmRequisitions from "./pages/Requisitions";

import DrawerLayout from "./layout/Drawer";
import AmLayout from "./layout/index";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <div>
      <ToastContainer />
      <BrowserRouter>
      <Routes>
        {/* Default */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* 🔓 Public Routes */}
        <Route element={<AmLayout />}>
          <Route path="/login" element={<AmLogin />} />
          <Route path="/signup" element={<AmSignup />} />
          <Route path="/forgot-password" element={<AmForgotPassword />} />
        </Route>

        {/* 🔐 Protected Routes */}
        <Route path="/account-manager" element={<DrawerLayout />}>
          <Route path="dashboard" element={<AmDashboard />} />
          <Route path="requisitions" element={<AmRequisitions />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </div>
  );
};

export default App;