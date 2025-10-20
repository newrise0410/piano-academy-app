// src/components/common/Button.js
import React from 'react';
import { TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';

/**
 * Button - 재사용 가능한 버튼 컴포넌트
 *
 * @param {string} title - 버튼 텍스트
 * @param {function} onPress - 클릭 핸들러
 * @param {string} variant - 버튼 스타일 (primary, secondary, danger, success, outline, ghost)
 * @param {string} size - 버튼 크기 (small, medium, large)
 * @param {string} icon - 왼쪽 아이콘 (Ionicons 이름)
 * @param {string} iconRight - 오른쪽 아이콘 (Ionicons 이름)
 * @param {boolean} loading - 로딩 상태
 * @param {boolean} disabled - 비활성화 상태
 * @param {boolean} fullWidth - 전체 너비 사용
 * @param {string} className - 추가 클래스
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
  className = '',
  style,
}) {
  // 변형별 스타일
  const variants = {
    primary: {
      bg: 'bg-primary',
      text: 'text-white',
      border: '',
      iconColor: '#FFFFFF',
    },
    secondary: {
      bg: 'bg-secondary',
      text: 'text-white',
      border: '',
      iconColor: '#FFFFFF',
    },
    danger: {
      bg: 'bg-red-500',
      text: 'text-white',
      border: '',
      iconColor: '#FFFFFF',
    },
    success: {
      bg: 'bg-green-500',
      text: 'text-white',
      border: '',
      iconColor: '#FFFFFF',
    },
    outline: {
      bg: 'bg-white',
      text: 'text-primary',
      border: 'border-2 border-primary',
      iconColor: '#8B5CF6',
    },
    ghost: {
      bg: 'bg-transparent',
      text: 'text-primary',
      border: '',
      iconColor: '#8B5CF6',
    },
  };

  // 크기별 스타일
  const sizes = {
    small: {
      padding: 'px-3 py-2',
      text: 'text-sm',
      icon: 18,
    },
    medium: {
      padding: 'px-4 py-3',
      text: 'text-base',
      icon: 20,
    },
    large: {
      padding: 'px-6 py-4',
      text: 'text-lg',
      icon: 24,
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
      className={`
        flex-row items-center justify-center rounded-xl
        ${currentVariant.bg}
        ${currentVariant.border}
        ${currentSize.padding}
        ${isDisabled ? 'opacity-50' : ''}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      style={style}
    >
      {loading ? (
        <ActivityIndicator color={currentVariant.iconColor} size="small" />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {icon && (
            <Ionicons
              name={icon}
              size={currentSize.icon}
              color={currentVariant.iconColor}
            />
          )}
          <Text className={`${currentVariant.text} ${currentSize.text} font-semibold`}>
            {title}
          </Text>
          {iconRight && (
            <Ionicons
              name={iconRight}
              size={currentSize.icon}
              color={currentVariant.iconColor}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}