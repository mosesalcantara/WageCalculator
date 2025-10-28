/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: { primary: "#acb6e2ff" },
      fontFamily: {
        r: "Geist_400Regular",
        sb: "Geist_600SemiBold",
        b: "Geist_700Bold",
      },
    },
  },
  plugins: [],
};
