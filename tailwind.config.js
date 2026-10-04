/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pehnawa: {
          'warm-ivory': '#F9F7F2',
          'cream': '#F3EEE5',
          'forest-green': '#1C4A2D',
          'dark-green': '#173D2A',
          'burgundy': '#5C1D24',
          'warm-gold': '#C49A6C',
          'charcoal': '#2B2B2B',
          'muted-beige': '#D8D0C4',
        }
      }
    },
  },
  plugins: [],
}
