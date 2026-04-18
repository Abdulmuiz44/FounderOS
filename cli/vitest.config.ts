import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { defineConfig } from 'vitest/config';

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root,
  css: {
    postcss: {
      plugins: [],
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
