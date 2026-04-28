import React from 'react';
import { View, Text, StyleSheet, Modal, Platform } from 'react-native';
import { COLORS, SIZES, FONTS } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from '../ui/GradientButton';

export default function LockdownOverlay({ visible }) {
  const isWeb = Platform.OS === 'web';
  const [isFullscreen, setIsFullscreen] = React.useState(true);

  // Monitor fullscreen on web
  React.useEffect(() => {
    if (!isWeb) return;
    
    const checkFullscreen = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', checkFullscreen);
    return () => document.removeEventListener('fullscreenchange', checkFullscreen);
  }, [isWeb]);

  const handleRetry = () => {
    if (isWeb) {
      document.documentElement.requestFullscreen().catch(() => {
        alert('Please enable fullscreen to continue.');
      });
    } else {
      try {
        const ScreenPinning = require('../../modules/expo-screen-pinning');
        ScreenPinning.start();
      } catch (e) {
        console.warn('Pinning error:', e);
      }
    }
  };

  const isVisible = visible || (isWeb && !isFullscreen);
  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.container}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(10, 14, 26, 0.95)' }]} />
        
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={60} color={COLORS.primary} />
          </View>
          
          <Text style={styles.title}>Security Lockdown Active</Text>
          <Text style={styles.description}>
            {isWeb 
              ? 'Fullscreen mode is required to maintain quiz integrity. Please enable fullscreen to continue.'
              : 'Screen pinning (Lock Task Mode) is required to ensure quiz integrity. Please pin the app to continue.'}
          </Text>
          
          {!isWeb && (
            <View style={styles.instructionCard}>
              <Text style={styles.instructionTitle}>How to enable:</Text>
              <Text style={styles.instructionStep}>1. Click "Enable Lockdown" below</Text>
              <Text style={styles.instructionStep}>2. Select "GOT IT" on the Android dialog</Text>
            </View>
          )}

          <GradientButton
            title={isWeb ? "Enter Fullscreen" : "Enable Lockdown"}
            onPress={handleRetry}
            containerStyle={styles.button}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.space24,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SIZES.space32,
    borderRadius: SIZES.radius24,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.space24,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: SIZES.xl * 1.2,
    ...FONTS.bold,
    textAlign: 'center',
    marginBottom: SIZES.space16,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: SIZES.md,
    ...FONTS.medium,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SIZES.space32,
  },
  instructionCard: {
    width: '100%',
    backgroundColor: COLORS.surfaceLight,
    padding: SIZES.space20,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.space32,
  },
  instructionTitle: {
    color: COLORS.primary,
    fontSize: SIZES.sm,
    ...FONTS.bold,
    textTransform: 'uppercase',
    marginBottom: SIZES.space12,
  },
  instructionStep: {
    color: COLORS.textPrimary,
    fontSize: SIZES.sm,
    ...FONTS.medium,
    marginBottom: SIZES.space8,
  },
  button: {
    width: '100%',
  }
});
