import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { deleteItem, getItem, setItem } from '../utils/storage';
import { authApi } from '../api/auth';
import type { AuthUser, LoginCredentials, RegisterData, AuthResponse } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Persist auth tokens to secure storage. */
async function saveTokens(response: AuthResponse): Promise<void> {
  await setItem('auth_token', response.token);
  if (response.refresh_token) {
    await setItem('refresh_token', response.refresh_token);
  }
}

/** Clear all auth tokens from secure storage. */
async function clearTokens(): Promise<void> {
  await deleteItem('auth_token');
  await deleteItem('refresh_token');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await getItem('auth_token');
      if (token) {
        const userData = await authApi.me();
        setUser(userData);
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      await clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    await saveTokens(response);
    setUser(response.user);
  };

  const register = async (data: RegisterData) => {
    const response = await authApi.register(data);
    await saveTokens(response);
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.log('Logout API error:', error);
    } finally {
      await clearTokens();
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authApi.me();
      setUser(userData);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser: setUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
