import { defineConfig, devices } from "@playwright/test";

// Preserve Edge by default, while allowing another installed Chromium browser locally.
const browserChannel = process.env.PLAYWRIGHT_BROWSER_CHANNEL || "msedge";
const e2ePort = process.env.E2E_PORT?.match(/^\d+$/)?.[0] || "3003";
const e2eUrl = `http://localhost:${e2ePort}`;

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
    baseURL: e2eUrl,
    trace: "on-first-retry",
  },
  webServer: {
    command: `npx next dev -p ${e2ePort}`,
    url: `${e2eUrl}/`,
    reuseExistingServer: false,
    env: {
      NODE_ENV: "development",
      AUTH_SECRET: "dev-auth-secret-e2e",
      AUTH_URL: e2eUrl,
      DEV_AUTH_ENABLED: "true",
    },
    timeout: 120 * 1000,
  },
  projects: [
    {
      name: browserChannel,
      use: { ...devices[browserChannel === "chrome" ? "Desktop Chrome" : "Desktop Edge"], channel: browserChannel },
    },
  ],
});
