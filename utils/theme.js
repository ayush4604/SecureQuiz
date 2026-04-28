// SecureQuiz Design System
// Premium dark theme with electric cyan and vivid violet accents

export const COLORS = {
  // Backgrounds
  bg: '#0A0E1A',
  bgSecondary: '#111627',
  surface: '#141928',
  surfaceLight: '#1C2237',
  surfaceHover: '#232942',

  // Accents
  primary: '#00D4FF',
  primaryDark: '#00A3CC',
  primaryLight: '#33DDFF',
  secondary: '#7C3AED',
  secondaryDark: '#6D28D9',
  secondaryLight: '#8B5CF6',

  // Gradients
  gradientStart: '#00D4FF',
  gradientEnd: '#7C3AED',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0AEC0',
  textMuted: '#64748B',
  textDark: '#0A0E1A',

  // Status
  success: '#10B981',
  successLight: '#34D399',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  danger: '#EF4444',
  dangerLight: '#F87171',
  dangerDark: '#DC2626',

  // Glass
  glass: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  glassLight: 'rgba(255, 255, 255, 0.08)',

  // Overlay
  overlay: 'rgba(10, 14, 26, 0.9)',
  overlayLight: 'rgba(10, 14, 26, 0.7)',

  // Violation
  violationBg: 'rgba(239, 68, 68, 0.15)',
  violationBorder: 'rgba(239, 68, 68, 0.4)',
};

export const FONTS = {
  light: { fontWeight: '300' },
  regular: { fontWeight: '400' },
  medium: { fontWeight: '500' },
  semiBold: { fontWeight: '600' },
  bold: { fontWeight: '700' },
  extraBold: { fontWeight: '800' },
};

export const SIZES = {
  // Font sizes
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 36,
  hero: 48,

  // Spacing
  space2: 2,
  space4: 4,
  space8: 8,
  space12: 12,
  space16: 16,
  space20: 20,
  space24: 24,
  space32: 32,
  space40: 40,
  space48: 48,
  space64: 64,

  // Border radius
  radiusSm: 8,
  radius: 12,
  radiusMd: 16,
  radiusLg: 20,
  radiusXl: 24,
  radiusFull: 999,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  glow: (color = '#00D4FF') => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  }),
};

export const GLASS = {
  card: {
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: SIZES.radiusMd,
  },
  cardLight: {
    backgroundColor: COLORS.glassLight,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: SIZES.radiusMd,
  },
};
