// Teacher Results Screen - View student scores and violation reports

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView, Platform, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AnimatedBackground from '../../components/ui/AnimatedBackground';
import GlassCard from '../../components/ui/GlassCard';
import { COLORS, SIZES, FONTS } from '../../utils/theme';
import { getQuizById, getQuizResults } from '../../services/quizService';
import { VIOLATION_LABELS } from '../../utils/constants';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

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

  const handleDownloadCSV = async () => {
    if (sessions.length === 0) {
      Alert.alert('No Data', 'There are no submissions to download.');
      return;
    }

    // Header for CSV
    let csv = 'Student Name,Score,Total Questions,Percentage,Status,Submitted At\n';
    
    // Add data rows
    sessions.forEach(s => {
      const pct = totalQ > 0 ? Math.round(((s.score || 0) / totalQ) * 100) : 0;
      const date = s.submittedAt ? new Date(s.submittedAt).toLocaleString() : 'N/A';
      const status = s.status === 'auto_submitted' ? 'Auto' : 'Manual';
      
      // Clean names to avoid CSV breaking
      const cleanName = s.name.replace(/,/g, '');
      csv += `${cleanName},${s.score || 0},${totalQ},${pct}%,${status},${date}\n`;
    });

    const fileName = `results_${quiz.title.replace(/\s+/g, '_')}.csv`;

    // Create and download file (Web compatible)
    if (Platform.OS === 'web') {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', fileName);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Native Android/iOS implementation
      try {
        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
        
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: 'Share Quiz Results',
            UTI: 'public.comma-separated-values-text',
          });
        } else {
          Alert.alert('Success', `CSV saved to ${fileUri}`);
        }
      } catch (err) {
        console.error('Sharing error:', err);
        Alert.alert('Error', 'Failed to share CSV file.');
      }
    }
  };

  const renderAnswerDetails = (studentSession) => {
    const studentAnswers = studentSession.answers || {};
    
    return (
      <View style={s.detailsSection}>
        <Text style={s.detailsTitle}>Detailed Submission:</Text>
        {quiz.questions.map((q, idx) => {
          // Try question ID first (new format), fall back to numeric index (old format)
          let studentAns = studentAnswers[q.id];
          if (studentAns === undefined) {
            studentAns = studentAnswers[idx];
          }
          if (studentAns === undefined) {
            studentAns = studentAnswers[String(idx)];
          }
          
          const isCorrect = Array.isArray(q.correctAnswer) 
            ? JSON.stringify([...(q.correctAnswer || [])].sort()) === JSON.stringify([...(studentAns || [])].sort())
            : q.correctAnswer === studentAns;

          const getDisplayValue = (val) => {
            if (val === undefined || val === null) return 'Unanswered';
            if (q.type === 'text') return val || 'N/A';
            if (Array.isArray(val)) {
              return val.map(i => q.options[i]).filter(Boolean).join(', ') || 'None';
            }
            if (typeof val === 'number' && q.options[val]) return q.options[val];
            return String(val);
          };

          return (
            <View key={idx} style={s.answerRow}>
              <View style={s.qInfo}>
                <Text style={s.qNumText}>Q{idx + 1}</Text>
                <Text style={s.qText} numberOfLines={2}>{q.text}</Text>
              </View>
              
              <View style={s.ansCompare}>
                <View style={s.ansBlock}>
                  <Text style={s.ansLabel}>Student:</Text>
                  <Text style={[s.ansVal, { color: isCorrect ? COLORS.success : COLORS.danger }]}>
                    {getDisplayValue(studentAns)}
                  </Text>
                </View>
                {!isCorrect && (
                  <View style={s.ansBlock}>
                    <Text style={s.ansLabel}>Correct:</Text>
                    <Text style={[s.ansVal, { color: COLORS.success }]}>
                      {getDisplayValue(q.correctAnswer)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <AnimatedBackground>
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/teacher')} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={s.titleContainer}>
            <Text style={s.headerTitle} numberOfLines={1}>Results</Text>
            <Text style={s.quizSub}>{quiz.title}</Text>
          </View>
          <TouchableOpacity onPress={handleDownloadCSV} style={s.downloadBtn}>
            <Ionicons name="download-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
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
                activeOpacity={0.9}
                onPress={() => setExpandedStudent(isExpanded ? null : item.id)}
              >
                <GlassCard
                  style={[s.studentCard, isExpanded && s.expandedCard]}
                  variant={violations.length > 0 ? 'danger' : 'default'}
                >
                  <View style={s.row}>
                    <Text style={s.rank}>#{index + 1}</Text>
                    <View style={s.studentInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={s.name}>{item.name}</Text>
                        {item.platform === 'web' && (
                          <Text style={s.platformBadge}>WEB</Text>
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
                    <Ionicons 
                      name={isExpanded ? "chevron-up" : "chevron-down"} 
                      size={18} 
                      color={COLORS.textMuted} 
                      style={{ marginLeft: 8 }}
                    />
                  </View>

                  {isExpanded && (
                    <View style={s.expandedContent}>
                      {violations.length > 0 && (
                        <View style={s.violSection}>
                          <Text style={s.violTitle}>Anti-Cheat Violations ({violations.length}):</Text>
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
                      
                      {renderAnswerDetails(item)}
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
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: SIZES.space20, paddingVertical: SIZES.space16,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.glass, alignItems: 'center', justifyContent: 'center' },
  titleContainer: { flex: 1 },
  headerTitle: { color: COLORS.textPrimary, fontSize: SIZES.xl, ...FONTS.bold },
  quizSub: { color: COLORS.textMuted, fontSize: SIZES.xs, ...FONTS.regular },
  downloadBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary + '15', alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: SIZES.space12, paddingHorizontal: SIZES.space20, marginBottom: SIZES.space16 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: SIZES.space12 },
  statNum: { color: COLORS.textPrimary, fontSize: SIZES.xxl, ...FONTS.bold },
  statLabel: { color: COLORS.textMuted, fontSize: SIZES.xs, ...FONTS.medium },
  list: { paddingHorizontal: SIZES.space20, paddingBottom: 40 },
  studentCard: { marginBottom: SIZES.space12, overflow: 'hidden' },
  expandedCard: { borderColor: COLORS.primary + '40' },
  row: { flexDirection: 'row', alignItems: 'center', gap: SIZES.space12 },
  rank: { color: COLORS.textMuted, fontSize: SIZES.lg, ...FONTS.bold, width: 30 },
  studentInfo: { flex: 1 },
  name: { color: COLORS.textPrimary, fontSize: SIZES.base, ...FONTS.semiBold },
  platformBadge: { color: COLORS.textMuted, fontSize: 10, backgroundColor: COLORS.glass, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  sub: { color: COLORS.textMuted, fontSize: SIZES.xs, ...FONTS.regular, marginTop: 2 },
  scoreBox: { alignItems: 'flex-end' },
  score: { fontSize: SIZES.lg, ...FONTS.bold },
  pct: { color: COLORS.textMuted, fontSize: SIZES.xs },
  expandedContent: { marginTop: SIZES.space16, paddingTop: SIZES.space16, borderTopWidth: 1, borderTopColor: COLORS.glassBorder },
  violSection: { marginBottom: SIZES.space20 },
  violTitle: { color: COLORS.danger, fontSize: SIZES.sm, ...FONTS.semiBold, marginBottom: 8 },
  violRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  violText: { color: COLORS.textSecondary, fontSize: SIZES.sm },
  detailsSection: { gap: SIZES.space12 },
  detailsTitle: { color: COLORS.textPrimary, fontSize: SIZES.sm, ...FONTS.bold, marginBottom: 4 },
  answerRow: { 
    backgroundColor: COLORS.surfaceLight, padding: 12, borderRadius: 10, 
    borderWidth: 1, borderColor: COLORS.glassBorder 
  },
  qInfo: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  qNumText: { color: COLORS.primary, fontSize: SIZES.xs, ...FONTS.bold, backgroundColor: COLORS.primary + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, height: 20 },
  qText: { color: COLORS.textPrimary, fontSize: SIZES.sm, ...FONTS.medium, flex: 1 },
  ansCompare: { flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: COLORS.glassBorder, paddingTop: 8 },
  ansBlock: { flex: 1 },
  ansLabel: { color: COLORS.textMuted, fontSize: 10, ...FONTS.medium, marginBottom: 2 },
  ansVal: { fontSize: SIZES.sm, ...FONTS.semiBold },
  empty: { color: COLORS.textMuted, textAlign: 'center', marginTop: 40, fontSize: SIZES.md },
});
