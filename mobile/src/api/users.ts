import type {
  User,
  UserProfile,
  CreateUserData,
  UpdateUserData,
  PaginatedResponse,
} from '../types';

import api from './client';

export const userApi = {
  // List all users (admin/landlord only)
  getUsers: (params?: {
    page?: number;
    search?: string;
    role?: string;
    per_page?: number;
  }): Promise<PaginatedResponse<User>> =>
    api.get<PaginatedResponse<User>>('/users', params),

  // Get single user
  getUser: (userId: number): Promise<{ user: User }> =>
    api.get<{ user: User }>(`/users/${userId}`),

  // Create new user
  createUser: (data: CreateUserData): Promise<{ message: string; user: User }> =>
    api.post<{ message: string; user: User }>('/users', data),

  // Update user
  updateUser: (userId: number, data: UpdateUserData): Promise<{ message: string; user: User }> =>
    api.put<{ message: string; user: User }>(`/users/${userId}`, data),

  // Delete user
  deleteUser: (userId: number): Promise<{ message: string }> =>
    api.delete<{ message: string }>(`/users/${userId}`),
};

export default userApi;
