/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    // Sin esquinas redondeadas y sin sombras en todo el sistema.
    // Cualquier `rounded-*` o `shadow-*` heredado se resuelve a cero.
    borderRadius: {
      none: '0',
      DEFAULT: '0',
      sm: '0',
      md: '0',
      lg: '0',
      xl: '0',
      '2xl': '0',
      '3xl': '0',
      full: '0',
    },
    boxShadow: {
      none: 'none',
      DEFAULT: 'none',
      sm: 'none',
      md: 'none',
      lg: 'none',
      xl: 'none',
      '2xl': 'none',
      inner: 'none',
    },
    extend: {
      colors: {
        ink: '#000000',
        paper: '#E9E6DF',
        meta: '#6B6862',
        'meta-dark': '#8C8880',
        // La señal es el único color de la interfaz: marca lo que suena.
        // El DJ IA puede reasignarla en tiempo de ejecución vía --signal.
        signal: 'rgb(var(--signal) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"Archivo"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      animation: {
        'sound-wave': 'soundWave 1.1s ease-in-out infinite',
        'signal-blink': 'signalBlink 1.6s steps(1, end) infinite',
      },
      keyframes: {
        soundWave: {
          '0%, 100%': { height: '15%' },
          '50%': { height: '100%' },
        },
        signalBlink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0.15' },
        },
      },
    },
  },
  plugins: [],
};
