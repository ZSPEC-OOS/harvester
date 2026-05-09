/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#050816',
        // Legacy tokens kept for backward compat
        'neon-blue': '#22D3EE',
        'neon-purple': '#8B5CF6',
        // Research UI palette
        'r-surface': 'rgba(8,18,38,0.92)',
        'r-border':  'rgba(120,140,180,0.18)',
        'r-accent':  '#2155D6',
        'r-teal':    '#26BFA6',
        'r-text':    '#F3F6FB',
        'r-muted':   '#94A3B8',
        'r-dim':     '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        // Subtle outer blue glow for active CTAs
        'bloom': '0 0 28px rgba(33, 85, 214, 0.35)',
        // Card depth: blue ambient + deep shadow + top highlight handled inline
        'card': '0 1px 0 rgba(255,255,255,0.04) inset, 0 28px 72px rgba(0,0,0,0.55), 0 0 80px rgba(15,40,100,0.12)',
        // Restrained glow (legacy)
        'glow': '0 0 40px rgba(33, 85, 214, 0.10)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.5' },
          '50%':      { opacity: '0.85' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 4s ease-in-out infinite',
        shimmer:   'shimmer 2.4s linear infinite',
      },
    },
  },
  plugins: [],
};
