/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        fontfamily: {
        sans: 'var(--font-family-dmsans)',
      },
      colors: {
        brand: "#1e40af", // exemplo: azul personalizado
      },
    },
  },
  plugins: [],
}