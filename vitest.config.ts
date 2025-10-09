import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'build/',
        '**/*.config.{ts,js}',
        '**/*.d.ts',
        '**/tests/**',
      ],
    },
    include: ['packages/*/tests/**/*.test.ts', 'packages/*/tests/**/*.spec.ts'],
    exclude: ['node_modules', 'dist', 'build', '.next'],
  },
});
