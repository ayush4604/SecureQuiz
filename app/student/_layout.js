// Student Layout

import React from 'react';
import { Stack } from 'expo-router';
import { COLORS } from '../../utils/theme';

export default function StudentLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.bg },
        animation: 'slide_from_right',
        gestureEnabled: false,
      }}
    />
  );
}
