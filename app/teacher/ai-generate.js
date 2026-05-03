import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AnimatedBackground from '../../components/ui/AnimatedBackground';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import { COLORS, SIZES, FONTS } from '../../utils/theme';
import { generateAIQuiz } from '../../services/aiService';

export default function AIGenerateScreen() {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState('5');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      Alert.alert('Missing Topic', 'Please enter a topic for the quiz.');
      return;
    }

    const qCount = parseInt(count);
    if (isNaN(qCount) || qCount < 1 || qCount > 15) {
      Alert.alert('Invalid Count', 'Please enter a number between 1 and 15.');
      return;
    }

    setLoading(true);
    try {
      const questions = await generateAIQuiz(topic.trim(), qCount);
      
      // Navigate to create-quiz with pre-filled questions
      router.push({
        pathname: '/teacher/create-quiz',
        params: { 
          initialTitle: `AI: ${topic}`,
          initialQuestions: JSON.stringify(questions) 
        }
      });
    } catch (e) {
      Alert.alert('AI Error', e.message || 'Failed to generate quiz. Check your connection or API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Quiz Master</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <GlassCard style={styles.card}>
            <View style={styles.iconContainer}>
              <Ionicons name="flash" size={40} color={COLORS.primary} />
            </View>
            
            <Text style={styles.title}>What's the topic?</Text>
            <Text style={styles.subtitle}>
              Our AI will generate high-quality questions and options for you instantly.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quiz Topic</Text>
              <TextInput
                style={styles.input}
                value={topic}
                onChangeText={setTopic}
                placeholder="e.g. Ancient Rome, Python Basics..."
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Number of Questions (Max 15)</Text>
              <TextInput
                style={[styles.input, { width: 100 }]}
                value={count}
                onChangeText={setCount}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>

            <GradientButton 
              title="Generate Quiz" 
              onPress={handleGenerate}
              loading={loading}
              style={styles.generateBtn}
            />
          </GlassCard>

          <View style={styles.tipCard}>
            <Ionicons name="bulb-outline" size={20} color={COLORS.warning} />
            <Text style={styles.tipText}>
              Tip: Be specific! "Chemistry of Water" works better than just "Science".
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.space20, paddingVertical: SIZES.space16,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.glass, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: COLORS.textPrimary, fontSize: SIZES.xl, ...FONTS.bold },
  content: { padding: SIZES.space20 },
  card: {
    padding: SIZES.space32,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.space24,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: SIZES.xxl,
    ...FONTS.bold,
    textAlign: 'center',
    marginBottom: SIZES.space8,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: SIZES.md,
    textAlign: 'center',
    marginBottom: SIZES.space32,
    lineHeight: 22,
  },
  inputGroup: {
    width: '100%',
    marginBottom: SIZES.space24,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    ...FONTS.medium,
    marginBottom: SIZES.space8,
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.space16,
    paddingVertical: SIZES.space16,
    color: COLORS.textPrimary,
    fontSize: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  generateBtn: {
    width: '100%',
    marginTop: SIZES.space8,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: SIZES.space24,
    backgroundColor: COLORS.glass,
    padding: SIZES.space16,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  tipText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    ...FONTS.medium,
    flex: 1,
  }
});
