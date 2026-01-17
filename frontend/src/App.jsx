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

// Use environment variable or fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common["Content-Type"] = "application/json";

console.log("📡 API Base URL:", API_URL);

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
        <p>Make sure Django backend is running on http://127.0.0.1:8000</p>
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