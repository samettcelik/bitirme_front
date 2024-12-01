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
      }
    },
  },
  plugins: [],
};