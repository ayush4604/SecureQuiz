// Quiz Detail - View quiz, start it, see joined students (REAL-TIME)

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  SafeAreaView, Alert, Share,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AnimatedBackground from '../../components/ui/AnimatedBackground';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import { COLORS, SIZES, FONTS } from '../../utils/theme';
import { updateQuizStatus, subscribeToQuiz, subscribeToQuizResults } from '../../services/quizService';
import { QUIZ_STATUS } from '../../utils/constants';

export default function QuizDetailScreen() {
  const { quizId } = useLocalSearchParams();
  const [quiz, setQuiz] = useState(null);
  const [sessions, setSessions] = useState([]);

  // Real-time listener for quiz document (status, title, etc.)
  useEffect(() => {
    if (!quizId) return;

    const unsub = subscribeToQuiz(quizId, (quizData) => {
      setQuiz(quizData);
    });

    return () => { if (typeof unsub === 'function') unsub(); };
  }, [quizId]);

  // Real-time listener for all student sessions — instant updates
  useEffect(() => {
    if (!quizId) return;

    const unsub = subscribeToQuizResults(quizId, (results) => {
      setSessions(results);
    });

    return () => { if (typeof unsub === 'function') unsub(); };
  }, [quizId]);

  const handleStart = async () => {
    await updateQuizStatus(quizId, QUIZ_STATUS.ACTIVE);
    Alert.alert('Quiz Started!', 'Students can now take the quiz.');
  };

  const handleEnd = async () => {
    await updateQuizStatus(quizId, QUIZ_STATUS.COMPLETED);
  };

  const handleShare = async () => {
    if (!quiz) return;
    await Share.share({
      message: `Join my SecureQuiz!\nCode: ${quiz.code}\nTitle: ${quiz.title}`,
    });
  };

  const handleResults = () => {
    router.push({ pathname: '/teacher/results', params: { quizId } });
  };

  if (!quiz) return (
    <AnimatedBackground>
      <SafeAreaView style={s.safe}>
        <Text style={s.loading}>Loading...</Text>
      </SafeAreaView>
    </AnimatedBackground>
  );

  return (
    <AnimatedBackground>
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/teacher')} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={s.headerTitle} numberOfLines={1}>{quiz.title}</Text>
          <TouchableOpacity onPress={handleShare} style={s.backBtn}>
            <Ionicons name="share-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={s.content}>
          {/* Quiz Code */}
          <GlassCard style={s.codeCard}>
            <Text style={s.codeLabel}>QUIZ CODE</Text>
            <Text style={s.codeText}>{quiz.code}</Text>
            <Text style={s.codeSub}>Share this code with students</Text>
          </GlassCard>

          {/* Stats */}
          <View style={s.statsRow}>
            <GlassCard style={s.statCard}>
              <Text style={s.statNum}>{quiz.questions?.length || 0}</Text>
              <Text style={s.statLabel}>Questions</Text>
            </GlassCard>
            <GlassCard style={s.statCard}>
              <Text style={s.statNum}>{quiz.timeLimit}</Text>
              <Text style={s.statLabel}>Minutes</Text>
            </GlassCard>
            <GlassCard style={s.statCard}>
              <Text style={s.statNum}>{sessions.length}</Text>
              <Text style={s.statLabel}>Students</Text>
            </GlassCard>
          </View>

          {/* Students */}
          <Text style={s.sectionTitle}>Joined Students</Text>
          {sessions.length === 0 ? (
            <Text style={s.emptyText}>No students have joined yet...</Text>
          ) : (
            <FlatList
              data={sessions}
              keyExtractor={(item) => item.id}
              style={s.studentList}
              renderItem={({ item }) => (
                <View style={s.studentRow}>
                  <Ionicons name="person-circle" size={28} color={COLORS.textMuted} />
                  <Text style={s.studentName}>{item.name}</Text>
                  <Text style={[s.studentStatus, {
                    color: (item.status === 'submitted' || item.status === 'auto_submitted') ? COLORS.success :
                      item.status === 'active' ? COLORS.warning : COLORS.textMuted,
                  }]}>
                    {(item.status === 'submitted' || item.status === 'auto_submitted') ? `✓ ${item.score || 0}/${quiz.questions?.length}` :
                      item.status === 'active' ? '● Taking quiz' : '◌ Waiting'}
                  </Text>
                </View>
              )}
            />
          )}
        </View>

        {/* Action Buttons */}
        <View style={s.actions}>
          {quiz.status === QUIZ_STATUS.DRAFT && (
            <GradientButton title="Start Quiz" onPress={handleStart} />
          )}
          {quiz.status === QUIZ_STATUS.ACTIVE && (
            <GradientButton title="End Quiz" onPress={handleEnd} variant="danger" />
          )}
          {quiz.status === QUIZ_STATUS.COMPLETED && (
            <GradientButton title="View Results" onPress={handleResults} />
          )}
          {quiz.status === QUIZ_STATUS.ACTIVE && (
            <GradientButton title="View Results" onPress={handleResults} variant="outline" style={{ marginTop: 12 }} />
          )}
        </View>
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  loading: { color: COLORS.textMuted, textAlign: 'center', marginTop: 100, fontSize: SIZES.lg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.space20, paddingVertical: SIZES.space16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.glass,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: COLORS.textPrimary, fontSize: SIZES.xl, ...FONTS.bold, flex: 1, textAlign: 'center', marginHorizontal: 8 },
  content: { flex: 1, paddingHorizontal: SIZES.space20 },
  codeCard: { alignItems: 'center', marginBottom: SIZES.space16 },
  codeLabel: { color: COLORS.textMuted, fontSize: SIZES.xs, ...FONTS.bold, letterSpacing: 3 },
  codeText: { color: COLORS.primary, fontSize: 42, ...FONTS.extraBold, letterSpacing: 8, marginVertical: 4 },
  codeSub: { color: COLORS.textMuted, fontSize: SIZES.sm },
  statsRow: { flexDirection: 'row', gap: SIZES.space12, marginBottom: SIZES.space20 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: SIZES.space12 },
  statNum: { color: COLORS.textPrimary, fontSize: SIZES.xxl, ...FONTS.bold },
  statLabel: { color: COLORS.textMuted, fontSize: SIZES.xs, ...FONTS.medium, marginTop: 2 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: SIZES.base, ...FONTS.semiBold, marginBottom: SIZES.space12 },
  emptyText: { color: COLORS.textMuted, fontSize: SIZES.md, textAlign: 'center', marginTop: 20 },
  studentList: { flex: 1 },
  studentRow: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.space12,
    paddingVertical: SIZES.space12, borderBottomWidth: 1, borderBottomColor: COLORS.glassBorder,
  },
  studentName: { color: COLORS.textPrimary, fontSize: SIZES.base, ...FONTS.medium, flex: 1 },
  studentStatus: { fontSize: SIZES.sm, ...FONTS.semiBold },
  actions: { paddingHorizontal: SIZES.space20, paddingBottom: SIZES.space24, paddingTop: SIZES.space12 },
});
