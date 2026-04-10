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
    shadowColor: 'transparent',
    elevation: 0, // Flat look
  },
  tabBarLabelStyle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  tabBarItemStyle: {
    paddingVertical: 8,
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

