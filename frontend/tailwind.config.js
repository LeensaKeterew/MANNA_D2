/** @type {import('tailwindcss').Config} */
// MANNA design tokens (same values as the original D1 theme) exposed to Tailwind.
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  // Preflight stays off so the existing D1 page styles keep their exact look;
  // base resets for forms/fonts live in index.css (@layer base).
  corePlugins: { preflight: false },
  theme: {
    // Overrides Tailwind's default font stacks so no default Tailwind font is ever used.
    fontFamily: {
      heading: ["Playfair Display", "serif"],
      body: ["Nunito Sans", "sans-serif"],
      sans: ["Nunito Sans", "sans-serif"],
      serif: ["Playfair Display", "serif"],
      mono: ["Nunito Sans", "sans-serif"],
    },
    extend: {
      colors: {
        manna: {
          bg: "#EDD9C2",
          card: "#f3e7d0",
          input: "#F7E7D8",
          primary: "#7c2b28",
          "primary-dark": "#5e1f1d",
          text: "#3c2a20",
          muted: "#8a7460",
          border: "#ddc9a3",
          success: "#4a7c4e",
          green: "#3A4D20",
          gold: "#DFAC62",
        },
      },
      borderRadius: { pill: "999px", card: "18px" },
      boxShadow: { card: "0 2px 10px rgba(60, 42, 32, 0.08)" },
      maxWidth: { content: "700px" },
    },
  },
  plugins: [],
};
