import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@layout': path.resolve(__dirname, './src/components/layout'),
      '@api': path.resolve(__dirname, './src/api'),
      '@core': path.resolve(__dirname, './src/core'),
      '@router': path.resolve(__dirname, './src/router'),
      '@views': path.resolve(__dirname, './src/components/views'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
});
