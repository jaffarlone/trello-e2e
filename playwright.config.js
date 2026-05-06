const { defineConfig } = require("@playwright/test");
require("dotenv").config();

module.exports = defineConfig({
  // Run sequentially — tests share state (board → list → card → cleanup)
  workers: 1,

  // Timeout per test
  timeout: 30_000,

  // Retry once on transient network failures
  retries: 1,

  // Reporters
  reporter: [
    ["list"],
    ["html", { outputFolder: "reports/html", open: "never" }],
    ["json", { outputFile: "reports/results.json" }],
  ],

  use: {
    baseURL: "https://api.trello.com/1",
    actionTimeout:     10_000,
    navigationTimeout: 15_000,
    extraHTTPHeaders: {
      "Accept":       "application/json",
      "Content-Type": "application/json",
    },
  },

  projects: [
    {
      name: "trello-api",
      testMatch: "**/tests/*.spec.js",
    },
  ],

  outputDir: "reports/test-results",
});
