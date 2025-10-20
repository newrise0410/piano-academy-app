// src/styles/auth_colors.js
// 인증 화면 전용 색상 시스템

const AUTH_COLORS = {
  primary: {
    DEFAULT: "#8B5CF6", // 보라색 - 메인 컬러
    50: "#F5F3FF",
    100: "#EDE9FE",
    500: "#8B5CF6",
    600: "#7C3AED",
  },
  secondary: {
    DEFAULT: "#EC4899", // 핑크색
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
  blue: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    500: "#3B82F6",
    600: "#2563EB",
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
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
  },
  white: "#FFFFFF",
  black: "#000000",
};

// 그라디언트 색상 조합 (인증 화면)
export const AUTH_GRADIENTS = {
  primaryGradient: [AUTH_COLORS.primary[500], AUTH_COLORS.primary[600]],
  purpleToPink: [AUTH_COLORS.primary[500], AUTH_COLORS.pink[500]],
  splashGradient: [AUTH_COLORS.primary[500], AUTH_COLORS.primary[600], AUTH_COLORS.pink[500]],
};

// 반투명 오버레이 색상
export const AUTH_OVERLAY_COLORS = {
  whiteLight: 'rgba(255, 255, 255, 0.2)',
  whiteMedium: 'rgba(255, 255, 255, 0.5)',
  blackLight: 'rgba(0, 0, 0, 0.2)',
  blackMedium: 'rgba(0, 0, 0, 0.5)',
};

// 의미론적 색상 (인증 화면)
export const AUTH_SEMANTIC_COLORS = {
  teacher: AUTH_COLORS.primary.DEFAULT,     // 선생님 역할
  parent: AUTH_COLORS.pink[500],            // 학부모 역할
  success: AUTH_COLORS.success.DEFAULT,
  warning: AUTH_COLORS.warning.DEFAULT,
  error: AUTH_COLORS.danger.DEFAULT,
};

// 그림자 색상
export const AUTH_SHADOW_COLORS = {
  primary: AUTH_COLORS.primary[600],
  black: AUTH_COLORS.black,
};

// 입력 필드 색상
export const AUTH_INPUT_COLORS = {
  border: AUTH_COLORS.gray[300],
  borderFocus: AUTH_COLORS.primary[500],
  background: AUTH_COLORS.white,
  placeholder: AUTH_COLORS.gray[400],
  text: AUTH_COLORS.gray[800],
};

export default AUTH_COLORS;
