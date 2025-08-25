/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.js",
    "./resources/**/*.vue",
  ],
  theme: {
    extend: {
      colors: {
        'sweetiz-green': '#8BC34A',
        'sweetiz-dark': '#2C3E50',
      }
    },
  },
  plugins: [],
}