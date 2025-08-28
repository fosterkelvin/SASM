import axios, { AxiosError, AxiosResponse } from "axios";

const options = {
  baseURL: import.meta.env.VITE_API,
  withCredentials: true,
  timeout: 10000, // 10 second timeout
};

const API = axios.create(options);

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

API.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 errors
      if (status === 401 && !originalRequest._retry) {
        // Check if this is the user endpoint - expected 401 when not authenticated
        if (error.config?.url === "/user") {
          return Promise.reject({
            status,
            expected: true,
            ...(typeof data === "object" && data !== null
              ? data
              : { message: data }),
          });
        }

        // Do NOT attempt a token refresh for certain auth endpoints like signin/signup/refresh
        // These endpoints legitimately return 401 for invalid credentials or missing refresh token
        // and should be surfaced directly to callers instead of triggering a refresh loop.
        const noRefreshUrls = [
          "/auth/signin",
          "/auth/signup",
          "/auth/refresh",
          "/auth/password/forgot",
          "/auth/email/resend",
        ];

        const requestUrl = String(error.config?.url || "");
        if (noRefreshUrls.includes(requestUrl)) {
          return Promise.reject({
            status,
            ...(typeof data === "object" && data !== null
              ? data
              : { message: data }),
          });
        }

        // For other 401s, try to refresh the token
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return API(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Try to refresh the token
          await API.get("/auth/refresh");
          processQueue(null);
          return API(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          // Refresh failed, redirect to login
          if (typeof window !== "undefined") {
            window.location.href = "/signin";
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject({
        status,
        ...(typeof data === "object" && data !== null
          ? data
          : { message: data }),
      });
    }
    return Promise.reject(error);
  }
);

export default API;
