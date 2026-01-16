import { test as base, expect, Page, Locator } from "@playwright/test";

/**
 * Extended test fixture with custom helpers for Fixlify E2E tests
 */

// Mock data types
interface MockSMSConversation {
  id: string;
  client_name: string;
  client_phone: string;
  last_message: string;
  unread_count: number;
}

interface MockEmailConversation {
  id: string;
  client_name: string;
  client_email: string;
  subject: string;
  last_message: string;
  unread_count: number;
}

interface MockEstimate {
  id: string;
  estimate_number: string;
  client_name: string;
  total: number;
  status: "draft" | "sent" | "approved" | "declined";
}

// Custom fixture types
type CustomFixtures = {
  // Page object factories
  connectPage: ConnectPageObject;

  // Data helpers
  mockSMS: MockSMSHelper;
  mockEmail: MockEmailHelper;
  mockEstimate: MockEstimateHelper;

  // Assertion helpers
  waitForToast: (message: string) => Promise<void>;
  waitForLoading: () => Promise<void>;
};

// Connect Page Object
class ConnectPageObject {
  constructor(private page: Page) {}

  // Navigation
  async goto() {
    await this.page.goto("/connect");
    // Wait for the Connect page to load - look for the page header or tabs
    await this.page.waitForSelector('h1:has-text("Connect"), [role="tablist"]', {
      timeout: 15000,
    });
  }

  // Tab navigation
  async selectTab(tab: "inbox" | "calls" | "ai-calls") {
    const tabMap = {
      inbox: "Unified Inbox",
      calls: "Calls",
      "ai-calls": "AI Calls",
    };
    await this.page.click(`role=tab[name="${tabMap[tab]}"]`);
  }

  // Category selection
  async selectCategory(category: string) {
    await this.page.click(`[data-testid="category-${category}"], button:has-text("${category}")`);
  }

  // Conversation list
  get conversationList(): Locator {
    return this.page.locator('[data-testid="conversation-list"], .conversation-list');
  }

  async selectConversation(index: number = 0) {
    const conversations = this.page.locator(
      '[data-testid="conversation-item"], .conversation-item'
    );
    await conversations.nth(index).click();
  }

  async selectConversationByName(name: string) {
    await this.page.click(`text=${name}`);
  }

  // Message thread
  get messageThread(): Locator {
    return this.page.locator('[data-testid="message-thread"], .message-thread');
  }

  get messages(): Locator {
    return this.page.locator('[data-testid="message-bubble"], .message-bubble');
  }

  get lastMessage(): Locator {
    return this.messages.last();
  }

  // Message input
  get messageInput(): Locator {
    return this.page.locator(
      '[data-testid="message-input"], textarea[placeholder*="Type"]'
    );
  }

  get sendButton(): Locator {
    return this.page.locator('[data-testid="send-button"], button:has(svg.lucide-send)');
  }

  async sendMessage(text: string) {
    await this.messageInput.fill(text);
    await this.sendButton.click();
  }

  async sendMessageWithEnter(text: string) {
    await this.messageInput.fill(text);
    await this.messageInput.press("Enter");
  }

  // Smart replies
  get smartReplies(): Locator {
    return this.page.locator('[data-testid="smart-replies"], .smart-replies');
  }

  get smartReplyButtons(): Locator {
    return this.page.locator('[data-testid="smart-reply"], .smart-reply-card');
  }

  async selectSmartReply(index: number = 0) {
    await this.smartReplyButtons.nth(index).click();
  }

  async waitForSmartReplies() {
    await this.page.waitForSelector('[data-testid="smart-reply"], .smart-reply-card', {
      timeout: 15000,
    });
  }

  get generateRepliesButton(): Locator {
    return this.page.locator('button:has(svg.lucide-sparkles)');
  }

  async generateSmartReplies() {
    await this.generateRepliesButton.click();
    await this.waitForSmartReplies();
  }

