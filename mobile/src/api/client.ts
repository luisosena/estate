import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { Platform } from 'react-native';
import { deleteItem, getItem, setItem } from '../utils/storage';

// API Base URL - Platform-aware configuration
// For development, use appropriate URL based on platform
const getApiBaseUrl = () => {
  // Check if custom URL is provided via environment variable
  // For physical devices, set EXPO_PUBLIC_API_URL in mobile/.env to your PC's Wi-Fi IP
  // e.g. EXPO_PUBLIC_API_URL=http://192.168.1.105:8000/api/v1
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Platform-specific fallback URLs
  if (Platform.OS === 'web') {
    return 'http://localhost:8000/api/v1';
  } else if (Platform.OS === 'android') {
    // 10.0.2.2 is the Android emulator's alias for the host machine's loopback.
    // This does NOT work on physical devices — set EXPO_PUBLIC_API_URL in .env instead.
    console.warn(
      '[API] No EXPO_PUBLIC_API_URL set. Falling back to Android emulator address (10.0.2.2). ' +
      'If you are on a physical device, create mobile/.env with:\n' +
      'EXPO_PUBLIC_API_URL=http://<YOUR_PC_WIFI_IP>:8000/api/v1'
    );
    return 'http://10.0.2.2:8000/api/v1';
  } else {
    // iOS simulator can use localhost
    return 'http://localhost:8000/api/v1';
  }
};

const API_BASE_URL = getApiBaseUrl();

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await getItem('auth_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.client(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await getItem('refresh_token');
            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refresh_token: refreshToken,
            });

            const { token } = response.data;
            await setItem('auth_token', token);

            this.processQueue(null, token);
            this.isRefreshing = false;

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError as Error, null);
            this.isRefreshing = false;
            // Clear tokens and trigger re-login
            await deleteItem('auth_token');
            await deleteItem('refresh_token');
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: Error | null, token: string | null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else if (token) {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  // Generic request methods
  async get<T>(url: string, params?: object): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: object): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: object): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: object): Promise<T> {
    const response = await this.client.patch<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  // Set token manually (for after login)
  setToken(token: string): void {
    setItem('auth_token', token);
  }

  // Clear tokens (for logout)
  clearTokens(): void {
    deleteItem('auth_token');
    deleteItem('refresh_token');
  }
}

export const api = new ApiClient();
export default api;
