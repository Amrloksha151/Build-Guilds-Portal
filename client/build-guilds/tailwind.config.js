/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        blueprint: {
          dark: 'rgb(var(--color-dark-rgb) / <alpha-value>)',
          darker: 'rgb(var(--color-darker-rgb) / <alpha-value>)',
          light: 'rgb(var(--color-light-rgb) / <alpha-value>)',
          danger: 'rgb(var(--color-danger-rgb) / <alpha-value>)',
          warning: 'rgb(var(--color-warning-rgb) / <alpha-value>)',
          success: 'rgb(var(--color-success-rgb) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Phantom Sans', 'sans-serif'],
        display: ['RC', 'sans-serif'],
        'display-dark': ['RC Dark', 'sans-serif'],
        'display-light': ['RC Light', 'sans-serif'],
        'display-empty': ['RC Empty', 'sans-serif'],
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(219, 228, 238, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(219, 228, 238, 0.12) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '32px 32px',
      },
    },
  },
  plugins: [],
}
