import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Handle 401 Unauthorized, refresh token logic goes here
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // const newToken = await refreshAuthToken();...
      // useAuthStore.getState().setAccessToken(newToken);
      // return api(originalRequest);
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
