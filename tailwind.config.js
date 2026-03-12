/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          main: '#25b1a2',
          dark: '#1a7e73',
          light: 'rgba(37, 177, 162, 0.08)',
        },
        secondary: {
          main: 'rgb(227, 90, 117)',
          dark: 'rgb(197, 78, 101)',
          light: 'rgba(227, 90, 117, 0.1)',
        },
        tertiary: {
          main: '#171C38',
          light: 'rgba(23, 28, 56, 0.03)',
          text: '#171C38',
        },
      },
    },
  },
  plugins: [],
};
