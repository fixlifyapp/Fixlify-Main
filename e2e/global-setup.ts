import { chromium, FullConfig } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Global setup for Playwright tests
 * Performs authentication and saves storage state
 */
async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use?.baseURL || "http://localhost:8080";

  // Check for test credentials
  const testEmail = process.env.TEST_USER_EMAIL || "test@fixlify.com";
  const testPassword = process.env.TEST_USER_PASSWORD || "testpass123";

  console.log(`\n Setting up authentication for ${testEmail}...\n`);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to login
    await page.goto(`${baseURL}/login`);

    // Wait for login form
    await page.waitForSelector('[data-testid="login-email"], input[type="email"]', {
      timeout: 10000,
    });

    // Fill credentials
    await page.fill('[data-testid="login-email"], input[type="email"]', testEmail);
    await page.fill('[data-testid="login-password"], input[type="password"]', testPassword);

    // Submit login
    await page.click('[data-testid="login-submit"], button[type="submit"]');

    // Wait for redirect to dashboard or main app
    await page.waitForURL("**/dashboard**", { timeout: 15000 }).catch(() => {
      // Fallback - wait for any authenticated route
      return page.waitForURL("**/*", { timeout: 5000 });
    });

    // Verify we're logged in by checking for auth indicators
    const isLoggedIn = await page
      .locator('[data-testid="user-menu"], [data-testid="sidebar"], .sidebar')
      .isVisible()
      .catch(() => false);

    if (!isLoggedIn) {
      console.warn("Warning: Could not verify login state. Tests may fail.");
    }

    // Save storage state
    const authPath = path.resolve(__dirname, "./.auth/user.json");
    await context.storageState({ path: authPath });

    console.log(` Authentication saved to ${authPath}\n`);
  } catch (error) {
    console.error("Failed to authenticate:", error);
    // Create empty auth file so tests can proceed (will fail on auth check)
    const authPath = path.resolve(__dirname, "./.auth/user.json");
    fs.writeFileSync(authPath, JSON.stringify({ cookies: [], origins: [] }));
  } finally {
    await browser.close();
  }
}

export default globalSetup;
