// GradientButton Component - Animated gradient button with press effect

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../utils/theme';

export default function GradientButton({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  loading = false,
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'outline'
  size = 'large', // 'small' | 'medium' | 'large'
  icon,
}) {
  const gradients = {
    primary: [COLORS.primary, COLORS.secondary],
    secondary: [COLORS.secondary, COLORS.secondaryDark],
    danger: [COLORS.danger, COLORS.dangerDark],
  };

  const sizeStyles = {
    small: { paddingVertical: SIZES.space8, paddingHorizontal: SIZES.space16 },
    medium: { paddingVertical: SIZES.space12, paddingHorizontal: SIZES.space24 },
    large: { paddingVertical: SIZES.space16, paddingHorizontal: SIZES.space32 },
  };

  const textSizes = {
    small: SIZES.sm,
    medium: SIZES.base,
    large: SIZES.lg,
  };

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.7}
        style={[
          styles.outlineButton,
          sizeStyles[size],
          disabled && styles.disabledOutline,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.primary} size="small" />
        ) : (
          <Text
            style={[
              styles.outlineText,
              { fontSize: textSizes[size] },
              textStyle,
            ]}
          >
            {icon} {title}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[disabled && styles.disabled, style]}
    >
      <LinearGradient
        colors={disabled ? ['#374151', '#1F2937'] : gradients[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, sizeStyles[size], SHADOWS.medium]}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <Text
            style={[
              styles.text,
              { fontSize: textSizes[size] },
              FONTS.semiBold,
              textStyle,
            ]}
          >
            {icon ? `${icon}  ${title}` : title}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    color: COLORS.textPrimary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.5,
  },
  outlineButton: {
    borderRadius: SIZES.radius,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineText: {
    color: COLORS.primary,
    textAlign: 'center',
    ...FONTS.semiBold,
  },
  disabledOutline: {
    borderColor: COLORS.textMuted,
    opacity: 0.5,
  },
});
