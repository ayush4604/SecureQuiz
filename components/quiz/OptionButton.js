// OptionButton Component - Answer option button with selection state

import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../utils/theme';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export default function OptionButton({
  option,
  index,
  isSelected,
  isCorrect,
  isMulti = false,
  showResult = false,
  onPress,
  disabled = false,
}) {
  let bgColor = COLORS.glass;
  let borderColor = COLORS.glassBorder;
  let textColor = COLORS.textPrimary;
  let letterBg = COLORS.surfaceLight;
  let iconName = null;

  if (isSelected && !showResult) {
    bgColor = COLORS.primary + '15';
    borderColor = COLORS.primary;
    letterBg = COLORS.primary;
    textColor = COLORS.textPrimary;
    if (isMulti) iconName = 'checkbox';
  }

  if (showResult) {
    if (isCorrect) {
      bgColor = 'rgba(16, 185, 129, 0.15)';
      borderColor = COLORS.success;
      letterBg = COLORS.success;
      iconName = 'checkmark-circle';
    } else if (isSelected && !isCorrect) {
      bgColor = 'rgba(239, 68, 68, 0.15)';
      borderColor = COLORS.danger;
      letterBg = COLORS.danger;
      iconName = 'close-circle';
    }
  }

  return (
    <TouchableOpacity
      onPress={() => onPress(index)}
      disabled={disabled}
      activeOpacity={0.7}
      style={[styles.container, { backgroundColor: bgColor, borderColor }]}
    >
      <View style={[styles.letter, { backgroundColor: letterBg }]}>
        <Text style={styles.letterText}>{OPTION_LETTERS[index]}</Text>
      </View>
      <Text style={[styles.optionText, { color: textColor }]} numberOfLines={3}>
        {option}
      </Text>
      {iconName && (
        <Ionicons
          name={iconName}
          size={24}
          color={isCorrect ? COLORS.success : COLORS.danger}
          style={styles.icon}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.space16,
    borderRadius: SIZES.radius,
    borderWidth: 1.5,
    marginBottom: SIZES.space12,
  },
  letter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.space12,
  },
  letterText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.md,
    ...FONTS.bold,
  },
  optionText: {
    flex: 1,
    fontSize: SIZES.base,
    ...FONTS.medium,
    lineHeight: 22,
  },
  icon: {
    marginLeft: SIZES.space8,
  },
});
