/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: { 50: '#f4f7f5', 100: '#e3ebe6', 400: '#7fa896', 500: '#5b8d7a', 600: '#476f60' },
        coral: { 100: '#fbe2d8', 400: '#f08a6c', 500: '#ec7150', 600: '#d65a39' },
        cream: '#faf7f2'
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem'
      }
    }
  },
  plugins: []
};