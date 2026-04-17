/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ff6f01",
        secondary: "#dc6640",
        danger: "#fb2f28",
        dark: "#2e2c2a",
        container: "#2a2929",
        bg: "#f3efea",
        muted: "#454440",
      },

      // 🔥 FONT SYSTEM (PROFESSIONAL)
      fontFamily: {
        sans: ['Inter', 'sans-serif'],          // body text
        serif: ['Playfair Display', 'serif'],   // headings
      },

      borderRadius: {
        xl: '1rem',
      },

      spacing: {
        '4': '1rem',
        '6': '1.5rem',
        '8': '2rem',
      },
    },
  },
  plugins: [],
}
