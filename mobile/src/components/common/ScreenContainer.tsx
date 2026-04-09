import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets, Edge } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  edges?: Edge[];
  backgroundColor?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
  withKeyboard?: boolean;
}

/**
 * ScreenContainer provides a unified way to handle:
 * 1. Safe Area Insets (notches, home indicators)
 * 2. Keyboard Avoiding behavior
 * 3. Scrolling vs Static layouts
 * 4. Background styling
 */
export function ScreenContainer({
  children,
  style,
  scrollable = false,
  edges = ['top', 'bottom'], // Default to vertical only to prevent horizontal 'zoom'
  backgroundColor = colors.background,
  refreshing = false,
  onRefresh,
  withKeyboard = true,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();

  // Root style handles the background color for the entire screen (edge-to-edge)
  const rootStyle: ViewStyle = {
    flex: 1,
    backgroundColor,
  };

  // Content style handles the safe area padding
  const safeAreaStyle: ViewStyle = {
    flex: 1,
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
  };

  const content = scrollable ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={style}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, style]}>{children}</View>
  );

  return (
    <View style={rootStyle}>
      {withKeyboard ? (
        <KeyboardAvoidingView
          style={safeAreaStyle}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        <View style={safeAreaStyle}>{content}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
