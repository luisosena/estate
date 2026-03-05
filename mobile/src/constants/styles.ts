import { StyleSheet } from 'react-native';
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
 */
export const tabBarScreenOptions = {
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.gray[500],
  tabBarStyle: {
    paddingBottom: 5,
    height: 60,
  },
  tabBarLabelStyle: {
    fontSize: 12,
  },
} as const;
