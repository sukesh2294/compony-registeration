// import axios from "axios";

// // Get API URL based on environment
// // Note: Vite environment variables are replaced at BUILD TIME, not runtime
// // So VITE_API_URL_PROD must be set before building/deploying
// const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// const API_URL = isLocalhost
//   ? import.meta.env.VITE_API_URL_LOCAL || "http://localhost:8000"
//   : import.meta.env.VITE_API_URL_PROD ;

// // Log all environment variables for debugging
// console.log("🔍 Environment Debug:", {
//   hostname: window.location.hostname,
//   isLocalhost: isLocalhost,
//   VITE_API_URL_LOCAL: import.meta.env.VITE_API_URL_LOCAL,
//   VITE_API_URL_PROD: import.meta.env.VITE_API_URL_PROD,
//   VITE_API_URL: import.meta.env.VITE_API_URL,
//   resolved_API_URL: API_URL || "UNDEFINED - This will cause errors!"
// });

// // Warn if API URL is not set in production
// if (!API_URL && !isLocalhost) {
//   console.error("⚠️ CRITICAL: VITE_API_URL_PROD is not set!");
//   console.error("⚠️ This environment variable must be set in your deployment platform BEFORE building.");
//   console.error("⚠️ Steps to fix:");
//   console.error("   1. Go to your deployment platform (Vercel/Netlify/etc)");
//   console.error("   2. Add environment variable: VITE_API_URL_PROD");
//   console.error("   3. Value: https://compony-registeration-backend.onrender.com");
//   console.error("   4. Redeploy your frontend");
// }

// // Create axios instance
// // Important: If API_URL is undefined, we should NOT create an instance with empty baseURL
// // as it will make relative requests to the frontend domain
// if (!API_URL && !isLocalhost) {
//   console.error("❌ Cannot create API instance: VITE_API_URL_PROD is not configured!");
//   console.error("❌ API calls will fail. Please set VITE_API_URL_PROD and redeploy.");
// }

// const api = axios.create({
//   baseURL: API_URL || (isLocalhost ? "http://localhost:8000" : ""),
//   headers: {
//     "Content-Type": "application/json",
//     "Accept": "application/json",
//   },
//   timeout: 60000, // 60 seconds timeout (Render free tier may need cold start time)
//   withCredentials: false, // Disable credentials for CORS simplicity
// });

// // Log API URL for debugging (always, not just in dev)
// console.log("📡 API Base URL:", API_URL || (isLocalhost ? "http://localhost:8000 (default)" : "NOT SET - API calls will fail!"));
// console.log("🌐 Current Hostname:", window.location.hostname);
// console.log("🔗 Full API URL will be:", API_URL ? `${API_URL}/api/auth/login/` : "Cannot determine - VITE_API_URL_PROD not set");

// // Add request interceptor to add JWT token and log requests
// api.interceptors.request.use(
//   (config) => {
//     // Prevent API calls if API_URL is not set in production
//     if (!API_URL && !isLocalhost) {
//       const error = new Error("API_URL_NOT_CONFIGURED");
//       error.message = "VITE_API_URL_PROD is not configured. Please set it in your deployment environment variables BEFORE building.";
//       error.apiUrl = API_URL;
//       console.error("❌ API Request Blocked:", {
//         reason: "API_URL not set in production",
//         hostname: window.location.hostname,
//         configBaseURL: config.baseURL,
//         fullURL: config.baseURL ? `${config.baseURL}${config.url}` : config.url,
//         message: "Set VITE_API_URL_PROD environment variable and REDEPLOY"
//       });
//       return Promise.reject(error);
//     }
    
//     // Also check if baseURL is empty string (shouldn't happen but safety check)
//     if (!config.baseURL && !isLocalhost) {
//       console.error("⚠️ Warning: Request baseURL is empty! This will cause relative requests.");
//       console.error("⚠️ Request config:", config);
//     }
    
//     // Add retry metadata for timeout/network errors
//     config._retryCount = config._retryCount || 0;
//     config._maxRetries = 3;
    
//     const token = localStorage.getItem("access_token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
    
//     // Log request in development
//     if (import.meta.env.DEV) {
//       console.log("🚀 API Request:", config.method?.toUpperCase(), config.url, config._retryCount > 0 ? `(retry ${config._retryCount})` : "");
//     }
//     return config;
//   },
//   (error) => {
//     console.error("❌ Request Error:", error);
//     return Promise.reject(error);
//   }
// );

