// Application constants for frontend

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  TENANT: {
    DASHBOARD: '/api/tenant/dashboard',
    PAYMENTS: '/api/tenant/payments',
    UTILITIES: '/api/tenant/utilities',
  },
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  TENANT_DASHBOARD: '/tenant/dashboard',
  TENANT_PAYMENTS: '/tenant/payments',
  TENANT_UTILITIES: '/tenant/utilities',
  SETTINGS: {
    PROFILE: '/settings/profile',
    PASSWORD: '/settings/password',
    APPEARANCE: '/settings/appearance',
    TWO_FACTOR: '/settings/two-factor',
  },
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  API: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
} as const;
