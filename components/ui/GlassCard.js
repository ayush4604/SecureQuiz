// GlassCard Component - Glassmorphism card with frosted glass effect

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../../utils/theme';

export default function GlassCard({
  children,
  style,
  variant = 'default', // 'default' | 'light' | 'danger' | 'success'
  noPadding = false,
}) {
  const variantStyles = {
    default: {
      backgroundColor: COLORS.glass,
      borderColor: COLORS.glassBorder,
    },
    light: {
      backgroundColor: COLORS.glassLight,
      borderColor: COLORS.glassBorder,
    },
    danger: {
      backgroundColor: COLORS.violationBg,
      borderColor: COLORS.violationBorder,
    },
    success: {
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
    },
  };

  return (
    <View
      style={[
        styles.card,
        variantStyles[variant],
        !noPadding && styles.padding,
        SHADOWS.medium,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    overflow: 'hidden',
  },
  padding: {
    padding: SIZES.space20,
  },
});
