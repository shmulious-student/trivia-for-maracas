import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@trivia/shared': path.resolve(__dirname, '../shared/src/index.ts')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
  },
  optimizeDeps: {
    include: ['@trivia/shared']
  },
  build: {
    commonjsOptions: {
      include: [/@trivia\/shared/, /node_modules/]
    }
  }
});
