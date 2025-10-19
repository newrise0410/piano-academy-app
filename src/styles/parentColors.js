// src/styles/parentColors.js
// 학부모 앱 전용 컬러 시스템

export const PARENT_COLORS = {
  // 메인 컬러 (핑크 계열)
  primary: {
    DEFAULT: '#EC4899',
    50: '#FDF2F8',
    100: '#FCE7F3',
    200: '#FBCFE8',
    300: '#F9A8D4',
    400: '#F472B6',
    500: '#EC4899',
    600: '#DB2777',
    700: '#BE185D',
  },

  // 서브 컬러 (보라 계열)
  secondary: {
    DEFAULT: '#8B5CF6',
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
  },

  // 출석 (초록)
  attendance: {
    DEFAULT: '#10B981',
    light: '#D1FAE5',
    bg: '#ECFDF5',
    text: '#059669',
  },

  // 진도 (보라)
  progress: {
    DEFAULT: '#8B5CF6',
    light: '#F3E8FF',
    bg: '#FAF5FF',
    text: '#7C3AED',
  },

  // 수강료 (파랑)
  tuition: {
    DEFAULT: '#3B82F6',
    light: '#DBEAFE',
    bg: '#EFF6FF',
    text: '#2563EB',
  },

  // 앨범 (핑크)
  gallery: {
    DEFAULT: '#EC4899',
    light: '#FCE7F3',
    bg: '#FDF2F8',
    text: '#DB2777',
  },

  // 일정 (블루)
  schedule: {
    DEFAULT: '#3B82F6',
    light: '#DBEAFE',
    bg: '#EFF6FF',
    border: '#93C5FD',
  },

  // 알림/소식
  notice: {
    new: '#EC4899',
    info: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
  },

  // 그레이 스케일
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
  },

  // 상태 색상
  status: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },

  // 그라데이션 (배열 형태)
  gradients: {
    primary: ['#EC4899', '#8B5CF6'],
    profile: ['#EC4899', '#8B5CF6', '#3B82F6'],
    schedule: ['#DBEAFE', '#EDE9FE'],
    card: ['#FDF2F8', '#F5F3FF'],
  },

  // 배경 장식
  decoration: {
    pink: '#FBCFE8',
    purple: '#DDD6FE',
  },

  // 그림자
  shadow: {
    primary: '#EC4899',
    secondary: '#8B5CF6',
    blue: '#3B82F6',
    green: '#10B981',
    black: '#000000',
  },
};

export default PARENT_COLORS;
