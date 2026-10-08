import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  // Locally the tests share one dev server that compiles on demand
  workers: process.env.CI ? undefined : 2,
  reporter: [["list"]],
  // The dev server compiles routes on first visit
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: "retain-on-failure",
    // Returning visitor: the first-visit intro (Motion §0) is covered by intro.spec.ts
    storageState: {
      cookies: [],
      origins: [{ origin: new URL(baseURL).origin, localStorage: [{ name: "visad-intro-seen", value: "1" }] }],
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
