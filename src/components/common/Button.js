// src/components/common/Button.js
import React from 'react';
import { TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';
import { SHADOWS, RADIUS, SPACING, TYPOGRAPHY } from '../../styles/commonStyles';

/**
 * Button - 재사용 가능한 버튼 컴포넌트
 *
 * @param {string} title - 버튼 텍스트
 * @param {function} onPress - 클릭 핸들러
 * @param {string} variant - 버튼 스타일 (primary, secondary, danger, success, warning, info, outline, ghost)
 * @param {string} size - 버튼 크기 (small, medium, large)
 * @param {string} icon - 왼쪽 아이콘 (Ionicons 이름)
 * @param {string} iconRight - 오른쪽 아이콘 (Ionicons 이름)
 * @param {boolean} loading - 로딩 상태
 * @param {boolean} disabled - 비활성화 상태
 * @param {boolean} fullWidth - 전체 너비 사용
 * @param {string} colorScheme - 색상 스키마 (teacher 또는 parent)
 * @param {object} style - 추가 스타일
 */
export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  colorScheme = 'teacher', // 'teacher' 또는 'parent'
  style,
}) {
  // 색상 스키마에 따른 import
  const COLORS = colorScheme === 'teacher'
    ? require('../../styles/teacher_colors').default
    : require('../../styles/parent_colors').default;

  // 변형별 스타일
  const variants = {
    primary: {
      backgroundColor: COLORS.primary.DEFAULT,
      textColor: COLORS.white,
      borderColor: 'transparent',
      borderWidth: 0,
      iconColor: COLORS.white,
      shadow: SHADOWS.md,
    },
    secondary: {
      backgroundColor: COLORS.secondary.DEFAULT,
      textColor: COLORS.white,
      borderColor: 'transparent',
      borderWidth: 0,
      iconColor: COLORS.white,
      shadow: SHADOWS.md,
    },
    danger: {
      backgroundColor: COLORS.danger[500],
      textColor: COLORS.white,
      borderColor: 'transparent',
      borderWidth: 0,
      iconColor: COLORS.white,
      shadow: SHADOWS.md,
    },
    success: {
      backgroundColor: COLORS.success[500],
      textColor: COLORS.white,
      borderColor: 'transparent',
      borderWidth: 0,
      iconColor: COLORS.white,
      shadow: SHADOWS.md,
    },
    warning: {
      backgroundColor: COLORS.warning[500],
      textColor: COLORS.white,
      borderColor: 'transparent',
      borderWidth: 0,
      iconColor: COLORS.white,
      shadow: SHADOWS.md,
    },
    info: {
      backgroundColor: COLORS.blue[500],
      textColor: COLORS.white,
      borderColor: 'transparent',
      borderWidth: 0,
      iconColor: COLORS.white,
      shadow: SHADOWS.md,
    },
    outline: {
      backgroundColor: COLORS.white,
      textColor: COLORS.primary.DEFAULT,
      borderColor: COLORS.primary.DEFAULT,
      borderWidth: 2,
      iconColor: COLORS.primary.DEFAULT,
      shadow: SHADOWS.sm,
    },
    ghost: {
      backgroundColor: 'transparent',
      textColor: COLORS.primary.DEFAULT,
      borderColor: 'transparent',
      borderWidth: 0,
      iconColor: COLORS.primary.DEFAULT,
      shadow: SHADOWS.none,
    },
  };

  // 크기별 스타일
  const sizes = {
    small: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      fontSize: TYPOGRAPHY.fontSize.sm,
      iconSize: 16,
      borderRadius: RADIUS.md,
    },
    medium: {
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.xl,
      fontSize: TYPOGRAPHY.fontSize.base,
      iconSize: 20,
      borderRadius: RADIUS.xl,
    },
    large: {
      paddingVertical: SPACING.lg,
      paddingHorizontal: SPACING['2xl'],
      fontSize: TYPOGRAPHY.fontSize.lg,
      iconSize: 24,
      borderRadius: RADIUS.xl,
    },
  };

  const currentVariant = variants[variant] || variants.primary;
  const currentSize = sizes[size] || sizes.medium;

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: currentVariant.backgroundColor,
          borderRadius: currentSize.borderRadius,
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
          borderWidth: currentVariant.borderWidth,
          borderColor: currentVariant.borderColor,
          opacity: isDisabled ? 0.5 : 1,
          width: fullWidth ? '100%' : 'auto',
          ...currentVariant.shadow,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={currentVariant.iconColor} size="small" />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
          {icon && (
            <Ionicons
              name={icon}
              size={currentSize.iconSize}
              color={currentVariant.iconColor}
            />
          )}
          <Text
            style={{
              color: currentVariant.textColor,
              fontSize: currentSize.fontSize,
              fontWeight: TYPOGRAPHY.fontWeight.semibold,
            }}
          >
            {title}
          </Text>
          {iconRight && (
            <Ionicons
              name={iconRight}
              size={currentSize.iconSize}
              color={currentVariant.iconColor}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}