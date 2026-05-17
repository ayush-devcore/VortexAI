/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.html",
    "./public/**/*.js",
    "./src/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        arctic: {
          blue: '#2563EB',
          green: '#10B981',
          white: '#F9FAFB',
        }
      }
    },
  },
  plugins: [],
}
