/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'neumorphism': '20px 20px 60px #bebebe, -20px -20px 60px #ffffff',
        'inner-neumorphism': 'inset 5px 5px 10px #bebebe, inset -5px -5px 10px #ffffff',
      }
    },
  },
  plugins: [],
}