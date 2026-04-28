// ShieldIcon - Animated security shield icon

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../utils/theme';

export default function ShieldIcon({ size = 80, color = COLORS.primary, animated = true }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (!animated) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.2,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    glow.start();

    return () => {
      pulse.stop();
      glow.stop();
    };
  }, [animated]);

  return (
    <View style={[styles.container, { width: size * 1.6, height: size * 1.6 }]}>
      {/* Glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: size * 1.6,
            height: size * 1.6,
            borderRadius: size * 0.8,
            borderColor: color,
            opacity: glowAnim,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
      {/* Shield icon */}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <Ionicons name="shield-checkmark" size={size} color={color} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 2,
  },
});
