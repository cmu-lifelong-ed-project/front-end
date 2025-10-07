import axios from "axios";

export const authHeader = (token?: string) => {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// error handling ให้โยนข้อความที่อ่านง่าย
api.interceptors.response.use(
  (res) => res,
  (err) => {
    return Promise.reject(new Error(err.message));
  }
);

export default api;
