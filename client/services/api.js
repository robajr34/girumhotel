import { deleteToken, getToken, saveToken } from "@/utils/localStorage";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : "http://localhost:8080/api";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
  withCredentials: true,
});

// Request interceptor: attach bearer token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Track ongoing refresh promise to prevent simultaneous refresh requests
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Response interceptor: handle 401 and refresh token rotation
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    // 401 Unauthorized handling
    if (error.response.status === 401) {
      // If the failed request was the refresh endpoint itself or login/signup, don't loop
      const isAuthEndpoint =
        originalRequest.url?.includes("/auth/refresh") ||
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/signup") ||
        originalRequest.url?.includes("/auth/setup");

      if (isAuthEndpoint || originalRequest._retry) {
        if (originalRequest.url?.includes("/auth/refresh")) {
          deleteToken();
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          // Direct axios call with credentials to avoid interceptor recursion
          const refreshRes = await axios.post(
            `${BASE_URL}/auth/refresh`,
            {},
            { withCredentials: true },
          );

          const newAccessToken =
            refreshRes.data?.data?.accessToken || refreshRes.data?.accessToken;

          if (newAccessToken) {
            saveToken(newAccessToken);
            api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
            onRefreshed(newAccessToken);
            isRefreshing = false;

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          } else {
            throw new Error("No access token returned");
          }
        } catch (refreshErr) {
          isRefreshing = false;
          refreshSubscribers = [];
          deleteToken();

          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("auth:session-expired"));
          }
          return Promise.reject(error);
        }
      }

      // If already refreshing, wait for new token
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          if (!token) {
            return reject(error);
          }
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  },
);

/**
 * Utility to extract user-friendly error message from backend responses
 */
export const getErrorMessage = (error) => {
  if (!error) return "An unexpected error occurred.";

  if (typeof error === "string") return error;

  const data = error.response?.data;

  if (data) {
    // Check for validation errors array
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.map((err) => `${err.field}: ${err.message}`).join(", ");
    }

    // Check for backend structured error object { error: { message, code } }
    if (data.error?.message) {
      return data.error.message;
    }

    // Check for standard top-level message
    if (data.message) {
      return data.message;
    }
  }

  // Network / server offline error
  if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
    return "Request timed out. Please check your connection.";
  }

  if (error.message === "Network Error") {
    return "Unable to connect to the server. Please verify the backend is running.";
  }

  return error.message || "Something went wrong. Please try again.";
};

export default api;
