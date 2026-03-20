import { StyleSheet, Platform } from 'react-native';
import { colors } from './colors';

/**
 * Shared styles used across multiple screens.
 * Avoids duplicating identical StyleSheet.create() calls in every screen file.
 */
export const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    paddingTop: 24,
  },
  title: {
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.text.secondary,
    marginTop: 4,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.white,
  },
  placeholder: {
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: 40,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  date: {
    color: colors.text.secondary,
    marginTop: 2,
  },
  empty: {
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  chip: {
    height: 28,
  },
});

/**
 * Tab bar options shared between Tenant and Landlord navigators.
 * Full-width design with straight top border and bottom-spanning height.
 * Uses responsive spacing and accessible labels.
 */
export const tabBarScreenOptions = {
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.gray[600], // Better contrast for inactive
  tabBarStyle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 84 : 70,
    paddingBottom: Platform.OS === 'ios' ? 28 : 0, // Safe area padding for iOS home indicator
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    // Subtle shadow for depth
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  tabBarLabelStyle: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    // Ensure accessibility - labels always visible for screen readers
  },
  tabBarItemStyle: {
    paddingVertical: 6,
  },
  tabBarShowLabel: true,
} as const;
