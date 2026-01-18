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
  // Only check backend connection in development
  // In production, let the app render and handle errors gracefully
  const [isBackendConnected, setIsBackendConnected] = useState(isLocalhost ? false : true);
  const [loading, setLoading] = useState(isLocalhost);

  useEffect(() => {
    // Only check backend connection in localhost/development
    // In production, skip this check to avoid blocking the app
    if (!isLocalhost) {
      setLoading(false);
      return;
    }

    const testBackendConnection = async () => {
      try {
        // Use the configured API instance or direct axios with API_URL
        const testUrl = API_URL ? `${API_URL}/` : "/";
        const response = await axios.get(testUrl, { timeout: 5000 });
        console.log("✅ Backend connection successful:", response.data);
        setIsBackendConnected(true);
      } catch (error) {
        console.error("⚠️ Backend connection failed (this is OK for development):", error.message);
        // Don't block the app - just log the error
        // The login page will handle API errors gracefully
        setIsBackendConnected(true); // Allow app to render anyway
      } finally {
        setLoading(false);
      }
    };

    testBackendConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

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

  // Don't block app in production - let it render and handle errors in components
  // Only show error in development if backend is clearly not running
  if (!isBackendConnected && isLocalhost) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        textAlign: "center",
        padding: "20px"
      }}>
        <h2 style={{ color: "orange" }}>⚠️ Backend Not Connected (Development)</h2>
        <p>Make sure Django backend is running on {API_URL || "http://localhost:8000"}</p>
        <p>Run: <code>python manage.py runserver</code></p>
        <button 
          onClick={() => setIsBackendConnected(true)}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "#667eea",
            color: "white",
            border: "none",
            borderRadius: "8px"
          }}
        >
          Continue Anyway
        </button>
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