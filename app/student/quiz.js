// 🔒 QUIZ LOCKDOWN SCREEN - All anti-cheat layers active
// This is the most security-critical screen in the entire app

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Alert, ScrollView, TextInput, Keyboard,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AnimatedBackground from '../../components/ui/AnimatedBackground';
import QuestionCard from '../../components/quiz/QuestionCard';
import OptionButton from '../../components/quiz/OptionButton';
import Timer from '../../components/quiz/Timer';
import QuestionNav from '../../components/quiz/QuestionNav';
import Watermark from '../../components/quiz/Watermark';
import GradientButton from '../../components/ui/GradientButton';
import ViolationWarning from '../../components/security/ViolationWarning';
import LockdownOverlay from '../../components/security/LockdownOverlay';
import SubmissionModal from '../../components/quiz/SubmissionModal';
import GlassCard from '../../components/ui/GlassCard';
import { COLORS, SIZES, FONTS } from '../../utils/theme';
import { useAntiCheat } from '../../hooks/useAntiCheat';
import { useQuizEngine } from '../../hooks/useQuizEngine';
import { useTimer } from '../../hooks/useTimer';
import { useApp } from '../../context/AppContext';
import { getQuizById, updateSession } from '../../services/quizService';
import { Ionicons } from '@expo/vector-icons';
import { MAX_VIOLATIONS, QUESTION_TYPES } from '../../utils/constants';
import { db, doc, onSnapshot } from '../../services/firebase';

// Error Boundary for catching silent crashes
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#0A0E1A', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#FF4444', fontSize: 18, fontWeight: 'bold' }}>Quiz Crash Detected</Text>
          <Text style={{ color: '#FFFFFF', marginTop: 10, textAlign: 'center' }}>{this.state.error?.message}</Text>
          <Text style={{ color: '#AAAAAA', marginTop: 20 }}>Please screenshot this and tell the AI.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function QuizScreen() {
  const { quizId, sessionId } = useLocalSearchParams();
  const { state } = useApp();
  const [quiz, setQuiz] = useState(null);
  const [quizActive, setQuizActive] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Load quiz
  useEffect(() => {
    (async () => {
      try {
        const data = await getQuizById(quizId);
        if (data) {
          setQuiz(data);
          setQuizActive(true);
        }
      } catch (e) {
        console.error('Quiz Load Error:', e);
      }
    })();
  }, [quizId]);

  // Quiz engine
  const engine = useQuizEngine(quiz || { questions: [] });

  // Handle submission
  const handleSubmit = useCallback(async (isAutoSubmit = false) => {
    if (submitted) return;
    setSubmitted(true);
    setQuizActive(false);
    setShowSubmitModal(false);

    // Get final results from engine
    const result = engine.calculateScore();

    try {
      await updateSession(quizId, sessionId, {
        status: isAutoSubmit ? 'auto_submitted' : 'submitted',
        answers: result.answers,
        score: result.correct,
        total: result.total,
        violations: violationsRef.current,
        submittedAt: new Date().toISOString(),
        autoSubmitted: isAutoSubmit,
      });

      router.replace({
        pathname: '/student/results',
        params: {
          quizId,
          score: result.correct,
          total: result.total,
          percentage: result.percentage,
        },
      });
    } catch (e) {
      console.error('Submit failed:', e);
      // Fallback for students to at least see their results
      router.replace('/student/results');
    }
  }, [submitted, engine, quizId, sessionId]);

  const handleAutoSubmit = useCallback(() => handleSubmit(true), [handleSubmit]);

  // Watchdog Listener - Detect when teacher ends quiz
  useEffect(() => {
    if (!quizId || !quizActive) return;

    // Direct listener to the quiz status
    const unsub = onSnapshot(doc(db, 'quizzes', quizId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.status === 'ended') {
          console.log('[Watchdog] Teacher ended quiz. Auto-submitting...');
          handleAutoSubmit();
        }
      }
    });

    return () => unsub();
  }, [quizId, quizActive, handleAutoSubmit]);

  // Anti-cheat
  const antiCheat = useAntiCheat(
    quizActive,
    state.studentName,
    handleAutoSubmit
  );

  // Timer
  const timer = useTimer(
    quiz?.timeLimit || 15,
    quizActive,
    handleAutoSubmit
  );

  const violationsRef = useRef([]);
  useEffect(() => {
    if (antiCheat) {
      violationsRef.current = antiCheat.violations;
    }
  }, [antiCheat.violations]);

  const handleNext = () => {
    try {
      engine.nextQuestion();
    } catch (e) {
      console.error('[QuizScreen] Next Error:', e);
    }
  };

  const confirmSubmit = () => {
    setShowSubmitModal(true);
  };

  if (!quiz || !engine.currentQuestion) {
    return (
      <AnimatedBackground variant="quiz">
        <SafeAreaView style={s.safe}>
          <Text style={s.loadText}>Loading quiz...</Text>
        </SafeAreaView>
      </AnimatedBackground>
    );
  }

  return (
    <ErrorBoundary>
      <AnimatedBackground variant="quiz">
        <SafeAreaView style={s.safe}>
          {/* Watermark */}
          <Watermark studentName={state.studentName} />

        {/* Lockdown Enforcement Overlay */}
        <LockdownOverlay visible={!antiCheat.isLockedDown} />

        {/* Violation Warning Overlay */}
        <ViolationWarning
          visible={antiCheat.warningVisible}
          message={antiCheat.warningMessage}
          violationCount={antiCheat.violations.length}
          onDismiss={antiCheat.dismissWarning}
        />

        {/* Submission Modal Overlay */}
        <SubmissionModal 
          visible={showSubmitModal}
          unansweredCount={engine.totalQuestions - engine.answeredCount}
          onConfirm={() => handleSubmit(false)}
          onCancel={() => setShowSubmitModal(false)}
        />

        {/* Top Bar */}
        <View style={s.topBar}>
          <Timer
            formattedTime={timer.formattedTime}
            urgency={timer.urgency}
            progress={timer.progress}
          />
          <View style={s.topRight}>
            {antiCheat.violations.length > 0 && (
              <View style={s.violBadge}>
                <Ionicons name="warning" size={14} color={COLORS.danger} />
                <Text style={s.violText}>
                  {antiCheat.violations.length}/{MAX_VIOLATIONS}
                </Text>
              </View>
            )}
            <Text style={s.progress}>
              {engine.answeredCount}/{engine.totalQuestions}
            </Text>
          </View>
        </View>

        {/* Question Navigation Dots */}
        <QuestionNav
          totalQuestions={engine.totalQuestions}
          currentIndex={engine.currentIndex}
          answers={engine.answers}
          onPress={engine.goToQuestion}
        />

        {/* Question + Options */}
        <ScrollView
          style={s.flex}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
        >
          <QuestionCard
            question={engine.currentQuestion}
            questionNumber={engine.currentIndex + 1}
            totalQuestions={engine.totalQuestions}
          />

          <View style={s.optionsContainer}>
            {engine.currentQuestion.type === QUESTION_TYPES.TEXT ? (
              <GlassCard style={s.textAnswerCard}>
                <Text style={s.textAnswerLabel}>Your Answer:</Text>
                <TextInput
                  style={s.textInput}
                  value={engine.selectedAnswer || ''}
                  onChangeText={engine.selectAnswer}
                  placeholder="Type your answer here..."
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  blurOnSubmit={true}
                  onSubmitEditing={Keyboard.dismiss}
                />
              </GlassCard>
            ) : (
              (engine.currentQuestion.options || []).map((option, idx) => (
                <OptionButton
                  key={idx}
                  index={idx}
                  option={option}
                  isMulti={engine.currentQuestion.type === QUESTION_TYPES.MULTI}
                  isSelected={
                    engine.currentQuestion.type === QUESTION_TYPES.MULTI
                      ? (engine.selectedAnswer || []).includes(idx)
                      : engine.selectedAnswer === idx
                  }
                  onPress={engine.selectAnswer}
                />
              ))
            )}
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={s.bottomBar}>
          <GradientButton
            title="Previous"
            variant="outline"
            size="medium"
            onPress={engine.prevQuestion}
            disabled={engine.isFirstQuestion}
          />

          {engine.isLastQuestion ? (
            <GradientButton
              title="Submit"
              size="medium"
              onPress={confirmSubmit}
            />
          ) : (
            <GradientButton
              title="Next"
              size="medium"
              onPress={handleNext}
            />
          )}
        </View>
      </SafeAreaView>
    </AnimatedBackground>
    </ErrorBoundary>
  );
}

