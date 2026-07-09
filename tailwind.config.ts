import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#FF6900', dark: '#E45E00', light: '#FFF1E6' },
        surface: { DEFAULT: '#FFFFFF', soft: '#F9F8F8', muted: '#EBEBEB' },
        ink: '#0A0A0A',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-inter-tight)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
