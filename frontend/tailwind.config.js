/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arena: {
          dark: '#0B0F19',
          card: '#151D2A',
          border: '#243044',
          accent: '#6366F1',
          crimson: '#E11D48', // Choice A / Red
          cobalt: '#2563EB',  // Choice B / Blue
          amber: '#D97706',   // Choice C / Yellow
          emerald: '#059669', // Choice D / Green
          violet: '#7C3AED',
          cyan: '#06B6D4'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif']
      },
      animation: {
        'bounce-short': 'bounce 0.8s infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s infinite ease-in-out'
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(99, 102, 241, 0.8)' }
        }
      }
    },
  },
  plugins: [],
}