// // Add response interceptor to handle token refresh and log errors
// api.interceptors.response.use(
//   (response) => {
//     // Check if we got HTML instead of JSON
//     const contentType = response.headers["content-type"] || "";
//     const status = response.status || 200;
    
//     // If we got HTML response:
//     // - Status 500 with HTML = Backend server error (Django error page)
//     // - Status 200/404 with HTML = Request went to wrong domain (frontend)
//     if (contentType.includes("text/html") && typeof response.data === "string" && response.data.includes("<!doctype html>")) {
//       if (status === 500 || status >= 500) {
//         // This is a backend server error, not a configuration issue
//         console.error("⚠️ Backend Server Error (500): Received HTML error page instead of JSON");
//         console.error("📡 Backend URL:", API_URL);
//         console.error("🔗 Request URL:", response.config.url);
//         console.error("🌐 Full URL:", response.config.baseURL + response.config.url);
//         console.error("❌ SOLUTION: Check your backend server logs for the actual error.");
//         console.error("   - Database connection issues?");
//         console.error("   - Missing environment variables?");
//         console.error("   - Unhandled exception in Django code?");
        
//         const error = new Error("BACKEND_SERVER_ERROR");
//         error.isHtmlResponse = true;
//         error.isBackendError = true;
//         error.status = status;
//         error.apiUrl = API_URL;
//         error.requestUrl = response.config.url;
//         error._isHandled = true;
//         throw error;
//       } else {
//         // Status 200/404 with HTML means request went to wrong domain
//         console.error("⚠️ CRITICAL: Received HTML instead of JSON!");
//         console.error("This means the API request went to the frontend domain instead of backend.");
//         console.error("📡 API_URL:", API_URL);
//         console.error("🔗 Request URL:", response.config.url);
//         console.error("🌐 Full URL:", response.config.baseURL + response.config.url);
//         console.error("❌ SOLUTION: Set VITE_API_URL_PROD environment variable in your deployment platform!");
        
//         const error = new Error("API_URL_NOT_CONFIGURED");
//         error.isHtmlResponse = true;
//         error.apiUrl = API_URL;
//         error.requestUrl = response.config.url;
//         error._isHandled = true;
//         throw error;
//       }
//     }
//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config;
    
//     // Check if response is HTML 
//     if (error.response && error.response.data && typeof error.response.data === "string" && error.response.data.includes("<!doctype html>")) {
//       const status = error.response.status || 0;
      
//       if (status === 500 || status >= 500) {
//         // Backend server error - Django error page
//         console.error("⚠️ Backend Server Error (500): Received HTML error page instead of JSON");
//         console.error("📡 Backend URL:", API_URL || "NOT SET");
//         console.error("🔗 Request URL:", originalRequest?.url);
//         console.error("🌐 Full URL:", originalRequest ? (originalRequest.baseURL || "MISSING") + originalRequest.url : "N/A");
//         console.error("❌ This is a backend server error. Check backend logs for details:");
//         console.error("   - Database connection issues?");
//         console.error("   - Missing environment variables?");
//         console.error("   - Unhandled exception in Django code?");
        
//         error.isHtmlResponse = true;
//         error.isBackendError = true;
//         error.status = status;
//         error.apiUrl = API_URL;
//       } else {
//         // Other HTML responses - likely wrong domain
//         console.error("⚠️ CRITICAL: Received HTML instead of JSON!");
//         console.error("This means the API request went to the frontend domain instead of backend.");
//         console.error("📡 API_URL:", API_URL || "NOT SET");
//         console.error("🔗 Request URL:", originalRequest?.url);
//         console.error("🌐 Full URL:", originalRequest ? (originalRequest.baseURL || "MISSING") + originalRequest.url : "N/A");
//         console.error("❌ SOLUTION: Set VITE_API_URL_PROD environment variable in your deployment platform!");
        
//         error.isHtmlResponse = true;
//         error.apiUrlNotSet = !API_URL;
//       }
//     }
    
