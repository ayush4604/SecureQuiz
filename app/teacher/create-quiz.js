// Create Quiz Screen - Teacher creates a new quiz

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, SafeAreaView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AnimatedBackground from '../../components/ui/AnimatedBackground';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import { COLORS, SIZES, FONTS } from '../../utils/theme';
import { createQuiz } from '../../services/quizService';
import { DEFAULT_TIME_LIMIT, QUESTION_TYPES } from '../../utils/constants';

const EMPTY_Q = { 
  text: '', 
  type: QUESTION_TYPES.SINGLE,
  options: ['', '', '', ''], 
  correctAnswer: 0 
};

export default function CreateQuizScreen() {
  const [title, setTitle] = useState('');
  const [timeLimit, setTimeLimit] = useState(DEFAULT_TIME_LIMIT.toString());
  const [questions, setQuestions] = useState([{ ...EMPTY_Q, options: ['', '', '', ''] }]);
  const [loading, setLoading] = useState(false);
  const [expandedQ, setExpandedQ] = useState(0);

  const updateQuestion = (qi, field, val) => {
    setQuestions(p => { 
      const u = [...p]; 
      u[qi] = { ...u[qi], [field]: val }; 
      
      // Reset correct answer if type changes
      if (field === 'type') {
        if (val === QUESTION_TYPES.SINGLE) u[qi].correctAnswer = 0;
        else if (val === QUESTION_TYPES.MULTI) u[qi].correctAnswer = [0];
        else u[qi].correctAnswer = '';
      }
      
      return u; 
    });
  };

  const updateOption = (qi, oi, val) => {
    setQuestions(p => {
      const u = [...p]; const opts = [...u[qi].options]; opts[oi] = val;
      u[qi] = { ...u[qi], options: opts }; return u;
    });
  };

  const toggleMultiCorrect = (qi, oi) => {
    setQuestions(p => {
      const u = [...p];
      let current = [...(u[qi].correctAnswer || [])];
      if (current.includes(oi)) {
        if (current.length > 1) current = current.filter(i => i !== oi);
      } else {
        current.push(oi);
      }
      u[qi] = { ...u[qi], correctAnswer: current };
      return u;
    });
  };

  const addQuestion = () => {
    setQuestions(p => [...p, { ...EMPTY_Q, options: ['', '', '', ''] }]);
    setExpandedQ(questions.length);
  };
  const removeQuestion = (qi) => {
    if (questions.length <= 1) { Alert.alert('Error', 'Need at least 1 question.'); return; }
    setQuestions(p => p.filter((_, i) => i !== qi));
    if (expandedQ >= qi && expandedQ > 0) setExpandedQ(p => p - 1);
  };

  const validate = () => {
    if (!title.trim()) { Alert.alert('Missing Title', 'Enter a quiz title.'); return false; }
    const t = parseInt(timeLimit);
    if (isNaN(t) || t < 1) { Alert.alert('Invalid Time', 'Enter valid time limit.'); return false; }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) { Alert.alert('Error', `Question ${i+1} is empty.`); setExpandedQ(i); return false; }
      
      if (q.type !== QUESTION_TYPES.TEXT) {
        for (let j = 0; j < q.options.length; j++) {
          if (!q.options[j].trim()) { Alert.alert('Error', `Q${i+1} Option ${j+1} is empty.`); setExpandedQ(i); return false; }
        }
      } else {
        if (!q.correctAnswer.toString().trim()) { Alert.alert('Error', `Q${i+1} Correct Answer is empty.`); setExpandedQ(i); return false; }
      }
    }
    return true;
  };

  const handleCreate = async () => {
    if (loading) return; // Prevent multiple clicks
    if (!validate()) return;
    
    setLoading(true);
    try {
      const quiz = await createQuiz({
        title: title.trim(),
        timeLimit: parseInt(timeLimit),
        questions: questions.map((q, i) => ({
          id: `q${i+1}`, 
          text: q.text.trim(),
          type: q.type,
          options: q.type !== QUESTION_TYPES.TEXT ? q.options.map(o => o.trim()) : [], 
          correctAnswer: q.correctAnswer,
        })),
      });
      Alert.alert('Quiz Created!', `Quiz Code: ${quiz.code}\n\nShare this code with students.`,
        [{ text: 'Go to Dashboard', onPress: () => router.back() }]);
    } catch (e) {
      Alert.alert('Error', 'Failed to create quiz.');
    } finally { 
      // Keep loading true for a bit to prevent accidental double-alerts
      setTimeout(() => setLoading(false), 2000); 
    }
  };

  return (
    <AnimatedBackground>
      <SafeAreaView style={s.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.flex}>
          <View style={s.header}>
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/teacher')} style={s.backBtn}>
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Create Quiz</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={s.flex} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
            {/* Quiz Details */}
            <GlassCard style={s.section}>
              <Text style={s.sectionTitle}>Quiz Details</Text>
              <Text style={s.label}>Title</Text>
              <TextInput style={s.input} value={title} onChangeText={setTitle}
                placeholder="e.g., Math Quiz - Chapter 5" placeholderTextColor={COLORS.textMuted} />
              <Text style={s.label}>Time Limit (minutes)</Text>
              <TextInput style={[s.input, { width: 100 }]} value={timeLimit} onChangeText={setTimeLimit}
                placeholder="15" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" />
            </GlassCard>

            {/* Questions */}
            <Text style={s.sectionTitle}>Questions ({questions.length})</Text>

            {questions.map((q, qi) => (
              <GlassCard key={qi} style={s.qCard} variant={expandedQ === qi ? 'light' : 'default'}>
                <TouchableOpacity onPress={() => setExpandedQ(expandedQ === qi ? -1 : qi)} style={s.qHeader}>
                  <Text style={s.qNum}>Q{qi + 1}</Text>
                  <Text style={s.qPreview} numberOfLines={1}>{q.text || 'Tap to edit...'}</Text>
                  <Ionicons name={expandedQ === qi ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.textMuted} />
                </TouchableOpacity>

                {expandedQ === qi && (
                  <View style={s.qBody}>
                    <Text style={s.optLabel}>Question Type</Text>
                    <View style={s.typeRow}>
                      {[
                        { id: QUESTION_TYPES.SINGLE, label: 'Single', icon: 'radio-button-on' },
                        { id: QUESTION_TYPES.MULTI, label: 'Multiple', icon: 'checkbox' },
                        { id: QUESTION_TYPES.TEXT, label: 'Text', icon: 'create' },
                      ].map(type => (
                        <TouchableOpacity 
                          key={type.id} 
                          onPress={() => updateQuestion(qi, 'type', type.id)}
                          style={[s.typeBtn, q.type === type.id && s.typeBtnActive]}
                        >
                          <Ionicons name={type.icon} size={16} color={q.type === type.id ? COLORS.primary : COLORS.textMuted} />
                          <Text style={[s.typeBtnTxt, q.type === type.id && s.typeBtnTxtActive]}>{type.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <TextInput style={[s.input, { minHeight: 60, textAlignVertical: 'top', marginTop: 12 }]}
                      value={q.text} onChangeText={v => updateQuestion(qi, 'text', v)}
                      placeholder="Enter your question..." placeholderTextColor={COLORS.textMuted} multiline />

                    {q.type === QUESTION_TYPES.TEXT ? (
                      <View>
                        <Text style={s.optLabel}>Correct Answer</Text>
                        <TextInput 
                          style={s.input} 
                          value={q.correctAnswer} 
                          onChangeText={v => updateQuestion(qi, 'correctAnswer', v)}
                          placeholder="Type the correct answer here..."
                          placeholderTextColor={COLORS.textMuted}
                        />
                      </View>
                    ) : (
                      <>
                        <Text style={s.optLabel}>
                          Options {q.type === QUESTION_TYPES.SINGLE ? '(tap ● to mark correct)' : '(select multiple correct)'}
                        </Text>
                        {q.options.map((opt, oi) => (
                          <View key={oi} style={s.optRow}>
                            <TouchableOpacity 
                              onPress={() => q.type === QUESTION_TYPES.SINGLE ? updateQuestion(qi, 'correctAnswer', oi) : toggleMultiCorrect(qi, oi)} 
                              style={{ padding: 4 }}
                            >
                              <Ionicons
                                name={
                                  q.type === QUESTION_TYPES.SINGLE 
                                    ? (q.correctAnswer === oi ? 'checkmark-circle' : 'ellipse-outline')
                                    : (q.correctAnswer.includes(oi) ? 'checkbox' : 'square-outline')
                                }
                                size={24} 
                                color={(q.type === QUESTION_TYPES.SINGLE ? q.correctAnswer === oi : q.correctAnswer.includes(oi)) ? COLORS.success : COLORS.textMuted} 
                              />
                            </TouchableOpacity>
                            <TextInput style={[s.input, { flex: 1 }]} value={opt}
                              onChangeText={v => updateOption(qi, oi, v)}
                              placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                              placeholderTextColor={COLORS.textMuted} />
                          </View>
                        ))}
                      </>
                    )}
                    <TouchableOpacity onPress={() => removeQuestion(qi)} style={s.removeBtn}>
                      <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
                      <Text style={s.removeTxt}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </GlassCard>
            ))}

            <TouchableOpacity onPress={addQuestion} style={s.addBtn}>
              <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
              <Text style={s.addTxt}>Add Question</Text>
            </TouchableOpacity>

            <View style={{ marginBottom: 32 }}>
              <GradientButton title="Create Quiz" onPress={handleCreate} loading={loading} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 }, flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.space20, paddingVertical: SIZES.space16,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.glass, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: COLORS.textPrimary, fontSize: SIZES.xl, ...FONTS.bold },
  content: { paddingHorizontal: SIZES.space20, paddingBottom: 40 },
  section: { marginBottom: SIZES.space20 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: SIZES.lg, ...FONTS.bold, marginBottom: SIZES.space16 },
  label: { color: COLORS.textSecondary, fontSize: SIZES.sm, ...FONTS.medium, marginBottom: 8, marginTop: 12 },
  input: {
    backgroundColor: COLORS.surfaceLight, borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.space16, paddingVertical: SIZES.space12,
    color: COLORS.textPrimary, fontSize: SIZES.base, borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  qCard: { marginBottom: SIZES.space12 },
  qHeader: { flexDirection: 'row', alignItems: 'center', gap: SIZES.space12 },
  qNum: {
    color: COLORS.primary, fontSize: SIZES.md, ...FONTS.bold,
    backgroundColor: COLORS.primary + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  qPreview: { color: COLORS.textSecondary, fontSize: SIZES.md, flex: 1 },
  qBody: { marginTop: SIZES.space16 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 8, borderRadius: 8, backgroundColor: COLORS.surfaceLight,
    borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  typeBtnActive: { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary },
  typeBtnTxt: { color: COLORS.textMuted, fontSize: SIZES.xs, ...FONTS.medium },
  typeBtnTxtActive: { color: COLORS.primary, ...FONTS.bold },
  optLabel: { color: COLORS.textMuted, fontSize: SIZES.sm, ...FONTS.medium, marginTop: 8, marginBottom: 8 },
  optRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  removeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12, alignSelf: 'flex-end' },
  removeTxt: { color: COLORS.danger, fontSize: SIZES.sm, ...FONTS.medium },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: SIZES.space16, borderRadius: SIZES.radius,
    borderWidth: 1, borderColor: COLORS.primary + '30', borderStyle: 'dashed', marginBottom: SIZES.space24,
  },
  addTxt: { color: COLORS.primary, fontSize: SIZES.md, ...FONTS.semiBold },
});
