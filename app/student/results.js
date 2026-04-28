// Student Results Screen - Score display after quiz submission

import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Animated,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AnimatedBackground from '../../components/ui/AnimatedBackground';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import { COLORS, SIZES, FONTS } from '../../utils/theme';

export default function StudentResultsScreen() {
  const { score, total, percentage } = useLocalSearchParams();
  const scoreNum = parseInt(score) || 0;
  const totalNum = parseInt(total) || 0;
  const pct = parseInt(percentage) || 0;
  const passed = pct >= 40;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1, useNativeDriver: true, friction: 6,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 500, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getGrade = () => {
    if (pct >= 90) return { letter: 'A+', color: COLORS.success, icon: 'trophy' };
    if (pct >= 80) return { letter: 'A', color: COLORS.success, icon: 'medal' };
    if (pct >= 70) return { letter: 'B', color: COLORS.successLight, icon: 'thumbs-up' };
    if (pct >= 60) return { letter: 'C', color: COLORS.warning, icon: 'checkmark-circle' };
    if (pct >= 40) return { letter: 'D', color: COLORS.warningLight, icon: 'alert-circle' };
    return { letter: 'F', color: COLORS.danger, icon: 'close-circle' };
  };

  const grade = getGrade();

  return (
    <AnimatedBackground>
      <SafeAreaView style={s.safe}>
        <View style={s.container}>
          {/* Result Card */}
          <Animated.View style={[s.resultSection, { transform: [{ scale: scaleAnim }] }]}>
            <Ionicons name={grade.icon} size={64} color={grade.color} />
            <Text style={[s.grade, { color: grade.color }]}>{grade.letter}</Text>
            <Text style={s.scoreText}>
              {scoreNum}/{totalNum}
            </Text>
            <Text style={[s.pctText, { color: grade.color }]}>{pct}%</Text>
            <Text style={s.statusText}>
              {passed ? 'Congratulations!' : 'Keep studying!'}
            </Text>
          </Animated.View>

          {/* Stats */}
          <Animated.View style={[s.statsSection, { opacity: fadeAnim }]}>
            <View style={s.statsRow}>
              <GlassCard style={s.statCard} variant="success">
                <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                <Text style={[s.statNum, { color: COLORS.success }]}>{scoreNum}</Text>
                <Text style={s.statLabel}>Correct</Text>
              </GlassCard>
              <GlassCard style={s.statCard} variant="danger">
                <Ionicons name="close-circle" size={24} color={COLORS.danger} />
                <Text style={[s.statNum, { color: COLORS.danger }]}>{totalNum - scoreNum}</Text>
                <Text style={s.statLabel}>Wrong</Text>
              </GlassCard>
            </View>
          </Animated.View>

          {/* Back Button */}
          <Animated.View style={[s.btnSection, { opacity: fadeAnim }]}>
            <GradientButton
              title="Back to Home"
              onPress={() => router.replace('/')}
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1, paddingHorizontal: SIZES.space24,
    justifyContent: 'center', alignItems: 'center',
  },
  resultSection: { alignItems: 'center', marginBottom: SIZES.space32 },
  grade: {
    fontSize: 64, ...FONTS.extraBold, marginTop: SIZES.space8,
  },
  scoreText: {
    color: COLORS.textPrimary, fontSize: SIZES.xxxl, ...FONTS.bold, marginTop: SIZES.space8,
  },
  pctText: {
    fontSize: SIZES.xl, ...FONTS.semiBold, marginTop: 4,
  },
  statusText: {
    color: COLORS.textSecondary, fontSize: SIZES.lg, ...FONTS.medium, marginTop: SIZES.space12,
  },
  statsSection: { width: '100%', marginBottom: SIZES.space32 },
  statsRow: { flexDirection: 'row', gap: SIZES.space16 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: SIZES.space16 },
  statNum: { fontSize: SIZES.xxl, ...FONTS.bold, marginTop: SIZES.space8 },
  statLabel: { color: COLORS.textMuted, fontSize: SIZES.sm, ...FONTS.medium, marginTop: 2 },
  btnSection: { width: '100%' },
});
