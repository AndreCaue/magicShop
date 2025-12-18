/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        moveAcross: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100vw)" },
        },
      },
      animation: {
        "move-across": "moveAcross 5s linear infinite",
      },
      colors: {
        pureRed: "#FF0000",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"], // fonte global
        display: ["Poppins", "sans-serif"], // títulos de produto
      },
    },
  },
  plugins: [],
};
