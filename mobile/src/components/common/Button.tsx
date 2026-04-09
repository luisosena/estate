import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle, 
  ActivityIndicator,
  TouchableOpacityProps
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
}

export function Button({ 
  label, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  loading = false,
  style,
  disabled,
  ...rest 
}: ButtonProps) {
  
  const getBackground = () => {
    if (disabled) return colors.gray[200];
    switch (variant) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.surfaceVariant;
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      default: return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.gray[400];
    switch (variant) {
      case 'primary': return colors.white;
      case 'secondary': return colors.text.primary;
      case 'outline': return colors.text.primary;
      case 'ghost': return colors.text.secondary;
      default: return colors.white;
    }
  };

  const getBorder = () => {
    if (variant === 'outline') {
      return { borderWidth: 1, borderColor: disabled ? colors.gray[200] : colors.border };
    }
    return {};
  };

  const getHeight = () => {
    switch (size) {
      case 'sm': return 36;
      case 'lg': return 56;
      case 'md':
      default: return 48;
    }
  };

  const textColor = getTextColor();

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        { backgroundColor: getBackground(), height: getHeight() },
        getBorder(),
        style
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon && (
            <Ionicons name={icon} size={size === 'sm' ? 16 : 20} color={textColor} style={styles.icon} />
          )}
          <Text style={[styles.label, { color: textColor, fontSize: size === 'sm' ? 14 : 16 }]}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontWeight: '600',
  },
});
