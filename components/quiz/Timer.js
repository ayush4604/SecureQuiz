// Timer Component - Countdown timer with urgency color transitions

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../utils/theme';

export default function Timer({ formattedTime, urgency, progress }) {
  const urgencyColors = {
    normal: COLORS.success,
    warning: COLORS.warning,
    critical: COLORS.danger,
  };

  const color = urgencyColors[urgency] || COLORS.success;

  return (
    <View style={[styles.container, { borderColor: color + '40' }]}>
      <Ionicons
        name={urgency === 'critical' ? 'alarm' : 'time-outline'}
        size={18}
        color={color}
      />
      <Text style={[styles.time, { color }]}>{formattedTime}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.space8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: SIZES.space12,
    paddingVertical: SIZES.space8,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
  },
  time: {
    fontSize: SIZES.lg,
    ...FONTS.bold,
    fontVariant: ['tabular-nums'],
  },
});
