/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors - Enhanced for light theme
        primary: {
          50: '#fce7f3',
          100: '#fbcfe8',
          200: '#f8a5d3',
          300: '#f472b6',
          400: '#ec4899',
          500: '#E91E63', // Main magenta neon
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
          // Light theme - INVERTED (Dark Blue instead of Dark Magenta)
          light: {
            50: '#dbeafe',
            100: '#bfdbfe',
            200: '#93c5fd',
            300: '#60a5fa',
            400: '#3b82f6',
            500: '#1E3A8A', // Dark Blue (opposite of magenta)
            600: '#1d4ed8',
            700: '#1e40af',
            800: '#1e3a8a',
            900: '#1e3a8a',
            950: '#172554',
          }
        },
        accent: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#00C9FF', // Electric blue
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
          // Light theme - INVERTED (Dark Red instead of Dark Blue)
          light: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#DC2626', // Dark Red (opposite of blue)
            600: '#dc2626',
            700: '#b91c1c',
            800: '#991b1b',
            900: '#7f1d1d',
            950: '#450a0a',
          }
        },
        highlight: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#9C27B0', // Purple glow
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
          // Light theme - INVERTED (Dark Green instead of Dark Purple)
          light: {
            50: '#ecfdf5',
            100: '#d1fae5',
            200: '#a7f3d0',
            300: '#6ee7b7',
            400: '#34d399',
            500: '#059669', // Dark Green (opposite of purple)
            600: '#059669',
            700: '#047857',
            800: '#065f46',
            900: '#064e3b',
            950: '#022c22',
          }
        },
        // Background Colors - Enhanced for light theme
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1E1E1E', // Card background
          900: '#0f172a',
          950: '#0D0D0D', // Deep background
          // Light theme - Neutral grays
          light: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
            950: '#020617',
          }
        },
        // Status Colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#4CAF50', // Success green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#FFC107', // Warning amber
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#F44336', // Error red
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        info: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#03A9F4', // Info cyan
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        // Neutral colors - Enhanced for light theme
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#B0B0B0', // Muted gray
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
          // Light theme - Neutral grays
          light: {
            50: '#fafafa',
            100: '#f5f5f5',
            200: '#e5e5e5',
            300: '#d4d4d4',
            400: '#a3a3a3',
            500: '#737373',
            600: '#525252',
            700: '#404040',
            800: '#262626',
            900: '#171717',
            950: '#0a0a0a',
          }
        },
        // New light theme specific colors - INVERTED SCHEME
        light: {
          primary: '#1E3A8A', // Dark Blue (opposite of magenta)
          accent: '#DC2626', // Dark Red (opposite of blue)
          highlight: '#059669', // Dark Green (opposite of purple)
          text: '#1A1A1A', // Very dark text for light theme
          textSecondary: '#404040', // Secondary dark text
          textMuted: '#656565', // Muted dark text
          background: '#FFFFFF', // Pure white background
          card: '#F8F9FA', // Light card background
          border: '#E1E5E9', // Light border
          shadow: '#000000', // Black shadow for light theme
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'fade-in-left': 'fadeInLeft 0.6s ease-out',
        'fade-in-right': 'fadeInRight 0.6s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        'bounce-in': 'bounceIn 0.8s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite alternate',
        'gradient-shift': 'gradientShift 3s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
        'neon-pulse': 'neonPulse 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%': { boxShadow: '0 0 20px rgba(233, 30, 99, 0.4)' },
          '100%': { boxShadow: '0 0 40px rgba(233, 30, 99, 0.8)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        neonPulse: {
          '0%': { 
            textShadow: '0 0 5px rgba(233, 30, 99, 0.5), 0 0 10px rgba(233, 30, 99, 0.3), 0 0 15px rgba(233, 30, 99, 0.2)',
            boxShadow: '0 0 5px rgba(233, 30, 99, 0.5)',
          },
          '100%': { 
            textShadow: '0 0 10px rgba(233, 30, 99, 0.8), 0 0 20px rgba(233, 30, 99, 0.6), 0 0 30px rgba(233, 30, 99, 0.4)',
            boxShadow: '0 0 20px rgba(233, 30, 99, 0.8)',
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'neon-gradient': 'linear-gradient(45deg, #E91E63, #00C9FF, #9C27B0)',
        'dark-gradient': 'linear-gradient(135deg, #0D0D0D 0%, #1E1E1E 100%)',
        'light-gradient': 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(233, 30, 99, 0.5)',
        'neon-lg': '0 0 40px rgba(233, 30, 99, 0.6)',
        'neon-xl': '0 0 60px rgba(233, 30, 99, 0.7)',
        'accent-neon': '0 0 20px rgba(0, 201, 255, 0.5)',
        'highlight-neon': '0 0 20px rgba(156, 39, 176, 0.5)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-light': '0 8px 32px 0 rgba(255, 255, 255, 0.1)',
      },
    },
  },
  plugins: [],
}
