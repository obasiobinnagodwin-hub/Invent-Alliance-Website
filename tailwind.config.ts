import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        neon: {
          blue: '#00f0ff',
          cyan: '#00ffff',
          purple: '#a855f7',
          pink: '#ff00ff',
          green: '#00ff88',
          yellow: '#ffff00',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-neon': 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
        'gradient-neon-blue': 'linear-gradient(135deg, #00f0ff 0%, #0066ff 50%, #00f0ff 100%)',
        'gradient-neon-purple': 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #a855f7 100%)',
        'gradient-neon-cyan': 'linear-gradient(135deg, #00ffff 0%, #0066ff 50%, #00ffff 100%)',
      },
      boxShadow: {
        'neon-blue': '0 0 5px #00f0ff, 0 0 10px #00f0ff, 0 0 15px #00f0ff, 0 0 20px #00f0ff',
        'neon-purple': '0 0 5px #a855f7, 0 0 10px #a855f7, 0 0 15px #a855f7, 0 0 20px #a855f7',
        'neon-cyan': '0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff, 0 0 20px #00ffff',
        'neon-pink': '0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 15px #ff00ff, 0 0 20px #ff00ff',
        'neon-green': '0 0 5px #00ff88, 0 0 10px #00ff88, 0 0 15px #00ff88, 0 0 20px #00ff88',
      },
      animation: {
        'glow-blue': 'glow-blue 2s ease-in-out infinite alternate',
        'glow-purple': 'glow-purple 2s ease-in-out infinite alternate',
        'glow-cyan': 'glow-cyan 2s ease-in-out infinite alternate',
        'gradient': 'gradient 8s linear infinite',
      },
      keyframes: {
        'glow-blue': {
          '0%': { 'box-shadow': '0 0 5px #00f0ff, 0 0 10px #00f0ff, 0 0 15px #00f0ff' },
          '100%': { 'box-shadow': '0 0 10px #00f0ff, 0 0 20px #00f0ff, 0 0 30px #00f0ff, 0 0 40px #00f0ff' },
        },
        'glow-purple': {
          '0%': { 'box-shadow': '0 0 5px #a855f7, 0 0 10px #a855f7, 0 0 15px #a855f7' },
          '100%': { 'box-shadow': '0 0 10px #a855f7, 0 0 20px #a855f7, 0 0 30px #a855f7, 0 0 40px #a855f7' },
        },
        'glow-cyan': {
          '0%': { 'box-shadow': '0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff' },
          '100%': { 'box-shadow': '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff, 0 0 40px #00ffff' },
        },
        'gradient': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
      },
    },
  },
  plugins: [],
};
export default config;

