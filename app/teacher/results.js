// Teacher Results Screen - View student scores and violation reports

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AnimatedBackground from '../../components/ui/AnimatedBackground';
import GlassCard from '../../components/ui/GlassCard';
import { COLORS, SIZES, FONTS } from '../../utils/theme';
import { getQuizById, getQuizResults } from '../../services/quizService';
import { VIOLATION_LABELS } from '../../utils/constants';

export default function ResultsScreen() {
  const { quizId } = useLocalSearchParams();
  const [quiz, setQuiz] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedStudent, setExpandedStudent] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [quizData, resultsData] = await Promise.all([
          getQuizById(quizId),
          getQuizResults(quizId)
        ]);
        
        if (quizData) setQuiz(quizData);
        if (resultsData) {
          const processed = resultsData
            .filter(s => s.status === 'submitted' || s.status === 'auto_submitted')
            .sort((a, b) => (b.score || 0) - (a.score || 0));
          setSessions(processed);
        }
      } catch (e) {
        console.error('Results Load Error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId]);

  if (loading || !quiz) return (
    <AnimatedBackground>
      <SafeAreaView style={s.safe}><Text style={s.loading}>Loading results...</Text></SafeAreaView>
    </AnimatedBackground>
  );

  const totalQ = quiz.questions?.length || 0;
  const avgScore = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.length)
    : 0;

  return (
    <AnimatedBackground>
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/teacher')} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Results</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <GlassCard style={s.statCard}>
            <Text style={s.statNum}>{sessions.length}</Text>
            <Text style={s.statLabel}>Submitted</Text>
          </GlassCard>
          <GlassCard style={s.statCard}>
            <Text style={[s.statNum, { color: COLORS.success }]}>{avgScore}/{totalQ}</Text>
            <Text style={s.statLabel}>Avg Score</Text>
          </GlassCard>
        </View>

        <FlatList
          data={sessions}
          keyExtractor={item => item.id}
          contentContainerStyle={s.list}
          renderItem={({ item, index }) => {
            const pct = totalQ > 0 ? Math.round(((item.score || 0) / totalQ) * 100) : 0;
            const violations = item.violations || [];
            const isExpanded = expandedStudent === item.id;

            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setExpandedStudent(isExpanded ? null : item.id)}
              >
                <GlassCard
                  style={s.studentCard}
                  variant={violations.length > 0 ? 'danger' : 'default'}
                >
                  <View style={s.row}>
                    <Text style={s.rank}>#{index + 1}</Text>
                    <View style={s.studentInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={s.name}>{item.name}</Text>
                        {item.platform === 'web' && (
                          <Text style={{ color: COLORS.textMuted, fontSize: 10, backgroundColor: COLORS.glass, paddingHorizontal: 4, borderRadius: 4 }}>WEB</Text>
                        )}
                      </View>
                      <Text style={s.sub}>
                        {item.status === 'auto_submitted' ? 'Auto-submitted' : 'Submitted'}
                      </Text>
                    </View>
                    <View style={s.scoreBox}>
                      <Text style={[s.score, {
                        color: pct >= 70 ? COLORS.success : pct >= 40 ? COLORS.warning : COLORS.danger
                      }]}>{item.score || 0}/{totalQ}</Text>
                      <Text style={s.pct}>{pct}%</Text>
                    </View>
                    {violations.length > 0 && (
                      <View style={s.violBadge}>
                        <Ionicons name="warning" size={12} color={COLORS.danger} />
                        <Text style={s.violCount}>{violations.length}</Text>
                      </View>
                    )}
                  </View>

                  {isExpanded && violations.length > 0 && (
                    <View style={s.violList}>
                      <Text style={s.violTitle}>Violations:</Text>
                      {violations.map((v, vi) => (
                        <View key={vi} style={s.violRow}>
                          <Ionicons name="alert-circle" size={14} color={COLORS.danger} />
                          <Text style={s.violText}>
                            {VIOLATION_LABELS[v.type] || v.type}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </GlassCard>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={s.empty}>No submissions yet</Text>
          }
        />
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
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.glass, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: COLORS.textPrimary, fontSize: SIZES.xl, ...FONTS.bold },
  statsRow: { flexDirection: 'row', gap: SIZES.space12, paddingHorizontal: SIZES.space20, marginBottom: SIZES.space16 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: SIZES.space12 },
  statNum: { color: COLORS.textPrimary, fontSize: SIZES.xxl, ...FONTS.bold },
  statLabel: { color: COLORS.textMuted, fontSize: SIZES.xs, ...FONTS.medium },
  list: { paddingHorizontal: SIZES.space20, paddingBottom: 40 },
  studentCard: { marginBottom: SIZES.space12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: SIZES.space12 },
  rank: { color: COLORS.textMuted, fontSize: SIZES.lg, ...FONTS.bold, width: 30 },
  studentInfo: { flex: 1 },
  name: { color: COLORS.textPrimary, fontSize: SIZES.base, ...FONTS.semiBold },
  sub: { color: COLORS.textMuted, fontSize: SIZES.xs, ...FONTS.regular, marginTop: 2 },
  scoreBox: { alignItems: 'flex-end' },
  score: { fontSize: SIZES.lg, ...FONTS.bold },
  pct: { color: COLORS.textMuted, fontSize: SIZES.xs },
  violBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: COLORS.violationBg, paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: SIZES.radiusFull, borderWidth: 1, borderColor: COLORS.violationBorder,
  },
  violCount: { color: COLORS.danger, fontSize: SIZES.xs, ...FONTS.bold },
  violList: { marginTop: SIZES.space12, paddingTop: SIZES.space12, borderTopWidth: 1, borderTopColor: COLORS.glassBorder },
  violTitle: { color: COLORS.danger, fontSize: SIZES.sm, ...FONTS.semiBold, marginBottom: 8 },
  violRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  violText: { color: COLORS.textSecondary, fontSize: SIZES.sm },
  empty: { color: COLORS.textMuted, textAlign: 'center', marginTop: 40, fontSize: SIZES.md },
});
