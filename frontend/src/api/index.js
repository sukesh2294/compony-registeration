import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          const response = await axios.post(
            "/api/token/refresh/",
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