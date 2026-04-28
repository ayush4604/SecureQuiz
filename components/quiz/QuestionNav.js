// QuestionNav - Question navigation dots

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SIZES, FONTS } from '../../utils/theme';

export default function QuestionNav({
  totalQuestions,
  currentIndex,
  answers,
  onPress,
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      {Array.from({ length: totalQuestions }, (_, i) => {
        const isCurrent = i === currentIndex;
        const isAnswered = answers[i] !== undefined;

        let bgColor = COLORS.surfaceLight;
        let borderColor = 'transparent';
        let textColor = COLORS.textMuted;

        if (isCurrent) {
          bgColor = COLORS.primary;
          borderColor = COLORS.primary;
          textColor = COLORS.textDark;
        } else if (isAnswered) {
          bgColor = COLORS.primary + '30';
          borderColor = COLORS.primary + '50';
          textColor = COLORS.primary;
        }

        return (
          <TouchableOpacity
            key={i}
            onPress={() => onPress(i)}
            activeOpacity={0.7}
            style={[
              styles.dot,
              { backgroundColor: bgColor, borderColor },
            ]}
          >
            <Text style={[styles.dotText, { color: textColor }]}>{i + 1}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    height: 60,
    flexGrow: 0,
  },
  container: {
    flexDirection: 'row',
    gap: SIZES.space8,
    paddingHorizontal: SIZES.space4,
    paddingVertical: SIZES.space8,
    height: 55, // Fixed height to prevent expanding
    flexGrow: 0, // Prevent it from taking extra space
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  dotText: {
    fontSize: SIZES.sm,
    ...FONTS.semiBold,
  },
});
