/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: '#00f3ff',
          pink: '#ff00ff',
          green: '#00ff88',
        },
      },
      fontFamily: {
        mono: ['"Roboto Mono"', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px #00f3ff, 0 0 40px #00f3ff, 0 0 60px #00f3ff',
        'neon-pink': '0 0 20px #ff00ff, 0 0 40px #ff00ff, 0 0 60px #ff00ff',
        'neon-green': '0 0 15px #00ff88, 0 0 30px #00ff88',
      },
      animation: {
        'pulse-neon': 'pulse-neon 1.5s ease-in-out infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px #00f3ff' },
          '50%': { opacity: '0.8', boxShadow: '0 0 40px #00f3ff' },
        },
      },
    },
  },
  plugins: [],
}
