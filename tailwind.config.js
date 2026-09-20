/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hokie: {
          maroon: '#861F41',
          orange: '#E87722',
          maroondark: '#64132F',
          orangedark: '#C75D0E',
          cream: '#FFF9F5',
          gold: '#C59B27',
          gray: '#323a45',
        }
      }
    },
  },
  plugins: [],
}
