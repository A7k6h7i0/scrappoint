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
        primary: {
          DEFAULT: '#0f766e',
          dark: '#115e59',
          light: '#5eead4',
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        secondary: {
          DEFAULT: '#3b82f6',
          dark: '#1d4ed8',
          light: '#93c5fd',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 20px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.03)',
        'premium-hover': '0 20px 60px rgba(15, 23, 42, 0.08), 0 4px 12px rgba(13, 148, 136, 0.06)',
        'premium-lg': '0 30px 80px rgba(15, 23, 42, 0.10)',
        'glow-accent': '0 8px 40px rgba(13, 148, 136, 0.18)',
        'glow-blue': '0 8px 40px rgba(59, 130, 246, 0.14)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      backgroundImage: {
        'hero-mesh':
          'radial-gradient(ellipse 80% 50% at 20% -10%, rgba(13,148,136,0.14), transparent 50%), radial-gradient(ellipse 60% 40% at 80% 0%, rgba(59,130,246,0.10), transparent 50%)',
        'gradient-accent': 'linear-gradient(135deg, #0f766e 0%, #3b82f6 100%)',
        'gradient-accent-soft': 'linear-gradient(135deg, rgba(13,148,136,0.08) 0%, rgba(59,130,246,0.06) 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float-delayed 7s ease-in-out infinite 1s',
        'shimmer': 'shimmer 1.8s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'spin-slow': 'spin-slow 12s linear infinite',
        'marquee': 'marquee 30s linear infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
