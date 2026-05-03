// Student Join Screen - Enter name and quiz code

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, SafeAreaView, Alert,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AnimatedBackground from '../../components/ui/AnimatedBackground';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import ShieldIcon from '../../components/ui/ShieldIcon';
import { COLORS, SIZES, FONTS } from '../../utils/theme';
import { getQuizByCode, addSessionToQuiz, getQuizResults } from '../../services/quizService';
import { generateId } from '../../utils/codeGenerator';
import { useApp } from '../../context/AppContext';

export default function StudentJoinScreen() {
  const { dispatch } = useApp();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your name.');
      return;
    }
    if (code.length !== 6) {
      Alert.alert('Invalid Code', 'Quiz code must be 6 digits.');
      return;
    }

    setLoading(true);
    try {
      const quiz = await getQuizByCode(code);
      if (!quiz) {
        Alert.alert('Not Found', 'No quiz found with this code. Please check and try again.');
        setLoading(false);
        return;
      }

      // Check if student with same name already joined (query results collection, not stale quiz.sessions)
      const normalizedName = name.trim().toLowerCase();
      const existingSessions = await getQuizResults(quiz.id);
      const nameExists = existingSessions.some(s => s.name?.toLowerCase() === normalizedName);
      if (nameExists) {
        Alert.alert('Access Denied', 'A student with this name has already joined this quiz. Each student can only take the quiz once.');
        setLoading(false);
        return;
      }

      const sessionId = generateId();
      const session = {
        id: sessionId,
        name: name.trim(),
        joinedAt: new Date().toISOString(),
        status: 'waiting',
        answers: {},
        score: 0,
        violations: [],
        platform: Platform.OS,
      };

      await addSessionToQuiz(quiz.id, session);

      dispatch({ type: 'SET_STUDENT', payload: { name: name.trim(), id: sessionId } });
      dispatch({ type: 'SET_ACTIVE_QUIZ', payload: { id: quiz.id, code: quiz.code, quiz } });
      dispatch({ type: 'SET_SESSION', payload: sessionId });

      router.push({
        pathname: '/student/lobby',
        params: { quizId: quiz.id, sessionId },
      });
    } catch (e) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedBackground>
      <SafeAreaView style={s.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={s.flex}
        >
          <View style={s.header}>
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={s.backBtn}>
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={s.container}>
            <ShieldIcon size={50} />
            <Text style={s.title}>Join Quiz</Text>
            <Text style={s.subtitle}>Enter your name and the quiz code from your teacher</Text>

            <GlassCard style={s.formCard}>
              <Text style={s.label}>Your Name</Text>
              <TextInput
                style={s.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="words"
              />

              <Text style={s.label}>Quiz Code</Text>
              <TextInput
                style={[s.input, s.codeInput]}
                value={code}
                onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="● ● ● ● ● ●"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                maxLength={6}
              />

              <GradientButton
                title="Join Quiz"
                onPress={handleJoin}
                loading={loading}
                style={s.joinBtn}
              />
            </GlassCard>

            <View style={s.secNote}>
              <Ionicons name="lock-closed" size={14} color={COLORS.textMuted} />
              <Text style={s.secNoteText}>
                This quiz uses anti-cheat protection. Screenshots and screen recording will be blocked.
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: { paddingHorizontal: SIZES.space20, paddingTop: SIZES.space16 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.glass,
    alignItems: 'center', justifyContent: 'center',
  },
  container: {
    flex: 1, paddingHorizontal: SIZES.space24, justifyContent: 'center',
    alignItems: 'center', marginTop: -40,
  },
  title: {
    color: COLORS.textPrimary, fontSize: SIZES.xxxl, ...FONTS.bold,
    marginTop: SIZES.space16,
  },
  subtitle: {
    color: COLORS.textSecondary, fontSize: SIZES.md, ...FONTS.regular,
    textAlign: 'center', marginTop: SIZES.space8, marginBottom: SIZES.space24,
    maxWidth: 280,
  },
  formCard: { width: '100%' },
  label: {
    color: COLORS.textSecondary, fontSize: SIZES.sm, ...FONTS.medium,
    marginBottom: SIZES.space8, marginTop: SIZES.space12,
  },
  input: {
    backgroundColor: COLORS.surfaceLight, borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.space16, paddingVertical: SIZES.space14,
    color: COLORS.textPrimary, fontSize: SIZES.base,
    borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  codeInput: {
    fontSize: SIZES.xxl, letterSpacing: 8, textAlign: 'center', ...FONTS.bold,
  },
  joinBtn: { marginTop: SIZES.space24 },
  secNote: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: SIZES.space20, paddingHorizontal: SIZES.space16,
  },
  secNoteText: {
    color: COLORS.textMuted, fontSize: SIZES.xs, ...FONTS.regular,
    flex: 1, lineHeight: 16,
  },
});
