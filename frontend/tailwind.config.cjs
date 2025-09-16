/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx,css}'],
  theme: {
    extend: {
      backgroundImage: {
        'minecraft-hero': "url('/src/assets/minecraft-background.png')",
      },
      colors: {
        'overworld-bg': '#86C07A',
        'surface': '#FFFFFF',
        'accent': '#4DA3FF',
        'muted': '#1F2937',
        'highlight': '#F6C85F',
      }
    },
  },
  plugins: [],
}
