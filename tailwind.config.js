/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['MaruBuri-Regular', 'sans-serif'],
        'maru': ['MaruBuri-Regular', 'sans-serif'],
        'maru-light': ['MaruBuri-Light', 'sans-serif'],
        'maru-extralight': ['MaruBuri-ExtraLight', 'sans-serif'],
        'maru-semibold': ['MaruBuri-SemiBold', 'sans-serif'],
        'maru-bold': ['MaruBuri-Bold', 'sans-serif'],
      },
      fontWeight: {
        'thin': '200',
        'extralight': '200',
        'light': '300',
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
        'extrabold': '700',
        'black': '700',
      },
      colors: {
        primary: {
          DEFAULT: '#8B5CF6',
          50: '#F5F3FF',
          100: '#EDE9FE',
          500: '#8B5CF6',
          600: '#7C3AED',
        },
        secondary: {
          DEFAULT: '#3B82F6',
          500: '#3B82F6',
        },
        pink: {
          DEFAULT: '#EC4899',
          500: '#EC4899',
        },
        success: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          DEFAULT: '#F59E0B',
          50: '#FFFBEB',
          500: '#F59E0B',
          600: '#D97706',
        },
        danger: {
          DEFAULT: '#EF4444',
          50: '#FEF2F2',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
    },
  },
  plugins: [],
}