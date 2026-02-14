/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry"
  },
  webServer: {
    command: "npm run build && npm run preview",
    port: 4173,
    reuseExistingServer: true,
    timeout: 120_000
  }
};

module.exports = config;
