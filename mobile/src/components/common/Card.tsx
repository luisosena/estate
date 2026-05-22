import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';

import { colors } from '../../constants/colors';

export interface CardProps extends ViewProps {
  noPadding?: boolean;
}

export function Card({ style, children, noPadding = false, ...rest }: CardProps) {
  return (
    <View 
      style={[
        styles.card, 
        !noPadding && styles.withPadding,
        style
      ]} 
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12, // More refined border radius
    borderWidth: 1,
    borderColor: colors.border,
    // Ensure no elevation or heavy shadow as per CRM minimal look
    elevation: 0,
    shadowColor: 'transparent',
    overflow: 'hidden',
  },
  withPadding: {
    padding: 16,
  }
});
