import { StyleSheet, Platform } from 'react-native';
import { colors } from './colors';

/**
 * Tab bar height constant for use in screen padding.
 * Use this to add bottom padding to screens with scrollable content.
 */
export const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 84 : 70;

/**
 * Additional padding for the tab bar to account for iOS safe area.
 */
export const TAB_BAR_PADDING_BOTTOM = Platform.OS === 'ios' ? 28 : 0;

/**
 * Bottom padding needed for screens to avoid tab bar overlay.
 * This is the visible height of the tab bar (excluding internal padding).
 */
export const SCREEN_BOTTOM_PADDING = Platform.OS === 'ios' ? 56 : 70;

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
    paddingTop: Platform.OS === 'ios' ? 80 : 64,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
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
  input: {
    marginBottom: 12,
  },
});

/**
 * Tab bar options shared between Tenant and Landlord navigators.
 * Full-width design with straight top border and bottom-spanning height.
 * Uses responsive spacing and accessible labels.
 */

export const tabBarScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.gray[600], // Better contrast for inactive
  tabBarStyle: {
    height: TAB_BAR_HEIGHT,
    paddingBottom: TAB_BAR_PADDING_BOTTOM,
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
