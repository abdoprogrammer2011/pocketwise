/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Inter carries the English UI; Tajawal is swapped in automatically for Arabic (see index.css).
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Tajawal', 'Cairo', 'system-ui', 'sans-serif'],
      },
      colors: {
        // "Money-growth" green as the primary brand color, evoking savings/growth rather than a generic blue.
        primary: {
          50: '#eefcf6',
          100: '#d3f8e6',
          200: '#a8f0d0',
          300: '#71e2b6',
          400: '#3fcb9a',
          500: '#1eaf80',
          600: '#128b67',
          700: '#0f6f55',
          800: '#0e5945',
          900: '#0d4a3a',
        },
        // Warm amber accent for "fun" spending & gamification highlights.
        accent: {
          300: '#ffd08a',
          400: '#ffb648',
          500: '#ff9f1c',
          600: '#e8850a',
          700: '#c26b03',
        },
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(15, 111, 85, 0.12)',
        glow: '0 0 0 4px rgba(30, 175, 128, 0.15)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.85)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        'fade-up': {
          '0%': { transform: 'translateY(8px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
      animation: {
        pop: 'pop 0.25s ease-out',
        'fade-up': 'fade-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
