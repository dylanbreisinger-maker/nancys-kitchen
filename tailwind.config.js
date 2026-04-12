/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#fdf6e3',
        'warm-white': '#fff8ef',
        sage: {
          DEFAULT: '#4a6741',
          light: '#a8c5a0',
          muted: '#e8f0e8',
          dark: '#2d4a2d',
        },
        orange: {
          DEFAULT: '#c96b2a',
          light: '#f5e0cc',
          muted: '#fdf0e6',
          warm: '#e8874a',
        },
        brown: {
          dark: '#3a2f1e',
          medium: '#7a5c3f',
          light: '#c4a882',
        },
        cardinal: '#c0392b',
      },
      fontFamily: {
        playfair: ['Playfair Display', 'Georgia', 'serif'],
        dancing: ['Dancing Script', 'cursive'],
        lato: ['Lato', 'sans-serif'],
      },
      backgroundImage: {
        'paper-texture': "url('/paper-texture.png')",
      },
      boxShadow: {
        recipe: '0 4px 20px rgba(58, 47, 30, 0.12)',
        'recipe-hover': '0 8px 30px rgba(58, 47, 30, 0.18)',
      },
    },
  },
  plugins: [],
};
