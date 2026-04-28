// ViolationWarning - Full-screen red warning overlay for anti-cheat violations

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../utils/theme';
import { MAX_VIOLATIONS } from '../../utils/constants';

export default function ViolationWarning({
  visible,
  message,
  violationCount,
  onDismiss,
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Flash the red overlay
      Animated.sequence([
        Animated.timing(flashOpacity, {
          toValue: 0.4,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(flashOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Show warning card
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const isAutoSubmit = violationCount >= MAX_VIOLATIONS;

  return (
    <View style={styles.container}>
      {/* Red flash overlay */}
      <Animated.View
        style={[styles.flashOverlay, { opacity: flashOpacity }]}
      />

      {/* Warning card */}
      <Animated.View
        style={[styles.cardContainer, { opacity, transform: [{ scale }] }]}
      >
        <View style={styles.card}>
          <Ionicons
            name={isAutoSubmit ? 'hand-left' : 'warning'}
            size={48}
            color={COLORS.danger}
          />
          <Text style={styles.title}>
            {isAutoSubmit ? 'Quiz Auto-Submitted!' : 'Warning!' }
          </Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.countContainer}>
            <Text style={styles.countText}>
              Violations: {violationCount}/{MAX_VIOLATIONS}
            </Text>
          </View>
          {isAutoSubmit ? (
            <Text style={styles.autoSubmitText}>
              Your quiz has been automatically submitted due to too many violations.
            </Text>
          ) : (
            <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
              <Text style={styles.dismissText}>I understand, continue quiz</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.danger,
  },
  cardContainer: {
    width: '85%',
    maxWidth: 400,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    borderWidth: 2,
    borderColor: COLORS.danger,
    padding: SIZES.space32,
    alignItems: 'center',
  },
  title: {
    color: COLORS.danger,
    fontSize: SIZES.xxl,
    ...FONTS.bold,
    marginTop: SIZES.space16,
    textAlign: 'center',
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: SIZES.base,
    ...FONTS.medium,
    marginTop: SIZES.space12,
    textAlign: 'center',
    lineHeight: 22,
  },
  countContainer: {
    backgroundColor: COLORS.violationBg,
    paddingHorizontal: SIZES.space16,
    paddingVertical: SIZES.space8,
    borderRadius: SIZES.radiusFull,
    marginTop: SIZES.space16,
    borderWidth: 1,
    borderColor: COLORS.violationBorder,
  },
  countText: {
    color: COLORS.danger,
    fontSize: SIZES.md,
    ...FONTS.bold,
  },
  autoSubmitText: {
    color: COLORS.dangerLight,
    fontSize: SIZES.sm,
    marginTop: SIZES.space16,
    textAlign: 'center',
    lineHeight: 20,
  },
  dismissButton: {
    marginTop: SIZES.space20,
    paddingVertical: SIZES.space12,
    paddingHorizontal: SIZES.space24,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
  },
  dismissText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.md,
    ...FONTS.medium,
  },
});
