/// <reference types="vitest" />
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api/stations': {
          target: 'https://de2.api.radio-browser.info',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/stations/, '/json/stations/search'),
        },
      },
    },
    plugins: [react()],
    // Aquí NO se declara la clave de Gemini. `define` sustituye el texto dentro
    // del código que se descarga el navegador, así que cualquier referencia a
    // process.env.GEMINI_API_KEY publicaría la clave en el JavaScript. La clave
    // solo se usa en las funciones de api/, que se ejecutan en el servidor y la
    // leen del entorno de Vercel.
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    },
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: './src/test/setup.ts',
    },
  };
});
