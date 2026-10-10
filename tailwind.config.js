/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          canvas: '#FAF8F5',
          card: '#FFFFFF',
          subtle: '#F4F0EA',
          border: '#E8E2D8',
          text: '#212529',
          muted: '#6C757D',
          primary: '#2D6A4F',
          darkgreen: '#1B4332',
          sage: '#52B788',
          emerald: '#10B981',
          lightgreen: '#D8F3DC',
          orange: '#E76F51',
          peach: '#F4A261',
          peachlight: '#FFF3EB'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'card': '0 4px 20px -2px rgba(45, 106, 79, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'floating': '0 12px 30px -4px rgba(45, 106, 79, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
