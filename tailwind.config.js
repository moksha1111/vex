/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        void: '#08070f',
        deep: '#0d0b1a',
        nebula: '#1a1530',
        rim: '#2a2348',
        cream: '#f7f3e8',
        ash: '#a8a3b8',
        flare: '#ff2e88',
        plasma: '#1ee9ff',
        lime: '#c4ff3d',
        gold: '#ffd166',
      },
      letterSpacing: {
        tightest: '-0.055em',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translate3d(0,0,0)' },
          to: { transform: 'translate3d(-50%,0,0)' },
        },
        marqueeRev: {
          from: { transform: 'translate3d(-50%,0,0)' },
          to: { transform: 'translate3d(0,0,0)' },
        },
        floatY: {
          '0%,100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-8px,0)' },
        },
        pulseDot: {
          '0%,100%': { opacity: '0.35' },
          '50%': { opacity: '1' },
        },
        spinSlow: {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        marqueeFast: 'marquee 14s linear infinite',
        marqueeRev: 'marqueeRev 24s linear infinite',
        floatY: 'floatY 4s ease-in-out infinite',
        pulseDot: 'pulseDot 1.6s ease-in-out infinite',
        spinSlow: 'spinSlow 22s linear infinite',
      },
    },
  },
  plugins: [],
};