//     // Log error details for debugging
//     if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
//       console.error("🌐 Network Error:", {
//         message: error.message,
//         code: error.code,
//         baseURL: API_URL || "NOT SET",
//         url: originalRequest?.url,
//         fullURL: originalRequest ? `${API_URL || "MISSING"}${originalRequest.url}` : "N/A"
//       });
//       if (!API_URL && window.location.hostname !== "localhost") {
//         console.error("❌ VITE_API_URL_PROD is not configured! API requests will fail.");
//       }
//     } else if (error.response) {
//       console.error("❌ API Error Response:", {
//         status: error.response.status,
//         statusText: error.response.statusText,
//         data: error.response.data,
//         url: originalRequest?.url,
//         contentType: error.response.headers["content-type"]
//       });
//     } else {
//       console.error("❌ API Error:", error);
//     }
    
//     // If error is 401 and not already retrying
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
      
//       try {
//         // Try to refresh token
//         const refreshToken = localStorage.getItem("refresh_token");
//         if (refreshToken) {
//           const response = await axios.post(
//             `${API_URL}/api/token/refresh/`,
//             { refresh: refreshToken }
//           );
          
//           // Update tokens
//           localStorage.setItem("access_token", response.data.access);
//           localStorage.setItem("refresh_token", response.data.refresh);
          
//           // Update Authorization header
//           originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          
//           // Retry original request
//           return api(originalRequest);
//         }
//       } catch (refreshError) {
//         // Refresh failed, redirect to login
//         localStorage.removeItem("access_token");
//         localStorage.removeItem("refresh_token");
//         localStorage.removeItem("user");
//         window.location.href = "/login";
//       }
//     }
    
//     return Promise.reject(error);
//   }
// );

// // API endpoints
// export const authAPI = {
//   register: (data) => api.post("/api/auth/register/", data),
//   login: (data) => api.post("/api/auth/login/", data),
//   verifyEmail: (token) => api.get(`/api/auth/verify-email/${token}/`),
//   verifyMobile: (data) => api.post("/api/auth/verify-mobile/", data),
//   logout: () => {
//     localStorage.removeItem("access_token");
//     localStorage.removeItem("refresh_token");
//     localStorage.removeItem("user");
//   },
// };

// export const companyAPI = {
//   register: (data) => api.post("/api/company/register/", data),
//   getProfile: () => api.get("/api/company/profile/"),
//   updateProfile: (data) => api.put("/api/company/profile/", data),
//   uploadLogo: (formData) => api.post("/api/company/upload-logo/", formData, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   }),
//   uploadBanner: (formData) => api.post("/api/company/upload-banner/", formData, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   }),
// };

// export const userAPI = {
//   getProfile: () => api.get("/api/user/profile/"),
//   updateProfile: (data) => api.put("/api/user/profile/", data),
// };

// export default api;



import axios from "axios";

const isLocalhost = window.location.hostname === "localhost" || 
                    window.location.hostname === "127.0.0.1" ||
                    window.location.hostname === "::1";

const API_URL = isLocalhost
  ? import.meta.env.VITE_API_URL_LOCAL || "http://localhost:8000"
  : import.meta.env.VITE_API_URL_PROD;

const FINAL_API_URL = API_URL || (isLocalhost ? "http://localhost:8000" : "");

// Debug logging for development only
if (import.meta.env.DEV) {
  console.log("🔍 Environment Debug:", {
    hostname: window.location.hostname,
    isLocalhost: isLocalhost,
    VITE_API_URL_LOCAL: import.meta.env.VITE_API_URL_LOCAL,
    VITE_API_URL_PROD: import.meta.env.VITE_API_URL_PROD,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    resolved_API_URL: FINAL_API_URL || "UNDEFINED"
  });
}

// Warn if API URL is not set in production
if (!FINAL_API_URL && !isLocalhost) {
  console.error("⚠️ CRITICAL: VITE_API_URL_PROD is not set!");
  console.error("⚠️ This environment variable must be set in your deployment platform.");
  console.error("⚠️ Value should be: https://compony-registeration-backend.onrender.com");
}

// Create axios instance
if (!FINAL_API_URL && !isLocalhost) {
  console.error("❌ Cannot create API instance: VITE_API_URL_PROD is not configured!");
}

const api = axios.create({
  baseURL: FINAL_API_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  timeout: 30000, // 30 seconds
  withCredentials: false,
});

