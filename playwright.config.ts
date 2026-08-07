import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: 0,
  workers: 1,
  reporter: "list",
  /** O dev server compila rota por rota sob demanda: a primeira visita é lenta. */
  timeout: 120 * 1000,
  expect: { timeout: 20 * 1000 },
  use: {
    baseURL: "http://localhost:3002",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3002/",
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_ENV: "development",
      AUTH_SECRET: "dev-auth-secret-e2e",
      AUTH_URL: "http://localhost:3002",
      DEV_AUTH_ENABLED: "true",
    },
    timeout: 120 * 1000,
  },
  projects: [
    {
      name: "msedge",
      use: { ...devices["Desktop Edge"], channel: "msedge" },
    },
  ],
});
