import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "pastel-grid": "#9BBED5",
        "traffic-red": "#FF5F56",
        "traffic-yellow": "#FFBD2E",
        "traffic-green": "#27C93F",
        "macos-blue": "#007AFF",
        "macos-gray": "#8E8E93",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          '"SF Pro Display"',
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
      },
      backdropBlur: {
        xs: "2px",
        glass: "20px",
        "glass-heavy": "40px",
      },
      boxShadow: {
        window: "0 22px 70px 4px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.15) inset",
        "window-light": "0 20px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5) inset",
        dock: "0 10px 30px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2) inset",
      },
    },
  },
  plugins: [],
};

export default config;
