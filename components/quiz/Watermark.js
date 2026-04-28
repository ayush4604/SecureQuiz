// Watermark Component - Dynamic student name watermark overlay

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../../utils/theme';

export default function Watermark({ studentName }) {
  if (!studentName) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Multiple watermark instances for coverage */}
      {[0, 1, 2].map((row) => (
        <View key={row} style={[styles.row, { top: `${20 + row * 30}%` }]}>
          <Text style={styles.watermarkText}>{studentName}</Text>
          <Text style={styles.watermarkText}>{studentName}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    overflow: 'hidden',
  },
  row: {
    position: 'absolute',
    flexDirection: 'row',
    gap: 80,
    transform: [{ rotate: '-25deg' }],
    left: -50,
    right: -50,
    justifyContent: 'center',
  },
  watermarkText: {
    color: 'rgba(255, 255, 255, 0.04)',
    fontSize: 28,
    ...FONTS.bold,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
});
