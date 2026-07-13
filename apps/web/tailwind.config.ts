import type { Config } from "tailwindcss";

// The whole visual identity (Parts 1-3 of the spec) lives here as tokens,
// so no component ever hardcodes a color, radius, or easing curve directly.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          0: "#08090b", // page background — near-black, not pure black
          1: "#0e0f13", // dark graphite — section backgrounds
          2: "#15171d", // card surface
          3: "#1b1e26", // hover / elevated surface
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.08)",
          strong: "rgba(255,255,255,0.16)",
        },
        accent: {
          DEFAULT: "#3d6bff", // the ONE accent color — electric blue
          bright: "#6f95ff",
          dim: "rgba(61,107,255,0.12)",
        },
        text: {
          primary: "#f2f3f5",
          secondary: "#a1a5ad",
          tertiary: "#6b7078",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      borderRadius: {
        sm: "10px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
      spacing: {
        18: "72px",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      boxShadow: {
        glow: "0 8px 22px -8px rgba(61,107,255,0.35)",
      },
      keyframes: {
        driftOne: { from: { transform: "translate(0,0)" }, to: { transform: "translate(70px,40px)" } },
        driftTwo: { from: { transform: "translate(0,0)" }, to: { transform: "translate(-60px,60px)" } },
        driftThree: { from: { transform: "translate(0,0)" }, to: { transform: "translate(50px,-40px)" } },
        fadeUp: { from: { opacity: "0", transform: "translateY(24px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        "drift-1": "driftOne 26s ease-in-out infinite alternate",
        "drift-2": "driftTwo 32s ease-in-out infinite alternate",
        "drift-3": "driftThree 24s ease-in-out infinite alternate",
        "fade-up": "fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
