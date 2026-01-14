/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark theme colors
        'dark-bg': '#0a0b0d',
        'dark-card': '#12141a',
        'dark-border': '#1e2128',
        
        // Neon accents
        'neon-green': '#00ff88',
        'neon-red': '#ff0055',
        'neon-blue': '#0088ff',
        'neon-purple': '#8800ff',
        
        // Trading colors
        'profit': '#00ff88',
        'loss': '#ff0055',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-cyber': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-profit': 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
        'gradient-loss': 'linear-gradient(135deg, #ff0055 0%, #cc0044 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #00ff88, 0 0 10px #00ff88' },
          '100%': { boxShadow: '0 0 20px #00ff88, 0 0 30px #00ff88' },
        },
      },
    },
  },
  plugins: [],
}