  // Search
  get searchInput(): Locator {
    return this.page.locator('[data-testid="conversation-search"], input[placeholder*="Search"]');
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500); // Debounce
  }

  // Archive
  async archiveCurrentConversation() {
    await this.page.click('button:has(svg.lucide-more-vertical)');
    await this.page.click('text=Archive');
  }

  // Star (email only)
  async starCurrentConversation() {
    await this.page.click('button:has(svg.lucide-more-vertical)');
    await this.page.click('text=Star');
  }

  // Channel badges
  getChannelBadge(channel: "sms" | "email"): Locator {
    return this.page.locator(`[data-testid="channel-badge-${channel}"]`);
  }

  // Unread indicators
  get unreadBadge(): Locator {
    return this.page.locator('[data-testid="unread-badge"], .unread-count');
  }

  // KPI cards
  get kpiCards(): Locator {
    return this.page.locator('[data-testid="kpi-card"], .kpi-card');
  }

  // Intent badge
  get intentBadge(): Locator {
    return this.page.locator('[data-testid="intent-badge"], .intent-badge');
  }
}

// Mock SMS Helper
class MockSMSHelper {
  constructor(private page: Page) {}

  // Intercept SMS API calls
  async mockConversations(conversations: MockSMSConversation[]) {
    await this.page.route("**/rest/v1/sms_conversations**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(conversations),
      });
    });
  }

  async mockMessages(messages: any[]) {
    await this.page.route("**/rest/v1/sms_messages**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(messages),
      });
    });
  }

  async mockSendSuccess() {
    await this.page.route("**/functions/v1/telnyx-sms", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message_id: "mock-123" }),
      });
    });
  }

  async mockSendFailure(error: string = "Failed to send SMS") {
    await this.page.route("**/functions/v1/telnyx-sms", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error }),
      });
    });
  }
}

// Mock Email Helper
class MockEmailHelper {
  constructor(private page: Page) {}

  async mockConversations(conversations: MockEmailConversation[]) {
    await this.page.route("**/rest/v1/email_conversations**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(conversations),
      });
    });
  }

  async mockMessages(messages: any[]) {
    await this.page.route("**/rest/v1/email_messages**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(messages),
      });
    });
  }

  async mockSendSuccess() {
    await this.page.route("**/functions/v1/mailgun-email", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, id: "mock-email-123" }),
      });
    });
  }
}

// Mock Estimate Helper
class MockEstimateHelper {
  constructor(private page: Page) {}

  async mockEstimate(estimate: MockEstimate) {
    await this.page.route("**/rest/v1/estimates**", (route) => {
      const url = route.request().url();
      if (url.includes(estimate.id)) {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([estimate]),
        });
      } else {
        route.continue();
      }
    });
  }

  async mockPortalApprove() {
    await this.page.route("**/functions/v1/portal-approve-estimate", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, status: "approved" }),
      });
    });
  }

  async mockPortalDecline() {
    await this.page.route("**/functions/v1/portal-decline-estimate", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, status: "declined" }),
      });
    });
  }
}

// Create extended test
export const test = base.extend<CustomFixtures>({
  connectPage: async ({ page }, use) => {
    await use(new ConnectPageObject(page));
  },

  mockSMS: async ({ page }, use) => {
    await use(new MockSMSHelper(page));
  },

  mockEmail: async ({ page }, use) => {
    await use(new MockEmailHelper(page));
  },

  mockEstimate: async ({ page }, use) => {
    await use(new MockEstimateHelper(page));
  },

  waitForToast: async ({ page }, use) => {
    await use(async (message: string) => {
      await page.waitForSelector(`text=${message}`, { timeout: 5000 });
    });
  },

  waitForLoading: async ({ page }, use) => {
    await use(async () => {
      // Wait for any loading spinners to disappear
      await page
        .locator(".animate-spin, [data-loading]")
        .waitFor({ state: "hidden", timeout: 10000 })
        .catch(() => {});
    });
  },
});

export { expect };
export type { MockSMSConversation, MockEmailConversation, MockEstimate };
