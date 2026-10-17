import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
    passWithNoTests: true,
    reporters: ['default', 'junit', 'json'],
    outputFile: {
      junit: './out/junit.xml',
      json: './out/test-results.json'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'cobertura'],
      reportsDirectory: './out/coverage',
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/tests/**', 'src/setupTests.js', 'src/main.jsx']
    }
  }
});