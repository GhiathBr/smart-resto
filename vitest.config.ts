import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    environmentMatchGlobs: [
      // Use node environment for service and controller tests
      ['**/*.service.test.ts', 'node'],
      ['**/*.controller.test.ts', 'node'],
      ['**/database-schema.test.ts', 'node'],
      ['**/route.test.ts', 'node'],
      // Use jsdom for component and context tests
      ['**/*.test.tsx', 'jsdom'],
      ['**/AuthContext.test.tsx', 'jsdom'],
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
