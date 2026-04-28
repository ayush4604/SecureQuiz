// AnimatedBackground - Particle and gradient animated background

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/theme';

const { width, height } = Dimensions.get('window');

function FloatingOrb({ delay, size, color, startX, startY }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.15)).current;

  useEffect(() => {
    const animateY = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -30,
          duration: 3000 + delay,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 30,
          duration: 3000 + delay,
          useNativeDriver: true,
        }),
      ])
    );

    const animateX = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 20,
          duration: 4000 + delay,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -20,
          duration: 4000 + delay,
          useNativeDriver: true,
        }),
      ])
    );

    const animateOpacity = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 2000 + delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.1,
          duration: 2000 + delay,
          useNativeDriver: true,
        }),
      ])
    );

    animateY.start();
    animateX.start();
    animateOpacity.start();

    return () => {
      animateY.stop();
      animateX.stop();
      animateOpacity.stop();
    };
  }, [delay]);

  return (
    <Animated.View
      style={[
        styles.orb,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left: startX,
          top: startY,
          opacity,
          transform: [{ translateY }, { translateX }],
        },
      ]}
    />
  );
}

export default function AnimatedBackground({ children, variant = 'default' }) {
  const gradientColors =
    variant === 'quiz'
      ? [COLORS.bg, '#050810', '#0A0E1A']
      : [COLORS.bg, COLORS.bgSecondary, '#050810'];

  const orbs = [
    { delay: 0, size: 200, color: 'rgba(0, 212, 255, 0.08)', startX: -50, startY: 100 },
    { delay: 500, size: 150, color: 'rgba(124, 58, 237, 0.08)', startX: width - 100, startY: 300 },
    { delay: 1000, size: 180, color: 'rgba(0, 212, 255, 0.05)', startX: 50, startY: height - 200 },
    { delay: 1500, size: 120, color: 'rgba(124, 58, 237, 0.06)', startX: width / 2, startY: 50 },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFillObject} />

      {variant !== 'quiz' &&
        orbs.map((orb, index) => <FloatingOrb key={index} {...orb} />)}

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  orb: {
    position: 'absolute',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});
