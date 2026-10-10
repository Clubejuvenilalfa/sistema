import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        dm: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        rosa: { DEFAULT: '#D5006D', dark: '#A00050', light: '#FFF0F6', muted: '#FFC8E4' },
        roxo: { DEFAULT: '#7B2FBE', dark: '#5A1A9A', light: '#F0E6FF' },
        laranja: { DEFAULT: '#F05A00', light: '#E8A000' },
        verde: { DEFAULT: '#8DC63F' },
        texto: { principal: '#2A0A1A', secundario: '#7A3558' },
      },
      borderRadius: {
        lg: '1rem',
        md: '0.75rem',
        sm: '0.5rem',
      },
    },
  },
  plugins: [animate],
};
