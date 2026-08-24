import axios from 'axios';

const getApiBaseUrl = (): string => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  return url.endsWith('/api') ? url : `${url}/api`;
};

const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach JWT Bearer token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pharmtrack_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Unified response handler with fallback tolerance
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'API Request Failed';
    console.warn(`[API Client] ${error.config?.method?.toUpperCase()} ${error.config?.url} failed:`, message);
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
