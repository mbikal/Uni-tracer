/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette
        navy: {
          900: '#0B1120',
          800: '#0F172A',
          700: '#1E293B',
          600: '#334155',
        },
        cyan: {
          400: '#00E5FF',
          500: '#00B8D4',
          600: '#0097A7',
        },
        warm: {
          white: '#FAFAFA',
          gray: '#E5E5E5',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'ticker': 'ticker 30s linear infinite',
        'pulse-red': 'pulse-red 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pulse-red': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      backgroundImage: {
        'gradient-card': 'linear-gradient(135deg, rgba(0, 229, 255, 0.1) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
}
