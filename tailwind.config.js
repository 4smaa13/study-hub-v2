/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        page: 'var(--color-page)',
        card: 'var(--color-card)',
        border: 'var(--color-border)',
        ink: 'var(--color-ink)',
        'ink-soft': 'var(--color-ink-soft)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        'accent-soft': 'var(--color-accent-soft)',
        'accent-ink': 'var(--color-accent-ink)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        arabic: ['Cairo', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}