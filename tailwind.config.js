/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#1E1E1E',
          teal: '#3E8E7E',
          light: '#F2F2F2',
        }
      }
    },
  },
  plugins: [],
}
