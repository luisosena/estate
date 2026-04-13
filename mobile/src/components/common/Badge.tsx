import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

type BadgeStatus = 'active' | 'pending' | 'canceled' | 'cancelled' | 'paid' | 'default' | 'waived';

interface BadgeProps {
  label: string;
  status?: BadgeStatus;
  style?: ViewStyle;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function Badge({ label, status = 'default', style, icon }: BadgeProps) {
  let backgroundColor = colors.gray[100];
  let textColor = colors.gray[700];
  let iconColor = colors.gray[700];

  switch (status) {
    case 'active':
    case 'paid':
      backgroundColor = '#ECFDF5'; // Light emerald
      textColor = colors.status.active;
      iconColor = colors.status.active;
      break;
    case 'pending':
      backgroundColor = '#FEF3C7'; // Light amber
      textColor = colors.status.pending;
      iconColor = colors.status.pending;
      break;
    case 'canceled':
    case 'cancelled':
      backgroundColor = '#FEF2F2'; // Light red
      textColor = colors.status.canceled;
      iconColor = colors.status.canceled;
      break;
    case 'waived':
      backgroundColor = colors.gray[200];
      textColor = colors.gray[600];
      iconColor = colors.gray[600];
      break;
  }

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      {icon && (
        <Ionicons name={icon} size={12} color={iconColor} style={styles.icon} />
      )}
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