const s = StyleSheet.create({
  safe: { 
    flex: 1,
    justifyContent: 'flex-start', // Force top alignment
  },
  flex: { flex: 1 },
  loadText: { 
    color: COLORS.textMuted, 
    textAlign: 'center', 
    marginTop: 100, 
    fontSize: SIZES.lg,
    userSelect: 'none',
  },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.space20, paddingVertical: SIZES.space12,
  },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: SIZES.space12 },
  violBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.violationBg, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: SIZES.radiusFull, borderWidth: 1, borderColor: COLORS.violationBorder,
  },
  violText: { color: COLORS.danger, fontSize: SIZES.sm, ...FONTS.bold },
  progress: { color: COLORS.textSecondary, fontSize: SIZES.md, ...FONTS.semiBold },
  content: {
    paddingHorizontal: SIZES.space20,
    paddingTop: 0,
    paddingBottom: SIZES.space20,
  },
  optionsContainer: {
    marginTop: SIZES.space8,
  },
  textAnswerCard: {
    padding: SIZES.space16,
    marginTop: SIZES.space8,
  },
  textAnswerLabel: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    ...FONTS.medium,
    marginBottom: SIZES.space12,
  },
  textInput: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.space16,
    paddingVertical: SIZES.space16,
    color: COLORS.textPrimary,
    fontSize: SIZES.md,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    ...FONTS.medium,
  },
  bottomBar: {
    flexDirection: 'row', justifyContent: 'space-between', gap: SIZES.space12,
    paddingHorizontal: SIZES.space20, paddingVertical: SIZES.space16,
    borderTopWidth: 1, borderTopColor: COLORS.glassBorder,
  },
});
