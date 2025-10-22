// src/styles/colors.js
const COLORS = {
  primary: {
    DEFAULT: "#8B5CF6",
    50: "#F5F3FF",
    100: "#EDE9FE",
    500: "#8B5CF6",
    600: "#7C3AED",
  },
  secondary: {
    DEFAULT: "#3B82F6",
  },
  success: {
    DEFAULT: "#10B981",
    50: "#ECFDF5",
    500: "#10B981",
    600: "#059669",
  },
  warning: {
    DEFAULT: "#F59E0B",
    50: "#FFFBEB",
    600: "#D97706",
  },
  danger: {
    DEFAULT: "#EF4444",
    50: "#FEF2F2",
    500: "#EF4444",
  },
  info: {
    DEFAULT: "#3B82F6",
    50: "#EFF6FF",
    500: "#3B82F6",
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
  pink: {
    500: "#EC4899",
  },
  white: "#FFFFFF",
  black: "#000000",
};

// 그라디언트 색상 조합
export const GRADIENTS = {
  tuitionHeader: ['#4ADE80', '#22D3EE', '#3B82F6'], // 수강료 헤더 그라디언트
  greenToCyan: [COLORS.success[500], COLORS.cyan.DEFAULT],
  primaryGradient: [COLORS.primary[500], COLORS.primary[600]],
};

// 템플릿 배경 색상
export const TEMPLATE_COLORS = {
  concert: COLORS.purple[100],      // 발표회 안내
  closure: COLORS.amber[100],       // 휴강 안내
  tuition: COLORS.sky[100],         // 수강료 안내
  custom: COLORS.red[100],          // 직접 입력
};

// 반투명 오버레이 색상
export const OVERLAY_COLORS = {
  whiteLight: 'rgba(255, 255, 255, 0.2)',
  whiteMedium: 'rgba(255, 255, 255, 0.5)',
  blackLight: 'rgba(0, 0, 0, 0.2)',
  blackMedium: 'rgba(0, 0, 0, 0.5)',
};

// 의미론적 색상
export const SEMANTIC_COLORS = {
  teacher: COLORS.primary.DEFAULT,
  parent: COLORS.pink[500],
  success: COLORS.success.DEFAULT,
  warning: COLORS.warning.DEFAULT,
  error: COLORS.danger.DEFAULT,
  paid: COLORS.success.DEFAULT,
  unpaid: COLORS.danger.DEFAULT,
};

// 그림자 색상
export const SHADOW_COLORS = {
  primary: COLORS.primary[600],
  black: COLORS.black,
};

export default COLORS;
