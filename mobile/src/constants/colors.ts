// Color palette - Clean White & Vibrant Orange CRM theme
// Distinctive aesthetic focusing on high-contrast minimalism
export const colors = {
  // Primary colors - Vibrant Orange
  primary: '#FF5722',      // Vibrant Orange
  primaryLight: '#FF8A65', // Lighter orange
  primaryDark: '#E64A19',  // Darker orange

  // Secondary colors - Crisp Blue (for contact chips)
  secondary: '#3B82F6',    
  secondaryLight: '#93C5FD', 
  secondaryDark: '#2563EB', 

  // Accent colors
  tertiary: '#8B5CF6',    
  warning: '#F59E0B',     
  error: '#EF4444',       
  success: '#10B981',     
  info: '#3B82F6',        

  // Neutral colors - Clean, cool grays
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#F9FAFB',   // App background
    100: '#F3F4F6',  // Hover states, subtle fills
    200: '#E5E7EB',  // Borders, dividers
    300: '#D1D5DB',  
    400: '#9CA3AF',  // Disabled text
    500: '#6B7280',  // Secondary text, labels
    600: '#4B5563',  
    700: '#374151',  
    800: '#1F2937',  
    900: '#111827',  // Primary text, headings
  },

  // Status colors
  status: {
    active: '#10B981',    // Emerald green
    pending: '#F59E0B',   // Amber
    expired: '#EF4444',   // Red
    overdue: '#EF4444',   // Red
    paid: '#10B981',      // Emerald green
    vacant: '#9CA3AF',    // Gray
    occupied: '#10B981',  // Emerald green
    maintenance: '#F59E0B', // Amber
    canceled: '#EF4444',  // Red
  },

  // Background colors - Clean bright white/gray
  background: '#fafafa',  // Extremely light gray, almost white, for the overall frame
  surface: '#ffffff',     // Pure white for cards/panels
  surfaceVariant: '#F9FAFB',

  // Text colors
  text: {
    primary: '#111827',   // Slate 900
    secondary: '#6B7280', // Slate 500
    disabled: '#9CA3AF',  // Slate 400
    inverse: '#ffffff',
  },

  // Border colors
  border: '#E5E7EB',      // Very subtle gray border
  borderLight: '#F3F4F6', 
};

export default colors;
