import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/features/**/*.{ts,tsx}',
    './src/shared/**/*.{ts,tsx}',
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── MERKURE void palette ──────────────────────────────────
        void: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          900: '#030712',
          950: '#010408',
        },
        surface: {
          1: 'rgba(255,255,255,0.02)',
          2: 'rgba(255,255,255,0.04)',
          3: 'rgba(255,255,255,0.07)',
        },
        // ── Accent cyan (primary brand) ───────────────────────────
        cyan: {
          DEFAULT: '#00d4ff',
          400: '#38e8ff',
          500: '#00d4ff',
          600: '#00aacc',
        },
        // ── Profit / Loss ─────────────────────────────────────────
        profit: '#4ade80',
        loss:   '#f87171',
        // ── Gold premium ──────────────────────────────────────────
        gold: '#fbbf24',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'grid-void': 'linear-gradient(rgba(0,212,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.05) 1px, transparent 1px)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      backgroundSize: {
        'grid-60': '60px 60px',
        'grid-80': '80px 80px',
      },
      boxShadow: {
        'glow-cyan':   '0 0 40px rgba(0, 212, 255, 0.15)',
        'glow-cyan-lg':'0 0 80px rgba(0, 212, 255, 0.2)',
        'glow-green':  '0 0 40px rgba(74, 222, 128, 0.15)',
        'glow-gold':   '0 0 40px rgba(251, 191, 36, 0.2)',
        'card':        '0 0 0 1px rgba(255,255,255,0.06), 0 2px 32px rgba(0,0,0,0.4)',
        'card-hover':  '0 0 0 1px rgba(0,212,255,0.2), 0 4px 48px rgba(0,0,0,0.5)',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
        'border-spin': {
          '100%': { transform: 'rotate(360deg)' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        shimmer:      'shimmer 3s linear infinite',
        float:        'float 4s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'border-spin':'border-spin 4s linear infinite',
        'slide-up':   'slide-up 0.5s ease-out',
        'fade-in':    'fade-in 0.4s ease-out',
        ticker:       'ticker 30s linear infinite',
      },
    },
  },
  plugins: [forms],
}

export default config
