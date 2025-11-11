/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./sections/**/*.{js,jsx,ts,tsx}",
    "./pages-src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        prime: "#0062f1"
      }
    }
  },
  plugins: []
};

