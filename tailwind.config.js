/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hextech-gold': '#C8AA6E',
        'hextech-blue': '#091428',
        'hextech-black': '#010A13',
      },
      fontFamily: {
        // You might want to add custom fonts here later
      },
    },
  },
  plugins: [],
}
