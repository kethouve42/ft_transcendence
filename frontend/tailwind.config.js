/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Cherche les classes Tailwind dans tous ces fichiers
  ],
  darkMode: 'class', // ou 'media' ou false, à toi de choisir
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
