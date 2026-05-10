import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        ds: {
          bg: "#050816",
          card: "#0B1120",
          border: "rgba(120,140,180,0.14)",
          primary: "#2155D6",
          accent: "#26BFA6",
          text: "#F3F6FD",
          muted: "#64748B",
          success: "#5DD3C2",
          warning: "#FBBF24",
          error: "#FCA5A5",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #2155D6 0%, #26BFA6 100%)",
      },
      boxShadow: {
        glow: "0 6px 28px rgba(33,85,214,0.38), inset 0 1px 0 rgba(255,255,255,0.10)",
        "glow-sm": "0 0 0 1px rgba(38,191,166,0.2)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
