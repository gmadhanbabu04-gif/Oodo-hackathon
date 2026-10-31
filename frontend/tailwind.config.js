/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        odoo: {
          purple: '#714B67',
          dark: '#5B3952',
          light: '#8E6082',
          teal: '#017E84',
          accent: '#F39C12'
        }
      }
    },
  },
  plugins: [],
}
