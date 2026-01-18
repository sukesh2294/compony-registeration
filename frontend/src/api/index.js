import axios from "axios";

// Get API URL based on environment
const API_URL =
  window.location.hostname === "localhost"
    ? import.meta.env.VITE_API_URL_LOCAL || "http://localhost:8000"
    : import.meta.env.VITE_API_URL_PROD || import.meta.env.VITE_API_URL;

// Warn if API URL is not set in production
if (!API_URL && window.location.hostname !== "localhost") {
  console.error("⚠️ VITE_API_URL_PROD is not set! Please set it in your deployment environment variables.");
}

// Create axios instance
const api = axios.create({
  baseURL: API_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
});

// Log API URL for debugging (always, not just in dev)
console.log("📡 API Base URL:", API_URL || "NOT SET - Please configure VITE_API_URL_PROD");
console.log("🌐 Current Hostname:", window.location.hostname);

// Add request interceptor to add JWT token and log requests
api.interceptors.request.use(
  (config) => {
    // Prevent API calls if API_URL is not set in production
    if (!API_URL && window.location.hostname !== "localhost") {
      const error = new Error("API_URL_NOT_CONFIGURED");
      error.message = "VITE_API_URL_PROD is not configured. Please set it in your deployment environment variables.";
      error.apiUrl = API_URL;
      console.error("❌ API Request Blocked:", {
        reason: "API_URL not set in production",
        hostname: window.location.hostname,
        message: "Set VITE_API_URL_PROD environment variable"
      });
      return Promise.reject(error);
    }
    
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log request in development
    if (import.meta.env.DEV) {
      console.log("🚀 API Request:", config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh and log errors
api.interceptors.response.use(
  (response) => {
    // Check if we got HTML instead of JSON (means request went to frontend instead of backend)
    const contentType = response.headers["content-type"] || "";
    if (contentType.includes("text/html") && typeof response.data === "string" && response.data.includes("<!doctype html>")) {
      console.error("⚠️ CRITICAL: Received HTML instead of JSON!");
      console.error("This means the API request went to the frontend domain instead of backend.");
      console.error("📡 API_URL:", API_URL);
      console.error("🔗 Request URL:", response.config.url);
      console.error("🌐 Full URL:", response.config.baseURL + response.config.url);
      console.error("❌ SOLUTION: Set VITE_API_URL_PROD environment variable in your deployment platform!");
      
      // Create a more descriptive error
      const error = new Error("API_URL_NOT_CONFIGURED");
      error.isHtmlResponse = true;
      error.apiUrl = API_URL;
      error.requestUrl = response.config.url;
      throw error;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Check if response is HTML (means we hit frontend instead of backend)
    if (error.response && error.response.data && typeof error.response.data === "string" && error.response.data.includes("<!doctype html>")) {
      console.error("⚠️ CRITICAL: Received HTML instead of JSON!");
      console.error("This means the API request went to the frontend domain instead of backend.");
      console.error("📡 API_URL:", API_URL || "NOT SET");
      console.error("🔗 Request URL:", originalRequest?.url);
      console.error("🌐 Full URL:", originalRequest ? (originalRequest.baseURL || "MISSING") + originalRequest.url : "N/A");
      console.error("❌ SOLUTION: Set VITE_API_URL_PROD environment variable in your deployment platform!");
      
      error.isHtmlResponse = true;
      error.apiUrlNotSet = !API_URL;
    }
    
    // Log error details for debugging
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      console.error("🌐 Network Error:", {
        message: error.message,
        code: error.code,
        baseURL: API_URL || "NOT SET",
        url: originalRequest?.url,
        fullURL: originalRequest ? `${API_URL || "MISSING"}${originalRequest.url}` : "N/A"
      });
      if (!API_URL && window.location.hostname !== "localhost") {
        console.error("❌ VITE_API_URL_PROD is not configured! API requests will fail.");
      }
    } else if (error.response) {
      console.error("❌ API Error Response:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: originalRequest?.url,
        contentType: error.response.headers["content-type"]
      });
    } else {
      console.error("❌ API Error:", error);
    }
    
    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          const response = await axios.post(
            `${API_URL}/api/token/refresh/`,
            { refresh: refreshToken }
          );
          
          // Update tokens
          localStorage.setItem("access_token", response.data.access);
          localStorage.setItem("refresh_token", response.data.refresh);
          
          // Update Authorization header
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          
          // Retry original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  register: (data) => api.post("/api/auth/register/", data),
  login: (data) => api.post("/api/auth/login/", data),
  verifyEmail: (token) => api.get(`/api/auth/verify-email/${token}/`),
  verifyMobile: (data) => api.post("/api/auth/verify-mobile/", data),
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  },
};

export const companyAPI = {
  register: (data) => api.post("/api/company/register/", data),
  getProfile: () => api.get("/api/company/profile/"),
  updateProfile: (data) => api.put("/api/company/profile/", data),
  uploadLogo: (formData) => api.post("/api/company/upload-logo/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }),
  uploadBanner: (formData) => api.post("/api/company/upload-banner/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }),
};

export const userAPI = {
  getProfile: () => api.get("/api/user/profile/"),
  updateProfile: (data) => api.put("/api/user/profile/", data),
};

export default api;