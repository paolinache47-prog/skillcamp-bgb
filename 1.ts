import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative base so the build works from any sub-path or a static file server.
  base: './',
  plugins: [react()],
  server: { port: 5195 },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
