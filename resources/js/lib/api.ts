import axios from 'axios';
import { API_ENDPOINTS } from './constants';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for Laravel Sanctum
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service functions
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post(API_ENDPOINTS.AUTH.LOGIN, credentials),
  
  logout: () =>
    api.post(API_ENDPOINTS.AUTH.LOGOUT),
  
  me: () =>
    api.get(API_ENDPOINTS.AUTH.ME),
};

export const tenantApi = {
  getDashboard: () =>
    api.get(API_ENDPOINTS.TENANT.DASHBOARD),
  
  getPayments: () =>
    api.get(API_ENDPOINTS.TENANT.PAYMENTS),
  
  getUtilities: () =>
    api.get(API_ENDPOINTS.TENANT.UTILITIES),
};

export default api;
