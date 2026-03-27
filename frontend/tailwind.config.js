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
          DEFAULT: '#E11D48', // A modern rose/red similar to food delivery apps
          dark: '#BE123C',
          light: '#F43F5E'
        },
        dark: {
          bg: '#121212',
          surface: '#1E1E1E',
          border: '#333333'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
