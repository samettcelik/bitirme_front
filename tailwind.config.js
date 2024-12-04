/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        greenLight: "#32CD32", // Açık yeşil
        greenMid: "#013309", // Koyu yeşil
        blackBg: "#000000", // Siyah
      },
      backgroundImage: {
        'sidebar-radial':
          "radial-gradient(circle at top left, #32CD32, #013309 27%, #000000 80%)", // Daha kısa geçiş
      },
      animation: {
        'glow-1': 'glow 8s ease-in-out infinite',
        'glow-2': 'glow 8s ease-in-out infinite 2s',
        'glow-3': 'glow 8s ease-in-out infinite 4s',
        'glow-4': 'glow 8s ease-in-out infinite 6s',
        'glow-random': 'glow 12s ease-in-out infinite',
        'glow-random-2': 'glow 12s ease-in-out infinite 3s',
        'glow-random-3': 'glow 12s ease-in-out infinite 6s',
        'glow-random-4': 'glow 12s ease-in-out infinite 9s',
      },
      keyframes: {
        glow: {
          '0%, 100%': { 
            borderColor: 'rgba(0, 0, 0, 0.2)',
            boxShadow: 'none'
          },
          '50%': { 
            borderColor: 'rgba(255, 255, 255, 0.8)',
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.8)'
          }
        }
      }
    },
  },
  plugins: [],
};