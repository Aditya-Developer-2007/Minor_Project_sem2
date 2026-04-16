/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        nyai: {
          bg: "#0A0A0A",
          panel: "#121212",
          accent: "#3B82F6", // Electric Blue
          purple: "#8B5CF6", // Royal Purple
          text: "#E5E5E5",
          muted: "#A3A3A3"
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Import Inter in index.css
      }
    },
  },
  plugins: [],
}