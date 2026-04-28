// Teacher Layout - Stack navigation for teacher screens

import React from 'react';
import { Stack } from 'expo-router';
import { COLORS } from '../../utils/theme';

export default function TeacherLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.bg },
        animation: 'slide_from_right',
      }}
    />
  );
}
