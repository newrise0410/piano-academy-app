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
    600: "#059669",
  },
  warning: {
    DEFAULT: "#F59E0B",
    600: "#D97706",
  },
  danger: {
    DEFAULT: "#EF4444",
  },
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
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

export const SEMANTIC_COLORS = {
  teacher: COLORS.primary.DEFAULT,
  parent: "#EC4899",
  success: COLORS.success.DEFAULT,
  warning: COLORS.warning.DEFAULT,
  error: COLORS.danger.DEFAULT,
  paid: COLORS.success.DEFAULT,
  unpaid: COLORS.danger.DEFAULT,
};

export default COLORS;
