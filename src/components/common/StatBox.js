// src/components/common/StatBox.js
import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';
import { SHADOWS, RADIUS, SPACING, TYPOGRAPHY, ICON_CONTAINER } from '../../styles/commonStyles';

export default function StatBox({
  number,
  label,
  variant = 'default',
  icon,
  backgroundColor,
  textColor,
  iconColor,
  colorScheme = 'teacher', // 'teacher' 또는 'parent'
}) {
  // 색상 스키마에 따른 import
  const COLORS = colorScheme === 'teacher'
    ? require('../../styles/teacher_colors').default
    : require('../../styles/parent_colors').default;

  // variant별 스타일 정의
  const variants = {
    default: {
      bgColor: COLORS.gray[100],
      textColor: COLORS.gray[900],
      iconBg: COLORS.primary[100],
      iconColor: COLORS.primary[600],
    },
    primary: {
      bgColor: COLORS.primary[50],
      textColor: COLORS.primary[700],
      iconBg: COLORS.primary[100],
      iconColor: COLORS.primary[600],
    },
    warning: {
      bgColor: COLORS.warning[50],
      textColor: COLORS.warning[700],
      iconBg: COLORS.warning[100],
      iconColor: COLORS.warning[600],
    },
    success: {
      bgColor: COLORS.success[50],
      textColor: COLORS.success[700],
      iconBg: COLORS.success[100],
      iconColor: COLORS.success[600],
    },
    danger: {
      bgColor: COLORS.danger[50],
      textColor: COLORS.danger[700],
      iconBg: COLORS.danger[100],
      iconColor: COLORS.danger[600],
    },
    info: {
      bgColor: COLORS.secondary[50],
      textColor: COLORS.secondary[700],
      iconBg: COLORS.secondary[100],
      iconColor: COLORS.secondary[600],
    },
  };

  const variantStyle = variants[variant];

  return (
    <View
      style={{
        backgroundColor: backgroundColor || variantStyle.bgColor,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        alignItems: 'center',
        ...SHADOWS.sm,
      }}
    >
      {/* 아이콘 */}
      {icon && (
        <View
          style={{
            ...ICON_CONTAINER.sm(variantStyle.iconBg),
            marginBottom: SPACING.sm,
          }}
        >
          <Ionicons
            name={icon}
            size={18}
            color={iconColor || variantStyle.iconColor}
          />
        </View>
      )}

      {/* 라벨 */}
      <Text
        style={{
          fontSize: TYPOGRAPHY.fontSize.xs,
          fontWeight: TYPOGRAPHY.fontWeight.bold,
          color: textColor || COLORS.gray[600],
          marginBottom: SPACING.xs,
        }}
      >
        {label}
      </Text>

      {/* 숫자 */}
      <Text
        style={{
          fontSize: TYPOGRAPHY.fontSize['3xl'],
          fontWeight: TYPOGRAPHY.fontWeight.bold,
          color: textColor || variantStyle.textColor,
        }}
      >
        {number}
      </Text>
    </View>
  );
}