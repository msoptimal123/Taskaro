import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Type colors
        task: {
          DEFAULT: '#3B82F6',
          bg: '#EFF6FF',
          fg: '#1D4ED8',
        },
        deadline: {
          DEFAULT: '#D97706',
          bg: '#FEF3C7',
          fg: '#92400E',
        },
        rezervacija: {
          DEFAULT: '#7C3AED',
          bg: '#F5F3FF',
          fg: '#5B21B6',
        },
        // Brand
        accent: '#C2692A',
        done: '#9CA3AF',
        success: '#16A34A',
        // Surfaces
        bg: '#F7F4F0',
        card: '#FFFFFF',
        border: '#EDE9E2',
        border2: '#F0EDE8',
        // Text
        text: '#1A1714',
        muted: '#9B968F',
        muted2: '#6B6560',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-dm-serif)', 'serif'],
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '16px', letterSpacing: '0.08em' }],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.04)',
        'card-hover': '0 2px 8px rgba(0,0,0,0.08)',
        modal: '0 8px 32px rgba(0,0,0,0.18)',
        mic: '0 4px 20px rgba(0,0,0,0.24), 0 1px 4px rgba(0,0,0,0.12)',
      },
      keyframes: {
        'mic-idle-pulse': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.8' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '60%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'dot-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'mic-pulse': 'mic-idle-pulse 2.5s ease-in-out infinite',
        'pop-in': 'pop-in 0.3s ease-out forwards',
        'dot-bounce': 'dot-bounce 0.6s ease-in-out infinite',
        'fade-in': 'fade-in 0.2s ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;
