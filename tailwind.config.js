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
        almond: 'var(--color-almond)',
        border: 'var(--color-border)',
        ink: 'var(--color-ink)',
        'ink-soft': 'var(--color-ink-soft)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        'accent-soft': 'var(--color-accent-soft)',
        'accent-ink': 'var(--color-accent-ink)',
        sage: 'var(--color-sage)',
        'sage-soft': 'var(--color-sage-soft)',
        honey: 'var(--color-honey)',
      },
      fontFamily: {
        sans: ['Karla', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
        arabic: ['Cairo', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(74,55,40,0.04), 0 8px 24px rgba(74,55,40,0.08)',
      },
    },
  },
  plugins: [],
}