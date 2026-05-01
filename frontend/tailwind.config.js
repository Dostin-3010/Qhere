/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wine: {
          DEFAULT: '#6B1A2A',
          light: '#8B2236',
          dark: '#4A1020',
        },
        surface: '#FFFFFF',
        background: '#F5F5F5',
        dark: '#111111',
        mid: '#6B6B6B',
        border: '#E0E0E0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 16px rgba(0,0,0,0.07)',
        hover: '0 4px 24px rgba(107,26,42,0.12)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.5s ease-out both',
        fadeIn: 'fadeIn 0.4s ease-out both',
        scaleIn: 'scaleIn 0.4s ease-out both',
        'fadeUp-slow': 'fadeUp 0.6s ease-out 0.2s both',
        'fadeUp-slower': 'fadeUp 0.6s ease-out 0.35s both',
      },
    },
  },
  plugins: [],
}