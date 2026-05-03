// Teacher Dashboard - Main teacher screen with quiz list

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AnimatedBackground from '../../components/ui/AnimatedBackground';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../utils/theme';
import { getAllQuizzes, deleteQuiz, subscribeToTeacherQuizzes, getQuizResults } from '../../services/quizService';
import { QUIZ_STATUS } from '../../utils/constants';

export default function TeacherDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [studentCounts, setStudentCounts] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadQuizzes = useCallback(async () => {
    try {
      const data = await getAllQuizzes();
      setQuizzes(data.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
      }));
      
      // Fetch real student counts from the results collection
      const counts = {};
      await Promise.all(data.map(async (q) => {
        try {
          const results = await getQuizResults(q.id);
          counts[q.id] = results.length;
        } catch { counts[q.id] = 0; }
      }));
      setStudentCounts(counts);
    } catch (e) {
      console.warn('Failed to load quizzes:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Real-time subscription to teacher quizzes
  useEffect(() => {
    let unsub;
    (async () => {
      unsub = await subscribeToTeacherQuizzes((data) => {
        setQuizzes(data.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB - dateA;
        }));
        setLoading(false);
        setRefreshing(false);
        
        // Update student counts from results collection
        Promise.all(data.map(async (q) => {
          try {
            const results = await getQuizResults(q.id);
            setStudentCounts(prev => ({ ...prev, [q.id]: results.length }));
          } catch { /* ignore */ }
        }));
      });
    })();

    return () => { if (typeof unsub === 'function') unsub(); };
  }, []);

  // Also do initial load as fallback
  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  const onRefresh = () => {
    setRefreshing(true);
    loadQuizzes();
  };

  const handleDelete = (quizId, title) => {
    Alert.alert(
      'Delete Quiz',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteQuiz(quizId);
            loadQuizzes();
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case QUIZ_STATUS.ACTIVE: return COLORS.success;
      case QUIZ_STATUS.COMPLETED: return COLORS.textMuted;
      default: return COLORS.warning;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case QUIZ_STATUS.ACTIVE: return '● Live';
      case QUIZ_STATUS.COMPLETED: return '✓ Completed';
      default: return '◌ Draft';
    }
  };

  const renderQuizCard = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: '/teacher/quiz-detail',
          params: { quizId: item.id },
        })
      }
    >
      <GlassCard style={styles.quizCard}>
        <View style={styles.quizHeader}>
          <View style={styles.quizInfo}>
            <Text style={styles.quizTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.quizMeta}>
              <Text style={[styles.statusBadge, { color: getStatusColor(item.status) }]}>
                {getStatusLabel(item.status)}
              </Text>
              <Text style={styles.metaText}>
                {item.questions?.length || 0} questions
              </Text>
              <Text style={styles.metaText}>
                {item.timeLimit} min
              </Text>
            </View>
          </View>
          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>CODE</Text>
            <Text style={styles.codeText}>{item.code}</Text>
          </View>
        </View>

        <View style={styles.quizFooter}>
          <View style={styles.footerLeft}>
            <Ionicons name="people" size={14} color={COLORS.textMuted} />
            <Text style={styles.footerText}>
              {studentCounts[item.id] || item.sessions?.length || 0} students
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDelete(item.id, item.title)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.danger + '80'} />
          </TouchableOpacity>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>No quizzes yet</Text>
      <Text style={styles.emptyDesc}>
        Create your first quiz and share the code with students
      </Text>
    </View>
  );

  return (
    <AnimatedBackground>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Teacher Dashboard</Text>
            <Text style={styles.headerSub}>{quizzes.length} quizzes</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Actions Section */}
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => router.push('/teacher/create-quiz')}
          >
            <View style={[styles.iconBox, { backgroundColor: COLORS.primary + '20' }]}>
              <Ionicons name="add" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.actionLabel}>Manual Quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => router.push('/teacher/ai-generate')}
          >
            <View style={[styles.iconBox, { backgroundColor: COLORS.secondary + '20' }]}>
              <Ionicons name="flash" size={28} color={COLORS.secondary} />
            </View>
            <Text style={styles.actionLabel}>AI Generator</Text>
          </TouchableOpacity>
        </View>

        {/* Quiz List */}
        <FlatList
          data={quizzes}
          renderItem={renderQuizCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={!loading && renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        />

        {/* Create Quiz FAB */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/teacher/create-quiz')}
          style={styles.fab}
        >
          <Ionicons name="add" size={28} color={COLORS.textDark} />
        </TouchableOpacity>
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.space20,
    paddingVertical: SIZES.space16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: SIZES.xl,
    ...FONTS.bold,
    textAlign: 'center',
  },
  headerSub: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    ...FONTS.medium,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.space20,
    gap: SIZES.space12,
    marginBottom: SIZES.space24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SIZES.space20,
    borderRadius: SIZES.radius16,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: COLORS.textPrimary,
    fontSize: SIZES.sm,
    ...FONTS.semiBold,
  },
  list: {
    paddingHorizontal: SIZES.space20,
    paddingBottom: 100,
  },
  quizCard: {
    marginBottom: SIZES.space12,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SIZES.space12,
  },
  quizInfo: {
    flex: 1,
  },
  quizTitle: {
    color: COLORS.textPrimary,
    fontSize: SIZES.lg,
    ...FONTS.semiBold,
  },
  quizMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.space12,
    marginTop: SIZES.space8,
  },
  statusBadge: {
    fontSize: SIZES.sm,
    ...FONTS.semiBold,
  },
  metaText: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    ...FONTS.regular,
  },
  codeContainer: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SIZES.space12,
    paddingVertical: SIZES.space8,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '25',
  },
  codeLabel: {
    color: COLORS.primary,
    fontSize: 8,
    ...FONTS.bold,
    letterSpacing: 2,
  },
  codeText: {
    color: COLORS.primary,
    fontSize: SIZES.lg,
    ...FONTS.bold,
    letterSpacing: 3,
  },
  quizFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.space12,
    paddingTop: SIZES.space12,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.space4,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    ...FONTS.regular,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: SIZES.space12,
  },
  emptyTitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.xl,
    ...FONTS.semiBold,
  },
  emptyDesc: {
    color: COLORS.textMuted,
    fontSize: SIZES.md,
    ...FONTS.regular,
    textAlign: 'center',
    maxWidth: 250,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.large,
  },
});
