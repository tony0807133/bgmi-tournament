/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#f97316',
        surface: {
          DEFAULT: '#0a0a0f',
          1: '#111118',
          2: '#16161f',
          3: '#1c1c28',
        }
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(249,115,22,0.15), transparent)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    }
  },
  plugins: []
};
