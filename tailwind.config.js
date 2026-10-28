/** @type {import('tailwindcss').Config} */

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        ink: {
          950: '#050807',
          900: '#070b0a',
          850: '#0a100d',
          800: '#0e1613',
          700: '#16211c',
        },
        mint: {
          200: '#c8f7e4',
          300: '#7df0c4',
          400: '#4ce0a8',
          500: '#2ec98f',
          600: '#17a574',
          700: '#0d7a55',
        },
        gold: {
          300: '#f7ddb0',
          400: '#f2c777',
          500: '#e0a94e',
        },
      },
      fontFamily: {
        display: ['Outfit Variable', 'Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Manrope Variable', 'Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 18px 50px -12px rgba(76, 224, 168, 0.45)',
        card: '0 24px 60px -30px rgba(0, 0, 0, 0.9)',
        insetline: 'inset 0 1px 0 rgba(255, 255, 255, 0.14)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
