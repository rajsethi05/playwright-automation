import {
  defineConfig,
  devices,
  type PlaywrightTestOptions,
} from "@playwright/test";
import { config, type BrowserName } from "./config/config";

/**
 * Wires config/config.ts into Playwright. Change values there (or via env vars), not here.
 * See https://playwright.dev/docs/test-configuration.
 */
const browserDevices: Record<BrowserName, Partial<PlaywrightTestOptions>> = {
  chromium: devices["Desktop Chrome"],
  firefox: devices["Desktop Firefox"],
  webkit: devices["Desktop Safari"],
};

export default defineConfig({
  testDir: "./tests",
  timeout: config.timeouts.test,
  expect: { timeout: config.timeouts.expect },
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: config.isCI,
  retries: config.retries,
  workers: config.workers,
  /* `open: 'never'` keeps a failed run from blocking the terminal; use `npm run report`. */
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: config.baseUrl,
    headless: config.headless,
    actionTimeout: config.timeouts.action,
    navigationTimeout: config.timeouts.navigation,
    trace: config.artifacts.trace,
    screenshot: config.artifacts.screenshot,
    video: config.artifacts.video,
    testIdAttribute: "id",
  },
  projects: [
    /* API tests don't need a browser, so they run once rather than once per browser. */
    {
      name: "api",
      testMatch: ["**/api-tests/**/*.spec.ts", "**/e2e-api-tests/**/*.spec.ts"],
      use: { baseURL: config.apiUrl },
    },
    ...config.browsers.map((browser) => ({
      name: browser,
      testMatch: ["**/ui-tests/**/*.spec.ts", "**/e2e-ui-tests/**/*.spec.ts"],
      use: browserDevices[browser],
    })),
  ],
});
