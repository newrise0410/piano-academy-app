// src/styles/parent_colors.js
// 학부모 앱 전용 색상 시스템

const PARENT_COLORS = {
  // 메인 컬러 - 핑크색
  primary: {
    DEFAULT: "#EC4899",
    50: "#FDF2F8",
    100: "#FCE7F3",
    200: "#FBCFE8",
    300: "#F9A8D4",
    400: "#F472B6",
    500: "#EC4899",
    600: "#DB2777",
    700: "#BE185D",
    800: "#9D174D",
    900: "#831843",
  },

  // 세컨더리 컬러 - 보라색
  secondary: {
    DEFAULT: "#8B5CF6",
    50: "#F5F3FF",
    100: "#EDE9FE",
    200: "#DDD6FE",
    300: "#C4B5FD",
    400: "#A78BFA",
    500: "#8B5CF6",
    600: "#7C3AED",
    700: "#6D28D9",
    800: "#5B21B6",
    900: "#4C1D95",
  },

  // 성공 - 초록색
  success: {
    DEFAULT: "#10B981",
    50: "#ECFDF5",
    100: "#D1FAE5",
    200: "#A7F3D0",
    300: "#6EE7B7",
    400: "#34D399",
    500: "#10B981",
    600: "#059669",
    700: "#047857",
    800: "#065F46",
    900: "#064E3B",
  },

  // 경고 - 노란색
  warning: {
    DEFAULT: "#F59E0B",
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#F59E0B",
    600: "#D97706",
    700: "#B45309",
    800: "#92400E",
    900: "#78350F",
  },

  // 위험 - 빨간색
  danger: {
    DEFAULT: "#EF4444",
    50: "#FEF2F2",
    100: "#FEE2E2",
    200: "#FECACA",
    300: "#FCA5A5",
    400: "#F87171",
    500: "#EF4444",
    600: "#DC2626",
    700: "#B91C1C",
    800: "#991B1B",
    900: "#7F1D1D",
  },

  // 추가 색상 팔레트
  orange: {
    50: "#FFF7ED",
    100: "#FFEDD5",
    200: "#FED7AA",
    300: "#FDBA74",
    400: "#FB923C",
    500: "#F97316",
    600: "#EA580C",
    700: "#C2410C",
    800: "#9A3412",
    900: "#7C2D12",
  },

  green: {
    50: "#ECFDF5",
    100: "#D1FAE5",
    200: "#BBF7D0",
    300: "#86EFAC",
    400: "#4ADE80",
    500: "#22C55E",
    600: "#16A34A",
    700: "#15803D",
    800: "#166534",
    900: "#14532D",
  },

  blue: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#3B82F6",
    600: "#2563EB",
    700: "#1D4ED8",
    800: "#1E40AF",
    900: "#1E3A8A",
  },

  cyan: {
    DEFAULT: "#22D3EE",
    50: "#ECFEFF",
    100: "#CFFAFE",
    200: "#A5F3FC",
    300: "#67E8F9",
    400: "#22D3EE",
    500: "#06B6D4",
    600: "#0891B2",
    700: "#0E7490",
    800: "#155E75",
    900: "#164E63",
  },

  purple: {
    50: "#FAF5FF",
    100: "#E9D5FF",
    200: "#DDD6FE",
    300: "#C4B5FD",
    400: "#A78BFA",
    500: "#A855F7",
    600: "#8B5CF6",
    700: "#7C3AED",
    800: "#6D28D9",
    900: "#5B21B6",
  },

  pink: {
    50: "#FDF2F8",
    100: "#FCE7F3",
    200: "#FBCFE8",
    300: "#F9A8D4",
    400: "#F472B6",
    500: "#EC4899",
    600: "#DB2777",
    700: "#BE185D",
    800: "#9D174D",
    900: "#831843",
  },

  amber: {
    50: "#FFFBEB",
    100: "#FED7AA",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#F59E0B",
    600: "#D97706",
    700: "#B45309",
    800: "#92400E",
    900: "#78350F",
  },

  // Gray 스케일
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
    900: "#111827",
  },

  // 기본 색상
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
};

