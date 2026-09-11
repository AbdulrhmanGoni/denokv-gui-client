import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "e2e.spec.ts",
  use: {
    screenshot: "only-on-failure",
  },
  maxFailures: 1,
});
