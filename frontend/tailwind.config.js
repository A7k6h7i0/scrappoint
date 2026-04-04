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
        },
        secondary: {
          DEFAULT: '#2563eb',
          dark: '#1d4ed8',
          light: '#93c5fd',
        },
        neutral: {
          950: '#0f172a',
          900: '#111827',
          800: '#1f2937',
          700: '#374151',
          600: '#4b5563',
          500: '#6b7280',
          200: '#e5e7eb',
          100: '#f3f4f6',
          50: '#f9fafb',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f8fafc',
          soft: '#f1f5f9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 24px 80px rgba(15, 23, 42, 0.12)',
        'premium-lg': '0 30px 100px rgba(15, 23, 42, 0.16)',
      },
      backgroundImage: {
        'hero-radial':
          'radial-gradient(circle at top left, rgba(20, 184, 166, 0.22), transparent 30%), radial-gradient(circle at top right, rgba(37, 99, 235, 0.16), transparent 26%), radial-gradient(circle at bottom, rgba(15, 23, 42, 0.06), transparent 42%)',
      },
    },
  },
  plugins: [],
}
