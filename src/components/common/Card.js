// src/components/common/Card.js
import React from 'react';
import { View } from 'react-native';
import { SHADOWS, RADIUS, SPACING, CARD_STYLES } from '../../styles/commonStyles';

/**
 * Card - 재사용 가능한 카드 컴포넌트
 *
 * @param {ReactNode} children - 카드 내용
 * @param {string} variant - 카드 스타일 (default, small, large, flat, section)
 * @param {object} style - 추가 스타일
 * @param {string} colorScheme - 색상 스키마 (teacher 또는 parent)
 */
export default function Card({
  children,
  variant = 'default',
  style,
  colorScheme = 'teacher',
}) {
  // 색상 스키마에 따른 import
  const COLORS = colorScheme === 'teacher'
    ? require('../../styles/teacher_colors').default
    : require('../../styles/parent_colors').default;

  // variant별 스타일
  const variantStyles = {
    default: CARD_STYLES.default,
    small: CARD_STYLES.small,
    large: CARD_STYLES.large,
    flat: CARD_STYLES.flat,
    section: CARD_STYLES.section,
    // 추가 variant들
    elevated: {
      backgroundColor: COLORS.white,
      borderRadius: RADIUS['3xl'],
      padding: SPACING.xl,
      ...SHADOWS.lg,
    },
    outlined: {
      backgroundColor: COLORS.white,
      borderRadius: RADIUS['3xl'],
      padding: SPACING.lg,
      borderWidth: 1,
      borderColor: COLORS.gray[200],
      ...SHADOWS.none,
    },
    gradient: {
      backgroundColor: 'transparent',
      borderRadius: RADIUS['3xl'],
      padding: SPACING.lg,
      ...SHADOWS.md,
    },
  };

  const currentStyle = variantStyles[variant] || variantStyles.default;

  return (
    <View style={[currentStyle, style]}>
      {children}
    </View>
  );
}