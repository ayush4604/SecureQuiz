// Landing Screen - Role Selection (Teacher or Student)
// Build Timestamp: 1776947530 (Forcing Netlify Update)

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  ScrollView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import ShieldIcon from '../components/ui/ShieldIcon';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import { COLORS, SIZES, FONTS, SHADOWS } from '../utils/theme';
import { APP_NAME } from '../utils/constants';

export default function LandingScreen() {
  return (
    <AnimatedBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView 
          style={styles.flex}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Hero Section */}
          <View style={styles.hero}>
            <ShieldIcon size={Platform.OS === 'web' ? 90 : 70} />
            <Text style={styles.appName}>{APP_NAME}</Text>
            <Text style={styles.tagline}>
              Secure Anti-Cheat Quiz Platform
            </Text>
          </View>

          {/* Security Features */}
          <View style={styles.features}>
            <View style={styles.featureRow}>
              <View style={styles.featureBadge}>
                <Ionicons name="eye-off" size={14} color={COLORS.primary} />
                <Text style={styles.featureText}>Screenshot Blocked</Text>
              </View>
              <View style={styles.featureBadge}>
                <Ionicons name="videocam-off" size={14} color={COLORS.primary} />
                <Text style={styles.featureText}>Recording Blocked</Text>
              </View>
            </View>
            <View style={styles.featureRow}>
              <View style={styles.featureBadge}>
                <Ionicons name="swap-horizontal" size={14} color={COLORS.primary} />
                <Text style={styles.featureText}>Tab Switch Detection</Text>
              </View>
              <View style={styles.featureBadge}>
                <Ionicons name="shield-checkmark" size={14} color={COLORS.primary} />
                <Text style={styles.featureText}>15 Security Layers</Text>
              </View>
            </View>
          </View>

          {/* Role Selection */}
          <Text style={styles.selectText}>Select your role</Text>

          <View style={styles.cards}>
            {/* Teacher Card */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/teacher')}
              style={styles.cardWrapper}
            >
              <GlassCard style={styles.roleCard}>
                <LinearGradient
                  colors={['rgba(0, 212, 255, 0.1)', 'rgba(0, 212, 255, 0.02)']}
                  style={styles.cardGradient}
                >
                  <View style={styles.iconCircle}>
                    <Ionicons name="school" size={32} color={COLORS.primary} />
                  </View>
                  <Text style={styles.roleTitle}>I'm a Teacher</Text>
                  <Text style={styles.roleDesc}>
                    Create & manage quizzes{'\n'}Monitor student activity
                  </Text>
                  <View style={styles.arrowCircle}>
                    <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
                  </View>
                </LinearGradient>
              </GlassCard>
            </TouchableOpacity>

            {/* Student Card */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/student')}
              style={styles.cardWrapper}
            >
              <GlassCard style={styles.roleCard}>
                <LinearGradient
                  colors={['rgba(124, 58, 237, 0.1)', 'rgba(124, 58, 237, 0.02)']}
                  style={styles.cardGradient}
                >
                  <View style={[styles.iconCircle, { backgroundColor: COLORS.secondary + '20' }]}>
                    <Ionicons name="person" size={32} color={COLORS.secondary} />
                  </View>
                  <Text style={styles.roleTitle}>I'm a Student</Text>
                  <Text style={styles.roleDesc}>
                    Join quiz with code{'\n'}No login required
                  </Text>
                  <View style={[styles.arrowCircle, { borderColor: COLORS.secondary + '40' }]}>
                    <Ionicons name="arrow-forward" size={18} color={COLORS.secondary} />
                  </View>
                </LinearGradient>
              </GlassCard>
            </TouchableOpacity>
          </View>

          {/* Download App Section - Only visible on Web */}
          {Platform.OS === 'web' && (
            <View style={styles.downloadSection}>
              <Text style={styles.selectText}>Want the full lockdown experience?</Text>
              <GradientButton 
                title="Download Android App"
                variant="outline"
                style={styles.downloadBtn}
                onPress={() => Linking.openURL('https://expo.dev/artifacts/eas/37PmoAxQ2B2QBmwCkCK9Y8.apk')}
              />
            </View>
          )}
        </View>
      </ScrollView>
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: SIZES.space32,
  },
  container: {
    paddingHorizontal: SIZES.space24,
  },
  hero: {
    alignItems: 'center',
    marginBottom: SIZES.space32,
    minHeight: 120, // Ensure space for logo even if font loads slow
    justifyContent: 'center',
  },
  appName: {
    fontSize: Platform.OS === 'web' ? SIZES.display * 1.2 : SIZES.display,
    color: COLORS.textPrimary,
    ...FONTS.extraBold,
    marginTop: SIZES.space16,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    ...FONTS.medium,
    marginTop: SIZES.space8,
    textAlign: 'center',
  },
  features: {
    alignItems: 'center',
    marginBottom: SIZES.space32,
    gap: SIZES.space8,
  },
  featureRow: {
    flexDirection: 'row',
    gap: SIZES.space8,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: SIZES.space12,
    paddingVertical: SIZES.space4,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  featureText: {
    color: COLORS.primary,
    fontSize: SIZES.xs,
    ...FONTS.medium,
  },
  selectText: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    ...FONTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: SIZES.space16,
  },
  cards: {
    gap: Platform.OS === 'web' ? SIZES.space24 : SIZES.space16,
  },
  cardWrapper: {
    // for touch feedback
  },
  roleCard: {
    padding: 0,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: SIZES.space24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.space16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTitle: {
    color: COLORS.textPrimary,
    fontSize: SIZES.lg,
    ...FONTS.bold,
    flex: 1,
  },
  roleDesc: {
    display: 'none', // Hidden to keep card compact
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadSection: {
    marginTop: SIZES.space32,
    alignItems: 'center',
    width: '100%',
  },
  downloadBtn: {
    width: '100%',
    maxWidth: 320,
    marginTop: -8, // slight adjustment to bring it closer to its label
  },
});
