// Student Lobby - Waiting for teacher to start the quiz

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Animated,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AnimatedBackground from '../../components/ui/AnimatedBackground';
import GlassCard from '../../components/ui/GlassCard';
import ShieldIcon from '../../components/ui/ShieldIcon';
import { COLORS, SIZES, FONTS } from '../../utils/theme';
import { getQuizById } from '../../services/quizService';
import { useApp } from '../../context/AppContext';
import { QUIZ_STATUS } from '../../utils/constants';

export default function LobbyScreen() {
  const { quizId, sessionId } = useLocalSearchParams();
  const { state } = useApp();
  const [quiz, setQuiz] = useState(null);
  const [dots, setDots] = useState('');
  const [loading, setLoading] = useState(true);

  // Redirect if missing data
  useEffect(() => {
    if (!quizId || !state.studentName) {
      router.replace('/');
    }
  }, [quizId, state.studentName]);

  // Animated dots
  useEffect(() => {
    const iv = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(iv);
  }, []);

  // Poll for quiz status
  const checkStatus = useCallback(async () => {
    const data = await getQuizById(quizId);
    if (data) {
      setQuiz(data);
      if (data.status === QUIZ_STATUS.ACTIVE) {
        router.replace({
          pathname: '/student/quiz',
          params: { quizId, sessionId },
        });
      }
    }
  }, [quizId, sessionId]);

  useEffect(() => {
    checkStatus();
    const iv = setInterval(checkStatus, 2000);
    return () => clearInterval(iv);
  }, [checkStatus]);

  return (
    <AnimatedBackground>
      <SafeAreaView style={s.safe}>
        <View style={s.container}>
          <ShieldIcon size={60} color={COLORS.secondary} />

          <Text style={s.title}>You're In!</Text>
          <Text style={s.name}>{state.studentName}</Text>

          {quiz && (
            <GlassCard style={s.quizCard}>
              <Text style={s.quizTitle}>{quiz.title}</Text>
              <View style={s.infoRow}>
                <View style={s.infoBadge}>
                  <Ionicons name="help-circle" size={14} color={COLORS.primary} />
                  <Text style={s.infoText}>{quiz.questions?.length} questions</Text>
                </View>
                <View style={s.infoBadge}>
                  <Ionicons name="time" size={14} color={COLORS.primary} />
                  <Text style={s.infoText}>{quiz.timeLimit} min</Text>
                </View>
              </View>
            </GlassCard>
          )}

          <View style={s.waitingBox}>
            <Text style={s.waitingText}>
              Waiting for teacher to start{dots}
            </Text>
          </View>

          {/* Security info */}
          <GlassCard style={s.secCard} variant="light">
            <Text style={s.secTitle}>🔒 Security Active</Text>
            <View style={s.secRow}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
              <Text style={s.secText}>Screenshots will be blocked</Text>
            </View>
            <View style={s.secRow}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
              <Text style={s.secText}>Screen recording will be blocked</Text>
            </View>
            <View style={s.secRow}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
              <Text style={s.secText}>Tab switching will be detected</Text>
            </View>
            <View style={s.secRow}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
              <Text style={s.secText}>3 violations = auto-submit</Text>
            </View>
          </GlassCard>
        </View>
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1, paddingHorizontal: SIZES.space24, justifyContent: 'center', alignItems: 'center',
  },
  title: {
    color: COLORS.textPrimary, fontSize: SIZES.xxxl, ...FONTS.bold, marginTop: SIZES.space16,
  },
  name: {
    color: COLORS.secondary, fontSize: SIZES.xl, ...FONTS.semiBold, marginTop: 4,
  },
  quizCard: {
    width: '100%', alignItems: 'center', marginTop: SIZES.space24,
  },
  quizTitle: {
    color: COLORS.textPrimary, fontSize: SIZES.lg, ...FONTS.semiBold, textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row', gap: SIZES.space16, marginTop: SIZES.space12,
  },
  infoBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  infoText: { color: COLORS.textSecondary, fontSize: SIZES.sm },
  waitingBox: {
    marginTop: SIZES.space32, paddingVertical: SIZES.space16,
  },
  waitingText: {
    color: COLORS.textMuted, fontSize: SIZES.lg, ...FONTS.medium,
  },
  secCard: {
    width: '100%', marginTop: SIZES.space24,
  },
  secTitle: {
    color: COLORS.textPrimary, fontSize: SIZES.base, ...FONTS.semiBold, marginBottom: SIZES.space12,
  },
  secRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6,
  },
  secText: {
    color: COLORS.textSecondary, fontSize: SIZES.sm, ...FONTS.regular,
  },
});
