/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gym: {
          black: '#0d0e10',
          surface: '#141518',
          'surface-hover': '#1c1e22',
          border: '#23252a',
          'border-subtle': 'rgba(255, 255, 255, 0.08)',
          lime: '#ccff00',
          'lime-hover': '#b8e600',
          'lime-dark': '#88aa00',
          primary: '#f5f6f8',
          secondary: '#9aa0ac',
          muted: '#676c78',
          danger: '#ef4444',
          warning: '#f59e0b',
          success: '#10b981',
          accent: '#ccff00',
        }
      },
      fontFamily: {
        heading: ['"Barlow Condensed"', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        xs: '2px',
        sm: '3px',
      },
      boxShadow: {
        'lime-glow': '0 0 25px rgba(204, 255, 0, 0.25)',
        'lime-glow-lg': '0 0 50px rgba(204, 255, 0, 0.35)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
