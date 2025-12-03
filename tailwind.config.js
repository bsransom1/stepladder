/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
        'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'base': ['0.9375rem', { lineHeight: '1.625', letterSpacing: '0' }],
        'md': ['1rem', { lineHeight: '1.625', letterSpacing: '0' }],
        'lg': ['1.125rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'xl': ['1.25rem', { lineHeight: '1.375', letterSpacing: '0' }],
        '2xl': ['1.5rem', { lineHeight: '1.375', letterSpacing: '-0.025em' }],
        '3xl': ['1.875rem', { lineHeight: '1.375', letterSpacing: '-0.025em' }],
        '4xl': ['2.25rem', { lineHeight: '1.25', letterSpacing: '-0.025em' }],
        '5xl': ['3rem', { lineHeight: '1.25', letterSpacing: '-0.05em' }],
      },
      fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
      },
      lineHeight: {
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
      },
      colors: {
        // Semantic color tokens using CSS variables
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        card: {
          DEFAULT: 'var(--color-card)',
          foreground: 'var(--color-card-foreground)',
        },
        muted: {
          DEFAULT: 'var(--color-muted)',
          foreground: 'var(--color-muted-foreground)',
        },
        border: 'var(--color-border)',
        input: 'var(--color-input)',
        ring: 'var(--color-ring)',
        // Keep step colors for backward compatibility and specific use cases
        step: {
          bg: '#F5F5F7',
          surface: '#FFFFFF',
          border: '#E4E4E7',
          text: {
            main: '#111827',
            muted: '#6B7280',
          },
          // Dark mode colors
          dark: {
            bg: '#0F172A',
            surface: '#1E293B',
            border: '#334155',
            text: {
              main: '#F1F5F9',
              muted: '#94A3B8',
            },
          },
          primary: {
            50: '#F0FDF4',
            100: '#DCFCE7',
            200: '#BBF7D0',
            300: '#86EFAC',
            400: '#4ADE80',
            500: '#22C55E',
            600: '#16A34A',
            700: '#15803D',
            800: '#166534',
            900: '#14532D',
          },
          status: {
            success: {
              text: '#166534',
              textDark: '#86EFAC',
              bg: '#DCFCE7',
              bgDark: '#14532D',
            },
            warning: {
              text: '#B45309',
              textDark: '#FCD34D',
              bg: '#FEF3C7',
              bgDark: '#78350F',
            },
            danger: {
              text: '#B91C1C',
              textDark: '#F87171',
              bg: '#FEE2E2',
              bgDark: '#7F1D1D',
            },
            info: {
              text: '#0369A1',
              textDark: '#60A5FA',
              bg: '#E0F2FE',
              bgDark: '#0C4A6E',
            },
          },
        },
        // Keep primary as alias to step.primary for backward compatibility
        primary: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
      },
    },
  },
  plugins: [],
}

