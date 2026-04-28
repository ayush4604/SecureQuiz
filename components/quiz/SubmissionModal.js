import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, FONTS } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from '../ui/GradientButton';

export default function SubmissionModal({ visible, unansweredCount, onConfirm, onCancel }) {
  const isWeb = typeof window !== 'undefined';
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Transparent dark overlay for web/android compatibility */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(5, 8, 16, 0.9)' }]} />
        
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="send" size={40} color={COLORS.primary} />
          </View>
          
          <Text style={styles.title}>Submit Quiz?</Text>
          
          {unansweredCount > 0 ? (
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={20} color={COLORS.warning} />
              <Text style={styles.warningText}>
                You have {unansweredCount} unanswered questions!
              </Text>
            </View>
          ) : (
            <Text style={styles.description}>
              Are you sure you want to end your quiz? You cannot change your answers after submission.
            </Text>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.cancelBtn} 
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>Review</Text>
            </TouchableOpacity>
            
            <View style={{ flex: 1 }}>
              <GradientButton 
                title="Submit Now"
                onPress={onConfirm}
                size="medium"
              />
            </View>
          </View>
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
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    padding: SIZES.space32,
    borderRadius: SIZES.radius24,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    elevation: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
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
    fontSize: SIZES.xl,
    ...FONTS.bold,
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
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.warning + '15',
    padding: SIZES.space16,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.space32,
    borderWidth: 1,
    borderColor: COLORS.warning + '30',
  },
  warningText: {
    color: COLORS.warning,
    fontSize: SIZES.sm,
    ...FONTS.bold,
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.space16,
    width: '100%',
  },
  cancelBtn: {
    paddingHorizontal: SIZES.space20,
    paddingVertical: SIZES.space12,
  },
  cancelText: {
    color: COLORS.textMuted,
    fontSize: SIZES.md,
    ...FONTS.semiBold,
  },
});
