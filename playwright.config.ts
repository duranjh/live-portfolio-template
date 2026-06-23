import { defineConfig, devices } from '@playwright/test'

/**
 * Smoke-test config. Runs the demo-mode site (zero env) and checks the headline routes render.
 * Reuses a dev server if one is already up, else starts `npm run dev`. Run with `npm run test:e2e`
 * (requires browsers once: `npx playwright install chromium`). Kept out of the core CI gate so
 * `npm run test` stays browser-free.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
