/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        donut: {
          pink: '#FF69B4',
          brown: '#8B4513',
          cream: '#FFFDD0',
          glaze: '#FFF8DC',
        },
      },
    },
  },
  plugins: [],
};
