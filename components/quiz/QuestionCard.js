// QuestionCard Component - Displays a quiz question

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassCard from '../ui/GlassCard';
import { COLORS, SIZES, FONTS } from '../../utils/theme';

export default function QuestionCard({ question, questionNumber, totalQuestions }) {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            Q{questionNumber}/{totalQuestions}
          </Text>
        </View>
      </View>
      <Text style={styles.questionText}>{question.text}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SIZES.space16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.space16,
  },
  badge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SIZES.space12,
    paddingVertical: SIZES.space4,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: SIZES.sm,
    ...FONTS.semiBold,
  },
  questionText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.xl,
    ...FONTS.semiBold,
    lineHeight: 30,
  },
});
