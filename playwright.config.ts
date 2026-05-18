import { defineConfig, devices } from '@playwright/test'
import fs from 'fs'
import path from 'path'

// Zero-dependency manual .env.test.local loader
try {
  const envPath = path.resolve(__dirname, '.env.test.local')
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/)
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
      if (match) {
        let val = match[2] ? match[2].trim() : ''
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1)
        }
        process.env[match[1]] = val
      }
    }
  }
} catch (e) {
  console.warn('Failed to parse .env.test.local manually:', e)
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Keep to 1 worker for serial database state changes
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://kram:kram_test_password@localhost:5433/kram_test',
      NODE_ENV: 'test',
    }
  },
})
