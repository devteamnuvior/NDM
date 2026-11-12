import { defineConfig } from "@playwright/test";

/**
 * Browser tests. The parity tests open the original static prototype and the Next.js build side by side
 * and compare them, so both are started here:
 *   - the prototype: the repository root, served as plain files on port 5174
 *   - the new site:  the production build on port 3100 (run `npm run build:parity` first)
 */
export const LEGACY_URL = "http://localhost:5174";
export const NEXT_URL = "http://localhost:3100";

export default defineConfig({
  testDir: "./tests",
  outputDir: "./test-results",
  fullyParallel: false,
  workers: 3,
  /* three pages share one machine: a timing-based check may need a second go; comparisons are deterministic */
  retries: 1,
  timeout: 90_000,
  reporter: [["list"]],
  use: { channel: "chrome", headless: true },
  webServer: [
    { command: "python3 -m http.server 5174 --directory ..", url: `${LEGACY_URL}/index.html`, reuseExistingServer: true, stdout: "ignore", stderr: "ignore" },
    { command: "npm run start -- -p 3100", url: NEXT_URL, reuseExistingServer: true, stdout: "ignore", stderr: "pipe" },
  ],
});
