import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  AuthUser,
} from '../types';

import api from './client';

export const authApi = {
  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    api.post<AuthResponse>('/auth/login', credentials),

  register: (data: RegisterData): Promise<AuthResponse> =>
    api.post<AuthResponse>('/auth/register', data),

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    await api.clearTokens();
  },

  me: async (): Promise<AuthUser> => {
    const response = await api.get<{ data: AuthUser }>('/auth/me');
    return response.data;
  },

  refreshToken: (): Promise<{ token: string }> =>
    api.post<{ token: string }>('/auth/refresh'),

  forgotPassword: (email: string): Promise<{ message: string }> =>
    api.post<{ message: string }>('/auth/forgot-password', { email }),

  resetPassword: (data: {
    email: string;
    password: string;
    password_confirmation: string;
    token: string;
  }): Promise<{ message: string }> =>
    api.post<{ message: string }>('/auth/reset-password', data),
};

export default authApi;
