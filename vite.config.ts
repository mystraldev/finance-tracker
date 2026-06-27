import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/ · https://vitest.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/unit/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'test/unit/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/types/**',
        'src/vite-env.d.ts',
        'src/main.tsx',
        'src/data/**',
        'test/**',
      ],
      thresholds: {
        // Global baseline — locks current coverage so it can't regress.
        statements: 30,
        branches: 17,
        functions: 30,
        lines: 30,
        // Pure logic is fully tested; hold it to a high bar.
        'src/utils/**': {
          statements: 90,
          branches: 85,
          functions: 90,
          lines: 90,
        },
      },
    },
  },
})
