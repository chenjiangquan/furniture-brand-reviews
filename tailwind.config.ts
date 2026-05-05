import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#171744",
        muted: "#66657b",
        line: "#e3dff0",
        trust: "#8b5b91",
        "trust-dark": "#5d3469",
        wash: "#faf7ff"
      },
      boxShadow: {
        card: "0 10px 30px rgba(23, 23, 68, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
