/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff8ff',
          100: '#daedff',
          200: '#bddfff',
          300: '#8fcbff',
          400: '#58adff',
          500: '#2f8bff',
          600: '#176bf5',
          700: '#1256dd',
          800: '#1547b0',
          900: '#173f8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 20px -4px rgba(23, 66, 181, 0.12)',
      },
    },
  },
  plugins: [],
};
