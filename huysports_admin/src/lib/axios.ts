import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT Bearer token
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("sportx_auth_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Ignore localStorage read errors in non-browser envs
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle API errors and 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.message || "An unexpected error occurred";

    // If 401 Unauthorized, automatically clear token and redirect to login if not already on login page
    if (status === 401) {
      try {
        localStorage.removeItem("sportx_auth_token");
        localStorage.removeItem("sportx_auth_user");
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      } catch (e) {
        console.error("Failed to clear auth on 401", e);
      }
    }

    console.error("[API Error]:", message, error.response?.data);
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
