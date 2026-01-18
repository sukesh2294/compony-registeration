import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CompanyRegistrationPage from "./pages/CompanyRegistrationPage";
import SettingsPage from "./pages/SettingsPage";
import CompanyProfilePage from "./pages/CompanyProfilePage";
import InquiriesPage from "./pages/InquiriesPage";
import AnalyticsPage from "./pages/AnalyticsPage";

// API 
import axios from "axios";

// Get API URL based on environment
// Note: Don't set axios.defaults.baseURL as it affects all axios instances
// Each axios instance should be configured separately (see api/index.js)
const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const API_URL =
  isLocalhost
    ? import.meta.env.VITE_API_URL_LOCAL || "http://localhost:8000"
    : import.meta.env.VITE_API_URL_PROD || import.meta.env.VITE_API_URL;

// Only set defaults if API_URL is valid (for backwards compatibility)
// But prefer using configured instances from api/index.js
if (API_URL) {
  axios.defaults.baseURL = API_URL;
  axios.defaults.headers.common["Content-Type"] = "application/json";
} else if (!isLocalhost) {
  console.error("⚠️ Warning: API_URL is not set in App.jsx");
  console.error("⚠️ Some axios calls might fail. Set VITE_API_URL_PROD environment variable.");
}

console.log("📡 App.jsx API Base URL:", API_URL || "NOT SET");

function App() {
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testBackendConnection = async () => {
      try {
        const response = await axios.get("/");
        console.log("Backend response:", response.data);
        setIsBackendConnected(true);
      } catch (error) {
        console.error("Backend connection failed:", error);
        setIsBackendConnected(false);
      } finally {
        setLoading(false);
      }
    };

    testBackendConnection();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "24px"
      }}>
        🔄 Checking backend connection...
      </div>
    );
  }

  if (!isBackendConnected) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        textAlign: "center"
      }}>
        <h2 style={{ color: "red" }}>❌ Backend Connection Failed</h2>
        <p>Make sure Django backend is running on {API_URL}</p>
        <p>Run: <code>python manage.py runserver</code></p>
      </div>
    );
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/company-registration" element={<CompanyRegistrationPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/company-profile" element={<CompanyProfilePage />} />
          <Route path="/inquiries" element={<InquiriesPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;