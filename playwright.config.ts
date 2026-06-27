import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './test/e2e',
  timeout: 15000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: 'pnpm dev',
    port: 5173,
    reuseExistingServer: true,
  },
})
