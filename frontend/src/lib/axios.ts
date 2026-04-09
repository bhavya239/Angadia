import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const VITE_API_URL = import.meta.env.VITE_API_BASE_URL || '';
const BASE_URL = VITE_API_URL.endsWith('/api/v1') 
  ? VITE_API_URL 
  : `${VITE_API_URL.replace(/\/$/, '')}/api/v1`;

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
    // Handle 401 Unauthorized securely
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
