import axios from 'axios';
import { API_BASE_URL, API_BASE_URL_CANDIDATES } from '../constants/config';
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

let activeBaseUrl = normalizeBaseUrl(API_BASE_URL);
const fallbackBaseUrls = API_BASE_URL_CANDIDATES
  .map(normalizeBaseUrl)
  .filter((url, index, arr) => url !== activeBaseUrl && arr.indexOf(url) === index);

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
  async (error) => {
    const requestConfig = error.config as (Record<string, unknown> & { baseURL?: string }) | undefined;
    const canRetryWithFallback =
      error.code === 'ERR_NETWORK' &&
      requestConfig &&
      !requestConfig.__hasRetriedWithFallback &&
      fallbackBaseUrls.length > 0;

    if (canRetryWithFallback) {
      const nextBaseUrl = fallbackBaseUrls.shift() as string;
      activeBaseUrl = nextBaseUrl;
      api.defaults.baseURL = nextBaseUrl;

      const retryConfig = {
        ...(requestConfig as Record<string, unknown>),
        baseURL: nextBaseUrl,
        __hasRetriedWithFallback: true,
      };

      console.warn(`[api] Network error, retrying with fallback base URL: ${nextBaseUrl}`);
      return api.request(retryConfig as any);
    }

    if (error.code === 'ERR_NETWORK') {
      return Promise.reject(
        new Error(
          `Unable to connect to API at ${activeBaseUrl}. Check that the backend is running and reachable from this device.`,
        ),
      );
    }

    const message =
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message ??
      'Unknown error';
    return Promise.reject(new Error(message));
  },
);

export default api;
