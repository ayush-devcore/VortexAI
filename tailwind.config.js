/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './public/**/*.html',
    './public/**/*.js',
    './src/**/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        arctic: '#F9FAFB',
        electric: {
          DEFAULT: '#2563EB',
          light: '#DBEAFE',
          dark: '#1D4ED8',
        },
        emerald: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
          dark: '#059669',
        },
      },
    },
  },
  plugins: [],
};
