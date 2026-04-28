// Root Layout - Wraps entire app with providers and navigation

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import 'expo-insights';
import { AppProvider } from '../context/AppContext';
import { COLORS } from '../utils/theme';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.innerHTML = `
        * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-user-drag: none !important;
          cursor: default !important;
        }
        input, textarea {
          -webkit-user-select: text !important;
          user-select: text !important;
          cursor: text !important;
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  if (!loaded && !error) {
    return <View style={{ flex: 1, backgroundColor: COLORS.bg }} />;
  }

  return (
    <AppProvider>
      <StatusBar style="light" backgroundColor={COLORS.bg} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.bg },
          animation: 'fade',
        }}
      />
    </AppProvider>
  );
}
