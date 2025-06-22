import axios, { AxiosError, AxiosResponse } from "axios";

const options = {
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
};

const API = axios.create(options);

API.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response;
      return Promise.reject({ status, ...(typeof data === "object" && data !== null ? data : { message: data }) });
    }
  }
);

export default API;
