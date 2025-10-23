// src/styles/commonStyles.js
// 앱 전체에서 사용하는 공통 스타일 유틸리티

/**
 * 그림자 스타일
 * elevation은 Android, shadow는 iOS
 */
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  // 가벼운 그림자 - 작은 요소, 아이콘 버튼 등
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // 기본 그림자 - 카드, 버튼 등
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  // 중간 그림자 - 중요한 카드, 모달 등
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },

  // 강한 그림자 - 플로팅 요소, 중요 모달
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },

  // 컬러 그림자 - 강조 요소
  colored: (color, opacity = 0.3) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: opacity,
    shadowRadius: 12,
    elevation: 6,
  }),
};

/**
 * Border Radius
 */
export const RADIUS = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  full: 9999,
};

/**
 * Spacing
 */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

/**
 * Typography
 */
export const TYPOGRAPHY = {
  // 폰트 크기
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
    '6xl': 36,
  },

  // 폰트 무게
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // 행 간격
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

/**
 * 카드 스타일
 */
export const CARD_STYLES = {
  // 기본 카드
  default: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS['3xl'],
    padding: SPACING.lg,
    ...SHADOWS.md,
  },

  // 작은 카드
  small: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS['2xl'],
    padding: SPACING.md,
    ...SHADOWS.sm,
  },

  // 큰 카드 (강조)
  large: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS['3xl'],
    padding: SPACING.xl,
    ...SHADOWS.lg,
  },

  // 플랫 카드 (그림자 없음)
  flat: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS['3xl'],
    padding: SPACING.lg,
    ...SHADOWS.none,
  },

  // 섹션 카드 (배경색 없음)
  section: {
    backgroundColor: '#F9FAFB',
    borderRadius: RADIUS['2xl'],
    padding: SPACING.md,
    ...SHADOWS.none,
  },
};

/**
 * 버튼 스타일
 */
export const BUTTON_STYLES = {
  // Primary 버튼
  primary: (color) => ({
    backgroundColor: color,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    ...SHADOWS.md,
  }),

  // Secondary 버튼 (아웃라인)
  secondary: (color) => ({
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: color,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  }),

  // Ghost 버튼 (배경 없음)
  ghost: {
    backgroundColor: 'transparent',
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },

  // 작은 버튼
  small: (color) => ({
    backgroundColor: color,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.sm,
  }),

  // 아이콘 버튼
  icon: (size = 40) => ({
    width: size,
    height: size,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  }),

  // Fab 버튼 (플로팅)
  fab: (color) => ({
    position: 'absolute',
    bottom: SPACING['3xl'],
    right: SPACING.xl,
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    backgroundColor: color,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.xl,
  }),
};

/**
 * 아이콘 컨테이너 스타일
 */
export const ICON_CONTAINER = {
  // 작은 아이콘
  sm: (backgroundColor) => ({
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  }),

  // 기본 아이콘
  md: (backgroundColor) => ({
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  }),

  // 큰 아이콘
  lg: (backgroundColor) => ({
    width: 48,
    height: 48,
    borderRadius: RADIUS.xl,
    backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  }),

  // 원형 아이콘
  round: (backgroundColor, size = 40) => ({
    width: size,
    height: size,
    borderRadius: RADIUS.full,
    backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  }),
};

/**
 * 배지 스타일
 */
export const BADGE_STYLES = {
  default: (backgroundColor, textColor = '#FFFFFF') => ({
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    backgroundColor,
  }),

  dot: (backgroundColor) => ({
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor,
  }),
};

/**
 * Input 스타일
 */
export const INPUT_STYLES = {
  default: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  focused: (color) => ({
    borderColor: color,
    borderWidth: 2,
    ...SHADOWS.sm,
  }),

  error: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
};

/**
 * Divider 스타일
 */
export const DIVIDER = {
  horizontal: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },

  vertical: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
};

/**
 * 애니메이션 Duration
 */
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 250,
  slow: 350,
};

/**
 * Container 스타일
 */
export const CONTAINER = {
  screen: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  content: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },

  section: {
    marginBottom: SPACING.lg,
  },
};

export default {
  SHADOWS,
  RADIUS,
  SPACING,
  TYPOGRAPHY,
  CARD_STYLES,
  BUTTON_STYLES,
  ICON_CONTAINER,
  BADGE_STYLES,
  INPUT_STYLES,
  DIVIDER,
  ANIMATION_DURATION,
  CONTAINER,
};