// 그라디언트 색상 조합 (학부모 앱)
export const PARENT_GRADIENTS = {
  // 메인 그라디언트
  primary: [PARENT_COLORS.primary[400], PARENT_COLORS.primary[600]],
  primarySubtle: [PARENT_COLORS.primary[50], PARENT_COLORS.primary[100]],

  // 세컨더리 그라디언트
  secondary: [PARENT_COLORS.secondary[400], PARENT_COLORS.secondary[600]],

  // 성공 그라디언트
  success: [PARENT_COLORS.success[400], PARENT_COLORS.success[600]],
  successSubtle: [PARENT_COLORS.success[50], PARENT_COLORS.success[100]],

  // 경고/위험 그라디언트
  warning: [PARENT_COLORS.warning[400], PARENT_COLORS.warning[600]],
  danger: [PARENT_COLORS.danger[400], PARENT_COLORS.danger[600]],

  // 특수 그라디언트
  pinkToPurple: [PARENT_COLORS.primary[500], PARENT_COLORS.purple[500]],
  pinkToOrange: [PARENT_COLORS.primary[400], PARENT_COLORS.orange[400]],
  successGradient: [PARENT_COLORS.success[400], PARENT_COLORS.cyan[400]],
  sunset: [PARENT_COLORS.orange[400], PARENT_COLORS.danger[400]],
  ocean: [PARENT_COLORS.blue[400], PARENT_COLORS.cyan[400]],
  spring: [PARENT_COLORS.green[400], PARENT_COLORS.cyan[400]],
};

// 반투명 오버레이 색상
export const PARENT_OVERLAY_COLORS = {
  whiteLight: 'rgba(255, 255, 255, 0.1)',
  whiteMedium: 'rgba(255, 255, 255, 0.3)',
  whiteHeavy: 'rgba(255, 255, 255, 0.5)',
  whiteAlmost: 'rgba(255, 255, 255, 0.9)',

  blackLight: 'rgba(0, 0, 0, 0.1)',
  blackMedium: 'rgba(0, 0, 0, 0.3)',
  blackHeavy: 'rgba(0, 0, 0, 0.5)',
  blackAlmost: 'rgba(0, 0, 0, 0.9)',

  primaryLight: 'rgba(236, 72, 153, 0.1)',
  primaryMedium: 'rgba(236, 72, 153, 0.3)',
};

// 의미론적 색상 (학부모 앱)
export const PARENT_SEMANTIC_COLORS = {
  // 상태 색상
  success: PARENT_COLORS.success.DEFAULT,
  warning: PARENT_COLORS.warning.DEFAULT,
  error: PARENT_COLORS.danger.DEFAULT,
  info: PARENT_COLORS.secondary.DEFAULT,

  // 납부 상태
  paid: PARENT_COLORS.success[500],          // 납부 완료
  unpaid: PARENT_COLORS.danger[500],         // 미납
  partial: PARENT_COLORS.warning[500],       // 부분 납부

  // 출석 상태
  present: PARENT_COLORS.success[500],       // 출석
  absent: PARENT_COLORS.danger[500],         // 결석
  late: PARENT_COLORS.warning[500],          // 지각
  excused: PARENT_COLORS.gray[400],          // 조퇴

  // UI 요소
  active: PARENT_COLORS.primary[500],
  inactive: PARENT_COLORS.gray[400],
  disabled: PARENT_COLORS.gray[300],

  // 텍스트 색상
  textPrimary: PARENT_COLORS.gray[900],
  textSecondary: PARENT_COLORS.gray[600],
  textTertiary: PARENT_COLORS.gray[500],
  textDisabled: PARENT_COLORS.gray[400],
  textInverse: PARENT_COLORS.white,

  // 배경 색상
  bgPrimary: PARENT_COLORS.white,
  bgSecondary: PARENT_COLORS.gray[50],
  bgTertiary: PARENT_COLORS.gray[100],

  // Border 색상
  border: PARENT_COLORS.gray[200],
  borderFocus: PARENT_COLORS.primary[500],
  borderError: PARENT_COLORS.danger[500],
};

// 그림자 색상
export const PARENT_SHADOW_COLORS = {
  primary: PARENT_COLORS.primary[600],
  secondary: PARENT_COLORS.secondary[600],
  success: PARENT_COLORS.success[600],
  warning: PARENT_COLORS.warning[600],
  danger: PARENT_COLORS.danger[600],
  black: PARENT_COLORS.black,
  gray: PARENT_COLORS.gray[400],
};

export default PARENT_COLORS;
