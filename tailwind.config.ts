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
        // Theme A: Special-Ops / Dark
        ops: {
          bg: '#0a0a0a',
          surface: '#111111',
          border: '#1a1a1a',
          accent: '#00ff88',
          text: '#e5e5e5',
          muted: '#666666',
        },
        // Theme B: Advisory / Light
        advisory: {
          bg: '#fafafa',
          surface: '#ffffff',
          border: '#e5e5e5',
          accent: '#0066cc',
          text: '#1a1a1a',
          muted: '#666666',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      animation: {
        'scanline': 'scanline 8s linear infinite',
        'grid-pulse': 'grid-pulse 4s ease-in-out infinite',
      },
      keyframes: {
        scanline: {
          '0%, 100%': { transform: 'translateY(-100%)' },
          '50%': { transform: 'translateY(100%)' },
        },
        'grid-pulse': {
          '0%, 100%': { opacity: '0.1' },
          '50%': { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