// Development logging
if (import.meta.env.DEV) {
  console.log("📡 API Base URL:", FINAL_API_URL || "NOT SET");
  console.log("🌐 Current Hostname:", window.location.hostname);
}

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // Prevent API calls if API_URL is not set in production
    if (!FINAL_API_URL && !isLocalhost) {
      const error = new Error("API_URL_NOT_CONFIGURED");
      error.message = "VITE_API_URL_PROD is not configured.";
      error.apiUrl = FINAL_API_URL;
      error._isHandled = true;
      return Promise.reject(error);
    }
    
    // Add retry metadata (if implementing retry logic)
    config._retryCount = config._retryCount || 0;
    
    // Add Authorization header if token exists
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    // Check for HTML responses (indicates wrong domain or server error)
    const contentType = response.headers["content-type"] || "";
    const status = response.status || 200;
    
    const isHtmlResponse = contentType.includes("text/html") && 
      typeof response.data === "string" && 
      (response.data.includes("<!doctype html>") || 
       response.data.includes("<html>") || 
       response.data.includes("<!DOCTYPE html>"));
    
    if (isHtmlResponse) {
      if (status === 500 || status >= 500) {
        // Backend server error
        const error = new Error("BACKEND_SERVER_ERROR");
        error.isHtmlResponse = true;
        error.isBackendError = true;
        error.status = status;
        error.apiUrl = FINAL_API_URL;
        error._isHandled = true;
        throw error;
      } else {
        // Wrong domain - API URL not configured properly
        const error = new Error("API_URL_NOT_CONFIGURED");
        error.isHtmlResponse = true;
        error.apiUrl = FINAL_API_URL;
        error._isHandled = true;
        throw error;
      }
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Check for HTML error responses
    if (error.response && error.response.data && typeof error.response.data === "string") {
      const isHtmlError = error.response.data.includes("<!doctype html>") || 
                         error.response.data.includes("<html>") || 
                         error.response.data.includes("<!DOCTYPE html>");
      
      if (isHtmlError) {
        const status = error.response.status || 0;
        
        if (status === 500 || status >= 500) {
          error.isHtmlResponse = true;
          error.isBackendError = true;
          error.status = status;
          error.apiUrl = FINAL_API_URL;
        } else {
          error.isHtmlResponse = true;
          error.apiUrlNotSet = !FINAL_API_URL;
        }
      }
    }
    
    // Log error for debugging
    if (import.meta.env.DEV) {
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        console.error("🌐 Network Error:", {
          message: error.message,
          code: error.code,
          baseURL: FINAL_API_URL,
        });
      } else if (error.response) {
        console.error("❌ API Error:", {
          status: error.response.status,
          data: error.response.data,
          url: originalRequest?.url,
        });
      }
    }
    
    // Handle 401 Unauthorized (token refresh)
    if (error.response?.status === 401 && 
        !originalRequest?._retry && 
        FINAL_API_URL &&
        originalRequest?.url !== "/api/auth/login/" &&
        originalRequest?.url !== "/api/auth/register/") {
      
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");
      
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(
            `${FINAL_API_URL}/api/token/refresh/`,
            { refresh: refreshToken },
            {
              headers: { "Content-Type": "application/json" },
              timeout: 10000
            }
          );
          
          if (refreshResponse.data.access) {
            localStorage.setItem("access_token", refreshResponse.data.access);
            
            // Update refresh token if new one is provided
            if (refreshResponse.data.refresh) {
              localStorage.setItem("refresh_token", refreshResponse.data.refresh);
            }
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          
          // Only redirect if not an API call in background
          if (!originalRequest?._isBackground && window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
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
  
  // OTP Authentication
  sendRegistrationOtp: (data) => api.post("/api/send-otp/", data),
  verifyLoginOtp: (data) => api.post("/api/verify-otp/", data),
  resendLoginOtp: (data) => api.post("/api/resend-otp/", data),
  verifyRegistrationOtp: (data) => api.post("/api/verify-registration-otp/", data),
  resendRegistrationOtp: (data) => api.post("/api/resend-otp/", data), // Can reuse resend-otp for registration
  
  // Token Management
  refreshToken: (data) => api.post("/api/token/refresh/", data),
  
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
    headers: { "Content-Type": "multipart/form-data" },
  }),
  uploadBanner: (formData) => api.post("/api/company/upload-banner/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
};

export const userAPI = {
  getProfile: () => api.get("/api/user/profile/"),
  updateProfile: (data) => api.put("/api/user/profile/", data),
};

export default api;