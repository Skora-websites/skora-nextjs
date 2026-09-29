import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PORT || "3001";
const baseURL = process.env.E2E_BASE_URL || `http://127.0.0.1:${PORT}`;

/**
 * E2E tests for the admin login flow.
 *
 * Requirements:
 *   - local mongod running  (npm run db:start)
 *   - app reachable at baseURL (started automatically if not already running)
 */
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  outputDir: "test-results",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      // Use the installed Google Chrome so no browser download is needed.
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
