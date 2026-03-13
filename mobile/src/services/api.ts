import axios from 'axios';
import { API_BASE_URL } from '../constants/config';
import { useAuthStore } from '../store/authStore';

function normalizeBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed.slice(0, -4) : trimmed;
}

const api = axios.create({
  baseURL: normalizeBaseUrl(API_BASE_URL),
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Attach bearer token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// Unwrap the { success, data } envelope and surface error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message ??
      'Unknown error';
    return Promise.reject(new Error(message));
  },
);

export default api;
