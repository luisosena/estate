// Color palette matching your web app's design (Tailwind CSS slate/blue)
export const colors = {
  // Primary colors
  primary: '#0f172a',      // Slate 900
  primaryLight: '#1e293b', // Slate 800
  primaryDark: '#020617',  // Slate 950

  // Secondary colors
  secondary: '#3b82f6',    // Blue 500
  secondaryLight: '#60a5fa', // Blue 400
  secondaryDark: '#2563eb', // Blue 600

  // Accent colors
  tertiary: '#10b981',    // Emerald 500
  warning: '#f59e0b',     // Amber 500
  error: '#ef4444',       // Red 500
  success: '#22c55e',     // Green 500
  info: '#06b6d4',        // Cyan 500

  // Neutral colors
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Status colors
  status: {
    active: '#22c55e',    // Green
    pending: '#f59e0b',    // Amber
    expired: '#ef4444',   // Red
    overdue: '#dc2626',   // Red 600
    paid: '#22c55e',      // Green
    vacant: '#94a3b8',    // Gray 400
    occupied: '#22c55e',  // Green
    maintenance: '#f59e0b', // Amber
  },

  // Background colors
  background: '#f8fafc',  // Slate 50
  surface: '#ffffff',
  surfaceVariant: '#f1f5f9', // Slate 100

  // Text colors
  text: {
    primary: '#0f172a',   // Slate 900
    secondary: '#64748b', // Slate 500
    disabled: '#94a3b8',  // Slate 400
    inverse: '#ffffff',
  },

  // Border colors
  border: '#e2e8f0',      // Slate 200
  borderLight: '#f1f5f9', // Slate 100
};

export default colors;
