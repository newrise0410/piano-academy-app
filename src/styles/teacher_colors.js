// src/styles/teacher_colors.js
// 선생님 앱 전용 색상 시스템

const TEACHER_COLORS = {
  primary: {
    DEFAULT: "#8B5CF6", // 보라색 - 메인 컬러
    50: "#F5F3FF",
    100: "#EDE9FE",
    500: "#8B5CF6",
    600: "#7C3AED",
  },
  secondary: {
    DEFAULT: "#3B82F6", // 파란색
  },
  success: {
    DEFAULT: "#10B981", // 초록색
    50: "#ECFDF5",
    500: "#10B981",
    600: "#059669",
  },
  warning: {
    DEFAULT: "#F59E0B", // 노란색
    50: "#FFFBEB",
    600: "#D97706",
  },
  danger: {
    DEFAULT: "#EF4444", // 빨간색
    50: "#FEF2F2",
    500: "#EF4444",
  },
  orange: {
    50: "#FFF7ED",
    500: "#F97316",
    600: "#EA580C",
  },
  red: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    200: "#FECACA",
    500: "#EF4444",
    600: "#DC2626",
  },
  green: {
    50: "#ECFDF5",
    200: "#BBF7D0",
    500: "#22C55E",
  },
  blue: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    500: "#3B82F6",
    600: "#2563EB",
  },
  cyan: {
    DEFAULT: "#22D3EE",
    500: "#06B6D4",
  },
  purple: {
    50: "#FAF5FF",
    100: "#E9D5FF",
    500: "#A855F7",
    600: "#8B5CF6",
  },
  amber: {
    100: "#FED7AA",
  },
  sky: {
    100: "#DBEAFE",
  },
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    800: "#1F2937",
  },
  white: "#FFFFFF",
  black: "#000000",
};

// 그라디언트 색상 조합 (선생님 앱)
export const TEACHER_GRADIENTS = {
  tuitionHeader: ['#4ADE80', '#22D3EE', '#3B82F6'], // 수강료 헤더 그라디언트
  greenToCyan: [TEACHER_COLORS.success[500], TEACHER_COLORS.cyan.DEFAULT],
  primaryGradient: [TEACHER_COLORS.primary[500], TEACHER_COLORS.primary[600]],
};

// 알림장 템플릿 배경 색상
export const TEACHER_TEMPLATE_COLORS = {
  concert: TEACHER_COLORS.purple[100],      // 발표회 안내
  closure: TEACHER_COLORS.amber[100],       // 휴강 안내
  tuition: TEACHER_COLORS.sky[100],         // 수강료 안내
  custom: TEACHER_COLORS.red[100],          // 직접 입력
};

// 반투명 오버레이 색상
export const TEACHER_OVERLAY_COLORS = {
  whiteLight: 'rgba(255, 255, 255, 0.2)',
  whiteMedium: 'rgba(255, 255, 255, 0.5)',
  blackLight: 'rgba(0, 0, 0, 0.2)',
  blackMedium: 'rgba(0, 0, 0, 0.5)',
};

// 의미론적 색상 (선생님 앱)
export const TEACHER_SEMANTIC_COLORS = {
  success: TEACHER_COLORS.success.DEFAULT,
  warning: TEACHER_COLORS.warning.DEFAULT,
  error: TEACHER_COLORS.danger.DEFAULT,
  paid: TEACHER_COLORS.success.DEFAULT,      // 납부 완료
  unpaid: TEACHER_COLORS.danger.DEFAULT,     // 미납
};

// 그림자 색상
export const TEACHER_SHADOW_COLORS = {
  primary: TEACHER_COLORS.primary[600],
  black: TEACHER_COLORS.black,
};

export default TEACHER_COLORS;
