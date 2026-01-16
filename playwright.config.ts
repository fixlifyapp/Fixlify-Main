import { defineConfig, devices } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

// ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const TEST_ENV = process.env.TEST_ENV || "local";

const envConfigMap = {
  local: {
    baseURL: "http://localhost:8080",
    webServer: {
      command: "npm run dev",
      url: "http://localhost:8080",
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  },
  staging: {
    baseURL: "https://staging.fixlify.app",
    webServer: undefined,
  },
  production: {
    baseURL: "https://app.fixlify.app",
    webServer: undefined,
  },
};

if (!Object.keys(envConfigMap).includes(TEST_ENV)) {
  console.error(`No configuration found for environment: ${TEST_ENV}`);
  console.error(`Available environments: ${Object.keys(envConfigMap).join(", ")}`);
  process.exit(1);
}

console.log(`Running tests against: ${TEST_ENV.toUpperCase()}`);

const envConfig = envConfigMap[TEST_ENV as keyof typeof envConfigMap];

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./test-results",

  // Fully parallel
  fullyParallel: true,

  // Prevent .only() in CI
  forbidOnly: !!process.env.CI,

  // Retries
  retries: process.env.CI ? 2 : 0,

  // Workers
  workers: process.env.CI ? 1 : undefined,

  // Reporters
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["junit", { outputFile: "test-results/results.xml" }],
    ["list"],
  ],

  // Global settings
  use: {
    baseURL: envConfig.baseURL,
    actionTimeout: 15000,
    navigationTimeout: 30000,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",

    // Browser settings
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },

  // Test timeout
  timeout: 60000,

  // Expect timeout
  expect: { timeout: 10000 },

  // Web server config
  webServer: envConfig.webServer,

  // Projects for different scenarios
  projects: [
    // Setup project for authentication
    {
      name: "setup",
      testMatch: /global-setup\.ts/,
    },

    // Authenticated tests (Desktop Chrome)
    {
      name: "chromium-authenticated",
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: path.resolve(__dirname, "./e2e/.auth/user.json"),
      },
      testIgnore: /.*unauthenticated\.spec\.ts/,
    },

    // Unauthenticated tests (login, portal)
    {
      name: "chromium-unauthenticated",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /.*unauthenticated\.spec\.ts/,
    },

    // Mobile tests
    {
      name: "mobile-chrome",
      dependencies: ["setup"],
      use: {
        ...devices["Pixel 5"],
        storageState: path.resolve(__dirname, "./e2e/.auth/user.json"),
      },
      testMatch: /.*mobile\.spec\.ts/,
    },
  ],
});
