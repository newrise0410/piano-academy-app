import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';

/**
 * StatusBadge - 상태/레벨/카테고리 배지 컴포넌트
 *
 * @param {string} type - 배지 타입 (level, status, category, custom)
 * @param {string} value - 배지 값
 * @param {string} variant - 크기 (small, medium, large)
 * @param {string} iconName - Ionicons 아이콘 이름
 * @param {object} customColors - 커스텀 색상 { bg, text, border }
 * @param {object} style - 추가 스타일
 */
export default function StatusBadge({
  type = 'custom',
  value,
  variant = 'small',
  iconName,
  customColors,
  style,
}) {
  // 레벨별 색상 매핑
  const levelColors = {
    초급: { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
    중급: { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
    고급: { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' },
    심화: { bg: '#E9D5FF', text: '#6B21A8', border: '#C084FC' },
  };

  // 상태별 색상 매핑 (출석/결석/지각/조퇴)
  const attendanceStatusColors = {
    출석: { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7', icon: 'checkmark-circle' },
    결석: { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5', icon: 'close-circle' },
    지각: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D', icon: 'time' },
    조퇴: { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD', icon: 'log-out' },
  };

  // 결제 상태 색상 매핑
  const paymentStatusColors = {
    완납: { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7', icon: 'checkmark-circle' },
    미납: { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5', icon: 'alert-circle' },
    부분납부: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D', icon: 'time' },
  };

  // 카테고리별 색상 매핑
  const categoryColors = {
    클래식: { bg: '#F3E8FF', text: '#6B21A8', border: '#C084FC' },
    재즈: { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
    팝: { bg: '#FCE7F3', text: '#9F1239', border: '#F9A8D4' },
    '실용음악': { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
    기타: { bg: '#E5E7EB', text: '#1F2937', border: '#D1D5DB' },
  };

  // 티켓 타입 색상 매핑
  const ticketTypeColors = {
    count: { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD', icon: 'ticket' },
    period: { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7', icon: 'calendar' },
  };

  // 타입별 색상 결정
  const getColors = () => {
    if (customColors) return customColors;

    switch (type) {
      case 'level':
        return levelColors[value] || { bg: '#E5E7EB', text: '#1F2937', border: '#D1D5DB' };
      case 'attendance':
        return attendanceStatusColors[value] || { bg: '#E5E7EB', text: '#1F2937', border: '#D1D5DB' };
      case 'payment':
        return paymentStatusColors[value] || { bg: '#E5E7EB', text: '#1F2937', border: '#D1D5DB' };
      case 'category':
        return categoryColors[value] || { bg: '#E5E7EB', text: '#1F2937', border: '#D1D5DB' };
      case 'ticket':
        return ticketTypeColors[value] || { bg: '#E5E7EB', text: '#1F2937', border: '#D1D5DB' };
      default:
        return { bg: '#E5E7EB', text: '#1F2937', border: '#D1D5DB' };
    }
  };

  const colors = getColors();

  // 크기별 스타일
  const sizeStyles = {
    small: {
      padding: 'px-2 py-0.5',
      text: 'text-xs',
      icon: 12,
    },
    medium: {
      padding: 'px-3 py-1',
      text: 'text-sm',
      icon: 14,
    },
    large: {
      padding: 'px-4 py-1.5',
      text: 'text-base',
      icon: 16,
    },
  };

  const currentSize = sizeStyles[variant];

  // 아이콘 결정 (타입별 자동 아이콘 또는 커스텀 아이콘)
  const icon = iconName || colors.icon;

  return (
    <View
      className={`${currentSize.padding} rounded-full flex-row items-center`}
      style={[
        {
          backgroundColor: colors.bg,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={currentSize.icon}
          color={colors.text}
          style={{ marginRight: 4 }}
        />
      )}
      <Text
        className={`${currentSize.text} font-bold`}
        style={{ color: colors.text }}
      >
        {value}
      </Text>
    </View>
  );
}

/**
 * 사전 정의된 배지 변형들
 */

// 레벨 배지
export function LevelBadge({ level, variant = 'small', style }) {
  return (
    <StatusBadge
      type="level"
      value={level}
      variant={variant}
      style={style}
    />
  );
}

// 출석 상태 배지
export function AttendanceStatusBadge({ status, variant = 'small', style }) {
  return (
    <StatusBadge
      type="attendance"
      value={status}
      variant={variant}
      style={style}
    />
  );
}

// 결제 상태 배지
export function PaymentStatusBadge({ status, variant = 'small', style }) {
  return (
    <StatusBadge
      type="payment"
      value={status}
      variant={variant}
      style={style}
    />
  );
}

// 카테고리 배지
export function CategoryBadge({ category, variant = 'small', style }) {
  return (
    <StatusBadge
      type="category"
      value={category}
      variant={variant}
      style={style}
    />
  );
}

// 티켓 타입 배지
export function TicketTypeBadge({ type, variant = 'small', style }) {
  const label = type === 'count' ? '횟수권' : '기간권';
  return (
    <StatusBadge
      type="ticket"
      value={type}
      variant={variant}
      style={style}
      iconName={type === 'count' ? 'ticket' : 'calendar'}
    />
  );
}

// 미납 경고 배지
export function UnpaidBadge({ variant = 'small', style }) {
  return (
    <StatusBadge
      type="custom"
      value="미납"
      variant={variant}
      iconName="alert-circle"
      customColors={{ bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' }}
      style={style}
    />
  );
}
