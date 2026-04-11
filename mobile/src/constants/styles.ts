import { StyleSheet, Platform } from 'react-native';

import { colors } from './colors';

/**
 * Shared styles used across multiple screens.
 * Rebuilt for the minimal, high-contrast CRM aesthetic.
 */
export const screenStyles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    // Minimal or no shadow for the clean CRM look
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 0, 
  },
  empty: {
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  empty_inline: {
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: 8,
    fontSize: 14,
    fontStyle: 'italic',
  },
  input: {
    marginBottom: 12,
  },
});

/**
 * Minimalist Tab Bar matching the reference UI.
 * Pure white background, active icons are vibrant orange.
 */
export const tabBarScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.primary, // Orange
  tabBarInactiveTintColor: colors.gray[400], 
  tabBarStyle: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
    // Raise the bar higher
    height: Platform.OS === 'ios' ? 88 : 72,
    paddingBottom: Platform.OS === 'ios' ? 32 : 12,
  },
  tabBarLabelStyle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 0,
    marginBottom: Platform.OS === 'ios' ? 0 : 4,
  },
  tabBarItemStyle: {
    paddingVertical: 10,
  },
  tabBarShowLabel: true,
} as const;

/**
 * Standard options for Native Headers across Stack Navigators.
 */
export const nativeHeaderOptions = {
  headerStyle: {
    backgroundColor: colors.surface,
  },
  headerTintColor: colors.text.primary,
  headerTitleStyle: {
    fontWeight: '700' as const,
    fontSize: 17,
  },
  headerShadowVisible: false, // Clean minimalist look
  headerBackTitleVisible: false, // iOS cleanup
} as const;

