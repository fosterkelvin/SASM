import axios, { AxiosError, AxiosResponse } from "axios";

const options = {
  baseURL: import.meta.env.VITE_API,
  withCredentials: true,
};

const API = axios.create(options);

API.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response;

      // Add context for debugging - but don't log expected 401s on user endpoint
      if (status === 401 && error.config?.url === "/user") {
        // This is expected when user is not authenticated
        return Promise.reject({
          status,
          expected: true, // Flag to indicate this is an expected error
          ...(typeof data === "object" && data !== null
            ? data
            : { message: data }),
        });
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
