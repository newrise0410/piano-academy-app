// src/styles/parent_colors.js
// 학부모 앱 전용 색상 시스템

const PARENT_COLORS = {
  primary: {
    DEFAULT: "#EC4899", // 핑크색 - 메인 컬러
    50: "#FDF2F8",
    100: "#FCE7F3",
    500: "#EC4899",
    600: "#DB2777",
  },
  secondary: {
    DEFAULT: "#8B5CF6", // 보라색
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
  pink: {
    50: "#FDF2F8",
    100: "#FCE7F3",
    500: "#EC4899",
    600: "#DB2777",
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

// 그라디언트 색상 조합 (학부모 앱)
export const PARENT_GRADIENTS = {
  primaryGradient: [PARENT_COLORS.primary[500], PARENT_COLORS.primary[600]],
  pinkToPurple: [PARENT_COLORS.primary[500], PARENT_COLORS.purple[500]],
  successGradient: [PARENT_COLORS.success[500], PARENT_COLORS.cyan.DEFAULT],
};

// 반투명 오버레이 색상
export const PARENT_OVERLAY_COLORS = {
  whiteLight: 'rgba(255, 255, 255, 0.2)',
  whiteMedium: 'rgba(255, 255, 255, 0.5)',
  blackLight: 'rgba(0, 0, 0, 0.2)',
  blackMedium: 'rgba(0, 0, 0, 0.5)',
};

// 의미론적 색상 (학부모 앱)
export const PARENT_SEMANTIC_COLORS = {
  success: PARENT_COLORS.success.DEFAULT,
  warning: PARENT_COLORS.warning.DEFAULT,
  error: PARENT_COLORS.danger.DEFAULT,
  paid: PARENT_COLORS.success.DEFAULT,      // 납부 완료
  unpaid: PARENT_COLORS.danger.DEFAULT,     // 미납
  present: PARENT_COLORS.success.DEFAULT,   // 출석
  absent: PARENT_COLORS.danger.DEFAULT,     // 결석
};

// 그림자 색상
export const PARENT_SHADOW_COLORS = {
  primary: PARENT_COLORS.primary[600],
  black: PARENT_COLORS.black,
};

export default PARENT_COLORS;
